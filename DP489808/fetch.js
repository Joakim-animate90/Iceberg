//import puppeteer-core
import puppeteer from 'puppeteer-core';
import {discoverLinks} from './disc.js';
import fetch from 'node-fetch'
import {getSeeds}  from './getSeeds.js';

const AUTH = 'brd-customer-hl_c6129ab6-zone-scraping_browser1:j6x7j107kgpw'
const SBR_WS_ENDPOINT = `wss://${AUTH}@brd.superproxy.io:9222`;
async function fetchPage({canonicalURL, requestURL, requestOptions, headers}) {
    if (!requestOptions) requestOptions = {method: "GET", headers};
    if (!canonicalURL) canonicalURL = requestURL;
    if (!requestURL) requestURL = canonicalURL;
    return await fetch(requestURL, requestOptions)
        .then(response => {
            return {
                canonicalURL,
                request: Object.assign({URL: requestURL}, requestOptions),
                response
            };
        });
}
let headers = {
    "authority": "www.msp.gob.do",
    "cache-control": "no-cache",
    "pragma": "no-cache",
    "sec-ch-ua": "\"Chromium\";v=\"116\", \"Not)A;Brand\";v=\"24\", \"Google Chrome\";v=\"116\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Linux\"",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "none",
    "sec-fetch-user": "?1",
    "upgrade-insecure-requests": "1",
    "Accept-Encoding": "gzip, deflate, br"
};
const getPdf= async function ({argument, canonicalURL, headers}) {
    let customHeaders = {
                "authority": "www.msp.gob.do",
                "cache-control": "no-cache",
                "pragma": "no-cache",
                "sec-ch-ua": "\"Chromium\";v=\"116\", \"Not)A;Brand\";v=\"24\", \"Google Chrome\";v=\"116\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Linux\"",
                "sec-fetch-dest": "document",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "none",
                "sec-fetch-user": "?1",
                "upgrade-insecure-requests": "1",
                "Accept-Encoding": "gzip, deflate, br"
            };
    let _headers = Object.assign(customHeaders, headers);
    
    let method = "GET";
    let requestOptions = {method, headers: _headers};
    let responsePage = await fetchPage({canonicalURL, requestOptions});
    return [responsePage];
};
function removeHTMLTags(str) {
    return str.replace(/<[^>]+>/g, '');
  }

async function home({ canonicalURL, headers }) {
     let puppeteerManager = await puppeteer.connect({
        browserWSEndpoint: `wss://${AUTH}@zproxy.lum-superproxy.io:9222`,
    });

    try {
        const page = await puppeteerManager.newPage();
        console.log('Connected! Navigating to https://www.msp.gob.do/web/Transparencia/base-legal-resoluciones/...');

        await page.goto(canonicalURL);
        await page.waitForSelector('[href]', { timeout: 15000 });

        console.log('Navigated! Scraping page content...');
        let responseBody = await page.evaluate(() => document.body.innerHTML);

        let cleanedResponseBody = responseBody.replace(/<\/a><\/div><\/li>/g,'') 
        cleanedResponseBody = removeHTMLTags(cleanedResponseBody)
        cleanedResponseBody = JSON.parse(cleanedResponseBody);

        const response = {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(cleanedResponseBody),
        };
        
        console.log(response)
        return [response]
    } finally {
        await puppeteerManager.close();
    }

}





async function performFetchForUrls(urls) {
  for (const url of urls) {
    try {
      await fetchURL({ canonicalURL: url });
    } catch (error) {
      console.error(`Error fetching URL: ${url}`, error);
    }
  }
}


async function fetchURL({ canonicalURL, headers }) {
    if(/rootcat/i.test(canonicalURL)){
        console.log('Processing URL:' + canonicalURL)
        //return [await gethome({ canonicalURL, headers })]
    }else if(/pdf/i.test(canonicalURL)){
        console.log('Processing URL:' + canonicalURL)
        //return await getPdf({ canonicalURL, headers })
    }else{
        return [await fetchPage({ canonicalURL, headers })]
    }

}

async function main() {
    const getSeedsList = await getSeeds();
    const failedURLs = [];
    
    for (const canonicalURL of getSeedsList) {
        try {
            const response = await home({canonicalURL});
            const { body, headers } = response[0];
            const discover = discoverLinks({ content: body, contentType: headers['Content-Type'], canonicalURL });
            await performFetchForUrls(discover);
        } catch (err) {
            console.error(err.stack || err);
            failedURLs.push(canonicalURL);
        }
    }
    
    await retryFailedURLs(failedURLs, 5);
}

async function retryFailedURLs(failedURLs, maxRetries) {
    for (const canonicalURL of failedURLs) {
        let retryCount = 0;
        
        while (retryCount < maxRetries) {
            try {
                const response = await home({canonicalURL});
                const { body, headers } = response[0];
                const discover = discoverLinks({ content: body, contentType: headers['Content-Type'], canonicalURL });
                await performFetchForUrls(discover);
                break; // Retry successful, exit loop
            } catch (err) {
                console.error(`Error fetching URL: ${canonicalURL}, Retrying...`);
                retryCount++;
            }
        }
        
        if (retryCount === maxRetries) {
            console.error(`Max retry attempts reached for URL: ${canonicalURL}`);
            process.exit(1);
        }
    }
}

main();