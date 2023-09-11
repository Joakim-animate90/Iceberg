async function parsePage({ URL, responseBody, html, responseURL }) {
    let data = [];
    html = await responseBody.content;
    if (html) {

        let $ = cheerio.load(html, { decodeEntities: false });

        let divResoluciones = $('div#resoluciones');
        //find div with class vc_tta-panel-body
        let divBody = divResoluciones.find('div.vc_tta-panel-body');
        //find divs with class row doc-download
        let divRow = divBody.find('div.row.doc-download');
        divRow.each((i, element) => {
            let div = $(element);
            let a = div.find('a');
            let href = a.attr('href');

            let doc = {
                URI: null,
                resolutionNo: null,
                summary: null,
                year: null,
                tipoDeContenido: 'Resoluciones',
                classificacion: 'Normativa',
                URL: [URL, decodeURI(URL), encodeURI(decodeURI(URL))].filter((c, i, a) => a.indexOf(c) === i),
            };
            let docURL = url.resolve(URL, href);
            doc.URI = docURL;
            let resolutionNo = div.find('div.col-xs-12.col-sm-8').text();
            let match = resolutionNo.match(/(\d{1,3}-\d{2,4})/);
            if (match) doc.resolutionNo = match[1] || null;
            if (doc.resolutionNo) doc.year = doc.resolutionNo.split('-')[1];
            if (doc.resolutionNo && doc.year.length === 2) doc.year = '20' + doc.year;
            let divSummary = div.find('div.col-xs-12.col-sm-8');

            let summary = divSummary.find('p').text();
            let summary2 = summary
            if (summary) {
                summary = summary.replace(/(\r\n|\n|\r)/gm, " ");
                if (doc.resolutionNo) summary = summary.split(doc.resolutionNo)[1] || summary;
                if (!doc.resolutionNo) summary = summary2.replace(/(\r\n|\n|\r)/gm, " ");
                // a regex to match Fecha: 04/10/2018
                let regex = /Fecha(\s+)?:(\s+)?(\d{1,2}\/\d{1,2}\/\d{4})/
                summary = summary.replace(',', '') || summary
                doc.summary = summary.replace(regex, ' ') || summary
                if (!doc.summary) doc.summary = null
                let date = div.find('p').find('span').text();
                if (date) {
                    date = date.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
                    if (date) {
                        doc.dateOriginalePublished = date[1] || null;
                        let momentDate = moment(doc.dateOriginalePublished, 'DD/MM/YYYY').format('YYYY-MM-DD');
                        let d = moment(momentDate)
                        doc.date = d.isValid() ? doc.date = momentDate : null
                    }
                }
                data.push(doc);
            }
        });
    }
    return data;
}

function removeNonAlpha(string) {
    let index = 0;
    // Remove non-alphabetical characters from the beginning
    while (index < string.length && !/[a-zA-Z]/.test(string.charAt(index))) {
        index++;
    }
    string = string.slice(index).replace(/^[^a-zA-Z]+/, '');
    return string;
}