function capitalize(text) {
    let array_descripcion = [];

    let array_words = text.split(" ")
    let first_word = array_words.shift();

    first_word = first_word.charAt(0).toUpperCase() + first_word.slice(1).toLowerCase();


    return first_word + " " + array_words.join(" ").toLowerCase();
}


function parsePage({ URL, responseBody, referer }) {

    let $ = cheerio.load(responseBody.content);
    let rows = $("table#MainContent_gv_Iniciativas tr:has(a)")
    let documents = [];
    rows.each(function(i, tr) {
            let columns = $(tr).children("td");
            let doc = {};
            let hasURI = false;
            columns.each(function(j, td) {
                let value = $(td).text().trim();
                let header = $("table#MainContent_gv_Iniciativas tr").first().find("th").eq(j).text().trim();
                console.log("value:" + value);
                console.log("header" + header);
                if (/TIPO/i.test(header)) header = 'tipo';
                if (/FECHA/i.test(header)) { //YYYY/MM/DD
                    header = 'fecha';
                    let datem = moment(value, "YYYY/MM/DD");
                    let date = datem.isValid() ? datem.format("YYYY-MM-DD") : null
                    doc.originalDate = value;
                    value = date;
                }
                if (/DESCRIPCIÓN/i.test(header)) {
                    header = 'descripcion';
                    value = capitalize(value);
                }
                if ($(td).has("a")) {
                    let href = $(td).find("a").attr("href");
                    if (href) {
                        href = url.resolve(URL, href);
                        header = "URI";
                        value = href;
                        hasURI = true;
                    }
                }
                if (header.trim()) {
                    doc[header] = value;
                }

            })
            if (hasURI) {
                doc.URL = URL;
                documents.push(doc);
            }
        })
        //return only tipo which has "iniciativa" USE A regex 
    documents = documents.filter(doc => /iniciativa/i.test(doc.tipo));
    //from 2023-03-16
    documents = documents.filter(doc => moment(doc.fecha, "YYYY-MM-DD").isAfter("2023-03-16"));

    return documents;
}