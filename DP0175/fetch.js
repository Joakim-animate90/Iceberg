
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




const home = async function ({argument, canonicalURL, headers}) {
        let customHeaders = {
                    "authority": "www.gob.pe",
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
        let requestOptions = {method, headers: _headers};
        let requestURL = 'https://www.gob.pe/institucion/smv/normas-legales/tipos/946-resolucion-smv';
        let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
        return responsePage;
    };

    const binaryDownload = async function ({ canonicalURL, requestURL, headers, requestOptions }) {
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
        if (responsePage.response.ok && /pdf|word/i.test(type)) {//Make sure your binary fileType is permitted by this regex
            let contentSize = parseInt(responsePage.response.headers.get('content-length') || "-1");
            let buffer = await responsePage.response.buffer();
            let bufferLength = buffer.length;
            if (contentSize < 0 || bufferLength === contentSize) {
                responsePage.response = new fetch.Response(buffer, responsePage.response);
            } else if (contentSize == 0 || bufferLength == 0) {//empty response
                responsePage.response.ok = false;
                responsePage.response.status = 404;
                responsePage.response.statusText = `Empty ${type} document download: ${contentSize} > ${bufferLength}\n`.toUpperCase();
                responsePage.response = new fetch.Response(responsePage.response.statusText, responsePage.response);
            } else {
                responsePage.response.ok = false;
                responsePage.response.status = 504;
                responsePage.response.statusText = `incomplete ${type} document download: ${contentSize} > ${bufferLength}\n`.toUpperCase();
                responsePage.response = new fetch.Response(responsePage.response.statusText, responsePage.response);
            }
        } else if (responsePage.response.ok && !/pdf|word/i.test(type)) {
            responsePage.response.ok = false;
            responsePage.response.statusText = `either not pdf, or request did not succeed: ${responsePage.response.status} && ${type}\n`.toUpperCase();
            responsePage.response.status = 505;
            responsePage.response = new fetch.Response(responsePage.response.statusText, responsePage.response);
        }
        return responsePage;
    };

async function fetchURL({canonicalURL, headers}) {
    if (/https?:.*https?:/i.test(canonicalURL)) {
        console.error("Rejecting URL", canonicalURL, `returning [];`);
        return [];
    }
    const match = canonicalURL.match(/page=(\d+))?$/i);
    if (match) {
        
        return [await home({canonicalURL, headers})]
    }  // else if pdf or docx
    else if (canonicalURL.match(/(pdf|docx)$/i)) {
        return [await binaryDownload({canonicalURL, headers})]
    }else {
        return [await fetchPage({canonicalURL, headers})]
    }

}