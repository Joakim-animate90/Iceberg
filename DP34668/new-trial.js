
async function fetchPage({ canonicalURL, requestURL, requestOptions, headers }) {
    if (!requestOptions) requestOptions = { method: "GET", headers };
    if (!canonicalURL) canonicalURL = requestURL;
    if (!requestURL) requestURL = canonicalURL;
    if (requestURL.match(/^https/i)) {
        // process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
        requestOptions.agent = new https.Agent({ rejectUnauthorized: false, keepAlive: true });
        // console.log("requestOptions.agent", requestOptions.agent);
    }
    return await fetchWithCookies(requestURL, requestOptions, "zone-g1-country-br")
        .then(response => {
            return {
                canonicalURL,
                request: Object.assign({ URL: requestURL }, requestOptions),
                response
            };
        });
}

const parseViewState = async function ({ responsePage }) {
    let html = await responsePage.response.buffer();
    responsePage.response = new fetch.Response(html, responsePage.response);
    let $ = cheerio.load(html);
    let viewState = $("#javax\\.faces\\.ViewState").val();
    setSharedVariable("view-state", viewState)
    console.log("view-state", viewState);
    return viewState;
};

const getHome = async function ({ headers, canonicalURL, page }) {
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
    let requestURL = 'https://wl.superfinanciera.gov.co/SiriWeb/publico/sancion/rep_sanciones_general.jsf';
    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });
    await parseViewState({ responsePage });
    await parsePageParameters({ responsePage })
    setSharedVariable('got-home', true);


    return [responsePage];


};

const parsePageParameters = async function ({ responsePage }) {
    let html = await responsePage.response.buffer();
    responsePage.response = new fetch.Response(html, responsePage.response);
    const $ = cheerio.load(html);
    let rootURL = responsePage.canonicalURL.replace(/\?page=\d+/i, "");
    $(".paginator td a").each(function (i) {
        let a = $(this);
        let pageNumber = parseInt(a.text().trim());
        if (!pageNumber) return;
        let onclick = a.attr("onclick");
        let match = /oamSubmitForm\('([^"']+)','([^"']+)'[^"']+\[\['([^"']+)','([^"']+)'\]\]/i.exec(onclick);
        if (!match) return;
        let preSubmit = match[1];
        let idcl = match[2];
        let name = match[3];
        let value = match[4];
        setSharedVariable(pageNumber, { preSubmit, idcl, name, value });
        a.attr('href', rootURL + "?page=" + pageNumber);
        a.attr('_onclick', onclick);
        a.attr('onclick', "return false;");
    });
    $('form[action]').each(function (i) {
        let form = $(this);
        let action = form.attr("action");
        let match = /(;jsessionid=.+)/i.exec(action);
        match && setSharedVariable('jsession', match[1]);
    });
};


const pagination = async function ({ canonicalURL, headers, page }) {
    //if (!getSharedVariable('got-home')) 
    await getHome({ canonicalURL, headers });
    let customHeaders = {
        "Cache-Control": "no-cache",
        "Origin": "https://wl.superfinanciera.gov.co",
        "Pragma": "no-cache",
        "Referer": "https://wl.superfinanciera.gov.co/SiriWeb/publico/sancion/rep_sanciones_general.jsf",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        "sec-ch-ua": "\"Google Chrome\";v=\"113\", \"Chromium\";v=\"113\", \"Not-A.Brand\";v=\"24\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "Accept-Encoding": "gzip, deflate, br",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36"
    }
    let { preSubmit, idcl, name, value } = getSharedVariable(page);
    //throw(name)
    if (!preSubmit) throw new Error("No page parameters found for page " + page);
    let _headers = Object.assign(customHeaders, headers);
    // set-cookie
    //_headers = Object.assign(_headers, { cookie: getSharedVariable("jsession") });
    const body = new FormData();
    body.append('autoScroll', '0,2049');
    body.append(preSubmit + '_SUBMIT', '1');
    body.append('javax.faces.ViewState', getSharedVariable("view-state"));
    body.append(name, value);
    body.append(preSubmit + ':_idcl', idcl);
    //throw({body})
    let method = "POST";
    let requestOptions = { method, body, headers: _headers };
    let requestURL = 'https://wl.superfinanciera.gov.co/SiriWeb/publico/sancion/rep_sanciones_general.jsf' + getSharedVariable('jsession');
    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });
    await parseViewState({ responsePage });
    await parsePageParameters({ responsePage });
    let res = await parseCheckIfCorrectPagination({ canonicalURL, responsePage });
    let pdfs = [];
    if (res.response.ok) {
        // get pdfs

        pdfs = await postPdfForEachRow({  canonicalURL, headers, responsePage });
        return pdfs;
    }
    pdfs.push(res);


    return pdfs;



};

