import puppeteer from 'puppeteer';
import moment from 'moment';
import fs from 'fs';
import cheerio from 'cheerio';

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

const parseCheckIfCorrectPagination = async function({ canonicalURL, responsePage, i }) {
    let html = await responsePage.response.buffer();
    //responsePage.response = new fetch.Response(html, responsePage.response);
    const $ = cheerio.load(html);
    // <div class="tableCentro" bis_skin_checked="1">Pagina 4 de 4</div>
    let numberOfPages = $(".tableCentro").text().trim();
    numberOfPages = numberOfPages.match(/Pagina (\d+) de (\d+)/i);
    // get the first number
    let currentPage = numberOfPages[1];
    currentPage = parseInt(currentPage)
    let page = i

    page = parseInt(page) ? parseInt(page) : 1
    if (currentPage !== page) {
        // 
        i = i - 1
    }

    return responsePage;
};


async function home({ canonicalURL, headers }) {



    const puppeteerManager = await puppeteer.launch({ headless: false, ignoreDefaultArgs: ['--disable-extensions', '--ignore-certificate-errors'] })
    const page = await puppeteerManager.newPage({
        incognito: true,
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15",
        downloadContentTypes: ["application/pdf"]
    });


    console.log("GOTO>>>>>> " + '');
    await page.goto('https://www.portaltransparencia.cl/PortalPdT/directorio-de-organismos-regulados/?org=AW004&pagina=58316896', {
        waitUntil: 'load',
        timeout: 60000
    }).catch((err) => {
        console.error("Page did not load.", err)
    });

    return;
    //  <input style="width: 73px;" alt="Dia - Mes - Año" id="contentSV:frm2:idFechaDesde.day" name="contentSV:frm2:idFechaDesde.day" size="2" maxlength="2" value="01">
    await page.waitForSelector('#contentSV\\:frm2\\:idFechaDesde\\.day');
    //await page.waitForTimeout(1000);
    // use page.evaluate to execute DOM manipulation
    await page.evaluate(() => {
        document.querySelector('#contentSV\\:frm2\\:idFechaDesde\\.day').value = '01';
    })

    await page.waitForTimeout(100);

    await page.select('#contentSV\\:frm2\\:idFechaDesde\\.month', '1');

    await page.waitForTimeout(100);

    await page.evaluate(() => {

        //year
        document.querySelector('#contentSV\\:frm2\\:idFechaDesde\\.year').value = '2014';
    })




    await page.waitForTimeout(100);

    await page.evaluate(() => {
        //day 
        document.querySelector('#contentSV\\:frm2\\:idFechaHasta\\.day').value = '31';
    })

    await page.waitForTimeout(1000);

    await page.select('#contentSV\\:frm2\\:idFechaHasta\\.month', '12');


    await page.evaluate(() => {
        //year
        document.querySelector('#contentSV\\:frm2\\:idFechaHasta\\.year').value = '2014';
    })


    await page.click('#contentSV\\:frm2\\:j_id_id26pc2');

    await page.waitForTimeout(5000);
    await page.waitForSelector('table tr');

    //     let i = 1;

    //    let pageNumber = canonicalURL.split('page=')[1];
    //    pageNumber = parseInt(pageNumber);
    //     // Click on the "Siguiente»" link inside the specified <td> element of the first row
    //     while (i <= pageNumber) {
    //     const firstRow = await page.$('table.paginator tbody tr:first-child');
    //     await firstRow.$eval(`td:nth-child(${i}) a`, (link) => link.click())
    //     //await page.waitForTimeout(000);
    //     await page.waitForSelector('table tr');
    //     i++;
    // }
    let i = 0;
    let responseBody = await page.evaluate(() => document.documentElement.innerHTML);

    let responses = []
    while (i <= 1) {
        if (i !== 0) {
            // const firstRow = await page.$('table.paginator tbody tr:first-child');
            // await firstRow.$eval(`td:nth-child(3) a`, (link) => link.click())
            const siguienteLink = await page.$('table.tableCentro a[href^="#"][onclick*=j_id_id100pc2next]');
            await siguienteLink.click()

            console.log("clicked on " + 3)
            await page.waitForTimeout(5000);

            //await page.waitForSelector('table tr');
            responseBody = await page.evaluate(() => document.documentElement.innerHTML);
            // parseCheckIfCorrectPagination({ responsePage: responseBody, i })

            // check if correct pa
        };


        let $ = cheerio.load(responseBody);

        let table = $('table')
        let tbody = table.find('tbody')
        let rows = tbody.find('tr')
            //use each to iterate over the rows
            // throw(rows.length)
        const tableRows = await page.$$('table tr');

        // Iterate over each table row
        for (const row of tableRows) {
            // Find the <td> elements within the row
            const tds = await row.$$('td');

            // Check if the row has at least 7 columns (td)
            if (tds.length >= 7) {
                // Extract the fecha and numero values from the respective columns
                let name = await (await tds[0].getProperty('textContent')).jsonValue();
                const fecha = await (await tds[6].getProperty('textContent')).jsonValue();
                const numero = await (await tds[5].getProperty('textContent')).jsonValue();
                name = caesarCipherEncode(name, 3);

                // Create the href using the fecha and numero values
                const href = `https://wl.superfinanciera.gov.co/SiriWeb/publico/sancion/rep_sanciones_general.jsf?name=${name}&fecha=${fecha}&numero=${numero}.pdf`;

                // Perform desired action with the href (e.g., store it in an array)
                responses.push(href);
            }
        }




        i = i + 1
    }
    //console.log(responses)
    // Write the hrefs to a file
    fs.writeFile('2020-2020.txt', responses.join('\n'), (err) => {
        if (err) {
            console.error('Error writing file:', err);
        } else {
            console.log('Hrefs saved to file: hrefs.txt');
        }
    });
    return responses;










    //     contentSV:frm2:sancion_valores
    //     wait for the selector to load
    //     await page.waitForSelector('#contentSV\\:frm2\\:sancion_valores');


    //     let responseBody = await page.evaluate(() => document.documentElement.innerHTML);
    //     let $ = cheerio.load(responseBody);


    //     let response =   simpleResponse({
    //         canonicalURL,
    //         mimeType: "text/html",
    //         responseBody: responseBody,
    //    })

    //     await page.click('#contentSV\\:frm2\\:sancion_valores tbody tr.row1Borde td:nth-child(6) a');
    //     const $ = cheerio.load(responseBody);
    //     console.log("Row clicked")





    //     // its a pdf so wait for the selector to load






}

async function fetchURL({ canonicalURL, headers }) {
    // https://wl.superfinanciera.gov.co/SiriWeb/publico/sancion/rep_sanciones_general.jsf?page=1

    if (/page=\d+/i.test(canonicalURL)) {
        return await home({ canonicalURL, headers });
    }
}

//fetchURL({ canonicalURL: 'https://wl.superfinanciera.gov.co/SiriWeb/publico/sancion/rep_sanciones_general_par.jsf?page=3', headers: {} })

fetchURL({ canonicalURL: 'https://www.portaltransparencia.cl/PortalPdT/directorio-de-organismos-regulados/?org=AW004&pagina=58316896&year=2023&section=Instructivos&page=1', headers: {} })


//   // Convert the responses array to a newline-separated string
// const data = responses.join('\n');

// // Specify the file path where you want to write the response
// const filePath = 'responses.txt';

// // Write the data to the file
// fs.writeFile(filePath, data, (err) => {
//   if (err) {
//     console.error('Error writing file:', err);
//     return;
//   }
//   console.log('Responses written to file:', filePath);
// });