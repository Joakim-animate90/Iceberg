function parsePage({ responseBody, URL, html, referer }) {
    console.log(`parsePage: parsing: ${responseBody.fileFormat} ${URL}`);
    const $ = cheerio.load(responseBody.content, { decodeEntities: false });
    const docs = [];
    const fields = ["gazette_date", "gazette_number", "year", "section"];
    const map = {};
    let params = querystring.parse(URL.substring(URL.indexOf('?') + 1));
    let d = /\d{8}/i.test(params.m) && moment(params.m, "YYYYMMDD");
    let year = d && d.isValid() ? d.year() : null;
    if (!d) {
        let m = /^(\d{4})/i.exec(params.m);
        year = m && parseInt(m[1]);
    }
    let gazette_date = d && d.isValid() ? d.format("YYYY-MM-DD") : null;
    $("div.post").each(function(i) {
        const div = $(this);
        const doc = { URI: [] };
        for (let i = 0; i < fields.length; i++) {
            doc[fields[i]] = null;
        }
        let text = div.find(">h2[id][class]").first().text().replace(/[\s]+/g, " ").trim();
        doc.title = text;
        text = text.substring(text.indexOf(':') + 1).trim();
        doc.extraordinario = /extraordinar/i.exec(text) ? true : false;
        doc.gazette_number = /^\d+/.exec(text);
        doc.gazette_number = doc.gazette_number ? doc.gazette_number[0] : null;
        doc.gazette_date = gazette_date;
        let year = moment(doc.gazette_date).year() || null
        doc.section = text.replace(doc.gazette_number, "").trim();
        doc.summary = div.find(".post-resumen").text().replace(/\s+/g, " ").trim() || null;
        doc.category = div.find("a[rel=category]").toArray().map(a => $(a).text().replace(/\s+/g, " ").trim()).filter(x => x);
        doc.subtitle = div.find(".postmeta").text().replace(/\s+/g, " ").trim();
        let match = /\b([a-z]+ \d{1,2}, \d{4})\b/i.exec(doc.subtitle);
        if (match && !doc.gazette_date) {
            let d = moment(match[1].replace(/\W+/i, " ") || "", ['MMMM D YYYY'], 'es');
            doc.gazette_date = d.isValid() ? d.format("YYYY-MM-DD") : null;
            doc.year = d && d.isValid() ? d.year() : year;
            // console.log(`doc date: ${d.format("YYYY-MM-DD")}`);
        }
        let a = div.find("a[target]");
        let URI = a.attr('href');
        URI = URI ? url.resolve(URL, URI) : null;
        URI && doc.URI.push(URI);
        if (!URI) {
            console.log(`No uRL for doc ${JSON.stringify(doc)}`);
            return;
        } else if (map[URI]) {
            console.log(`Duplicate doc for URL ${URI}`);
            return;
        }
        doc.year = d && d.isValid() ? d.year() : year;
        map[URI] = doc; //filter out duplicates
    });

    for (const d in map) {
        docs.push(map[d]);
    }

    if (docs.length === 0) {

        parsePageNew({ $, docs, fields, map, URL, html, gazette_date, d })
            //return [me.length]

        for (const d in map) {
            docs.push(map[d]);
        }

    }
    return docs;
}

function parsePageNew({ $, docs, fields, map, URL, html, gazette_date, d }) {
    //for each class card-body in the body
    let cardsRow = $(".col-12.col-md-8");
    let cards = cardsRow.find("div.card-body");
    //return [cards.length]

    cards.each(function(i) {
        const doc = { URI: [] };
        let card = $(this);
        for (let i = 0; i < fields.length; i++) {
            doc[fields[i]] = null;
        }
        let text = card.find("h2").first().text().replace(/[\s]+/g, " ").trim();
        doc.title = text;
        doc.extraordinario = /extraordinar/i.exec(text) ? true : false;
        doc.gazette_number = /\d+/.exec(text);
        doc.gazette_number = doc.gazette_number ? doc.gazette_number[0] : null;
        // doc.gazette_date = gazette_date;
        //let year = moment(doc.gazette_date).year() || null
        doc.section = text.replace(doc.gazette_number, "").trim();
        doc.category = card.find("h6").toArray().map(a => $(a).text().replace(/\s+/g, " ").trim()).filter(x => x);
        //for each p in the card-body get the text and join
        let p = card.find("p").toArray().map(p => $(p).text().replace(/\s+/g, " ").trim()).filter(x => x);
        doc.summary = p.join(" ");
        doc.subtitle = card.find("blockquote").text().replace(/\s+/g, " ").trim();
        // Públicado en junio 9, 2023
        let gazette_date = /\b([a-z]+ \d{1,2}, \d{4})\b/i.exec(doc.subtitle);
        doc.gaz = gazette_date;
        //convert to moment and format
        if (gazette_date && !doc.gazette_date) {
            let d = moment(gazette_date[1].replace(/\W+/i, " ") || "", ['MMMM D YYYY'], 'es');
            doc.gazette_date = d.isValid() ? d.format("YYYY-MM-DD") : null;
            doc.year = d && d.isValid() ? d.year() : year;
            // console.log(`doc date: ${d.format("YYYY-MM-DD")}`);
        }

        let a = card.find("a[target]");
        let URI = a.attr('href');
        URI = URI ? url.resolve(URL, URI) : null;
        URI && doc.URI.push(URI);
        if (!URI) {
            console.log(`No uRL for doc ${JSON.stringify(doc)}`);
            return;
        } else if (map[URI]) {
            console.log(`Duplicate doc for URL ${URI}`);
            return;
        }
        doc.year = d && d.isValid() ? d.year() : year;
        map[URI] = doc; //filter out duplicates

    })

}