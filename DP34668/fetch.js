function caesarCipherEncode(text, shift) {
    let encodedText = '';

    for (let i = 0; i < text.length; i++) {
        let char = text[i];

        if (char.match(/[a-z]/i)) {
            const charCode = text.charCodeAt(i);
            let encodedCharCode;

            if (char === char.toUpperCase()) {
                encodedCharCode = ((charCode - 65 + shift) % 26) + 65; // Uppercase letters (A-Z)
            } else {
                encodedCharCode = ((charCode - 97 + shift) % 26) + 97; // Lowercase letters (a-z)
            }

            char = String.fromCharCode(encodedCharCode);
        }

        encodedText += char;
    }

    return encodedText;
}
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

const parseViewState = async function({ responsePage }) {
    let html = await responsePage.response.buffer();
    responsePage.response = new fetch.Response(html, responsePage.response);
    let $ = cheerio.load(html);
    let viewState = $("#javax\\.faces\\.ViewState").val();
    setSharedVariable("view-state", viewState)
    console.log("view-state", viewState);
    return viewState;
};

const getHome = async function({ headers, canonicalURL, page }) {
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
    let requestURL = 'https://wl.superfinanciera.gov.co/SiriWeb/publico/sancion/rep_sanciones_general_par.jsf';
    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });
    await parseViewState({ responsePage });
    //await parsePageParameters({ canonicalURL, responsePage })
    setSharedVariable('got-home', true);


    return [responsePage];


};
const getHome1 = async function({ arguments, canonicalURL, headers }) {
    await getHome({ canonicalURL, headers });
    // get the from day 
    let from = arguments.from;
    let to = arguments.to;
    setSharedVariable('from', from);
    setSharedVariable('to', to);
    let fromDay = from.split("-")[0];

    let fromMonth = from.split("-")[1];
    let fromYear = from.split("-")[2];

    let toDay = to.split("-")[0];
    let toMonth = to.split("-")[1];
    let toYear = to.split("-")[2];

    setSharedVariable('fromDay', fromDay);
    setSharedVariable('fromMonth', fromMonth);
    setSharedVariable('fromYear', fromYear);
    setSharedVariable('toDay', toDay);
    setSharedVariable('toMonth', toMonth);
    setSharedVariable('toYear', toYear);
    let customHeaders = {
        "Cache-Control": "max-age=0",
        "Origin": "https://wl.superfinanciera.gov.co",
        "Referer": "https://wl.superfinanciera.gov.co/SiriWeb/publico/sancion/rep_sanciones_general_par.jsf",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        "sec-ch-ua": "\"Chromium\";v=\"113\", \"Not-A.Brand\";v=\"24\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Linux\"",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);
    const body = new FormData();
    body.append('contentSV:frm2:idFechaDesde.day', fromDay);
    body.append('contentSV:frm2:idFechaDesde.month', fromMonth);
    body.append('contentSV:frm2:idFechaDesde.year', fromYear);
    body.append('contentSV:frm2:idFechaHasta.day', toDay);
    body.append('contentSV:frm2:idFechaHasta.month', toMonth);
    body.append('contentSV:frm2:idFechaHasta.year', toYear);
    body.append('contentSV:frm2:j_id_id15pc2', '');
    body.append('contentSV:frm2:j_id_id17pc2', '');
    body.append('contentSV:frm2:j_id_id19pc2', '');
    body.append('contentSV:frm2:numeroResolucion', '');
    body.append('contentSV:frm2:j_id_id25pc2', '');
    body.append('contentSV:frm2:j_id_id26pc2', 'Buscar');
    body.append('autoScroll', '0,0');
    body.append('contentSV:frm2_SUBMIT', '1');
    body.append('javax.faces.ViewState', getSharedVariable("view-state"));
    let method = "POST";
    let requestOptions = { method, body, headers: _headers };
    let requestURL = 'https://wl.superfinanciera.gov.co/SiriWeb/publico/sancion/rep_sanciones_general_par.jsf';
    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });
    responsePage = await parseCheckIfCorrectPagination({ canonicalURL, responsePage });
    //get the response status
    let status = responsePage[0].response.status;
    responsePage = responsePage[0]
    let pageNumber = canonicalURL.match(/page=(\d+)/i);
    pageNumber = pageNumber ? pageNumber[1] : 1;
    if (status === 200) {
        await parseViewState({ responsePage });
        responsePage = await parsePageParameters({ canonicalURL, responsePage })
        return responsePage;
    }
    return [responsePage];
}

