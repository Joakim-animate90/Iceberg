const { parse } = require("csv-parse/.");

async function fetchPage({ canonicalURL, requestURL, requestOptions, headers }) {
    if (!requestOptions) requestOptions = { method: "GET", headers };
    if (!canonicalURL) canonicalURL = requestURL;
    if (!requestURL) requestURL = canonicalURL;
    requestOptions.agent = new https.Agent({ rejectUnauthorized: false, keepAlive: true });

    return await fetchWithCookies(requestURL, requestOptions)
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



const getViewStateFromResponse = function({ response }) {
    const $ = cheerio.load(response);


    // get viewstate
    let viewstate = $('#__VIEWSTATE').val();
    viewstate = $('input[type="hidden"][name="__VIEWSTATE"]').val();

    let viewstategenerator = $('input[id="__VIEWSTATEGENERATOR"]').val();
    let eventvalidation = $('input[id="__EVENTVALIDATION"]').val();

    let actualPage = $('#MainContent_listaResultadoTabla_lblTotalNumberOfPages').text()
    actualPage = parseInt(actualPage)



    // console.log("viewstate-----------------------------------------------")
    // console.log(viewstate)
    // console.log("viewstategenerator-----------------------------------------------")
    // console.log(viewstategenerator)
    // console.log("eventvalidation-----------------------------------------------")
    // console.log(eventvalidation)
    // set viewstate to shared variable
    setSharedVariable('viewstate', viewstate);
    setSharedVariable('viewstategenerator', viewstategenerator);
    setSharedVariable('eventvalidation', eventvalidation);



};

const createPdfLinks = async function({ html, canonicalURL, headers }) {
    const responses = [];


    //get a copy of the html

    let htmlCopy = html



    //get the viewstate

    getViewStateFromResponse({ response: htmlCopy })
        //throw(getSharedVariable('viewstate') + " " + getSharedVariable('viewstategenerator') + " " + getSharedVariable('eventvalidation'))

    const $ = cheerio.load(html);

    const table = $('#MainContent_listaResultadoTabla')
    const tbody = table.find('tbody')
    const trs = tbody.find('tr')
    let uri = null;
    if (trs && trs.length > 7) {
        for (let i = 1; i < 9; i++) {
            //get tds 
            const tds = $(trs[i]).find('td')
            let nroResolucion = $(tds[0]).text()
            let fechaDelaResolucion = $(tds[2]).text()

            // get the link
            const link = $(tds[5]).find('a')
                // get the href
            let href = link.attr('href')


            const pattern = /ctl\d{2}\$MainContent\$listaResultadoTabla\$ctl\d{2}\$lnkabrirPdf/;
            const matches = href.match(pattern);


            setSharedVariable('__EVENTTARGET', matches[0]);




            let canonicalURL = `https://www.csj.gov.py/ResolucionesWeb/Formularios/documentoPDF.aspx?resolucionArchivo&nroResolucion=${nroResolucion}&fechaResolucion=${fechaDelaResolucion}`

            let pdfResponse = await fetchPdf({ canonicalURL, headers })

            responses.push(pdfResponse)

            uri = `https://www.csj.gov.py/ResolucionesWeb/Formularios/documentoPDF.aspx?resolucionArchivo&nroResolucion=${nroResolucion}&fechaResolucion=${fechaDelaResolucion}`

            // get the link

            // get the href and replace the url
            $(link).attr('href', url)



        }
    }


    return responses


};
const postNextPage = async function({ canonicalURL, headers }) {
    let customHeaders = {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        "DNT": "1",
        "Host": "www.csj.gov.py",
        "Pragma": "no-cache",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-User": "?1",
        "Sec-Fetch-Site": "same-origin",
        "Upgrade-Insecure-Requests": "1",
        "sec-ch-ua": "\"Not_A Brand\";v=\"99\", \"Google Chrome\";v=\"109\", \"Chromium\";v=\"109\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "referer": "https://www.csj.gov.py/ResolucionesWeb/Formularios/resultadoBusqueda.aspx",
        "Content-Type": "application/x-www-form-urlencoded",

        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);

    const data = {};

    data["__EVENTTARGET"] = ``;
    data["__EVENTARGUMENT"] = ``;
    data["__LASTFOCUS"] = ``;
    data["__VIEWSTATE"] = getSharedVariable('viewstate');
    data["__VIEWSTATEENCRYPTED"] = ``;
    data["__VIEWSTATEGENERATOR"] = getSharedVariable('viewstategenerator');
    data["__EVENTVALIDATION"] = getSharedVariable('eventvalidation');
    data["ctl00$MainContent$ddPaginas"] = 8;
    data["ctl00$MainContent$listaResultadoTabla$ctl11$btnNext"] = `Siguiente`;


    let body = querystring.stringify(data);


    //throw(JSON.stringify({data}, null, 4))

    let method = "POST"
    let requestOptions = { method, body, headers: _headers };
    let requestURL = 'https://www.csj.gov.py/ResolucionesWeb/Formularios/resultadoBusqueda.aspx'
        //let requestURL = `https://www.csj.gov.py/ResolucionesWeb/Formularios/documentoPDF.aspx?resolucionArchivo/`

    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });
    //return responsePage

    let response = await responsePage.response.text();
    let responseCopy = response
    getViewStateFromResponse({ response: responseCopy })

    return [responsePage, response];
}