function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}

const parseCheckIfCorrectPagination = async function ({ canonicalURL, responsePage }) {
    let html = await responsePage.response.buffer();
    responsePage.response = new fetch.Response(html, responsePage.response);
    const $ = cheerio.load(html);
    // <div class="tableCentro" bis_skin_checked="1">Pagina 4 de 4</div>
    let numberOfPages = $(".tableCentro").text().trim();
    numberOfPages = numberOfPages.match(/Pagina (\d+) de (\d+)/i);
    // get the first number
    let currentPage = numberOfPages[1];
    currentPage = parseInt(currentPage)
    let page = canonicalURL.match(/page=(\d+)/i);
    page = page[1];
    page = parseInt(page) ? parseInt(page) : 1
    if (currentPage !== page) {
        // return response status 504
        responsePage.response.ok = false;
        responsePage.response.status = 504;
        // set content type to text/plain
        responsePage.response.headers.set("content-type", "text/plain");
        responsePage.response.statusText = `Page ${page} is not equal to ${currentPage}\n`.toUpperCase();
        responsePage.response = new fetch.Response(
            responsePage.response.statusText,
            responsePage.response
        );
    }

    return responsePage;
};


const postPdfForEachRow = async function ({ argument, canonicalURL, headers, responsePage }) {
    let customHeaders = {
        "Cache-Control": "no-cache",
        "Origin": "https://wl.superfinanciera.gov.co",
        "Pragma": "no-cache",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        "sec-ch-ua": "\"Google Chrome\";v=\"113\", \"Chromium\";v=\"113\", \"Not-A.Brand\";v=\"24\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "Accept-Encoding": "gzip, deflate, br",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36"
    };
    let _headers = Object.assign(customHeaders, headers);


    let html = await responsePage.response.buffer();
    responsePage.response = new fetch.Response(html, responsePage.response);
    let $ = cheerio.load(html);
    let table = $('#contentSV\\:frm2\\:sancion_valores')
    let tbody = table.find('tbody')
    let rows = tbody.find('tr')
    //use each to iterate over the rows
    // throw(rows.length)
    let responses = []
    for (let i = 0; i < rows.length; i++) {
        let row = rows[i];
        // get the td elements
        let tds = $(row).find('td');

        let a = $(tds[5]).find('a');
        let onclick = a.attr('onclick');
        let regex = /'([^']*)'/g;
        let match = onclick.match(regex);
        let value = match ? match[1] : "";
        // remove the '' from the value
        value = value.replace(/'/g, "");
        let fecha = $(tds[6]).text();
        let numero = $(tds[5]).text();

        let href = canonicalURL + "&numero=" + numero + "&fecha=" + fecha + "&payload=" + value;

        a.attr('href', canonicalURL + "&numero=" + numero + "&fecha=" + fecha + "&payload=" + value);
        a.attr('onclick', "return false;");
        const body = new FormData();

        body.append('autoScroll', '0,0');
        body.append('contentSV:frm2_SUBMIT', '1');
        body.append('javax.faces.ViewState', getSharedVariable('view-state'));
        body.append('contentSV:frm2:_idcl', `${value}`);

        let method = "POST";
        let requestOptions = { method, body, headers: _headers };
        let requestURL = 'https://wl.superfinanciera.gov.co/SiriWeb/publico/sancion/rep_sanciones_general.jsf';
        let responsePage = await binaryDownload({ canonicalURL: href, requestURL, requestOptions });
        if (responsePage.response.status === 200) {
            responses.push(responsePage);
        }
    }

    return responses
};
//https://wl.superfinanciera.gov.co/SiriWeb/publico/sancion/rep_sanciones_general.jsf?numero=1487&fecha=2021/12/14&payload=contentSV:frm2:sancion_valores:0:j_id_id35pc2
const binaryDownload = async function ({
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
        let newtype = /\.pdf/i.test(name)
            ? "application/pdf"
            : /\.docx/i.test(name)
                ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                : /\.doc/i.test(name)
                    ? "application/msword"
                    : null;
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
    const match = canonicalURL.match(/rep_sanciones_general.jsf(\?page=(\d+))?$/i);
    const match2 = canonicalURL.match(/payload=([^&]+)/i);
    if (match) {
        let page = match[2] ? parseInt(match[2]) : 1;


        if (page === 1) {
            return await getHome({ canonicalURL, headers, page });
        }
        return await pagination({ canonicalURL, headers, page })
    } else if (match2) {
        return await postPdfForEachRow({ canonicalURL, headers, page })
    } else {
        return await fetchPage({ canonicalURL, headers });
    }

}

