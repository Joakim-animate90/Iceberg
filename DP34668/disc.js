function discoverLinks({ canonicalURL, content, contentType }) {
    let hrefs = [];
    // get a regex to match the links in seed
    const isListing = canonicalURL.match(/pge=.+/i)
    if (isListing && /html/.test(contentType)) {
        let $ = cheerio.load(html);
        let table = $('#contentSV\\:frm2\\:sancion_valores')
        let tbody = table.find('tbody')
        let rows = tbody.find('tr')
        //use each to iterate over the rows
        // throw(rows.length)
        let responses = []
        for (let i = 0; i < rows.length; i++) {
            let row = rows[i];
            // get the td elements
            let tds = $(row).find('td');
    
            let a = $(tds[5]).find('a');
            let onclick = a.attr('onclick');
            let regex = /'([^']*)'/g;
            let match = onclick.match(regex);
            let value = match ? match[1] : "";
            // remove the '' from the value
            value = value.replace(/'/g, "");
            let fecha = $(tds[6]).text();
            let numero = $(tds[5]).text();
    
            let href = canonicalURL + "&numero=" + numero + "&fecha=" + fecha + "&payload=" + value;
    
            a.attr('href', canonicalURL + "&numero=" + numero + "&fecha=" + fecha + "&payload=" + value);
            a.attr('onclick', "return false;");

            hrefs.push(href);
        }

    }

    return hrefs;

}