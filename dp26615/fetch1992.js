const fetchPage = async function ({ canonicalURL, requestURL, requestOptions, headers }) {
    if (!requestOptions) requestOptions = { method: 'GET', headers }
    if (!canonicalURL) canonicalURL = requestURL
    if (!requestURL) requestURL = canonicalURL
    return await fetchWithCookies(requestURL, requestOptions)
        .then(response => {
            return {
                canonicalURL,
                request: Object.assign({ URL: requestURL }, requestOptions),
                response
            }
        })
}

const customHeaders = {
    authority: 'www.scj.gob.cl',
    'cache-control': 'no-cache',
    dnt: '1',
    pragma: 'no-cache',
    'sec-ch-ua': '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'none',
    'upgrade-insecure-requests': '1',
    'Accept-Encoding': 'gzip, deflate, br'
}
async function search({ from, to, busca, canonicalURL, headers }) {

    const requestURL = 'https://seia.sea.gob.cl/busqueda/buscarProyecto.php?CP=0'
    const _headers1 = Object.assign(customHeaders, headers)
    const responsePageHome = await fetchPage({ canonicalURL, requestURL, headers: _headers1 })
    responsePageHome.response.headers.set('content-type', 'text/html')

    const _headers = Object.assign(customHeaders, headers, { 'content-type': 'application/x-www-form-urlencoded' }, { referer: requestURL })
    const method = 'POST'
    const data = {}
    data["presentacion"] = `AMBOS`
    data["PresentacionMin"] = from
    data["PresentacionMax"] = to
    data["busca"] = busca
    data["externo"] = `1`
    // use querystring.stringify to convert data to a query strin
    const body = querystring.stringify(data)

    const requestOptions = { method, headers: _headers, body }
    const requestURL1 = 'https://seia.sea.gob.cl/busqueda/buscarProyectoAction.php'
    const responsePage = await fetchPage({ canonicalURL, requestURL: requestURL1, requestOptions })

    return responsePage
}

async function getIframeURL({ canonicalURL, headers }) {
    const requestURL = null
    const cookies = ''
    const referer = canonicalURL.replace('expedientesEvaluacion.php?modo=ficha&id_expediente=', 'ficha/fichaPrincipal.php?modo=normal&id_expediente=')
    let requestOptions = { method: 'GET', headers}
    const responseP = await fetchPage({ canonicalURL, requestURL, requestOptions })
   

    const html = await responseP.response.text()
    const $ = cheerio.load(html, { decodeEntities: false })
    const xhrUrl = $("script:contains('cargaContenido')").html().match(/cargaContenido\('(.*?)'\)/)[1]
    const scriptURL = url.resolve(canonicalURL, xhrUrl)

 

    const _headers2 = Object.assign(customHeaders, headers,{ cookie: cookies }, { 'Sec-Fetch-Dest': 'iframe' }, { 'Sec-Fetch-Mode': 'navigate' })
    requestOptions = { method: 'GET', headers }
    const response = await fetchPage({ requestURL: scriptURL, requestOptions, headers })
    return response

    //if response is 302

   // const responseText = await response.response.text()
    // response.response = new fetch.Response(responseText, response.response)
    const regex = /id_expediente=(\d+)$/; // match the number after "id_expediente="

    const match = canonicalURL.match(regex); // apply the regex to the URL
    let number = null
    if (match) {
        number = match[1]; // extract the matched number
        console.log(number); // output: 2130374920
    } else {
        console.log('No match found');
    }
    let iframeURL = `https://seia.sea.gob.cl/expediente/xhr_documentos.php?id_expediente=${number}`

    const responsePage = await fetchPage({ canonicalURL, requestURL: iframeURL, headers })
    if (responsePage.response.status === 302) {
        const redirectURL = response.response.headers.get('location')
        throw new Error(`Redirected to ${redirectURL}`)
        const _headers3 = Object.assign(customHeaders, headers, { cookie: cookies }, { referer: scriptURL })
        requestOptions = { method: 'GET', headers: _headers3 }
        responsePage = await fetchPage({ canonicalURL, requestURL: redirectURL, requestOptions, headers })
    }

    return responsePage
}