const postLastPage = async function({ argument, canonicalURL, headers }) {
    let customHeaders = {
        "Cache-Control": "no-cache",
        "Content-Type": "application/x-www-form-urlencoded",
        "Origin": "https://www.csj.gov.py",
        "Pragma": "no-cache",
        "Referer": "https://www.csj.gov.py/ResolucionesWeb/Formularios/resultadoBusqueda.aspx",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        "sec-ch-ua": "\"Chromium\";v=\"112\", \"Google Chrome\";v=\"112\", \"Not:A-Brand\";v=\"99\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Linux\"",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);
    const data = {};
    data["__EVENTTARGET"] = ``;
    data["__EVENTARGUMENT"] = ``;
    data["__LASTFOCUS"] = ``;
    data["__VIEWSTATE"] = getSharedVariable('viewstate')
    data["__VIEWSTATEGENERATOR"] = getSharedVariable('viewstategenerator');
    data["__VIEWSTATEENCRYPTED"] = ``;
    data["__EVENTVALIDATION"] = getSharedVariable('eventvalidation');
    data["ctl00$MainContent$ddPaginas"] = `8`;
    data["ctl00$MainContent$listaResultadoTabla$ctl11$btnLast"] = `Ultimo`;
    let body = querystring.stringify(data);
    let method = "POST";
    let requestOptions = { method, body, headers: _headers };
    let requestURL = 'https://www.csj.gov.py/ResolucionesWeb/Formularios/resultadoBusqueda.aspx';
    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });

    //return responsePage

    let response = await responsePage.response.text();
    let responseCopy = response
    getViewStateFromResponse({ response: responseCopy })

    return [responsePage, response];
};




const postAnteriorPage = async function({ argument, canonicalURL, headers }) {
    let customHeaders = {
        "Cache-Control": "no-cache",
        "Content-Type": "application/x-www-form-urlencoded",
        "Origin": "https://www.csj.gov.py",
        "Pragma": "no-cache",
        "Referer": "https://www.csj.gov.py/ResolucionesWeb/Formularios/resultadoBusqueda.aspx",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        "sec-ch-ua": "\"Chromium\";v=\"112\", \"Google Chrome\";v=\"112\", \"Not:A-Brand\";v=\"99\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Linux\"",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);
    const data = {};
    data["__EVENTTARGET"] = ``;
    data["__EVENTARGUMENT"] = ``;
    data["__LASTFOCUS"] = ``;
    data["__VIEWSTATE"] = getSharedVariable('viewstate');
    data["__VIEWSTATEGENERATOR"] = getSharedVariable('viewstategenerator');
    data["__VIEWSTATEENCRYPTED"] = ``;
    data["__EVENTVALIDATION"] = getSharedVariable('eventvalidation');
    data["ctl00$MainContent$ddPaginas"] = `8`;
    data["ctl00$MainContent$listaResultadoTabla$ctl04$btnPrev"] = `Anterior`;
    let body = querystring.stringify(data);
    let method = "POST";
    let requestOptions = { method, body, headers: _headers };
    let requestURL = 'https://www.csj.gov.py/ResolucionesWeb/Formularios/resultadoBusqueda.aspx';
    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });
    //return responsePage

    let response = await responsePage.response.text();
    let responseCopy = response
    getViewStateFromResponse({ response: responseCopy })

    return [responsePage, response];;
};


