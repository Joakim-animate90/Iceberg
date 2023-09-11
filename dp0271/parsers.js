function parsePage({ responseBody, URL }) {
    const $ = cheerio.load(responseBody.content);
    const results = [];
    const translateLabel = function(label) {
        if (!label || !label.trim()) label = null;
        else if (/Resumen\s+tem[^\s]+tico/i.test(label))
            label = 'resumenTematico';
        else if (/N[^\s]+mero/i.test(label))
            label = 'numero';
        else if (/Tipo de contrato/i.test(label))
            label = 'tipoDeContrato';
        else if (/Sentido del acuerdo/i.test(label))
            label = 'sentidoDeAcuerdo';
        else if (/Fecha de adopci[^\s]+n/i.test(label))
            label = 'date';

        return label;
    };
    $("body>div:has(h2)").each(function() {
        let div = $(this);
        let doc = { URI: null };
        doc.title = div.find("h2").text().replace(/\s+/g, " ").replace(/^T[^\s]+tulo:\s+/i, "").trim();
        let header = $('body').find("h1").text()
        let document_type = header.split('del')[0]
        let emisor = header.split('del')[1]
        doc.emisor = emisor
        doc.header = header
        doc.documentType = document_type ? document_type : "Acuerdos";
        div.find("span:has('>strong')").each(function() {
            let span = $(this);
            let label = span.find('>strong').text().replace(/\s+/g, " ").trim();
            label = translateLabel(label);
            if (!label) return;
            span.find('>strong').remove();
            let value = span.text().replace(/\s+/g, " ").trim();

            if (/date/i.test(label)) {
                doc.dateOriginale = value
                let d = moment(value, ["D/MM/YY", "DD/MM/YYYY"]);
                if (d.isValid())
                    value = d.format("YYYY-MM-DD");
            }
            doc[label] = value;
        });
        let href = div.find('a').last().attr('href');
        href = href ? url.resolve(URL, href) : null;
        let href2 = href.replace('gd', 'archivo')
        href2 = href2.replace('https', 'http')
        doc.URI = [href, href2];
        doc.URL = URL
        results.push(doc);
    });
    //filter only docs for 2021 
    let filteredDocs = results.filter(doc => {
        let date = doc.dateOriginale
            //use moment 
        let d = moment(date, ["D/MM/YY", "DD/MM/YYYY"]);
        if (d.isValid()) {
            let year = d.format("YYYY");
            if (year > 2021) {
                return doc
            }
        }
    })

    return filteredDocs;
}