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




const getPages = async function({ argument, canonicalURL, headers }) {
    let customHeaders = {
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "Referer": "https://www.aragon.es/",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-site",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        "sec-ch-ua": "\"Chromium\";v=\"112\", \"Google Chrome\";v=\"112\", \"Not:A-Brand\";v=\"99\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Linux\"",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);

    let method = "GET";
    let requestOptions = { method, headers: _headers };
    let url = canonicalURL.split('&appendDate')[0];
    let requestURL = url;
    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });
    let html = await responsePage.response.text();
    const $ = cheerio.load(html);
    $("a[href ^='javascript:Abrirobjeto']").each(function() {
        let href = $(this).attr('href');
        href = href ? url.resolve(requestURL, href) : null;
        if (!href) return;
        let arg = /javascript:Abrirobjeto\('(.+)'\)/i.exec(href)[1];
        if (arg) {
            $(this).attr('href', `https://gd.aragon.es/cgi-bin/ACTA/BRSCGI?CMD=VEROBJ&${arg}`)
        }
    });
    responsePage.response = new fetch.Response($.html(), responsePage.response);
    return responsePage;

};

async function fetchURL({ canonicalURL, headers }) {
    const match = canonicalURL.match(/appendTime=.+/i);
    if (match) {

        return [await getPages({ canonicalURL, headers })]
    }

    return [await fetchPage({ canonicalURL, headers })];
}