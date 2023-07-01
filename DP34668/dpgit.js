async function fetchPage({ canonicalURL, requestURL, requestOptions, headers }) {
    if (!requestOptions) requestOptions = { method: "GET", headers };
    if (!canonicalURL) canonicalURL = requestURL;
    if (!requestURL) requestURL = canonicalURL;
    if (requestURL.match(/^https/i)) {
        // process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
        requestOptions.agent = new https.Agent({ rejectUnauthorized: false, keepAlive: true });
        // console.log("requestOptions.agent", requestOptions.agent);
    }
    return await fetchWithCookies(requestURL, requestOptions)
        .then(response => {
            return {
                canonicalURL,
                request: Object.assign({ URL: requestURL }, requestOptions),
                response
            };
        });
}



const getHome = async function({ headers, canonicalURL, argument }) {
    // canonicalURL https://wl.superfinanciera.gov.co/SiriWeb/publico/sancion/rep_sanciones_general.jsf?page=2&numero=890.pdf
    //get the numero from canonicalURL
    let numero = canonicalURL.match(/numero=(\d+)/i)[1];


    let customHeaders = {
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        "sec-ch-ua": "\"Google Chrome\";v=\"113\", \"Chromium\";v=\"113\", \"Not-A.Brand\";v=\"24\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "Accept-Encoding": "gzip, deflate, br",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36"
    };
    let _headers = Object.assign(customHeaders, headers);

    let method = "GET";
    let requestOptions = { method, headers: _headers };

    let requestURL = `https://raw.githubusercontent.com/Joakim-animate90/2018/main/${numero}.pdf`;
    // throw(requestURL)
    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });



    return responsePage;


};


const binaryDownload = async function({
    canonicalURL,
    requestURL,
    headers,
    requestOptions,
}) {
    let responsePage = await fetchPage({
        canonicalURL,
        requestURL,
        headers,
        requestOptions,
    });
    let type = responsePage.response.headers.get("content-type");
    if (/octet/i.test(type)) {
        let name = responsePage.response.headers.get("content-disposition");
        let newtype = /\.pdf/i.test(name) ?
            "application/pdf" :
            /\.docx/i.test(name) ?
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document" :
            /\.doc/i.test(name) ?
            "application/msword" :
            null;
        console.log("disposition:", type, name);
        if (newtype) {
            responsePage.response.headers.set("content-type", newtype);
            type = newtype;
            type && console.log(`TYPE = ${type}`);
        }
    }
    type && console.log(`TYPE = ${type}`);
    if (responsePage.response.ok && /pdf|word/i.test(type)) {
        //Make sure your binary fileType is permitted by this regex
        let contentSize = parseInt(
            responsePage.response.headers.get("content-length") || "-1"
        );
        let buffer = await responsePage.response.buffer();
        let bufferLength = buffer.length;
        if (contentSize < 0 || bufferLength === contentSize) {
            responsePage.response = new fetch.Response(buffer, responsePage.response);
        } else if (contentSize == 0 || bufferLength == 0) {
            //empty response
            responsePage.response.ok = false;
            responsePage.response.status = 404;
            responsePage.response.statusText =
                `Empty ${type} document download: ${contentSize} > ${bufferLength}\n`.toUpperCase();
            responsePage.response = new fetch.Response(
                responsePage.response.statusText,
                responsePage.response
            );
        } else {
            responsePage.response.ok = false;
            responsePage.response.status = 502;
            responsePage.response.statusText =
                `incomplete ${type} document download: ${contentSize} > ${bufferLength}\n`.toUpperCase();
            responsePage.response = new fetch.Response(
                responsePage.response.statusText,
                responsePage.response
            );
        }
    } else if (responsePage.response.ok && !/pdf|word/i.test(type)) {
        responsePage.response.ok = false;
        responsePage.response.statusText =
            `either not pdf, or request did not succeed: ${responsePage.response.status} && ${type}\n`.toUpperCase();
        responsePage.response.status = 502;
        responsePage.response = new fetch.Response(
            responsePage.response.statusText,
            responsePage.response
        );
    }
    return responsePage;
};


async function fetchURL({ canonicalURL, headers }) {
    if (/https?:.*https?:/i.test(canonicalURL)) {
        console.error("Rejecting URL", canonicalURL, `returning [];`);
        return [];
    }
    if (/pdf/i.test({
            canonicalURL)) {
            return [await getHome({ headers, canonicalURL })]
        } else {
            return [await fetchPage({ headers, canonicalURL })]
        }



    }


    //https://wl.superfinanciera.gov.co/SiriWeb/publico/sancion/rep_sanciones_general_par.jsf?from=19-04-2022&to=05-04-2023&page=1