/*Utility to convert a spanish date, month, year in text, to numbers*/

const utility = {
    initialized: false,
    init: function () {
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
    matchNo: function (text) {
        this.init();
        for (let x in this.numbers) {
            if (this.numbers[x] === text.toLowerCase().replace(/\s+/g, " ").trim())
                return parseInt(x);
        }
        // console.error("No match: " + text);
        return null;
    },
    splitBigNo: function (text) {
        this.init();
        let currentValue = 0;
        let value = this.matchNo(text);
        if (value) {
            return currentValue + value;
        }
        let match = /(.*mil\s*)/i.exec(text);
        if (match) {//hundreds
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
        if (match) {//hundreds
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
    parseSpanishDate: function (spanishDate) {

        let match = /(.+)\s+del?\s+([^\s]+)\s+del?\s+(.+)/i.exec(spanishDate);
        let day = match[1];
        let month = match[2];//ok
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


async function parsePage({URL, responseBody, html, referer}) {
    if (!/pdf/i.test(responseBody.fileFormat)) {
        console.error("Error: File is NOT valid PDF " + URL);
        return [];
    }
    try{
     const results = []
    let out = {
        URI: [URL, decodeURI(URL), encodeURI(decodeURI(URL))].filter((c, i, a) => a.indexOf(c) === i)
    };
    const dataType = "MEDIA";
    const locale = "es";

    out= {
        URI:[URL, decodeURI(URL), encodeURI(decodeURI(URL))].filter((c, i, a) => a.indexOf(c) === i),
        
        
        ano : null,
        numero:null,
        publishedDate:null,
        publishedDateOriginale:null,
        year:null,
        section:null,
        sectionTitle:null,
        URL:[URL, decodeURI(URL), encodeURI(decodeURI(URL))].filter((c, i, a) => a.indexOf(c) === i),
        parentURL:null,
        documentType: null

    };
   // http://gaceta.diputados.gob.mx/PDF/64/2020/nov/20201104-A.pdf?title=Anexo_A&ano=_año_XXIII&numero=_número_5645&publishedDate=_miércoles_4_de_noviembre_de_2020&anexo%7D
    let isChildListingAnexo =  URL.match(/title=(.*)&anexo=(.*)&title=(.*)&ano=(.*)&numero=(.*)&publishedDate=(.*)&anexo([^&]*)/i)
    let isChildListingNormal = URL.match(/title=(.*)&ano=(.*)&numero=(.*)&publishedDate=(.*)/i)
    

    // get the metadatas

    if(isChildListingAnexo){
        // before inserting in the out replace _ with space

        out.title = isChildListingAnexo[7].replace(/_/g, " ")
        out.ano = isChildListingAnexo[4].replace(/_/g, " ")
        out.numero = isChildListingAnexo[5].replace(/_/g, " ")
        let publishedDate = isChildListingAnexo[6].replace(/_/g, " ")
        out.publishedDateOriginale = publishedDate
        // remove miércoles 28 de abril de 2021 miércoles and replace with empty string
        // remove anything before the date check if starts with a number if not remove the first word

        publishedDate = publishedDate.split(" ")
        // remove the first word if it is not a number
        let i = 0;
        while (!/^\d+/i.test(publishedDate[i])){
            publishedDate.shift()
            i++
        }
        if (/^\d+/i.test(publishedDate[0])){
            publishedDate = publishedDate.join(" ")
        }else{
            publishedDate.shift()
            publishedDate = publishedDate.join(" ")
        }
        // match the four digit year  it should start with  20
        let year = publishedDate.match(/20\d{2}/i)
        out.year = year[0]
     
        out.publishedDate = utility.parseSpanishDate(publishedDate)
        out.section = isChildListingAnexo[3].replace(/_/g, " ")
        out.documentType = isChildListingAnexo[1].replace(/_/g, " ")
        out.parentURL = URL.split('?')[0]
        out.originalPdf = [{
        mediaObjectId: responseBody.id,
        // fileFormat: responseBody.fileFormat,
        locale, dataType
    }];
    let sectionTitle = await parseRemoteUrl(referer, "A06s36hp84xmo3e");
     try{ 
        if (sectionTitle && sectionTitle[0] && sectionTitle[0].title){
            let sectionTitle1 = sectionTitle
            
            sectionTitle1 = sectionTitle1.filter((doc) => {
            if (new RegExp(`Anexo ${numberPart}`, 'i').test(doc.anex)) {
                return doc;
            }
            })
            let anex = sectionTitle1 ? sectionTitle1[0].anex : null
            out.sectionTitle = sectionTitle1 && anex ? sectionTitle1[0].title.replace(anex, '') : null
        }
    } catch (error) {
        console.log(error)
    }
    results.push(out)


    }else if (isChildListingNormal){

      //  out.title = isChildListingNormal[5].replace(/_/g, " ")
        out.ano = isChildListingNormal[2].replace(/_/g, " ")
        out.numero = isChildListingNormal[3].replace(/_/g, " ")
        let publishedDate = isChildListingNormal[4].replace(/_/g, " ")
        out.publishedDateOriginale = publishedDate
        // remove miércoles 28 de abril de 2021 miércoles and replace with empty string
        publishedDate = publishedDate.split(" ")

        // remove the first word if it is not a number
        let i = 0;
        while (!/^\d+/i.test(publishedDate[i])){
            publishedDate.shift()
            i++
        }
        if (/^\d+/i.test(publishedDate[0])){
            publishedDate = publishedDate.join(" ")
        }else{
            publishedDate.shift()
            publishedDate = publishedDate.join(" ")
        }
        let year = publishedDate.match(/20\d{2}/i)
        out.year = year[0]
        publishedDate = publishedDate.split("&")[0]
        out.publishedDateOriginale = publishedDate
        out.publishedDate = utility.parseSpanishDate(publishedDate)
        out.section = isChildListingNormal[1].replace(/_/g, " ")
        out.parentURL = URL.split('?')[0]
        out.documentType = isChildListingNormal[1].replace(/_/g, " ")
        out.originalPdf = [{
        mediaObjectId: responseBody.id,
        // fileFormat: responseBody.fileFormat,
        locale, dataType
    }];
       
    }



    if(!html){
        try{
            html = await runRemoteFilter({URL, filter: "pdftotext"});
        }catch(e){
            console.error("PDF transcoding failed", e);
        }
    }
    if (html) {
        // const $ = cheerio.load(html);
        // if ($.text().trim().length > 20)
        const $ = cheerio.load(html);
       $('*').removeAttr('background-color').removeAttr('color');


        // Update the HTML content without colors
        const sanitizedHtml = $.html();
        //return [sanitizedHtml]

        out.htmlContent = {fileFormat: "text/html", content: sanitizedHtml, locale, dataType};
    } else {
        out.htmlContent = null;
        out.text = null;
    }
    let text = await runRemoteFilter({URL, filter: "pdftotext"});
    out.text = text && text.trim() && {content: text, locale, fileFormat: "text/plain", dataType} || null;
    results.push(out)

    return results;
    }catch(e){
      return []
    }
}

const runRemoteFilter = async function ({URL, id, filter}) {
    let textContent = "";
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

    let node = resp.nodes.filter(n => n)[0];

    if (node
        && node.lastSuccessfulRequest
        && node.lastSuccessfulRequest.outputForFilter
        && node.lastSuccessfulRequest.outputForFilter.length
        && node.lastSuccessfulRequest.outputForFilter[0]
        && node.lastSuccessfulRequest.outputForFilter[0].filterOutput
        && node.lastSuccessfulRequest.outputForFilter[0].filterOutput.content) {
        let _text = node.lastSuccessfulRequest.outputForFilter[0].filterOutput.content;
        textContent += _text;
    } else {
    }
    return textContent;
};
const parseRemoteUrl = async (urlToParse, parserId) => {
    const urlToParseId = "H" + new Buffer(urlToParse).toString("base64");
    const urlToParseId2 = "H" + sha256(urlToParse) + ".N";
    const resp = await graphql(`
          query {
            nodes(ids: ["${urlToParseId}", "${urlToParseId2}"]) {
              id
              ... on CrawledURL {
                lastSuccessfulRequest {
                  id
                }
              }
            }
          }`);
  
    let parserRes;
    let node = resp.nodes && resp.nodes.filter(n => n)[0];
    if (node && node.lastSuccessfulRequest) {
        // Parse acordao listing page
        parserRes = await graphql(`
            query {
              node(id:"${parserId}") {
                ... on CrawledPageParser {
                  jsonOutputFor(requestId:"${node.lastSuccessfulRequest.id}")
                }
              }
            }`);
    }
  
    return parserRes && parserRes.node && parserRes.node.jsonOutputFor;//returns array, filter as necessary
  };