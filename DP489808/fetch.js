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
       // await page.close();
    }

}





async function performFetchForUrls(urls) {
  for (const url of urls) {
    await fetchURL({ canonicalURL: url });
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
    let getSeedsList = await getSeeds();
    
    for (let i = 0; i < getSeedsList.length; i++) {
 
        let canonicalURL = getSeedsList[i];
        let response = await home({canonicalURL}).catch(err => {
             console.error(err.stack || err);
             process.exit(1);
        });

        let content = response[0].body
        let contentType = response[0].headers['Content-Type']

        console.log(content)
        console.log(contentType)

        let discover = discoverLinks({ content, contentType, canonicalURL }) 

        await performFetchForUrls(discover)
    }
}

main();