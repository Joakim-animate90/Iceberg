async function fetchPage({canonicalURL, requestURL, requestOptions, headers}) {
    if (!requestOptions) requestOptions = {method: "GET", headers};
    if (!canonicalURL) canonicalURL = requestURL;
    if (!requestURL) requestURL = canonicalURL;
  	if (requestURL.match(/^https/i)) {
        requestOptions.agent = new https.Agent({rejectUnauthorized: false, keepAlive: true});
    }
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
        "Cache-Control": "max-age=0","DNT": "1","Upgrade-Insecure-Requests": "1","Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers); 
    let method = "GET";
    let requestOptions = {method, headers: _headers};
    let requestURL = 'http://www.sabanadetorres-santander.gov.co/';
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
    return responsePage;
};

const pagination = async function ({domain, page, canonicalURL, headers}) {
  	let match = /www\.([\w-]+)\.gov/.exec(canonicalURL)
    let variable_domain = match && match[1].replace(/-/g, '')
    let customHeaders = {
        "DNT": "1","Origin": `${domain}`,"Referer": `${domain}/`,"Sec-Fetch-Dest": "empty","Sec-Fetch-Mode": "cors","Sec-Fetch-Site": "cross-site","sec-ch-ua": "\".Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"103\", \"Chromium\";v=\"103\"","sec-ch-ua-platform": "\"Windows\"","Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    let requestOptions = {method, headers: _headers};
  	//throw(JSON.stringify({domain, variable_domain}, null, 4))
  	let requestURL = null;
  	if (page === 1) {
    	requestURL = `https://${variable_domain}.micolombiadigital.gov.co/api/v1/contents?hasNextPage=false&includeLabels=true&includeTags=true&includeTypes=true&isFull=false&keyword=&orderBy=recent&page=0&pageSize=10&tags=19`;
    } else {
  		requestURL = `https://${variable_domain}.micolombiadigital.gov.co/api/v1/contents?hasNextPage=true&includeLabels=true&includeTags=true&includeTypes=true&isFull=false&keyword=&orderBy=recent&page=${page - 1}&pageSize=10&tags=19`;
    }
  	let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
    let type = responsePage.response.headers.get('content-type');
  	if (!/json/i.test(type)) {
    	return await rejectURL({responsePage, canonicalURL})
    }
  	let json = await responsePage.response.json();
  	responsePage.response = new fetch.Response(JSON.stringify(json), responsePage.response);
    return responsePage;
};

const getMetadataPage = async function ({domain, friendlyName, canonicalURL, headers}) {
    let customHeaders = {
        "DNT": "1","Origin": `${domain}`,"Referer": `${domain}/`,"Sec-Fetch-Dest": "empty","Sec-Fetch-Mode": "cors","Sec-Fetch-Site": "cross-site","sec-ch-ua": "\".Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"103\", \"Chromium\";v=\"103\"","sec-ch-ua-mobile": "?0","sec-ch-ua-platform": "\"Windows\"","Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    let requestOptions = {method, headers: _headers};
    let requestURL = `${domain}/api/v1/contents/${friendlyName}`;
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
  	let type = responsePage.response.headers.get('content-type');
  	if (!/json/i.test(type)) {
    	return await rejectURL({responsePage, canonicalURL})
    }
  	let json = await responsePage.response.json();
  	responsePage.response = new fetch.Response(JSON.stringify(json), responsePage.response);
    return responsePage;
};

const rejectURL = async function ({responsePage, canonicalURL}) {
    responsePage.response.ok = false;
    responsePage.response.statusText = `ERROR (wrongly created url): ${canonicalURL}\n`;
    responsePage.response.status = 502;
    responsePage.response = new fetch.Response(responsePage.response.statusText, responsePage.response);
    return responsePage;
};
const binaryDownload = async function ({canonicalURL, requestURL, headers, requestOptions}) {
    let responsePage = await fetchPage({canonicalURL, requestURL, headers, requestOptions, noProxy: true});
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
            responsePage.response.status = 502;
            responsePage.response.statusText = `incomplete ${type} document download: ${contentSize} > ${bufferLength}\n`.toUpperCase();
            responsePage.response = new fetch.Response(responsePage.response.statusText, responsePage.response);
        }
    } else {
        responsePage.response.ok = false;
        responsePage.response.statusText = `either not pdf, or request did not succeed: ${responsePage.response.status} && ${type}\n`.toUpperCase();
        responsePage.response.status = 502;
        responsePage.response = new fetch.Response(responsePage.response.statusText, responsePage.response);
    }
    return responsePage;
};

async function fetchURL({canonicalURL, headers}) {
    if (/https?:.*https?:/i.test(canonicalURL)) {
        console.error("Rejecting URL", canonicalURL, `returning [];`);
        return [];
    }
  	const isListing = canonicalURL.match(/(^.+co).+?page=(\d+)/i);
  	const isMetadataPage = /(^.+)\/normatividad\/([\w-]+)/i.exec(canonicalURL)
  	if (isListing) {
      	let domain = isListing[1]
        let page = isListing[2] ? parseInt(isListing[2]) : 1;
        return [await pagination({domain, page, canonicalURL, headers})]
      
    } else if (isMetadataPage) {
    	let domain = isMetadataPage[1]
        let friendlyName = isMetadataPage[2].replace(/https?/, 'https')
        return [await getMetadataPage({domain, friendlyName, canonicalURL, headers})]
      
    } else if (/\/drive\.google\.com\/uc\?/.test(canonicalURL)) {
        //return [await getContentURL({canonicalURL, headers})]
        return [await binaryDownload({canonicalURL, headers})];
    
  } else {
        //return defaultFetchURL({canonicalURL, headers});
      	return [await fetchPage({canonicalURL, headers})];
    }
}