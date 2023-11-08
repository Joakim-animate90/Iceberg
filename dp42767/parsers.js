async function parsePage({URL, responseBody, html}) {
    if (!/pdf/i.test(responseBody.fileFormat)) {
        console.error("Error: File is NOT valid PDF " + URL);
        return [];
    }
    const out = {
        URI: [URL, decodeURI(URL), encodeURI(decodeURI(URL))].filter((c, i, a) => a.indexOf(c) === i)
    };
    const dataType = "MEDIA";
    const locale = "ca";
    out.originalPdf = [{
        mediaObjectId: responseBody.id,
        // fileFormat: responseBody.fileFormat,
        locale, dataType
    }];

    if(!html){
        try{
            html = await runRemoteFilter({URL, filter: "pdf2htmlEx"});
        }catch(e){
            console.error("PDF transcoding failed", e);
        }
    }
    if (html) {
        // const $ = cheerio.load(html);
        // if ($.text().trim().length > 20)
        out.htmlContent = {fileFormat: "text/html", content: html, locale, dataType};
    } else {
        out.htmlContent = null;
        out.text = null;
    }
    let text = await runRemoteFilter({URL, filter: "pdftotext_raw"});
    out.text = text && text.trim() && {content: text, locale, fileFormat: "text/plain", dataType} || null;

    //mycode
    const regex = /\d+ [a-zA-Z].+ del \d{4}/;
    const result = text.match(regex);

    if (result) {
      let con = result[0]; // Output: 9 d'agost del 2023
      // out.date1 = con

      const regex1 = /\d{1,2} [a-zA-Z']+ del (\d{4})/;
      const result1 = text.match(regex1);

      if (result1) {
        const extractedText1 = result1[0].replace(' del ', ' ');
        const rep = extractedText1.replace("d'agost", "agosto")
        const formattedDate33 = moment(rep, 'D MMMM YYYY', 'es').format('YYYY-MM-DD');
        out.date = formattedDate33; // Output: 9 d'agost 2023
        const regex4 = /^(\d{4})-\d{2}-\d{2}$/;
        const match4 = formattedDate33.match(regex4);

        if (match4) {
          const year4 = match4[1];
          out.year = year4 // Output: 2023
        } else {
          console.log('Invalid date format');
        }
      } else {
        console.log("Text not found");
      }



      // mycode

      const regex = /(\d{1,2}) de ([a-zA-Z]+) del (\d{4})/;
      const results = con.match(regex);
      return results
      if (results) {
        const day = results[1];
        const month = results[2];
        const year = results[3];

        // Convert month from Catalan to Spanish
        const monthsCatalanToSpanish = {
          'gener': 'enero',
          'febrer': 'febrero',
          'març': 'marzo',
          'abril': 'abril',
          'maig': 'mayo',
          'juny': 'junio',
          'juliol': 'julio',
          'agost': 'agosto',
          'setembre': 'septiembre',
          'octubre': 'octubre',
          'novembre': 'noviembre',
          'desembre': 'diciembre',
        };

        const spanishMonth = monthsCatalanToSpanish[month.toLowerCase()];

        const formattedDate1 = `${day} de ${spanishMonth} de ${year}`;
        // out.date = formattedDate // Output: 26 julio 2023
        // code
        
        const formattedDate = moment(formattedDate1, 'DD [de] MMMM [de] YYYY').format('YYYY-MM-DD');
        out.date = formattedDate
        const regex = /^(\d{4})-\d{2}-\d{2}$/;
        const match44 = formattedDate.match(regex);

        if (match44) {
          const year11 = match44[1];
          out.year = year11 // Output: 2023
        } else {
          console.log('Invalid date format');
        }
        // console.log(formattedDate);

        //here
      } else {
        console.log("Date not found");
      }

      //until here


    } else {
      console.log("Date not found");
    }

    //end

    return [out];
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