const paginatorsFetch = async function({ html, canonicalURL, headers }) {
    let htmlCopy = html
        //throw(html)
    getViewStateFromResponse({ response: htmlCopy })
        // get pageNumber from shared variable
    let pageNumber = getSharedVariable('pageNumber');

    // get the actual page number
    let actualPageNumber = getSharedVariable('actualPageNumber');
    actualPageNumber = parseInt(actualPageNumber)
    let responsePage = null

    // divide the pageNumber by 2
    let halfPageNumber = actualPageNumber / 2
    halfPageNumber = Math.ceil(halfPageNumber)
    if (pageNumber >= halfPageNumber) {
        await postLastPage({ canonicalURL, headers })

        if (pageNumber === halfPageNumber) {
            responsePage = await postLastPage({ canonicalURL, headers })
            return responsePage
        } else {
            let k = halfPageNumber
            while (k <= pageNumber) {
                responsePage = await postAnteriorPage({ canonicalURL, headers })
                k++

            }
        }
    } else {

        let j = 2

        while (j <= pageNumber) {
            responsePage = await postNextPage({ canonicalURL, headers })
            j++
        }
        return responsePage
    }
}


const home = async function({ argument, canonicalURL, headers }) {
    //Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8
    //Accept-Encoding: gzip, deflate, br
    //Accept-Language: en-US,en;q=0.9
    let customHeaders = {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        "DNT": "1",
        "Pragma": "no-cache",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-User": "?1",
        "Sec-Fetch-Site": "none",
        "Upgrade-Insecure-Requests": "1",
        "sec-ch-ua": "\"Not_A Brand\";v=\"99\", \"Google Chrome\";v=\"109\", \"Chromium\";v=\"109\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",

        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    let requestOptions = { method, headers: _headers };
    const requestURL = 'https://www.csj.gov.py/ResolucionesWeb/Formularios/inicio.aspx'
        // from the canonical url get pageN umber
    let pageNumber = /page=(\d+)/.exec(canonicalURL);
    pageNumber = pageNumber ? parseInt(pageNumber[1]) : 1;
    setSharedVariable('pageNumber', pageNumber);

    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });
    // get viewstate
    let response = await responsePage.response.text();
    console.log("response-----------------------------------------------")


    getViewStateFromResponse({ response });
    //throw(getSharedVariable('viewstate'))

    return responsePage;
};

const postPdf = async function({ canonicalURL, headers }) {
    let customHeaders = {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        "DNT": "1",
        "Host": "www.csj.gov.py",
        "Pragma": "no-cache",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-User": "?1",
        "Sec-Fetch-Site": "same-origin",
        "Upgrade-Insecure-Requests": "1",
        "sec-ch-ua": "\"Not_A Brand\";v=\"99\", \"Google Chrome\";v=\"109\", \"Chromium\";v=\"109\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "referer": "https://www.csj.gov.py/ResolucionesWeb/Formularios/resultadoBusqueda.aspx",
        "Content-Type": "application/x-www-form-urlencoded",

        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);

    const data = {};

    data["__EVENTTARGET"] = getSharedVariable('__EVENTTARGET');
    data["__EVENTARGUMENT"] = ``;
    data["__LASTFOCUS"] = ``;
    data["__VIEWSTATE"] = getSharedVariable('viewstate');
    data["__VIEWSTATEENCRYPTED"] = ``;
    data["__VIEWSTATEGENERATOR"] = getSharedVariable('viewstategenerator');
    data["__EVENTVALIDATION"] = getSharedVariable('eventvalidation');
    data["ctl00$MainContent$ddPaginas"] = 8;



    let body = querystring.stringify(data);


    //throw(JSON.stringify({data}, null, 4))

    let method = "POST"
    let requestOptions = { method, body, headers: _headers };
    let requestURL = 'https://www.csj.gov.py/ResolucionesWeb/Formularios/resultadoBusqueda.aspx'
        //let requestURL = `https://www.csj.gov.py/ResolucionesWeb/Formularios/documentoPDF.aspx?resolucionArchivo/`

    let responsePage = await fetchPage({ requestURL, requestOptions });

    let response = await responsePage.response.text();
    getViewStateFromResponse({ response });

    return responsePage;
}
const fetchPdf = async function({ canonicalURL, headers }) {
    //Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8
    //Accept-Encoding: gzip, deflate, br
    //Accept-Language: en-US,en;q=0.9
    let customHeaders = {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        "DNT": "1",
        "Host": "www.csj.gov.py",
        "Pragma": "no-cache",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-User": "?1",
        "Sec-Fetch-Site": "same-origin",
        "Upgrade-Insecure-Requests": "1",
        "sec-ch-ua": "\"Not_A Brand\";v=\"99\", \"Google Chrome\";v=\"109\", \"Chromium\";v=\"109\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "referer": "https://www.csj.gov.py/ResolucionesWeb/Formularios/resultadoBusqueda.aspx",
        "Content-Type": "application/x-www-form-urlencoded",

        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);


    await postPdf({ canonicalURL, headers: _headers });




    let method = "GET";
    let requestOptions = { method, headers: _headers };
    let requestURL = `https://www.csj.gov.py/ResolucionesWeb/Formularios/documentoPDF.aspx?resolucionArchivo`


    let responsePage = await binaryDownload({ canonicalURL, requestURL, requestOptions });


    return responsePage;
};


