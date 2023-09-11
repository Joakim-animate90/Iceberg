async function parsePage({ URL, responseBody, html }) {
    if (!/pdf/i.test(responseBody.fileFormat)) {
        console.error("Error: File is NOT valid PDF " + URL);
        return [];
    }
    const out = {
        URI: [URL, decodeURI(URL), encodeURI(decodeURI(URL))].filter((c, i, a) => a.indexOf(c) === i),
        publicationYear: null,

    };
    const dataType = "MEDIA";
    const locale = "es";
    out.originalPdf = [{
        mediaObjectId: responseBody.id,
        //fileFormat: responseBody.fileFormat,
        locale,
        dataType
    }];
    const regexYear = /(20\d{2})/;
    const matchesYear = URL.match(regexYear);
    if (matchesYear && matchesYear.length > 1) {
        const year = matchesYear[0];
        out.publicationYear = year;
    } else {
        console.log('No match found.');
    }
    out.URL = [URL, decodeURI(URL), encodeURI(decodeURI(URL))].filter((c, i, a) => a.indexOf(c) === i)
    if (html) {
        let $ = cheerio.load(html, { decodeEntities: false });
        $("script, meta, base, iframe, frame, img").remove();
        $("a[href]").each(function(i) {
            let a = $(this);
            a.replaceWith(a.html());
        });

        out.htmlContent = { fileFormat: "text/html", content: $.html(), locale, dataType };
    } else {
        out.htmlContent = null;
        out.text = null;
    }
    let text = await runRemoteFilter({ URL, filter: "tesseractOCRSpanish" });
    if (text) {
        //get the last 300 words
        let words = text.split(/\s+/);
        let last50 = words.slice(words.length - 50).join(" ");
        // a regex to get publication date (2020)
        let regex = /(\d{4})/g;
        let match = regex.exec(last50);
        let year = match && match[1];
        if (year) {
            //if year is in the range 1900-2025
            if (year > 1900 || year < 2025) {
                out.publicationYear = year;
            }
        }
        out.last50Words = { content: last50, locale, fileFormat: "text/plain", dataType };

    }

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

const runRemoteFilter = async function ({URL, id, filter = 'pdftotext_raw'}) {
    let textContent = null;
    const resp = await getResp({URL, id, filter})
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