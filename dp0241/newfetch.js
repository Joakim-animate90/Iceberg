async function fetchPage({canonicalURL, requestURL, requestOptions, headers}) {
    if (!requestOptions) requestOptions = {method: "GET", headers};
    if (!canonicalURL) canonicalURL = requestURL;
    if (!requestURL) requestURL = canonicalURL;
    return await fetchWithCookies(requestURL, requestOptions)
        .then(response => {
            return {
                canonicalURL,
                request: Object.assign({URL: requestURL}, requestOptions),
                response
            };
        });
}


let mapURL = {
    "/no/hoyesterett/avgjorelser/2022/": "cbe4b4c5-12fb-483a-930b-c47298e4a055",
    "/no/hoyesterett/avgjorelser/2022/hoyesteretts-ankeutvalg---straff/": "1b2032ad-a8e4-48b7-b205-283a0cf3707c",
    "/no/hoyesterett/avgjorelser/2022/hoyesterett---sivil/": "1b2032ad-a8e4-48b7-b205-283a0cf3707c",
    "/no/hoyesterett/avgjorelser/2022/hoyesteretts-ankeutvalg---sivil/": "1b2032ad-a8e4-48b7-b205-283a0cf3707c",
    "/no/hoyesterett/avgjorelser/2021/":"2ec0e022-8072-43f3-bdd6-13d951a5c172",
    "/no/hoyesterett/avgjorelser/2021/hoyesteretts-ankeutvalg-straff/": "1b2032ad-a8e4-48b7-b205-283a0cf3707c",
    "/no/hoyesterett/avgjorelser/2021/hoyesterett-sivil/": "1b2032ad-a8e4-48b7-b205-283a0cf3707c",
    "/no/hoyesterett/avgjorelser/2021/hoyesteretts-ankeutvalg-sivil/": "1b2032ad-a8e4-48b7-b205-283a0cf3707c",

}

/**
 * Retrieves the home page content from the server.
 *
 * @param {Object} argument - The argument object.
 * @param {string} argument.canonicalURL - The canonical URL of the page.
 * @param {Object} argument.headers - The headers object.
 * @return {Promise<Response>} The response page from the server.
 */
const getHome = async function ({argument, canonicalURL, headers}) {
        let customHeaders = {
            "Content-Type": "application/json",
            "Origin": "https://www.domstol.no",
            "Referer": "https://www.domstol.no/no/hoyesterett/avgjorelser/2023/",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "sec-ch-ua": "\"Chromium\";v=\"116\", \"Not)A;Brand\";v=\"24\", \"Google Chrome\";v=\"116\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Linux\"",
            "Accept-Encoding": "gzip, deflate, br"
            };
        let _headers = Object.assign(customHeaders, headers);
        let replaceCanonical = canonicalURL.replace('https://www.domstol.no', '')
        let data = {
            "url": `${replaceCanonical}`,
            "isInEditMode": false,
            "currentBlockGuid": `${mapURL[replaceCanonical]}`,
            "language": "no"
        };
        let body = JSON.stringify(data);
        let method = "POST";
        let requestOptions = {method, body, headers: _headers};
        let requestURL = 'https://www.domstol.no/api/episerver/v3/compactcontentlist';
        let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
        //handle json
        let response = await handleHomeJSON(responsePage);
        // return links
        return [responsePage, response];
};
const getDocument = async function ({argument, canonicalURL, headers}) {
    let customHeaders = {
        "Content-Type": "application/json",
        "Origin": "https://www.domstol.no",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "sec-ch-ua": "\"Chromium\";v=\"116\", \"Not)A;Brand\";v=\"24\", \"Google Chrome\";v=\"116\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Linux\"",
        "Accept-Encoding": "gzip, deflate, br"
        };
    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    let requestOptions = {method, headers: _headers};
    let responsePage = await fetchPage({canonicalURL,  requestOptions});
    let response = await handleDocumentJSON(responsePage);
    // return links
    return [responsePage, response];
};

//handle the json

const handleHomeJSON = async function (responsePage) {
    const json = await responsePage.response.buffer();
    responsePage.response = new fetch.Response(json, responsePage.response);
    const json1 = await responsePage.response.json();
    const links = json1.map(elem => `https://www.domstol.no/api/episerver/v3.0/content/?contentUrl=${elem.PageUrl}`);
    const html = '<html><body></body></html>';
    const $ = cheerio.load(html);
    links.forEach((i, elem) => {
        appendLinkToBody($, elem, i);
    });
    const responseBody = $.html();
    const response = simpleResponse({
        canonicalURL:`https://www.domstol.no/api/episerver/v3.0/content/?text=html`,
        mimeType: "text/html",
        responseBody,
    });

    return response;
};

const handleDocumentJSON = async function (responsePage) {
    const json = await responsePage.response.buffer();
    responsePage.response = new fetch.Response(json, responsePage.response);
    const json1 = await responsePage.response.json();
    const body = json1[0].mainBody.value
    let uniqueId = json1[0].contentLink.id
    const html = '<html><body></body></html>';
    const $ = cheerio.load(html);
    appendFragmentHtml($,body)
    const responseBody = $.html();
    const response = simpleResponse({
        canonicalURL:`https://www.domstol.no/api/episerver/v3.0/content/?document=${uniqueId}`,
        mimeType: "text/html",
        responseBody,
    });

    return response;
};

function appendLinkToBody($,linkText, href) {
    let linkElement = $('<a></a>').attr('href',href).text(linkText);
    $('body').append(linkElement);
  }
function appendFragmentHtml($,body) {
    $('body').append(body);
  }

async function fetchURL({ canonicalURL, headers }) {
    if (/https?:.*https?:/i.test(canonicalURL)) {
        console.error("Rejecting URL", canonicalURL, `returning [];`);
        return [];
    }
    if(/contentURL/i.test(canonicalURL))
        return await getDocument({ canonicalURL, headers })
    if(/no\/hoyesterett\/avgjorelser\/202\d\/(w+)?\/$/i.test(canonicalURL))
        return await getHome({canonicalURL, headers})
    return [await fetchPage({canonicalURL, headers})]


}