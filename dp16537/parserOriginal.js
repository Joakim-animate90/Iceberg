function convertDate({ dateString, locale = "en", originFormat }) {
    return moment(dateString, originFormat, locale).format("YYYY-MM-DD");
}

async function parsePage({ URL, responseBody, html }) {
    try {
        if (!/pdf/i.test(responseBody.fileFormat)) {
            console.error("Error: File is NOT valid PDF " + URL);
            return [];
        }
        const out = {
            URI: [URL, decodeURI(URL), encodeURI(decodeURI(URL))].filter((c, i, a) => a.indexOf(c) === i)
        };

        //Initialize 
        out.dateOriginal = null;
        out.date = null;

        const dataType = "MEDIA";
        const locale = "es";
        out.originalPdf = [{
            mediaObjectId: responseBody.id,
            locale,
            dataType
        }];
        /*
    html = await transcode(URL, "pdftohtmlExact");//pdftools
    if(!html){
      out.htmlContent = null;
    }*/

        if (/https:\/\/validador\.sea\.gob\.cl\/validar\/.+/.test(URL)) {
            let _html = await transcode(URL, "pdf2htmlEx");
            out.htmlContent = { fileFormat: "text/html", content: _html, locale, dataType };

            let text = await transcode(URL, "pdftotext");
            out.text = text && text.trim() && { content: text, locale, fileFormat: "text/plain", dataType } || null;
        } else {
            html = await transcode(URL, "pdf2htmlEx"); //pdftools
            if (html) {
                let $ = cheerio.load(html, { decodeEntities: false });
                /*$("img").each(function(){
                  $(this).remove();
                });
                */
                out.htmlContent = { fileFormat: "text/html", content: $.html(), locale, dataType };

                let text = await transcode(URL, "pdftotext_raw");
                out.text = text && text.trim() && { content: text, locale, fileFormat: "text/plain", dataType } || null;
            } else {
                out.htmlContent = null;
                out.text = null;
            }
        }

        const html2 = await transcode(URL, "pdftohtml"); //pdftools
        if (html2) {
            let $ = cheerio.load(html2, { decodeEntities: false });
            const fechaString = $("b:contains('Fecha')").first().text();
            const datePattern = /[0-9]{1,2}\-[0-9]{1,2}\-[0-9]{4}/
            const dateMatch = fechaString.match(datePattern);

            if (dateMatch !== null) {
                out.dateOriginal = dateMatch[0];
                out.date = convertDate({
                    dateString: out.dateOriginal,
                    locale: "en",
                    originFormat: "DD-MM-YYYY",
                });;
            }
        }

        if (out.dateOriginal === null) {
            let text2 = null;
            try {
                text2 = await runRemoteFilter({ URL, filter: "tesseractOCRSpanish" });
            } catch (e) {
                //try{
                //text2 = await runRemoteFilter({ URL, filter: "abbyOCR" });
                //}catch (e){
                console.log("Failed to convert to text")
                    //}

            }
            const textPieces = text2.slice(0, 2000).split("\n");
            const spanishMonthsLong = /^SANTIAGO(,)?\s?[0-9]{1,2}\s(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s[0-9]{4}/i;
            const spanishMonthsAbbr = /^SANTIAGO(,)?\s?[0-9]{1,2}\s(enero|feb|mar|abr|mayo|Jun|Jul|agosto|sept|oct|nov|dic)\s[0-9]{4}/i;
            const englishMonthsLong = /^SANTIAGO(,)?\s?[0-9]{1,2}\s(January|February|March|April|May|June|July|August|September|October|November|December)\s[0-9]{4}/i;
            const englishMonthsAbbr = /^SANTIAGO(,)?\s?[0-9]{1,2}\s(Jan|Feb|Mar|Apr|May|June|July|Aug|Sept|Oct|Nov|Dec)\s[0-9]{4}/i;
            const datePattern = /[0-9]{2}.+[0-9]{4}$/;

            for (let i = 0; i < textPieces.length; i++) {
                let piece = textPieces[i].trim();
                let isMatch = spanishMonthsLong.test(piece) || spanishMonthsAbbr.test(piece) || englishMonthsLong.test(piece) || englishMonthsAbbr.test(piece);

                if (isMatch) {
                    let dateMatch = piece.match(datePattern);
                    let _locale = spanishMonthsLong.test(piece) || spanishMonthsAbbr.test(piece) ? "es" : "en";

                    if (dateMatch !== null) {
                        out.dateOriginal = dateMatch[0];

                        out.date = convertDate({
                            dateString: out.dateOriginal,
                            locale: _locale,
                            originFormat: "DD MMMM YYYY",
                        });

                        break;
                    }
                }
            }
        }
        out.URL = URL
        return [out];

    } catch (error) {
        return []
    }
}

const transcode = async(URL, filter) => {
    try {
        return await runRemoteFilter({ URL, filter });

    } catch (e) {
        console.error("Unable to transcode", e);
        return null;
    }
}

const runRemoteFilter = async function({ URL, id, filter }) {
        let textContent = "";
        const URLId = URL && "H" + new Buffer(URL).toString("base64");
        const URLIdN = URL && "H" + sha256(URL) + ".N";
        let query = `
    query {
		` +
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