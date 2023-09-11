async function parsePage({ URL, responseBody, html, responseURL }) {
    try {
        let doc = {
            URI: [URL, decodeURI(URL), encodeURI(decodeURI(URL))].filter((c, i, a) => a.indexOf(c) === i)
        };

        let data = []
        const dataType = "MEDIA";
        const locale = "de";

        html = responseBody.content

        if (html) {
            // clean the html before parsing
            // use sanitize-html 

            let $ = cheerio.load(html, { decodeEntities: false })
                // remove scripts 
            $('script').remove()
            $('noscript').remove()
            $('link').remove()


            // find the table with the id example
            doc = {
                URI: null,
                name: null,
                appendedOn: null,
                area: null,
                vDate: null,
                date: null,
                documentType: null,
                infoWithTitle: null,
                info: null,
                URL: [URL]

            }

            try {
                doc.URI = [URL, decodeURI(URL), encodeURI(decodeURI(URL))].filter((c, i, a) => a.indexOf(c) === i)
            } catch (e) {
                doc.URI = [URL]
            }
            // <div class="col-md-3" <div class="first">AmRod eCommerce UG (haftungsbeschränkt)<br>Hürth</div></div>

            let name = $('.first').text() ? $('.first').text().replace(/\r?\n/g, '') : null
                // if name includes hinzugefügt 
            if (name.includes('hinzugefügt')) {
                name = name.split('hinzugefügt')[0]
            }
            let area = $('.part').text() ? $('.part').text().trim() : null
            let vDate = $('.date').text() ? $('.date').text().trim() : null
                // let info = $('.info').text() ? $('.info').text().trim() : null dont use trim remove whitespaces 
            let info = $('.info').text().replace(/\r?\n/g, '');
            let infoWithTitle = $('.info').find('a').text() ? $('.info').find('a').text().trim() : null
                // use moment to parse the date 
            let date = moment(vDate, 'MM/DD/YYYY').format('YYYY-MM-DD')

            doc.name = name
            doc.area = area
            doc.vDate = vDate
            doc.appendedOn = vDate
            doc.date = date
            doc.info = info
            doc.documentType = area
            doc.infoWithTitle = infoWithTitle
                // remove tag header and footer
            $('header').remove()
            $('footer').remove()
            $('h1').remove()

            //from publication_container get the text and convert it to html 
            // remove class content-container margin_bottom_large

            $('.content-container margin_bottom_large').remove()
            $('div[class="container result_container global-search detail-view"]').remove()


            // remove <div class="result_pager_detail publication-nav bottom"> from removeClass
            $('.result_pager_detail').remove()
                // $('.publication_container').css('margin-center', 'auto')
                // force the full html to be on the right side
            $('.publication_container').css('margin-right')
                // remove div id cc_banner
            $('#cc_banner').remove()
            let sanitizedHtml = $.html().replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '');

            //remove the text from the sanitizedHtml Search Result – Federal Gazette 
            sanitizedHtml = sanitizedHtml.replace(/Search Result – Federal Gazette/g, '')
            sanitizedHtml = sanitizedHtml.replace(/^\s*x\s*$/g, '')
                // the html is in removeClass2
            doc.htmlContent = {
                content: sanitizeHtml(sanitizedHtml, {
                    // allowedTags: true,
                    //  allowedAttributes: true,
                    //transformTags: false
                }),
                locale,
                fileFormat: "text/html",
                dataType
            } || null;





            // let text = await runRemoteFilter({URL, filter: "pdftotext_raw"});
            // out.text = text && text.trim() && {content: text, locale, fileFormat: "text/plain", dataType} || null;




            data.push(doc)
        }
        return data


    } catch (e) {
        return []

    }
}
const runRemoteFilter = async function({ URL, id, filter }) {
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