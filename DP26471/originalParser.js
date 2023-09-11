async function parsePage({ URL, responseBody, html }) {
    console.log(`in parser processing:${URL}`);
    const utility = {
        initialized: false,
        init: function() {
            if (this.initialized) return;
            // console.log("initializing");
            //populate other numbers <100
            for (let i = 30; i < 100; i++) {
                if (this.numbers[i]) continue;
                let tens = Math.floor(i / 10) * 10;
                let ones = i % 10;
                this.numbers[i] = this.numbers[tens] + " y " + this.numbers[ones];
            }
            this.initialized = true;
        },
        matchNo: function(text) {
            this.init();
            for (let x in this.numbers) {
                if (this.numbers[x] === text.toLowerCase().replace(/\s+/g, " ").trim())
                    return parseInt(x);
            }
            // console.error("No match: " + text);
            return null;
        },
        splitBigNo: function(text) {
            this.init();
            let currentValue = 0;
            let value = this.matchNo(text);
            if (value) {
                return currentValue + value;
            }
            let match = /(.*mil\s*)/i.exec(text);
            if (match) { //hundreds
                let thousands = match[1];
                text = text.replace(thousands, "").trim();
                let howMany = thousands.replace(/\s*mil\s*$/i, "").trim();
                howMany = howMany ? this.splitBigNo(howMany) : 1;
                currentValue += 1000 * howMany;
            }
            value = this.matchNo(text);
            if (value) {
                return currentValue + value;
            }
            match = /([^\s]*cien(tos)?\s*)/i.exec(text);
            if (match) { //hundreds
                let hundreds = match[1];
                text = text.replace(hundreds, "").trim();
                if (hundreds === 'ciento') hundreds = "cien";
                let howMuch = this.matchNo(hundreds);
                currentValue += howMuch;
            }
            value = this.matchNo(text);
            if (value) {
                return currentValue + value;
            }
            return currentValue;
        },
        numbers: {
            "1": "uno",
            "2": "dos",
            "3": "tres",
            "4": "cuatro",
            "5": "cinco",
            "6": "seis",
            "7": "siete",
            "8": "ocho",
            "9": "nueve",
            "10": "diez",
            "11": "once",
            "12": "doce",
            "13": "trece",
            "14": "catorce",
            "15": "quince",
            "16": "dieciséis",
            "17": "diecisiete",
            "18": "dieciocho",
            "19": "diecinueve",
            "20": "veinte",
            "21": "veintiuno",
            "22": "veintidós",
            "23": "veintitrés",
            "24": "veinticuatro",
            "25": "veinticinco",
            "26": "veintiséis",
            "27": "veintisiete",
            "28": "veintiocho",
            "29": "veintinueve",
            "30": "treinta",
            "40": "cuarenta",
            "50": "cincuenta",
            "60": "sesenta",
            "70": "setenta",
            "80": "ochenta",
            "90": "noventa",
            "100": "cien",
            "200": "doscientos",
            "300": "trescientos",
            "400": "cuatrocientos",
            "500": "quinientos",
            "600": "seiscientos",
            "700": "setecientos",
            "800": "ochocientos",
            "900": "novecientos",
            "1000": "mil"
        },
        parseSpanishDate: function(spanishDate) {

            let match = /(.+)\s+del?\s+([^\s]+)\s+del?\s+(.+)/i.exec(spanishDate);
            let day = match[1];
            let month = match[2]; //ok
            let year = match[3];

            day = /^\d+$/i.test(day) ? day : this.matchNo(day);
            year = /^\d+$/i.test(year) ? year : this.splitBigNo(year);
            let date = null;
            if (day && year) {
                let d = moment(`${day}-${month.toLowerCase()}-${year}`, ['D-MMMM-YYYY'], 'es');
                date = d.isValid() ? d.format("YYYY-MM-DD") : null;
            }
            return date;
        }
    };
    /////////////////////
    if (!/pdf/i.test(responseBody.fileFormat)) {
        console.error("Error: File is NOT valid PDF " + URL);
        return [];
    }

    const out = {
        URI: [URL, decodeURI(URL), encodeURI(decodeURI(URL))].filter((c, i, a) => a.indexOf(c) === i),
        originalSpanishDate: null,
        Date: null
    };
    const dataType = "MEDIA";
    const locale = "es";
    out.originalPdf = [{
        mediaObjectId: responseBody.id,
        // fileFormat: responseBody.fileFormat,
        locale,
        dataType
    }];

    if (html) {
        // const $ = cheerio.load(html);
        // if ($.text().trim().length > 20)
        out.htmlContent = { fileFormat: "text/html", content: html, locale, dataType };
    } else {
        out.htmlContent = null;
        out.text = null;
    }
    let text = null;
    try {
        text = await runRemoteFilter({ URL, filter: "pdftotext_raw" });
    } catch (e) {
        text = null;
    }


    if (!text || !text.trim())
        text = await runRemoteOCRFilter({ URL, filter: "tesseractOCRSpanish" });
    return [text]

    //extract gazzete_number from text
    let dateString = null;
    let plainLanguageDate = null;
    if (text && text.mediaObjectId) {
        text.locale = locale;
        out.text = text;
    } else if (text && (typeof text === "string")) {
        // a veintinueve de abril de dos mil diecinueve 
        let patt = /Monterrey.+Nuevo\s+Le[óo]n.+(veint|mil).*/gi;
        let lines = text && text.split(/\s*\n\s*/ig).filter(l => l);
        for (let i = 0; i < 40 && i < lines.length; i++) {
            let match = patt.exec(lines[i]);
            if (match) {
                plainLanguageDate = match[[0]].trim().replace(/\W+$/, "");
                //break;
            }
        }
        if (plainLanguageDate) {
            plainLanguageDate = plainLanguageDate.replace(/Monterrey.+Nuevo\s+Le[óo]n\W+/, "");
            plainLanguageDate = plainLanguageDate.trim().replace(/^a\s+/, "");
            let date = utility.parseSpanishDate(plainLanguageDate);
            out.Date = date;
        }
        if (!plainLanguageDate) {
            //20 de febrero de 2019
            let patt2 = /Monterrey.+Nuevo\s+Le[óo]n.+([0-9]{1,2}\s+(de)?\s+\w+\s+(de)?\s+[0-9]{4})/gi;
            let lines = text && text.split(/\s*\n\s*/ig).filter(l => l);
            for (let i = 0; i < 40 && i < lines.length; i++) {
                let match = patt2.exec(lines[i]);
                if (match) {
                    dateString = match[[0]].replace(/Monterrey.+Nuevo\s+Le[óo]n\W+/, "");
                    dateString = dateString.trim().replace(/^a\s+/, "");
                    break;
                }
            }
        }
    }
    //
    if (dateString) {
        let dateString1 = dateString.replace(/de/gi, " ").replace(/\s+/g, " ").trim();
        let datem = moment(dateString1, "DD MMMM YYYY", "es");
        let date = datem.format("YYYY-MM-DD");
        out.Date = date;
    }
    out.originalSpanishDate = dateString || plainLanguageDate;
    out.text = text && text.trim() && { content: text, locale, fileFormat: "text/plain", dataType } || null;


    return [out];
}

