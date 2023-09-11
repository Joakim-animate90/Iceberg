async function parsePage({ URL, responseBody, html }) {
    if (!/pdf/i.test(responseBody.fileFormat)) {
        console.error("Error: File is NOT valid PDF " + URL);
        return [];
    }
    const out = {
        URI: [URL, decodeURI(URL), encodeURI(decodeURI(URL))].filter((c, i, a) => a.indexOf(c) === i),
        originalDate: null,
        date: null,
    };
    const dataType = "MEDIA";
    const locale = "en";
    out.originalPdf = [{
        mediaObjectId: responseBody.id,
        //fileFormat: responseBody.fileFormat,
        locale,

        dataType
    }];


    if (html) {


        out.htmlContent = { fileFormat: "text/html", content: html, locale, dataType };
    } else {
        out.htmlContent = null;
        out.text = null;
    }
    let text = null;
    try {
        text = await runRemoteFilter({ URL, filter: "pdftotext_raw" });

        out.text = text && text.trim() && { content: text, locale, fileFormat: "text/plain", dataType } || null;

    } catch (e) {
        console.log("Failed to convert to text")
    }
    const textPieces = text.slice(0, 500)
        //if textPieces is not greater than 100
    const spanishMonthsLong = /[0-9]{1,2}\s(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)(\s+)?[0-9]{4}/i;
    const spanishMonthsAbbr = /[0-9]{1,2}\s(enero|feb|mar|abr|mayo|Jun|Jul|agosto|sept|oct|nov|dic)(\s+)?[0-9]{4}/i;
    const englishMonthsLong = /[0-9]{1,2}\s(January|February|March|April|May|June|July|August|September|October|November|December)(\s+)?[0-9]{4}/i;
    const englishMonthsAbbr = /[0-9]{1,2}\s(Jan|Feb|Mar|Apr|May|June|July|Aug|Sept|Oct|Nov|Dec)(\s+)?[0-9]{4}/i;
    const datePattern = /[0-9]{2}.+[0-9]{4}$/;

    const spanishMonthsLongMatch = textPieces.match(spanishMonthsLong);
    const spanishMonthsAbbrMatch = textPieces.match(spanishMonthsAbbr);
    const englishMonthsLongMatch = textPieces.match(englishMonthsLong);
    const englishMonthsAbbrMatch = textPieces.match(englishMonthsAbbr);
    const datePatternMatch = textPieces.match(datePattern);


    const date = spanishMonthsLongMatch && spanishMonthsLongMatch[0] || spanishMonthsAbbrMatch && spanishMonthsAbbrMatch[0] || englishMonthsLongMatch && englishMonthsLongMatch[0] || englishMonthsAbbrMatch && englishMonthsAbbrMatch[0] || null;
    const dateMoment = date && moment(date, "DD MMMM YYYY").format("YYYY-MM-DD") || null;
    out.originalDate = date
    out.date = dateMoment


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