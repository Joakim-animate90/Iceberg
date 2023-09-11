async function fetchPage({canonicalURL, requestURL, requestOptions, headers}) {
    if (!requestOptions) requestOptions = {method: "GET", headers};
    if (!canonicalURL) canonicalURL = requestURL;
    if (!requestURL) requestURL = canonicalURL;
    return await fetchWithCookies(requestURL, requestOptions, "zone-2captcha-country-cl")
        .then(response => {
            return {
                canonicalURL,
                request: Object.assign({URL: requestURL}, requestOptions),
                response
            };
        }).catch(err => {
      		console.log(`request failed, returning null`);
            return {
                canonicalURL,
                request: Object.assign({URL: requestURL}, requestOptions),
                response: {text: () => null, buffer: () => null, ok: false, status: 503, headers:{get: ()=>null, set: (x)=>null}}, 
              	failed: true
            };
        });
}

const getHome = async function ({headers}) {
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
        "sec-ch-ua-platform": "\"Windows\"",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);

    let method = "GET";
    let requestOptions = {method, headers: _headers};
    let requestURL = 'https://oficinajudicialvirtual.pjud.cl/home/index.php';
    let responsePage = await fetchPage({canonicalURL: requestURL, requestOptions});
    return responsePage;
};

const getSession = async function ({headers}) {
    let homePage = await getHome({headers});
    let customHeaders = {
        "Cache-Control": "no-cache",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Origin": "https://oficinajudicialvirtual.pjud.cl",
        "Pragma": "no-cache",
        "Referer": "https://oficinajudicialvirtual.pjud.cl/home/index.php",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "X-Requested-With": "XMLHttpRequest",
        "sec-ch-ua": "\"Chromium\";v=\"112\", \"Google Chrome\";v=\"112\", \"Not:A-Brand\";v=\"99\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);
    const data = {};
    data["nombreAcceso"] = `CC`;
    let body = querystring.stringify(data);
    let method = "POST";
    let requestOptions = {method, body, headers: _headers};
    let requestURL = 'https://oficinajudicialvirtual.pjud.cl/includes/sesion-invitado.php';
    let responsePage = await fetchPage({canonicalURL: requestURL, requestOptions});
    return [homePage, responsePage];
};

const solveRecaptcha = async function ({siteURL = "https://oficinajudicialvirtual.pjud.cl/indexN.php"}) {
    const config = {
        headers: {},//any custom headers
        apiKey: "10122c7066706ebba801995c2e99fbe2",//2captcha subscription key
        siteKey: "6LelLWkUAAAAANPDMkBxllo_QJe5RQVpg6V2pIDt",//k or data-sitekey
        invisible: true,//is it invisible recaptcha?
        proxy: `lum-customer-vlex-zone-2captcha-country-cl:dcohwmkemk0n@zproxy.lum-superproxy.io.22225`//match or remove country if necessary
    }
    let customHeaders = {
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Pragma": "no-cache",
        "Cache-Control": "no-cache",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, config.headers);

    let method = "GET";
    let requestOptions = {method, headers: _headers};
    let requestURL = `https://2captcha.com/in.php?key=${config.apiKey}&method=userrecaptcha&googlekey=${config.siteKey}&proxy=${config.proxy}&pageurl=${siteURL}${config.invisible ? "&invisible=1" : ""}&json=1`;
    let responsePage = await fetchPage({requestURL, requestOptions});
    let j = responsePage.response && await responsePage.response.text() || null;
    let json = j && JSON.parse(j);
    if ((!json || json.status !== 1 || !json.request)) {
        console.error(`Error resolving recaptcha: ${j}`);
        return null;
    }
    //wait for resolution
    requestURL = `https://2captcha.com/res.php?key=${config.apiKey}&action=get&id=${json.request}&json=1`;
    let gResponse = null;
    let waitLoops = 0;
    do {
        waitLoops++;
        responsePage = await fetchPage({requestURL, requestOptions});
        j = responsePage.response && await responsePage.response.text();
        console.log(j);
        if (!j || /CAPCHA_NOT_READY/i.test(j)) {
            await sleepForSeconds(10);
            continue;
        }
        try{
        	json = j && JSON.parse(j);
        }catch(e){
        	//json error
          	console.error(`Error parsing JSON`, e);
          	continue;
        }
        //if (json.status !== 1 || !json.request) throw `Error resolving recaptcha: ${j}`;
        gResponse = json && json.request || gResponse;
    }
    while (!gResponse && waitLoops < 10);
    if (!gResponse) {
        console.error(`Error resolving recaptcha, captcha not resolved after total wait duration: ${j}`);
        return null;
    }

    setSharedVariable('recaptcha', gResponse);
    setSharedVariable('recaptcha-time', new Date().getTime());
    return gResponse;
};

const preForm = async function ({headers}) {
    let prevPages = await getSession({headers});
    let customHeaders = {
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "Referer": "https://oficinajudicialvirtual.pjud.cl/home/index.php",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        "sec-ch-ua": "\"Chromium\";v=\"112\", \"Google Chrome\";v=\"112\", \"Not:A-Brand\";v=\"99\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);

    let method = "GET";
    let requestOptions = {method, headers: _headers};
    let requestURL = 'https://oficinajudicialvirtual.pjud.cl/indexN.php';
    let responsePage = await fetchPage({canonicalURL: requestURL, requestOptions});
    prevPages.push(responsePage);
    return prevPages;
};

const getForm = async function ({headers}) {
    let prevPages = await preForm({headers});
    let customHeaders = {
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "Referer": "https://oficinajudicialvirtual.pjud.cl/indexN.php",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "X-Requested-With": "XMLHttpRequest",
        "sec-ch-ua": "\"Chromium\";v=\"112\", \"Google Chrome\";v=\"112\", \"Not:A-Brand\";v=\"99\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);

    let method = "GET";
    let requestOptions = {method, headers: _headers};
    let requestURL = 'https://oficinajudicialvirtual.pjud.cl/consultaUnificada.php';
    let responsePage = await fetchPage({canonicalURL: requestURL, requestOptions});
    prevPages.push(responsePage);
    return prevPages;
};

const search = async function ({from, to, canonicalURL, headers, process = true}) {
    let prevPages = await getForm({headers});
    console.log(`Searching from ${from} to ${to}`);
    let customHeaders = {
        "Cache-Control": "no-cache",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Origin": "https://oficinajudicialvirtual.pjud.cl",
        "Pragma": "no-cache",
        "Referer": "https://oficinajudicialvirtual.pjud.cl/indexN.php",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "X-Requested-With": "XMLHttpRequest",
        "sec-ch-ua": "\"Chromium\";v=\"112\", \"Google Chrome\";v=\"112\", \"Not:A-Brand\";v=\"99\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);
    const data = {};
    let gRecaptchaResponse = await getRecaptchaResponse({siteURL: customHeaders.Referer});
    data["g-recaptcha-response-fecha"] = gRecaptchaResponse;
    data["action"] = `validate_captcha_fecha`;
    data["fecDesde"] = from.format('DD/MM/YYYY');
    data["fecHasta"] = to.format('DD/MM/YYYY');
    data["fecCompetencia"] = `1`;
    let body = querystring.stringify(data);
    let method = "POST";
    let requestOptions = {method, body, headers: _headers};
    let requestURL = 'https://oficinajudicialvirtual.pjud.cl/ADIR_871/suprema/consultaFechaSuprema.php';
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
    // if (process)
    setSharedVariable('search', from.format('DD/MM/YYYY') + ' - ' + to.format('DD/MM/YYYY'));
    return await handleListingPage({responsePage, headers});
    // return [responsePage];
};

const sleepForSeconds = function (seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

const handleListingPage = async function ({responsePage, headers}) {
    console.log(`Handling listing page: ${responsePage.canonicalURL}`);
  	if(responsePage.failed)
      return [responsePage];
    let html = await responsePage.response.buffer();
  	
    const canonicalURL = responsePage.canonicalURL.replace(/&page=.+/i, "");
    const $ = cheerio.load(`<html lang="es"><body><table>${(html||"").toString()}</table></body></html>`);
  	if(!html || /ExpiredToken/i.test(html.toString().trim()) || /^\W*$/.test($.text().trim())){
    	responsePage.response = new fetch.Response(html, responsePage.response);
      	responsePage.response.ok = false;
      	responsePage.response.status = 505;
      	return [responsePage];
      
    }
    let docs = [];
    $("td a[onclick*='detalleCausaSuprema']").each(function (i) {
        let a = $(this);
        //onclick
        let onclick = a.attr('onclick');
        let match = /detalleCausaSuprema\s*\(\s*['"](.+)['"]\s*\)\W*$/.exec(onclick);
        let rol = a.closest("td").next().text();
        if (!match) {
            console.log(`BIG BUG: no rol attrib found: ${rol} - ${canonicalURL}`);
            return;
        }
        let url = `https://oficinajudicialvirtual.pjud.cl/ADIR_871/suprema/consultaFechaSuprema.php?rol=${rol}`;
        // setSharedVariable(rol, match[1]);
        a.attr('href', url);
      	a.attr('class', 'custom-link');
      	a.text('Docket');
        a.removeAttr('onclick');
        console.log("ROL added:", rol);
        docs.push({rol, url, id: match[1]});
    });
    $(".page-link[onclick]").each(function () {
        //get text and onclick
        let text = $(this).text().trim();
        let onclick = $(this).attr('onclick');
        //get page number
        let match = /^(\d+)$/.exec(text);
        if (!match) return;
        let page = parseInt(match[1]);
        match = /paginaFec\s*\(\s*["'](.+)["']\s*,\s*(\d+)\s*\)\W*$/.exec(onclick);
        if (!match) return;
        //console.log("page", page + ":", `(${match[2]})`, match[1]);
        setSharedVariable(page, match[1]);
        let url = `${canonicalURL}&page=${page}`;
        $(this).replaceWith(` <a href="${url}">${page}</a> `);
    });
    responsePage.response = new fetch.Response($.html(), responsePage.response);
    let responses = [responsePage];
    for (let i = 0; i < docs.length; i++) {
      	console.log(`DOCS: ${(i+1)}/${docs.length}`);
        let doc = docs[i];
        let responsePages = await openDoc({canonicalURL: doc.url, rol: doc.rol, causa: doc.id, headers});
        Array.isArray(responsePages) && responses.push(...responsePages);
    }
    return responses;
};

const getRecaptchaResponse = async function ({siteURL}) {
    let gRecaptchaResponse = null;
    let recaptchaTime = getSharedVariable('recaptcha-time');
    if (!recaptchaTime || new Date().getTime() - recaptchaTime > 1000 * 10 * 3) {
        gRecaptchaResponse = await solveRecaptcha({siteURL});
    } else {
        gRecaptchaResponse = getSharedVariable('recaptcha');
    }
    return gRecaptchaResponse || getSharedVariable('recaptcha');
}

const paginate = async function ({page, from, to, canonicalURL, headers}) {
    console.log("pagination: ", page);
    let sharedSearch = getSharedVariable('search');
    if (sharedSearch !== from.format('DD/MM/YYYY') + ' - ' + to.format('DD/MM/YYYY')) {
        await search({from, to, canonicalURL, headers, process: false});
    }
    let customHeaders = {
        "Cache-Control": "no-cache",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Origin": "https://oficinajudicialvirtual.pjud.cl",
        "Pragma": "no-cache",
        "Referer": "https://oficinajudicialvirtual.pjud.cl/indexN.php",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "X-Requested-With": "XMLHttpRequest",
        "sec-ch-ua": "\"Chromium\";v=\"112\", \"Google Chrome\";v=\"112\", \"Not:A-Brand\";v=\"99\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);
    const data = {};
    let gRecaptchaResponse = getRecaptchaResponse({siteURL: customHeaders.Referer});
    data["g-recaptcha-response-fecha"] = gRecaptchaResponse;
    data["action"] = `validate_captcha_fecha`;
    data["fecDesde"] = from.format('DD/MM/YYYY');
    data["fecHasta"] = to.format('DD/MM/YYYY');
    data["fecCompetencia"] = `1`;
    data["pagina"] = getSharedVariable(page);
    if (!data["pagina"]) throw new Error("No page encrypted attribute found: " + canonicalURL);
    let body = querystring.stringify(data);
    let method = "POST";
    let requestOptions = {method, body, headers: _headers};
    let requestURL = 'https://oficinajudicialvirtual.pjud.cl/ADIR_871/suprema/consultaFechaSuprema.php';
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
    //if (responsePage.response.ok && responsePage.response.status === 200)
        //setSharedVariable(page, undefined);
    return await handleListingPage({responsePage, headers});
    // return [responsePage];
};

const openDoc = async function ({rol, canonicalURL, headers, causa}) {
    console.log("openDoc: ", rol);
  	const dates = await getUrlDates({URL: canonicalURL});
  	//throw JSON.stringify(dates, null, 1);
  	let hours = 48;
  	if(dates && dates.lastFetched && moment().diff(dates.lastFetched, 'hours')<hours && dates.size>1000){
    	console.log(`skipping DOC Fetch, last fetched less than ${hours} hours ago ${dates.lastFetched} (${dates.size} Bytes): ${canonicalURL}`);
      	return;
    }else console.log(`doc last fetched ${dates && dates.lastFetched && moment().diff(dates.lastFetched, 'hours')} hours ago (${dates && dates.lastFetched})`)
    let customHeaders = {
        "Cache-Control": "no-cache",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Origin": "https://oficinajudicialvirtual.pjud.cl",
        "Pragma": "no-cache",
        "Referer": "https://oficinajudicialvirtual.pjud.cl/indexN.php",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "X-Requested-With": "XMLHttpRequest",
        "sec-ch-ua": "\"Chromium\";v=\"112\", \"Google Chrome\";v=\"112\", \"Not:A-Brand\";v=\"99\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);
    const data = {};
    causa = causa || getSharedVariable(rol);
    // 	throw JSON.stringify({rol, causa, canonicalURL}, null, 1)
    let gRecaptchaResponse = getRecaptchaResponse({siteURL: customHeaders.Referer});
    data["dtaCausa"] = causa;
    if (!data["dtaCausa"]) throw new Error("No rol encrypted attribute found: " + rol);
    data["tokenCaptcha"] = gRecaptchaResponse;
    let body = querystring.stringify(data);
    let method = "POST";
    let requestOptions = {method, body, headers: _headers};
    let requestURL = 'https://oficinajudicialvirtual.pjud.cl/ADIR_871/suprema/modal/causaSuprema.php';
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
  	if(responsePage.failed)
      return [responsePage];
    //updated with content links
    let html = await responsePage.response.text();
    const $ = cheerio.load(html);
    let table = $("#movimientosSup table:has(th)");
    let tableHeaders = {};
    table.find(">thead>tr, >tbody>tr").first().children().each(function (i) {
        let title = $(this);
        let label = title.text().replace(/\s+/g, " ").trim();
        //año=2023&correlativo=344753-2023&estado=bloqueado&fecha%20trámite
        if (/^a[nñ]o$/i.test(label))
            label = "ano";
        else if (/trámite/i.test(label))
            label = label.replace(/trámite/gi, "tramite");
        label && (tableHeaders[i] = label.replace(/\s+/ig, "_"));
    });
    //console.log(JSON.stringify(tableHeaders, null, 4));
    let contents = []
    table.find(">tbody>tr").each(function (i) {
        let cells = $(this).children();
        let doc = {};
        cells.each(function (j) {
            let td = $(this);
            let label = tableHeaders[j];
            let value = td.text().replace(/\s+/g, " ").trim();
            if (value && /\bfecha\b/i.test(label)) {
                value = moment(value, "DD/MM/YYYY");
                if (!value.isValid()) value = value;
                else value = value.format("YYYY-MM-DD");
            }
            doc[label] = value;
        });
        //do something with doc
        let keys = Object.keys(doc).filter((x) => /folio|anexo|A[ñn]o|fecha|Correlativo|estado/i.test(x)).sort();
        let o = keys.reduce((a, b) => {
            a[b] = doc[b];
            return a;
        }, {});
        doc.URI = `https://oficinajudicialvirtual.pjud.cl/ADIR_871/suprema/documentos/docCausaSuprema.php?${querystring.stringify(o).toLowerCase()}`;
        $(this).find("input#valorFile, input[name='valorFile']").each((i, e) => {
            let val = $(e).val();
            if (val) {
                // doc.valorFile = val;
                // console.log(doc.URI);
                // console.log(val);
                // console.log("___________");
                setSharedVariable(doc.URI, val);
                $(e).replaceWith(`<a href="${doc.URI}">Descargar Archivo</a>`);
                contents.push({url: doc.URI, id: val});
            }
        });
    });
    //check if page has content
    responsePage.response = new fetch.Response($.html(), responsePage.response);
    const responses = [responsePage];
    if (!html || !html.trim() || /^\W*$|ExpiredToken/i.test(html) || /^\W*$/i.test($.text().trim())) {
        //page has no content
        responsePage.response.ok = false;
        responsePage.response.status = 503;
    }
    for (let i = 0; i < contents.length; i++) {
      	console.log(`DOC contents: ${(i+1)}/${contents.length}`);
        let content = contents[i];
        let {url, id} = content;
        let responsePage = await downloadPDF({canonicalURL: url, headers, code: id});
      	responsePage && responses.push(responsePage)
    }
    // if(responsePage.response.ok && responsePage.response.status === 200){
    //    setSharedVariable(rol, undefined);
    // }
    return responses;
};

const getUrlDates = async function ({URL}) {
    let urlVersions = [URL, decodeURI(URL), encodeURI(URL), encodeURI(decodeURI(URL))].filter((c, i, a) => a.indexOf(c) === i);
    let ids = [];
    urlVersions.forEach(urlToParse => {
        const urlToParseId = "H" + new Buffer(URL).toString("base64");
        const urlToParseId2 = "H" + sha256(URL) + ".N";
        ids.push(urlToParseId, urlToParseId2);
    })
    try {
        const resp = await graphql(`
          query {
            nodes(ids: [${ids.filter((c, i, a) => a.indexOf(c) === i).map(x => `"${x}"`).join(", ")}]) {
                __typename
                ... on CrawledURL {
                  URL
                  firstSeen
                  lastSuccessfulRequest {
                    fetchedAt
					responseBody {
						contentSizeBytes
					}
                    
                  }
                }
            }
          }`);
        let node = resp.nodes && resp.nodes.filter(n => n)[0];
        return node && {
            firstFetched: node.firstSeen,
            lastFetched: node.lastSuccessfulRequest && node.lastSuccessfulRequest.fetchedAt,
          	size: node.lastSuccessfulRequest?.responseBody?.contentSizeBytes || 0,
        } || {};
    } catch (e) {
        console.error("Error getting dates for " + URL, e);
    }
    return {};
};

const downloadPDF = async function ({canonicalURL, code, headers}) {
    console.log("downloadPDF: ", canonicalURL);
  	const dates = await getUrlDates({URL: canonicalURL});
  	if(dates && dates.lastFetched){
    	console.log(`skipping PDF download, last fetched ${dates.lastFetched}: ${canonicalURL}`);
      	return;
    }
    let customHeaders = {
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "Referer": "https://oficinajudicialvirtual.pjud.cl/indexN.php",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        "sec-ch-ua": "\"Chromium\";v=\"112\", \"Google Chrome\";v=\"112\", \"Not:A-Brand\";v=\"99\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);

    let method = "GET";
    let requestOptions = {method, headers: _headers};
    code = code || getSharedVariable(canonicalURL) || getSharedVariable(decodeURI(canonicalURL));
    if (!code) {
        throw new Error("No file encrypted code found for " + canonicalURL + "");
    }
    let requestURL = 'https://oficinajudicialvirtual.pjud.cl/ADIR_871/suprema/documentos/docCausaSuprema.php?valorFile=' + code;
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
    return binaryDownload({canonicalURL, requestURL, headers, requestOptions, responsePage});
};

const binaryDownload = async function ({canonicalURL, requestURL, headers, requestOptions, responsePage}) {
    responsePage = responsePage || await fetchPage({canonicalURL, requestURL, headers, requestOptions});
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
    if (responsePage.response.ok && responsePage.response.status === 200) {
        setSharedVariable(canonicalURL, undefined);
        setSharedVariable(decodeURI(canonicalURL), undefined);
    }
    return responsePage;
};

async function fetchURL({canonicalURL, headers}) {
    if (/https?:.*https?:/i.test(canonicalURL)) {
        console.error("Rejecting URL", canonicalURL, `returning [];`);
        return [];
    }
    const match = canonicalURL.match(/\?(start|from)=(\d{4}-\d{2}-\d{2}).(end|to)=(\d{4}-\d{2}-\d{2})(&page=(\d+))?$/i);
    let rolMatch = canonicalURL.match(/\?rol=([^&]+)$/i);
    if (match) {
        let from = moment(match[2]);
        let to = moment(match[4]);
        let page = match[6] ? parseInt(match[6]) : 1;
        if (!page || page <= 1)
            return await search({from, to, page, canonicalURL, headers});
        return await paginate({from, to, page, canonicalURL, headers});
    } else if (rolMatch) {
        let rol = rolMatch[1];
        return [await openDoc({rol, canonicalURL, headers})];
    } else if (/docCausaSuprema.php\?.+/i.test(canonicalURL)) {
        return [await downloadPDF({canonicalURL, headers})];
    }
    throw new Error(`Invalid URL: ${canonicalURL}`);
}