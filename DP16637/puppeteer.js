import puppeteer from 'puppeteer';
import moment from 'moment';
import fs from 'fs';
import cheerio from 'cheerio';



async function home({ canonicalURL, headers }) {
    let responses = []
    const puppeteerManager = await puppeteer.launch({ headless: false, ignoreDefaultArgs: ['--disable-extensions', '--ignore-certificate-errors'] })
    const page = await puppeteerManager.newPage({
        incognito: true,
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15",
        downloadContentTypes: ["application/pdf"]
    });


    console.log("GOTO>>>>>> " + '');
    await page.goto('https://docs.rscsl.org/embed/decisions', {
        waitUntil: 'load',
        timeout: 60000
    }).catch((err) => {
        console.error("Page did not load.", err)
    });
    // await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
    //await page.waitForSelector('select[name="dt_decisions_datatables_length"]'
    // Extract CSRF token from the page's HTML
    const csrfToken = await page.evaluate(() => {
        const metaTag = document.querySelector('meta[name="csrf-token"]');
        return metaTag ? metaTag.getAttribute('content') : null;
    });
    console.log(csrfToken)
        // Click on the element with CSRF protection

    await page.waitForSelector('select[name="dt_decisions_datatables_length"]');

    // Select the <select> element with CSRF protection
    await page.select('select[name="dt_decisions_datatables_length"]', '100');
    await page.waitForTimeout(500);
    // responseBody = await page.evaluate(() => document.documentElement.innerHTML);
    // responses.push(
    //     simpleResponse({
    //         canonicalURL,
    //         mimeType: "text/html",
    //         responseBody: responseBody,
    //     })
    // );
    let i = 2

    while (i < 9) {

        await page.click(`a[data-dt-idx="${i}"]`, {
            headers: {
                'X-CSRF-Token': csrfToken,
            },
        });
        await page.waitForTimeout(2000);
        // responseBody = await page.evaluate(() => document.documentElement.innerHTML);
        // responses.push(
        //     simpleResponse({
        //         canonicalURL,
        //         mimeType: "text/html",
        //         responseBody: responseBody,
        //     })
        // );
        i++
    }

}

async function fetchURL({ canonicalURL, headers }) {
    // https://wl.superfinanciera.gov.co/SiriWeb/publico/sancion/rep_sanciones_general.jsf?page=1


    return await home({ canonicalURL, headers });

}

//fetchURL({ canonicalURL: 'https://wl.superfinanciera.gov.co/SiriWeb/publico/sancion/rep_sanciones_general_par.jsf?page=3', headers: {} })

fetchURL({ canonicalURL: 'https://rscsl.org/the-rscsl/rscsl-decisions/', headers: {} })