const parsePageParameters = async function({ canonicalURL, responsePage }) {
    let html = await responsePage.response.buffer();
    responsePage.response = new fetch.Response(html, responsePage.response);
    //return [responsePage]
    const $ = cheerio.load(html);
    let rootURL = responsePage.canonicalURL.replace(/page=\d+/i, "");


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
        // return [onclick]
        let regex = /'([^']*)'/g;
        let match = onclick.match(regex);

        let value = null
        if (match) {
            value = match ? match[1] : "";
            value = value.replace(/'/g, "");
        }

        // remove the '' from the value
        //throw(value)
        let name = $(tds[0]).text();
        let fecha = $(tds[6]).text();
        let numero = $(tds[5]).text();
        name = caesarCipherEncode(name, 3);

        // Create the href using the fecha and numero values
        const href = `https://wl.superfinanciera.gov.co/SiriWeb/publico/sancion/rep_sanciones_general.jsf?name=${name}&fecha=${fecha}&numero=${numero}.pdf`;


        // a.attr('href', href);
        // get the value from the a href
        //href = a.attr('href');
        //throw(href)
        //a.attr('onclick', "return false;");
        //  postPdfForEachRow({ canonicalURL, headers })

        let response = await postPdfForEachRow({ value, canonicalURL: href, headers: {} })

        responses.push(response)




    }
    $(".paginator td a").each(function(i) {
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
    $('form[action]').each(function(i) {
        let form = $(this);
        let action = form.attr("action");
        let match = /(;jsessionid=.+)/i.exec(action);
        match && setSharedVariable('jsession', match[1]);
    });
    responsePage.response = new fetch.Response($.html(), responsePage.response);
    responses.push(responsePage)
    return responses;
};




function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}

const parseCheckIfCorrectPagination = async function({ canonicalURL, responsePage }) {
    let html = await responsePage.response.buffer();
    responsePage.response = new fetch.Response(html, responsePage.response);
    const $ = cheerio.load(html);
    // <div class="tableCentro" bis_skin_checked="1">Pagina 4 de 4</div>



    let $tableCentro = $(".tableCentro");
    let numberOfPages = "";

    if ($tableCentro.length) {
        let numberOfPages = $(".tableCentro").text().trim();
        //modify the hrefs 



        numberOfPages = numberOfPages.match(/Pagina (\d+) de (\d+)/i);


        // get the first number
        let currentPage = numberOfPages[1];
        let totalPages = numberOfPages[2];
        currentPage = parseInt(currentPage)
        let page = canonicalURL.match(/page=(\d+)/i);
        if (page) {
            page = page[1];
            page = parseInt(page) ? parseInt(page) : 0
            totalPages = parseInt(totalPages) ? parseInt(totalPages) : 1

        } else {
            page = 0
        }


        if (currentPage !== page) {
            // return response status 504
            responsePage.response.ok = false;
            responsePage.response.status = 504;
            // set content type to text/plain
            responsePage.response.headers.set("content-type", "text/plain");
            responsePage.response.statusText = `Page ${page} is not equal to ${currentPage}\n`.toUpperCase
                //throw(responsePage.response.status)
            responsePage.response = new fetch.Response(
                responsePage.response.statusText,
                responsePage.response
            );

        }
    } else {
        // return response status 504
        responsePage.response.ok = false;
        responsePage.response.status = 504;
        // set content type to text/plain
        responsePage.response.headers.set("content-type", "text/plain");
        responsePage.response.statusText = `Page is null \n`.toUpperCase
            //throw(responsePage.response.status)
        responsePage.response = new fetch.Response(
            responsePage.response.statusText,
            responsePage.response
        );


    }
    //throw(responsePage.response.status)
    return [responsePage];
};

const postPdfForEachRow = async function({ value, canonicalURL, headers }) {
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


    const body = new FormData();

    body.append('autoScroll', '0,0');
    body.append('contentSV:frm2_SUBMIT', '1');
    body.append('javax.faces.ViewState', getSharedVariable("view-state"));
    body.append('contentSV:frm2:_idcl', `${value}`);
    body.append('contentSV:frm2:idFechaDesde.day', getSharedVariable('fromDay'));
    body.append('contentSV:frm2:idFechaDesde.month', getSharedVariable('fromMonth'));
    body.append('contentSV:frm2:idFechaDesde.year', getSharedVariable('fromYear'));
    body.append('contentSV:frm2:idFechaHasta.day', getSharedVariable('toDay'));
    body.append('contentSV:frm2:idFechaHasta.month', getSharedVariable('toMonth'));
    body.append('contentSV:frm2:idFechaHasta.year', getSharedVariable('toYear'));
    body.append('contentSV:frm2:numeroResolucion', '');
    body.append('contentSV:frm2:j_id_id15pc2', '');
    body.append('contentSV:frm2:j_id_id17pc2', '');
    body.append('contentSV:frm2:j_id_id19pc2', '');
    body.append('contentSV:frm2:j_id_id25pc2', '');

    let method = "POST";
    let requestOptions = { method, body, headers: _headers };
    let requestURL = 'https://wl.superfinanciera.gov.co/SiriWeb/publico/sancion/rep_sanciones_general_par.jsf';
    let responsePage = await binaryDownload({ canonicalURL, requestURL, requestOptions });




    return responsePage
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
    //https://wl.superfinanciera.gov.co/SiriWeb/publico/sancion/rep_sanciones_general_par.jsf?from=19-04-2022&to=05-04-2023&page=1 get the day month and year from the canonicalURL
    const match = canonicalURL.match(/\?(from)=(\d{2}-\d{2}-\d{4}).*(to)=(\d{2}-\d{2}-\d{4})(&page=(\d+))?$/i);

    let arguments = {}
    let from = null;
    let to = null;
    let page = null;

    if (match) {


        from = match[2];
        to = match[4];

        arguments = { from, to, page }

    }

    if (match) {

        let page = match[6] ? parseInt(match[6]) : 1;
        if (page === 1) {

            return await getHome1({ arguments, canonicalURL, headers, page })
        }
    } else {
        return await fetchPage({ canonicalURL, headers });
    }

}