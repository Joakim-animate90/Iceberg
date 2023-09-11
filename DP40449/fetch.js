async function parsePage({ URL, responseBody, html, responseURL }) {
    let data = [];
    html = await responseBody.content;
    if (html) {

        let $ = cheerio.load(html, { decodeEntities: false });
        let table = $('#dataTable')
        let tbody = table.find('tbody')
        let trs = tbody.find('tr')

        trs.each(async function(i, elem) {
            let item = $(this);


            let doc = {
                URI: [],
                resolutionNo: item.find('td:nth-child(1)').text() ? item.find('td:nth-child(1)').text().replace(/\n/g, '').trim() : null,
                conceptSummary: item.find('td:nth-child(2)').text() ? item.find('td:nth-child(2)').text().replace(/\n/g, '').trim() : null,
                category: item.find('td:nth-child(3)').text() ? item.find('td:nth-child(3)').text().replace(/\n/g, '').trim() : null,
                dateOriginale: item.find('td:nth-child(4)').text() ? item.find('td:nth-child(4)').text().replace(/\n/g, '').trim() : null,
                date: null,
                //get now the url  of the pdf its in a link
                documentForUnloading: item.find('td:nth-child(5)').find('a').attr('href') ? item.find('td:nth-child(5)').find('a').attr('href').replace(/\n/g, '').trim() : null,
                URL: [URL, decodeURI(URL), encodeURI(decodeURI(URL))].filter((c, i, a) => a.indexOf(c) === i),
            };
            // date is on this format 14/06/2023
            let date = moment(doc.dateOriginale, "DD/MM/YYYY");
            let formattedPubDate = date.format("YYYY-MM-DD");
            if (formattedPubDate === 'Invalid Date')
                formattedPubDate = null;

            doc.date = formattedPubDate;
            doc.URI.push(doc.documentForUnloading);

        });
    }

    return data;
}