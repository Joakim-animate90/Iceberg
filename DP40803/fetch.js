async function fetchPage({ canonicalURL, requestURL, requestOptions, headers }) {
    if (!requestOptions) requestOptions = { method: "GET", headers };
    if (!canonicalURL) canonicalURL = requestURL;
    if (!requestURL) requestURL = canonicalURL;
    if (requestURL.match(/^https/i)) {
        requestOptions.agent = new https.Agent({ rejectUnauthorized: false });
        console.log("using a custom HTTPS agent");
    }
    return await fetchWithCookies(requestURL, requestOptions, "zone-g1-country-do")
        .then(response => {
            return {
                canonicalURL,
                request: Object.assign({ URL: requestURL }, requestOptions),
                response
            };
        });
}





const binaryDownload = async function({ canonicalURL, requestURL, headers, requestOptions }) {

    let responsePage = await fetchPage({ canonicalURL, requestURL, headers, requestOptions });
    let type = responsePage.response.headers.get('content-type');
    if (/octet/i.test(type)) {
        let name = responsePage.response.headers.get('content-disposition');
        let newtype = /\.pdf/i.test(name) ? "application/pdf" : /\.docx/i.test(name) ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" : /\.doc/i.test(name) ? "application/msword" : null;
        console.log('disposition:', type, name);
        if (newtype) {
            responsePage.response.headers.set('content-type', newtype);
            type = newtype;
            type && console.log(`TYPE = ${type}`);
        }
    }
    type && console.log(`TYPE = ${type}`);
    if (responsePage.response.ok && /pdf|word/i.test(type)) { //Make sure your binary fileType is permitted by this regex
        let contentSize = parseInt(responsePage.response.headers.get('content-length') || "-1");
        let buffer = await responsePage.response.buffer();
        let bufferLength = buffer.length;
        if (contentSize < 0 || bufferLength === contentSize) {
            responsePage.response = new fetch.Response(buffer, responsePage.response);
        } else if (contentSize == 0 || bufferLength == 0) { //empty response
            responsePage.response.ok = false;
            responsePage.response.status = 404;
            responsePage.response.statusText = `Empty ${type} document download: ${contentSize} > ${bufferLength}\n`.toUpperCase();
            responsePage.response = new fetch.Response(responsePage.response.statusText, responsePage.response);
        } else {
            responsePage.response.ok = false;
            responsePage.response.status = 502;
            responsePage.response.statusText = `incomplete ${type} document download: ${contentSize} > ${bufferLength}\n`.toUpperCase();
            responsePage.response = new fetch.Response(responsePage.response.statusText, responsePage.response);
        }
    } else if (responsePage.response.ok && !/pdf|word/i.test(type)) {
        responsePage.response.ok = false;
        responsePage.response.statusText = `either not pdf, or request did not succeed: ${responsePage.response.status} && ${type}\n`.toUpperCase();
        responsePage.response.status = 502;
        responsePage.response = new fetch.Response(responsePage.response.statusText, responsePage.response);
    }
    return responsePage;
};


async function fetchURL({ canonicalURL, headers }) {
    if (/https?:.*https?:/i.test(canonicalURL)) {
        console.error("Rejecting URL", canonicalURL, `returning [];`);
        return [];
    }
    // if it mactches pdf or doc, then download it

    if (/\.pdf|\.docx?/i.test(canonicalURL)) {
        let responsePage = await fetchPage({ canonicalURL, headers });
        return [responsePage];
    } else {

        let responsePage = await fetchPage({ canonicalURL, headers });

        if (/html/i.test(responsePage.response.headers.get('content-type'))) {
            let html = await responsePage.response.text();
            const $ = cheerio.load(html);
            $("*script, base, frame, frameset").remove();
            //for each  class with class vc_tta-panel add vc_active
            $("div.vc_tta-panel").addClass("vc_active");
            // $("script").remove();
            responsePage.response = new fetch.Response($.html(), responsePage.response);
            return [responsePage]
        } else {

        }
    }


}