const EVENTTARGET = async function({ argument, canonicalURL, headers }) {
    await home({ canonicalURL, headers })

    let __VIEWSTATE = getSharedVariable('viewstate');
    let __VIEWSTATEGENERATOR = getSharedVariable('viewstategenerator');
    let __EVENTVALIDATION = getSharedVariable('eventvalidation');
    console.log("viewstate------------------------------------------")



    let customHeaders = {
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",

        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",

        "Host": "www.csj.gov.py",
        "Origin": "https://www.csj.gov.py",
        "Pragma": "no-cache",
        "Referer": "https://www.csj.gov.py/ResolucionesWeb/Formularios/inicio.aspx",
        "sec-ch-ua": "\"Brave\";v=\"107\", \"Chromium\";v=\"107\", \"Not=A?Brand\";v=\"24\"",
        "sec-ch-ua-mobile": "?0",

        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",

        "Sec-Fetch-Site": "same-origin",
        "Sec-GPC": "1",
        "sec-ch-ua-platform": "\"Windows\"",

        "X-MicrosoftAjax": "Delta=true",
        "X-Requested-With": "XMLHttpRequest*/",
        "Accept-Encoding": "gzip, deflate, br"


    };
    let _headers = Object.assign(customHeaders, headers);
    const data = {};
    data["ctl00$MainContent$smPrincipal"] = `ctl00$MainContent$UpdatePanel|ctl00$MainContent$ddCircunscripcion`
    data["__EVENTTARGET"] = `ctl00$MainContent$ddCircunscripcion`;
    data["__EVENTARGUMENT"] = ``;
    data["__LASTFOCUS"] = ``;
    data["__VIEWSTATE"] = __VIEWSTATE;
    data["__VIEWSTATEGENERATOR"] = __VIEWSTATEGENERATOR;
    data["__EVENTVALIDATION"] = __EVENTVALIDATION;
    data["ctl00$MainContent$txtTexto"] = ``;
    data["ctl00$MainContent$txtNro"] = ``;
    data["ctl00$MainContent$datepickerDesde"] = getSharedVariable('fromDate');
    data["ctl00$MainContent$datepickerHasta"] = getSharedVariable('toDate');
    data["ctl00$MainContent$ddCircunscripcion"] = getSharedVariable('circunValue');
    data["ctl00$MainContent$ddSalas"] = `-1`;
    data["ctl00$MainContent$ddTipoResolucion"] = `-1`;
    data["__ASYNCPOST"] = `true`;





    //throw(JSON.stringify({data}, null, 4))
    let body = querystring.stringify(data);
    body += "&";
    console.log(body)
        //true&=… remove the =…  on the end of the body



    let method = "POST";
    let requestOptions = { method, body, headers: _headers };
    let requestURL = `https://www.csj.gov.py/ResolucionesWeb/Formularios/inicio.aspx`;
    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });
    //responsePage = await responsePage.response.buffer();
    let textResponsePage = await responsePage.response.text();
    // split using | as the delimiter
    let response1 = textResponsePage.split("|");
    // check for viewstate in the response and get the next index is the viewstate
    let viewstateIndex = response1.findIndex((item) => item.includes("__VIEWSTATE"));
    // get the viewstate
    let viewstate = response1[viewstateIndex + 1];
    let viewstategeneratorIndex = response1.findIndex((item) => item.includes("__VIEWSTATEGENERATOR"));
    let viewstategenerator = response1[viewstategeneratorIndex + 1];
    let eventvalidationIndex = response1.findIndex((item) => item.includes("__EVENTVALIDATION"));
    let eventvalidation = response1[eventvalidationIndex + 1];

    setSharedVariable('viewstate', viewstate);
    setSharedVariable('viewstategenerator', viewstategenerator);
    setSharedVariable('eventvalidation', eventvalidation);

    //throw(getSharedVariable('eventvalidation'))

    return responsePage;
};
let circunDic = {
    altoParaguay: '18',
    amambay: '5',
    caazapa: '16',
    canindeyu: '15',
    capital: '1',
    central: '11',
    concepcion: '4',
    cordirella: '12',
    itapua: '3',
    misiones: '9',
    neembucu: '8',
    paraguari: '14',
    presidenteHayes: '19',
    sanPedro: '17',
}
let tipoDeDic = {
    acuerdoSentencia: '2',
    sentenciaDefinitiva: '3',
    autoInterlocutorio: '1'
}