const getResp = async function({ URL, id, filter }) {
        let textContent = null;
        const URLId = URL && "H" + new Buffer(URL).toString("base64");
        const URLIdN = URL && "H" + sha256(URL) + ".N";
        let query = `
              query {` +
            `
                nodes(ids: ["${URL && `${URLId}", "${URLIdN}` || `${id}`}"]) {`
        + `               id
                ... on CrawledURL {
                  lastSuccessfulRequest {
                    outputForFilter(filter: "${filter}")
                  }
                }
              }
            }`;
    const resp = await graphql(query);
    return resp;
}

const runRemoteFilter = async function ({ URL, id, filter = 'pdftotext_raw' }) {
    let textContent = null;
    const resp = await getResp({ URL, id, filter })
    let node = resp.nodes.filter(n => n)[0];
    if (node
        && node.lastSuccessfulRequest
        && node.lastSuccessfulRequest.outputForFilter
        && node.lastSuccessfulRequest.outputForFilter.length
        && node.lastSuccessfulRequest.outputForFilter[0]
        && node.lastSuccessfulRequest.outputForFilter[0].filterOutput
        && node.lastSuccessfulRequest.outputForFilter[0].filterOutput.content) {
        let _text = node.lastSuccessfulRequest.outputForFilter[0].filterOutput.content;
        textContent = _text;
    }
    return textContent;
};

const runRemoteOCRFilter = async function ({ URL, id, filter = 'abbyOcr' }) {
    const resp = await getResp({ URL, id, filter })
    let textContent = null;

    let node = resp.nodes.filter(n => n)[0];
    if (node
        && node.lastSuccessfulRequest
        && node.lastSuccessfulRequest.outputForFilter
        && node.lastSuccessfulRequest.outputForFilter.length
        && node.lastSuccessfulRequest.outputForFilter[0]
        && node.lastSuccessfulRequest.outputForFilter[0].filterOutput
        && node.lastSuccessfulRequest.outputForFilter[0].filterOutput.transcodedMediaObject) {
        let transcodedMediaObject = node.lastSuccessfulRequest.outputForFilter[0].filterOutput.transcodedMediaObject;
        if (/pdf/i.test(transcodedMediaObject.fileFormat)) {
            return transcodeMediaObject({ mediaObjectId: transcodedMediaObject.id, filter: "pdftotext" })
        } else if (/text/i.test(transcodedMediaObject.fileFormat)) {
            textContent = await transcodedMediaObject.getContent();
        }
        textContent = {
            mediaObjectId: transcodedMediaObject.id,
            fileFormat: transcodedMediaObject.fileFormat,
        };
    }
    return textContent;
};

async function transcodeMediaObject({ mediaObjectId, filter }) {
    const resp = await graphql(`
    mutation {
      transcodeMediaObject (input: {
        clientMutationId: "0",
        filter: "${filter}",
        mediaObjectId: "${mediaObjectId}"

      }) {
        mediaObject {
          id, content
        }
      }
    }
`)

    return resp && resp.transcodeMediaObject && resp.transcodeMediaObject.mediaObject && resp.transcodeMediaObject.mediaObject.content;
}