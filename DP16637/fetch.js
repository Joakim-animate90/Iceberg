async function fetchPage({ canonicalURL, requestURL, requestOptions, headers }) {
    if (!requestOptions) requestOptions = { method: "GET", headers };
    if (!canonicalURL) canonicalURL = requestURL;
    if (!requestURL) requestURL = canonicalURL;
    return await fetchWithCookies(requestURL, requestOptions)
        .then(response => {
            return {
                canonicalURL,
                request: Object.assign({ URL: requestURL }, requestOptions),
                response
            };
        });
}




const getHome = async function({ argument, canonicalURL, headers }) {
    let customHeaders = {
        "authority": "rscsl.org",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "sec-ch-ua": "\"Chromium\";v=\"112\", \"Google Chrome\";v=\"112\", \"Not:A-Brand\";v=\"99\"",
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
    let requestOptions = { method, headers: _headers };
    let requestURL = 'https://rscsl.org/the-rscsl/rscsl-decisions/';
    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });
    if (/html/i.test(responsePage.response.headers.get('content-type'))) {
        let html = await responsePage.response.text();
        const $ = cheerio.load(html);
        $("script, base, frame, frameset").remove();
        responsePage.response = new fetch.Response($.html(), responsePage.response)
    }
    return responsePage;
};




const getEachResult = async function({ argument, canonicalURL, headers }) {
    let customHeaders = {
        "authority": "rscsl.org",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "referer": "https://rscsl.org/the-rscsl/rscsl-decisions/",
        "sec-ch-ua": "\"Chromium\";v=\"112\", \"Google Chrome\";v=\"112\", \"Not:A-Brand\";v=\"99\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Linux\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);

    let method = "GET";
    let requestOptions = { method, headers: _headers };
    let requestURL = 'https://rscsl.org/download/rscsl-03-01-es-1463-taylor/';
    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });
    if (/html/i.test(responsePage.response.headers.get('content-type'))) {
        let html = await responsePage.response.text();
        const $ = cheerio.load(html);
        $("script, base, frame, frameset").remove();
        responsePage.response = new fetch.Response($.html(), responsePage.response)
    }
    return responsePage;
};

async function fetchURL({ canonicalURL, headers }) {
    if (/https?:.*https?:/i.test(canonicalURL)) {
        console.error("Rejecting URL", canonicalURL, `returning [];`);
        return [];
    }
    // match this url https://rscsl.org/the-rscsl/rscsl-decisions/

    return [await getEachResult({ canonicalURL, headers })]

}