async function fetchPage({ canonicalURL, requestURL, requestOptions, headers }) {
    if (!requestOptions) requestOptions = { method: "GET", headers };
    if (!canonicalURL) canonicalURL = requestURL;
    if (!requestURL) requestURL = canonicalURL;
    return await fetchWithCookies(requestURL, requestOptions).then((response) => {
        return {
            canonicalURL,
            request: Object.assign({ URL: requestURL }, requestOptions),
            response,
        };
    });
}
async function fetchURL({ canonicalURL, headers }) {
    if (/https?:.*https?:/i.test(canonicalURL)) {
        console.error("Rejecting URL", canonicalURL, `returning [];`);
        return [];
    }

    let responsePage = await fetchPage({ canonicalURL, headers })
    if (responsePage.response.status === 200) {
        return [responsePage]
    } else {
        //on the headers add a different user agent
        return [await puppeteerFetch({ canonicalURL, requestURL, headers })];


    }




}
async function puppeteerFetch({ canonicalURL, headers }) {
    const page = await puppeteerManager.newPage();
    await page.goto(canonicalURL, {
        waitFor: "networkidle0",
        timeout: 30000
    }).catch(e => console.error(`Puppeteer still loading page ${canonicalURL}`));
    let html = await page.evaluate(() => document.documentElement.outerHTML);

    return simpleResponse({
        canonicalURL,
        mimeType: "text/html",
        responseBody: html,
    });
}