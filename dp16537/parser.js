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