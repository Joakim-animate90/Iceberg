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
            //find each class row mt-0 px-3
        let rows = $('div.row.mt-0.px-3')
            //on each row find h2 and a

        rows.each((i, e) => {
            let summary = $(e).find('h2').text().trim()
            let link = $(e).find('a').attr('href')

            let doc = {
                URI: [link, decodeURI(link), encodeURI(decodeURI(link))].filter((c, i, a) => a.indexOf(c) === i),
                resolutionNumber: null,
                title: null,
                summary: summary,
                year: null,
                URL: [URL, decodeURI(URL), encodeURI(decodeURI(URL))].filter((c, i, a) => a.indexOf(c) === i),

            };
            // summary example Resolución MEM-CM-009-2023 Concesión de Exploración Minera BAHÍA BLANCA
            let regexDate = /\b(MEM-.+-)?\d+-\d{4}\b/;
            const match = summary.match(regexDate);
            if (match) {
                let text = match[0];
                // text trim
                text = text.trim()
                    //use a while loop to remove the first character if it is a space or a new line
                while (text[0] === ' ' || text[0] === '\n') {
                    text = text.substring(1)
                }
                //get the first 8 characters
                text = text.substring(0, 8)


                doc.resolutionNumber = text;

                let regex = /(\d{4})/
                let matchYear = text.match(regex)
                if (matchYear) {
                    matchYear = matchYear[1]
                    doc.year = matchYear
                    doc.title = summary.split(matchYear)[1]
                }
            } else {
                doc.resolutionNumber = null
                doc.year = null
            }
            let title = doc.title
            if (title)
                title = Capitalize(title.trim())
            doc.title = title
            data.push(doc)


        })



    }

    return data

}

function Capitalize(string) {
    let index = 0;

    // Remove non-alphabetical characters from the beginning
    while (index < string.length && !/[a-zA-Z]/.test(string.charAt(index))) {
        index++;
    }
    string = string.slice(index).replace(/^[^a-zA-Z]+/, '');

    // Capitalize the string if it starts with a lowercase letter
    if (index < string.length && string.charAt(index) === string.charAt(index).toLowerCase()) {
        string = string.charAt(index).toUpperCase() + string.slice(index + 1);
    }


    return string;
}