async function parsePage({ URL, responseBody, html, responseURL }) {

    let doc = {
        URI: [URL, decodeURI(URL), encodeURI(decodeURI(URL))].filter((c, i, a) => a.indexOf(c) === i)
    };

    let data = []
    const dataType = "MEDIA";
    const locale = "es";

    html = responseBody.content
    if (html) {

        let $ = cheerio.load(html, { decodeEntities: false })
        let table = $('#dt_decisions_datatables ')
        let rows = table.find('tbody tr')
            //get each row use each
        rows.each((i, row) => {
            let cells = $(row).find('td')

            let link = $(cells[0]).find('a').attr('href')
            let judgeMentNumber = $(cells[0]).find('a').text().trim() || null
            let caseText = $(cells[1]).text().trim() || null
            let dateOriginale = $(cells[2]).text().trim() || null
                //convert date 15 Feb 2005 to iso format using moment
            let date = moment(dateOriginale, 'DD MMM YYYY')
            date && date.isValid() ? date = moment(dateOriginale, 'DD MMM YYYY').format('YYYY-MM-DD') : date = null

            let documentType = $(cells[3]).text().trim() || null
            let summary = $(cells[4]).text().trim() || null


            let doc = {
                URI: [link, decodeURI(link), encodeURI(decodeURI(link))].filter((c, i, a) => a.indexOf(c) === i),
                judgeMentNumber: judgeMentNumber,
                case: caseText,
                dateOriginale: dateOriginale,
                documentType: documentType,
                summary: summary,
                date: date,
                year: null,
                URL: [URL, decodeURI(URL), encodeURI(decodeURI(URL))].filter((c, i, a) => a.indexOf(c) === i),

            };
            data.push(doc)
        })
        return data

    }
}