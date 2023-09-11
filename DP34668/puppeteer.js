function caesarCipherEncode(text, shift) {
    let encodedText = '';

    for (let i = 0; i < text.length; i++) {
        let char = text[i];

        if (char.match(/[a-z]/i)) {
            const charCode = text.charCodeAt(i);
            let encodedCharCode;

            if (char === char.toUpperCase()) {
                encodedCharCode = ((charCode - 65 + shift) % 26) + 65; // Uppercase letters (A-Z)
            } else {
                encodedCharCode = ((charCode - 97 + shift) % 26) + 97; // Lowercase letters (a-z)
            }

            char = String.fromCharCode(encodedCharCode);
        }

        encodedText += char;
    }

    return encodedText;
}
async function home({ canonicalURL, headers }) {



    //const puppeteerManager = await puppeteer.launch({ headless: false })
    const page = await puppeteerManager.newPage({
        incognito: true,
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15",
        downloadContentTypes: ["application/pdf"]
    });


    console.log("GOTO>>>>>> " + '');
    await page.goto('https://wl.superfinanciera.gov.co/SiriWeb/publico/sancion/rep_sanciones_general_par.jsf', {
        waitUntil: 'load',
        timeout: 60000
    }).catch((err) => {
        console.error("Page did not load.", err)
    });
    // from canonicalURL extract the from and to dates
    // https://wl.superfinanciera.gov.co/SiriWeb/publico/sancion/rep_sanciones_general_par.jsf?from=2021-01-01&to=2023-12-01&encde=ciph&page=2
    let from = canonicalURL.split('from=')[1];
    from = from.split('&')[0];

    let to = canonicalURL.split('to=')[1];
    to = to.split('&')[0];
    let fromDay = from.split('-')[2];


    let fromMonth = from.split('-')[1];
    // remove leading zero
    fromMonth = fromMonth.replace(/^0+/, '');
    let fromYear = from.split('-')[0];

    let toDay = to.split('-')[2];
    let toMonth = to.split('-')[1];
    // remove leading zero
    toMonth = toMonth.replace(/^0+/, '');
    let toYear = to.split('-')[0];
    //  <input style="width: 73px;" alt="Dia - Mes - Año" id="contentSV:frm2:idFechaDesde.day" name="contentSV:frm2:idFechaDesde.day" size="2" maxlength="2" value="01">
    await page.waitForSelector('#contentSV\\:frm2\\:idFechaDesde\\.day');
    // use page.evaluate to execute DOM manipulation
    await page.evaluate((fromDay) => {
        document.querySelector('#contentSV\\:frm2\\:idFechaDesde\\.day').value = fromDay;
    }, fromDay)

    await page.waitForTimeout(100);

    await page.select('#contentSV\\:frm2\\:idFechaDesde\\.month', fromMonth);

    await page.waitForTimeout(100);

    await page.evaluate((fromYear) => {

        //year
        document.querySelector('#contentSV\\:frm2\\:idFechaDesde\\.year').value = fromYear;
    }, fromYear)




    await page.waitForTimeout(100);

    await page.evaluate((toDay) => {
        //day 
        document.querySelector('#contentSV\\:frm2\\:idFechaHasta\\.day').value = toDay;
    }, toDay)

    await page.waitForTimeout(1000);

    await page.select('#contentSV\\:frm2\\:idFechaHasta\\.month', toMonth);


    await page.evaluate((toYear) => {
        //year
        document.querySelector('#contentSV\\:frm2\\:idFechaHasta\\.year').value = toYear;
    }, toYear)


    await page.click('#contentSV\\:frm2\\:j_id_id26pc2');

    await page.waitForTimeout(5000);
    await page.waitForSelector('table tr');


    let i = 1;
    let responseBody = await page.evaluate(() => document.documentElement.innerHTML);


    let pageNumber = canonicalURL.split('page=')[1];
    pageNumber = parseInt(pageNumber);

    let responses = []

    const firstRow = await page.$('table.paginator tbody tr:first-child');
    await firstRow.$eval(`td:nth-child(${pageNumber}) a`, (link) => link.click())
    await page.waitForTimeout(15000);
    //await page.waitForSelector('table tr');
    responseBody = await page.evaluate(() => document.documentElement.innerHTML);


    let $ = cheerio.load(responseBody);
    let rootURL = canonicalURL.replace(/page=\d+/i, "");
    $(".paginator td a").each(function(i) {
        let a = $(this);
        let pageNumber = parseInt(a.text().trim());
        if (!pageNumber) return;
        let onclick = a.attr("onclick");
        let href = rootURL + "page=" + pageNumber
        a.attr('href', href);
        a.attr('_onclick', onclick);
        a.attr('onclick', "return false;");
    });

    let table = $('table');
    let tbody = table.find('tbody');
    let rows = tbody.find('tr');

    // Iterate over each table row
    rows.each(function() {
        let tds = $(this).find('td');

        // Check if the row has at least 7 columns (td)
        if (tds.length >= 7) {
            // Extract the fecha and numero values from the respective columns
            let name = tds.eq(0).text().trim();
            let fecha = tds.eq(6).text().trim();
            let numero = tds.eq(5).text().trim();
            name = caesarCipherEncode(name, 3);

            // Create the href using the fecha and numero values
            let href = `https://wl.superfinanciera.gov.co/SiriWeb/publico/sancion/rep_sanciones_general.jsf?name=${name}&fecha=${fecha}&numero=${numero}.pdf`;

            // Modify the value of the href in tds[5]
            let tdInnerHTML = tds.eq(5).html();
            let updatedInnerHTML = tdInnerHTML.replace(/#(?=[^"]*"[^"]*(?:"[^"]*"[^"]*)*$)/g, href);
            tds.eq(5).html(updatedInnerHTML);
        }
    });


    // responseBody = await page.evaluate(() => document.documentElement.innerHTML);
    responseBody = $.html()
    responses.push(
        simpleResponse({
            canonicalURL,
            mimeType: "text/html",
            responseBody: responseBody,
        })
    );


    return responses;

}

async function fetchURL({ canonicalURL, headers }) {
    // https://wl.superfinanciera.gov.co/SiriWeb/publico/sancion/rep_sanciones_general.jsf?page=1

    if (/page=\d+/i.test(canonicalURL)) {

        return await home({ canonicalURL, headers })
    }
}