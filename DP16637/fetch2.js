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


const getCSRFToken = async function({ responsePage }) {
    let html = await responsePage.response.buffer();
    responsePage.response = new fetch.Response(html, responsePage.response);

    const $ = cheerio.load(html);
    let csrfToken = $("meta[name='csrf-token']").attr("content");
    setSharedVariable('csrfToken', csrfToken)
    return csrfToken;
}

const getHome = async function({ argument, canonicalURL, headers }) {
    let customHeaders = {
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
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
    let requestURL = 'https://rscsl.org/the-rscsl/rscsl-decisions/';
    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });
    return responsePage;
};




const getEmbed = async function({ argument, canonicalURL, headers }) {
    let customHeaders = {
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "Referer": "https://rscsl.org/the-rscsl/rscsl-decisions/",
        "Sec-Fetch-Dest": "iframe",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-site",
        "Upgrade-Insecure-Requests": "1",
        "sec-ch-ua": "\"Chromium\";v=\"112\", \"Google Chrome\";v=\"112\", \"Not:A-Brand\";v=\"99\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Linux\"",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);

    let method = "GET";
    let requestOptions = { method, headers: _headers };
    let requestURL = 'https://docs.rscsl.org/embed/decisions';
    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });
    await getCSRFToken({ responsePage })
    return responsePage;
};




const getResults = async function({ argument, canonicalURL, headers }) {
    await getHome({ canonicalURL, headers })
    await getEmbed({ canonicalURL, headers })
    let csrfToken = getSharedVariable('csrfToken')
        // throw JSON.stringify(csrfToken)
    let customHeaders = {
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "Referer": "https://docs.rscsl.org/embed/decisions",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "X-CSRF-TOKEN": csrfToken,
        "X-Requested-With": "XMLHttpRequest",
        "sec-ch-ua": "\"Chromium\";v=\"112\", \"Google Chrome\";v=\"112\", \"Not:A-Brand\";v=\"99\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Linux\"",
        "Accept-Encoding": "gzip, deflate, br"

    };
    let _headers = Object.assign(customHeaders, headers);

    let method = "GET";
    let requestOptions = { method, headers: _headers };
    //get a timestamp for sierra leone
    let currentTime = new Date()
    const timestamp = currentTime.getTime();
    //throw JSON.stringify(timestamp)
    let requestURL = 'https://docs.rscsl.org/embed/decisions?draw=1&columns%5B0%5D%5Bdata%5D=id&columns%5B1%5D%5Bdata%5D=scsl_docno&columns%5B2%5D%5Bdata%5D=courtCase&columns%5B3%5D%5Bdata%5D=doc_date&columns%5B4%5D%5Bdata%5D=documentType&columns%5B5%5D%5Bdata%5D=title&columns%5B6%5D%5Bdata%5D=noofpages&order%5B0%5D%5Bcolumn%5D=3&order%5B0%5D%5Bdir%5D=desc&start=10&length=10&search%5Bvalue%5D=&_=';
    //throw JSON.stringify(requestURL)
    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });
    return responsePage;
};
async function fetchURL({ canonicalURL, headers }) {
    if (/https?:.*https?:/i.test(canonicalURL)) {
        console.error("Rejecting URL", canonicalURL, `returning [];`);
        return [];
    }
    if (/\.(pdf|docx?)\b/i.test(canonicalURL)) {
        return [await binaryDownload({ canonicalURL, headers })];
    }
    // match this url https://rscsl.org/the-rscsl/rscsl-decisions/
    if (canonicalURL.startsWith('https://rscsl.org/the-rscsl/rscsl-decisions/')) {
        return [await getResults({ canonicalURL, headers })]
    } else if (canonicalURL.startsWith('https://rscsl.org/download/')) {
        return [await getEachResult({ canonicalURL, headers })]

    }



}