function parsePage({ responseBody, URL }) {
    const $ = cheerio.load(responseBody.content);
    let page_title = $("title").text().replace(/\s+/g, " ").trim();
    console.log(page_title);
    const results = [];
    $("div.entry-content > table > tbody> tr:has(a)").each(function(i) {
        let cells = $(this).children();
        let identification = cells.first().text().replace(/\s+/g, " ").trim();
        let resolution_number = /(\d+)/.exec(identification);
        resolution_number = resolution_number ? resolution_number[1] : null;
        let oficio_number = /((sir|SUPERIR)[^\d]+\d+)/i.exec(identification);
        oficio_number = oficio_number ? oficio_number[1] : null;
        if (oficio_number) {
            //remain wih the number only
            oficio_number = oficio_number.replace(/[^0-9]/g, "");
        }

        let date = /([0-9\/\-]{10})/i.exec(identification);
        date = date ? date[1] : null;
        let d = moment(date || "", "DD/MM/YYYY");
        date = d.isValid() ? d.format("YYYY-MM-DD") : null;
        let summary = cells.eq(1).text().replace(/\s+/g, " ").trim();
        let URI = cells.last().find('a').attr('href');
        URI = URI ? url.resolve(URL, URI) : null;
        let doc = { oficio_number, resolution_number, date, URI, identification, summary, class: 'oficio' };
        if (/Resoluci/i.test(page_title)) {
            delete doc.oficio_number;
            doc.class = "resolution";
        } else {
            delete doc.resolution_number;
        }
        results.push(doc)
    });
    return results;
}