const assignResponse = async function ({ canonicalURL, headers }) {
    const _headers = Object.assign(customHeaders, headers)
    const method = 'GET'
    const requestOptions = { method, headers: _headers }
    const responsePage = await fetchPage({ canonicalURL, requestURL: null, requestOptions })
    const htmlB = await responsePage.response.buffer()
    // const html = htmlB.toString().replace(/<a.*?<\/a>/g, '')
    //const html1 = html.replace(/<title>.*?<\/title>/g, '')
    responsePage.response = new fetch.Response(iconv.decode(htmlB, "iso-8859-1"), responsePage.response)
    responsePage.response.headers.set('content-type', 'text/html')
    return responsePage
}
async function paginatorsFetch({ from, to, page, canonicalURL, headers }) {
    const requestURL = 'https://seia.sea.gob.cl/busqueda/buscarProyecto.php?CP=0'
    const _headers1 = Object.assign(customHeaders, headers)
    const responsePageHome = await fetchPage({ canonicalURL, requestURL, headers: _headers1 })
    responsePageHome.response.headers.set('content-type', 'text/html')

    const _headers = Object.assign(customHeaders, headers, { 'content-type': 'application/x-www-form-urlencoded' }, { referer: requestURL })
    const method = 'POST'
    const data = {}
    data.presentacion = 'AMBOS'
    data.PresentacionMin = from
    data.PresentacionMax = to
    data.busca = 'true'
    data.externo = '1'
    // use querystring.stringify to convert data to a query strin
    const body = querystring.stringify(data)

    const requestOptions = { method, headers: _headers, body }
    const requestURL1 = 'https://seia.sea.gob.cl/busqueda/buscarProyectoAction.php'
    const responsePage = await fetchPage({ canonicalURL, requestURL: requestURL1, requestOptions })
    _headers.referer = requestURL1
    const requestOptions1 = { method: 'GET', headers: _headers }
    let requestURL2 = `https://seia.sea.gob.cl/busqueda/buscarProyectoAction.php?_paginador_refresh=1&_paginador_fila_actual=${page}`
    const responsePagePaginator = await fetchPage({ canonicalURL, requestURL: requestURL2, requestOptions: requestOptions1 })

    responsePagePaginator.response.headers.set('content-type', 'text/html')
    return responsePagePaginator
}
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
async function motherUrl({ canonicalURL, headers }) {
    const _headers = Object.assign(customHeaders, headers)
    const method = 'GET'
    const requestOptions = { method, headers: _headers }
    // from canonical url remove the part of fecha ingreso  https:\/\/seia.sea.gob.cl\/expediente\/expediente.php\?id_expediente=\d{10}&fechaIngreso=.+ and remain with https:\/\/seia.sea.gob.cl\/expediente\/expediente.php\?id_expediente=\d{10}
    const requestURL = canonicalURL.replace(/fechaIngreso=.+/, '')

    const responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions })
    return responsePage
}
async function postValidarDoc({ canonicalURL, headers }) {
    const _headers = Object.assign(customHeaders, headers, { 'content-type': 'application/json;charset=UTF-8' }, { referer: canonicalURL })
    const method = 'POST'
    // get the id number https://validador.sea.gob.cl/validar/2156206550
    const id = canonicalURL.split("/").pop();
    const data = {}
    data["code"] = ``
    data["id"] = `${id}`

    // use querystring.stringify to convert data to a query strin
    const body = querystring.stringify(data)

    const requestOptions = { method, headers: _headers, body }
    const requestURL1 = 'https://validador.sea.gob.cl/validar/documentPreVerification?'
    const responsePagePreVerification = await fetchPage({ canonicalURL, requestURL: requestURL1, requestOptions })
    // fetch https://validador.sea.gob.cl/validar/sea/documentVerification
    const _headers1 = Object.assign(customHeaders, _headers, { 'content-type': 'text/html;charset=UTF-8' }, { referer: canonicalURL })
    const responsePageVerification = await fetchPage({ canonicalURL, requestURL: 'https://validador.sea.gob.cl/validar/sea/documentVerification', requestOptions: { method, headers: _headers1 } })
    // https://validador.sea.gob.cl/validar/sea/documentDownload
    const _headers2 = Object.assign(customHeaders, _headers1, { referer: canonicalURL })
    const responsePageDownload = await fetchPage({ canonicalURL, requestURL: 'https://validador.sea.gob.cl/validar/sea/documentDownload', requestOptions: { method, headers: _headers2 } })
    responsePageDownload.response.headers.set('content-type', 'application/pdf')

    // set the content length


    return responsePageDownload
}
async function fetchURL({ canonicalURL, headers }) {
    if (/https?:.*https?:/i.test(canonicalURL)) {
        console.error('Rejecting URL', canonicalURL, 'returning [];')
        return []
    }
    const requestURL = null
    const _headers = Object.assign(customHeaders, headers)
    const isListing = canonicalURL.match(/from=(.*)&to=(.*)&busca=([^&]*)/i)
    const isListingPaginated = canonicalURL.match(/from=(.*)&to=(.*)&_paginador_fila_actual=([^&]*)/i)
    const isListingMother = canonicalURL.match(/fechaIngreso=(.*)/i)
    if (canonicalURL.startsWith('https://seia.sea.gob.cl/expediente/expedientesEvaluacion.php?')) {
        return [await getIframeURL({ canonicalURL, headers })]
    } else if (isListing) {
        const from = isListing[1]
        const to = isListing[2]
        const busca = isListing[3]
        return [await search({ from, to, busca, canonicalURL, headers })]
    } else if (canonicalURL.startsWith('https://seia.sea.gob.cl/documentos/documento.php?idDocumento=')) {
        return [await assignResponse({ canonicalURL, headers })]
    } else if (/\.(pdf|docx?)\b/i.test(canonicalURL)) {
       let requestOptions = { method: 'HEAD', headers:customHeaders }
        let responsePage = await fetchPage({ canonicalURL, requestOptions});
        // Check the content length
        const contentLength = responsePage.response.headers.get("content-length");
        if (contentLength && parseInt(contentLength) < 52428800) { // 300 MB in bytes
            // If the content length is greater than 300 MB, do nothing
            return [await binaryDownload({ canonicalURL, headers })];
        }
        
    }
    else if (isListingPaginated) {

        const from = isListingPaginated[1]
        const to = isListingPaginated[2]
        const page = isListingPaginated[3]
        return [await paginatorsFetch({ from, to, page, canonicalURL, headers })]
    } else if (isListingMother) {

        return [await motherUrl({ canonicalURL, headers })]
    }
    else {
        return [await fetchPage({ canonicalURL, requestURL, headers })]
    }
}