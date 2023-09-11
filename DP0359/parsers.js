const IGNORE_BEFORE = "2021-08-01";

function parsePage({ responseBody, URL }) {
    const $ = cheerio.load(responseBody.content);
    const results = [];
    $("div.view-content > table.views-table > tbody > tr").each(function(i) {
        let row = $(this);
        let exp_date = row.find("td.views-field-field-resol-fecha-exp span[property='dc:date']").attr('content');
        let d = moment(exp_date || "");
        let doc = { exp_date };
        doc.date = d.isValid() ? d.format("YYYY-MM-DD") : null;
        doc.year = d.isValid() ? d.year() : null;
        doc.document_type = row.find("td.views-field-field-resol-doctype-1").text().replace(/\s+/g, " ").trim();
        doc.document_number = row.find("td.views-field-field-resol-number").text().replace(/\s+/g, " ").trim();
        doc.title = row.find("td.views-field-title").text().replace(/\s+/g, " ").trim();
        let match = /Res\S*\s+(\S+)( de (\d{1,2})[ de]* ([a-z]+),? [de ]*(\d{4})\b)?/i.exec(doc.title);
        doc.document_number = doc.document_number || match && match[1] || null;

        doc.spanish_date = row.find("td.views-field-field-resol-fecha-exp-1").text().replace(/\s+/g, " ").trim().replace(/^[a-z]+, ([a-z]+)/i, "$1");
        d = moment(doc.spanish_date || "", "MMMM D, YYYY", "es");
        doc["fecha_de_expedición"] = d.isValid() ? d.format("YYYY-MM-DD") : null;

        if (!doc.date && match && match[2]) {
            doc.spanish_date = `${match[3]} ${match[4]} ${match[5]}`;
            d = moment(doc.spanish_date || "", "D MMMM YYYY", "es");
            doc.date = d.isValid() ? d.format("YYYY-MM-DD") : null;
            doc.year = d.year || d.isValid() ? d.year() : null;
        }
        d = moment(doc["fecha_de_expedición"]);
        doc.year = d.year || d.isValid() ? d.year() : null;
        doc.topic = row.find("td.views-field-body").text().replace(/\s+/g, " ").trim().replace(/^["\s]+|[\s"]+$/ig, "");
        let a = row.find("td.views-field-descargar-archivo-ucm a").first();
        let href = a.attr('href');
        href = href ? url.resolve(URL, href) : null;
        doc.publicationDate = null;
        doc.pubDate = row.find('td.views-field-created').text().replace(/\s+/g, " ").trim();
        d = moment(doc.pubDate || "", ["M/D/YYYY", "D MMMM YYYY"], "es");
        doc.year = d.year || d.isValid() ? d.year() : null;
        doc.publicationDate = d.isValid() ? d.format("YYYY-MM-DD") : null;
        // check the href it has htttps or http
        let href2 = null;

        if (href) {
            //check if the href has http or https
            if (href.includes("http")) {
                href2 = href.replace("http", "https");
            } else {
                //replace the href with https
                href2 = href.replace("https", "http");
            }
        }




        doc.URI = [href, href2]
        href && results.push(doc);
        doc.date = doc.date || doc['fecha_de_expedición'];
    });
    return results.filter(d => {
        if (!IGNORE_BEFORE) return true;
        let limit = moment(IGNORE_BEFORE);
        if (limit.isValid())
            return limit.isSameOrBefore(d.date || d.publicationDate)
        return true;
    });
}