const searchByDate = async function({ argument, canonicalURL, headers }) {

    const match = canonicalURL.match(/from=(.*)&to=(.*)&Circunscripción=(.*)&tipoDeResolucion=(.*)&page=(.*)&pg=([^&]*)/i);


    let from = match[1];
    let to = match[2];
    let circunscripcion = match[3];
    let tipoDeResolucion = match[4];
    let pageNum = match[5]
    pageNum = parseInt(pageNum)
    setSharedVariable('pageNumber', pageNum)
    setSharedVariable('fromDate', from);
    setSharedVariable('toDate', to);

    if (circunscripcion === 'amambay') {
        setSharedVariable('circunValue', circunDic.amambay)
    } else if (circunscripcion === 'caazapa') {
        setSharedVariable('circunValue', circunDic.caazapa)
    } else if (circunscripcion === 'canindeyu') {
        setSharedVariable('circunValue', circunDic.canindeyu)
    } else if (circunscripcion === 'capital') {
        setSharedVariable('circunValue', circunDic.capital)
    } else if (circunscripcion === 'central') {
        setSharedVariable('circunValue', circunDic.central)
    } else if (circunscripcion === 'concepcion') {
        setSharedVariable('circunValue', circunDic.concepcion)
    } else if (circunscripcion === 'cordirella') {
        setSharedVariable('circunValue', circunDic.cordirella)
    } else if (circunscripcion === 'itapua') {
        setSharedVariable('circunValue', circunDic.itapua)
    } else if (circunscripcion === 'misiones') {
        setSharedVariable('circunValue', circunDic.misiones)
    } else if (circunscripcion === 'neembucu') {
        setSharedVariable('circunValue', circunDic.neembucu)
    } else if (circunscripcion === 'paraguari') {
        setSharedVariable('circunValue', circunDic.paraguari)
    } else if (circunscripcion === 'presidenteHayes') {
        setSharedVariable('circunValue', circunDic.presidenteHayes)
    } else if (circunscripcion === 'sanPedro') {
        setSharedVariable('circunValue', circunDic.sanPedro)
    } else if (circunscripcion === 'altoParaguay') {
        setSharedVariable('circunValue', circunDic.altoParaguay)
    }


    if (tipoDeResolucion === 'acuerdoSentencia') {
        setSharedVariable('tipoDeValue', tipoDeDic.acuerdoSentencia)
    } else if (tipoDeResolucion === 'sentenciaDefinitiva') {
        setSharedVariable('tipoDeValue', tipoDeDic.sentenciaDefinitiva)
    } else if (tipoDeResolucion === 'autoInterlocutorio') {
        setSharedVariable('tipoDeValue', tipoDeDic.autoInterlocutorio)
    }


    await EVENTTARGET({ canonicalURL, headers })



    let customHeaders = {
        "Cache-Control": "no-cache",
        "Content-Type": "application/x-www-form-urlencoded",
        "DNT": "1",
        "Origin": "https://www.csj.gov.py",
        "Pragma": "no-cache",
        "Referer": "https://www.csj.gov.py/ResolucionesWeb/Formularios/inicio.aspx",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        "sec-ch-ua": "\"Not_A Brand\";v=\"99\", \"Google Chrome\";v=\"109\", \"Chromium\";v=\"109\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "Accept-Encoding": "gzip, deflate, br",


    };
    let _headers = Object.assign(customHeaders, headers);
    const data = {};
    data["ctl00$MainContent$txtTexto"] = ``;
    data["ctl00$MainContent$txtNro"] = ``;
    data["ctl00$MainContent$datepickerDesde"] = `${from}`;
    data["ctl00$MainContent$datepickerHasta"] = `${to}`;
    data["ctl00$MainContent$ddCircunscripcion"] = getSharedVariable('circunValue');
    data["ctl00$MainContent$ddSalas"] = `-1`;
    data["ctl00$MainContent$ddTipoResolucion"] = getSharedVariable('tipoDeValue');
    data["ctl00$MainContent$btnFiltro"] = `Consultar`;
    //data["conversationId"] = ``;
    data["__EVENTTARGET"] = ``;
    data["__EVENTARGUMENT"] = ``;
    data["__LASTFOCUS"] = ``;
    data["__VIEWSTATE"] = getSharedVariable('viewstate');
    data["__VIEWSTATEGENERATOR"] = getSharedVariable('viewstategenerator');
    data["__EVENTVALIDATION"] = getSharedVariable('eventvalidation');



    //throw(JSON.stringify({data}, null, 4))
    let body = querystring.stringify(data);

    let method = "POST";
    let requestOptions = { method, body, headers: _headers, redirect: 'manual' };
    let requestURL = `https://www.csj.gov.py/ResolucionesWeb/Formularios/inicio.aspx`;
    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });



    method = "GET";
    requestOptions = { method, headers: _headers };
    requestURL = `https://www.csj.gov.py/ResolucionesWeb/Formularios/resultadoBusqueda.aspx`;
    responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });
    //return [responsePage]
    // get page Number
    let html = await responsePage.response.text();
    let htmlCopy = html;
    let pageNumber = getSharedVariable('pageNumber');
    if (pageNumber > 1) {

        responsePage = await paginatorsFetch({ html: htmlCopy, canonicalURL, headers });


        let createsPdfLinks = await createPdfLinks({ html: responsePage[1], canonicalURL, headers });
        return createsPdfLinks;


    }
    let createsPdfLinks = await createPdfLinks({ html: html, canonicalURL, headers });
    return createsPdfLinks;


};
const getNumberOfPages = async function({ argument, canonicalURL, headers }) {

    const match = canonicalURL.match(/from=(.*)&to=(.*)&Circunscripción=(.*)&tipoDeResolucion=(.*)&page=(.*)&po=([^&]*)/i);


    let from = match[1];
    let to = match[2];
    let circunscripcion = match[3];
    let tipoDeResolucion = match[4];

    setSharedVariable('fromDate', from);
    setSharedVariable('toDate', to);

    if (circunscripcion === 'amambay') {
        setSharedVariable('circunValue', circunDic.amambay)
    } else if (circunscripcion === 'caazapa') {
        setSharedVariable('circunValue', circunDic.caazapa)
    } else if (circunscripcion === 'canindeyu') {
        setSharedVariable('circunValue', circunDic.canindeyu)
    } else if (circunscripcion === 'capital') {
        setSharedVariable('circunValue', circunDic.capital)
    } else if (circunscripcion === 'central') {
        setSharedVariable('circunValue', circunDic.central)
    } else if (circunscripcion === 'concepcion') {
        setSharedVariable('circunValue', circunDic.concepcion)
    } else if (circunscripcion === 'cordirella') {
        setSharedVariable('circunValue', circunDic.cordirella)
    } else if (circunscripcion === 'itapua') {
        setSharedVariable('circunValue', circunDic.itapua)
    } else if (circunscripcion === 'misiones') {
        setSharedVariable('circunValue', circunDic.misiones)
    } else if (circunscripcion === 'neembucu') {
        setSharedVariable('circunValue', circunDic.neembucu)
    } else if (circunscripcion === 'paraguari') {
        setSharedVariable('circunValue', circunDic.paraguari)
    } else if (circunscripcion === 'presidenteHayes') {
        setSharedVariable('circunValue', circunDic.presidenteHayes)
    } else if (circunscripcion === 'sanPedro') {
        setSharedVariable('circunValue', circunDic.sanPedro)
    } else if (circunscripcion === 'altoParaguay') {
        setSharedVariable('circunValue', circunDic.altoParaguay)
    }


    if (tipoDeResolucion === 'acuerdoSentencia') {
        setSharedVariable('tipoDeValue', tipoDeDic.acuerdoSentencia)
    } else if (tipoDeResolucion === 'sentenciaDefinitiva') {
        setSharedVariable('tipoDeValue', tipoDeDic.sentenciaDefinitiva)
    } else if (tipoDeResolucion === 'autoInterlocutorio') {
        setSharedVariable('tipoDeValue', tipoDeDic.autoInterlocutorio)
    }


    await EVENTTARGET({ canonicalURL, headers })



    let customHeaders = {
        "Cache-Control": "no-cache",
        "Content-Type": "application/x-www-form-urlencoded",
        "DNT": "1",
        "Origin": "https://www.csj.gov.py",
        "Pragma": "no-cache",
        "Referer": "https://www.csj.gov.py/ResolucionesWeb/Formularios/inicio.aspx",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        "sec-ch-ua": "\"Not_A Brand\";v=\"99\", \"Google Chrome\";v=\"109\", \"Chromium\";v=\"109\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "Accept-Encoding": "gzip, deflate, br",


    };
    let _headers = Object.assign(customHeaders, headers);
    const data = {};
    data["ctl00$MainContent$txtTexto"] = ``;
    data["ctl00$MainContent$txtNro"] = ``;
    data["ctl00$MainContent$datepickerDesde"] = `${from}`;
    data["ctl00$MainContent$datepickerHasta"] = `${to}`;
    data["ctl00$MainContent$ddCircunscripcion"] = getSharedVariable('circunValue');
    data["ctl00$MainContent$ddSalas"] = `-1`;
    data["ctl00$MainContent$ddTipoResolucion"] = getSharedVariable('tipoDeValue');
    data["ctl00$MainContent$btnFiltro"] = `Consultar`;
    //data["conversationId"] = ``;
    data["__EVENTTARGET"] = ``;
    data["__EVENTARGUMENT"] = ``;
    data["__LASTFOCUS"] = ``;
    data["__VIEWSTATE"] = getSharedVariable('viewstate');
    data["__VIEWSTATEGENERATOR"] = getSharedVariable('viewstategenerator');
    data["__EVENTVALIDATION"] = getSharedVariable('eventvalidation');



    //throw(JSON.stringify({data}, null, 4))
    let body = querystring.stringify(data);

    let method = "POST";
    let requestOptions = { method, body, headers: _headers, redirect: 'manual' };
    let requestURL = `https://www.csj.gov.py/ResolucionesWeb/Formularios/inicio.aspx`;
    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });



    method = "GET";
    requestOptions = { method, headers: _headers };
    requestURL = `https://www.csj.gov.py/ResolucionesWeb/Formularios/resultadoBusqueda.aspx`;
    responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });
    return [responsePage]


};


async function fetchURL({ canonicalURL, headers }) {
    // https://www.csj.gov.py/ResolucionesWeb/Formularios/inicio.aspx?from=01-01-1900&to=20-04-2023&page=1

    if (/pg=1/i.test(canonicalURL)) {

        return await searchByDate({ canonicalURL, headers })
    } else if (/po=totalPages/i.test(canonicalURL)) {

        return await getNumberOfPages({ canonicalURL, headers })
    }

}