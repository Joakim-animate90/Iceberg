async function fetchPage({canonicalURL, requestURL, requestOptions, headers}) {
    if (!requestOptions) requestOptions = {method: "GET", headers};
    if (!canonicalURL) canonicalURL = requestURL;
    if (!requestURL) requestURL = canonicalURL;
    return await fetchWithCookies(requestURL, requestOptions, 'zone-g1-country-co')
        .then(response => {
            return {
                canonicalURL,
                request: Object.assign({URL: requestURL}, requestOptions),
                response
            };
        });
}

const extractValue = (html, key) => {
    const pattern = new RegExp(`(?<=${key}\\|)(.*?)(?=\\|)`, 'g');
    const match = pattern.exec(html);
    return match ? match[0] : null;
};

const getViewStateFromResponse = async function({ responsePage }) {
    let html = await responsePage.response.buffer();
    responsePage.response = new fetch.Response(html, responsePage.response);

    const $ = cheerio.load(html);

    let viewstate = $('#__VIEWSTATE').val();
    viewstate = $('input[type="hidden"][name="__VIEWSTATE"]').val();

    let viewstategenerator = $('input[id="__VIEWSTATEGENERATOR"]').val();
    let eventvalidation = $('input[id="__EVENTVALIDATION"]').val();
    let eventArgument;
    let eventTarget;

    if(!viewstate || !viewstategenerator || !eventvalidation) {
       eventTarget = extractValue(html, '__EVENTTARGET');
       eventvalidation = extractValue(html, '__EVENTVALIDATION');
       eventArgument = extractValue(html, '__EVENTARGUMENT');
       viewstate = extractValue(html, '__VIEWSTATE');
       viewstategenerator = extractValue(html, '__VIEWSTATEGENERATOR');

    }

    setSharedVariable('viewstate', viewstate);
    setSharedVariable('viewstategenerator', viewstategenerator);
    setSharedVariable('eventvalidation', eventvalidation);

};


const createLinks = async function ({ argument, responsePage}) {
    let html = await responsePage.response.buffer();
    responsePage.response = new fetch.Response(html, responsePage.response);

    const $ = cheerio.load(html);
    const pageText = $('#MainContent_ResultadoBusqueda1_PaginaActualLabel').text();
    const totalPages = parseInt(pageText.split(' de ')[1]);
    const urls = [];
    for (let page = 2; page <= totalPages; page++) {
        const url = `https://samai.consejodeestado.gov.co/TitulacionRelatoria/BuscadorProvidenciasTituladas.aspx?type=caqueta&from=${argument.from}&to=${argument.to}&page=${page}`;
        urls.push(url);
    }

    // Inject URLs into the HTML body
    $('body').append(`<ul id="generatedUrls"></ul>`);
    urls.forEach(url => {
        $('#generatedUrls').append(`<li><a href="${url}">${url}</a></li>`);
    });
    responsePage.response = new fetch.Response($.html(), responsePage.response);

    // Return the modified HTML
    return responsePage;
};

const createDocumentLinks = async function ({ argument, responsePage}) {
    let html = await responsePage.response.buffer();
    responsePage.response = new fetch.Response(html, responsePage.response);

    const $ = cheerio.load(html);
    $('.row.p-1 a').each((index, element) => {
        const anchorTag = $(element);
        const onclickAttr = anchorTag.attr('onclick');
        const token = onclickAttr.match(/tokenDocumento=([^']+)/)[1];
        const newURL = `https://samai.consejodeestado.gov.co/PaginasTransversales/VerProvidencia.aspx?tokenDocumento=${token}`;
        
        // Update the href attribute with the new URL
        anchorTag.attr('href', newURL);
        
        // Remove the onclick attribute
        anchorTag.removeAttr('onclick');
    });
    responsePage.response = new fetch.Response($.html(), responsePage.response);

    // Return the modified HTML
    return responsePage;
}






const getHome = async function ({argument, canonicalURL, headers}) {
    let customHeaders = {
                "priority": "u=0, i",
                "sec-ch-ua": "\"Chromium\";v=\"124\", \"Google Chrome\";v=\"124\", \"Not-A.Brand\";v=\"99\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Linux\"",
                "sec-fetch-dest": "document",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "none",
                "sec-fetch-user": "?1",
                "upgrade-insecure-requests": "1"
            };
    let _headers = Object.assign(customHeaders, headers);
    
    let method = "GET";
    let requestOptions = {method, headers: _headers};
    let requestURL = 'https://samai.consejodeestado.gov.co/TitulacionRelatoria/BuscadorProvidenciasTituladas.aspx';
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
    await getViewStateFromResponse({responsePage});
    return responsePage;
};


/*
//document type
*/





const getDocumentType = async function ({argument, canonicalURL, headers}) {
        let customHeaders = {
                    "cache-control": "no-cache",
                    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "origin": "https://samai.consejodeestado.gov.co",
                    "priority": "u=1, i",
                    "referer": "https://samai.consejodeestado.gov.co/TitulacionRelatoria/BuscadorProvidenciasTituladas.aspx",
                    "sec-ch-ua": "\"Chromium\";v=\"124\", \"Google Chrome\";v=\"124\", \"Not-A.Brand\";v=\"99\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Linux\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "x-microsoftajax": "Delta=true",
                    "x-requested-with": "XMLHttpRequest"
                };
        let _headers = Object.assign(customHeaders, headers);
        const data = {};
        data["ctl00$MainContent$ScriptManager1"] = `ctl00$MainContent$PanelUpdate|ctl00$MainContent$CorporacionesTitulanDataList$ctl01$CorporacionButton`;
        data["__EVENTTARGET"] = ``;
        data["__EVENTARGUMENT"] = ``;
        data["__VIEWSTATE"] = `${getSharedVariable('viewstate')}`;
         data["__VIEWSTATEGENERATOR"] = `${getSharedVariable('viewstategenerator')}`;
        data["__SCROLLPOSITIONX"] = `0`;
        data["__SCROLLPOSITIONY"] = `0`;
        data["__VIEWSTATEENCRYPTED"] = ``;
        data["__EVENTVALIDATION"] = `${getSharedVariable('eventvalidation')}`;
        data["ctl00$TiempoSessionHiddenField"] = ``;
        data["stepactive"] = `1`;
        data["ctl00$MainContent$BusquedaRapidaTextBox"] = ``;
        data["ctl00$MainContent$NumeroRadicacionTextBox"] = ``;
        data["ctl00$MainContent$InternoTextBox"] = ``;
        data["ctl00$MainContent$PonenteTextBox"] = ``;
        data["ctl00$MainContent$FirmanteBuscadorTextBox"] = ``;
        data["ctl00$MainContent$FechaDesdeTextBox"] = ``;
        data["ctl00$MainContent$FechaHastaTextBox"] = ``;
        data["ctl00$MainContent$DescriptorBuscadorTextBox"] = ``;
        data["ctl00$MainContent$TemaTextoTextBox"] = ``;
        data["ctl00$MainContent$ProvidenciaTextoTextoTextBox"] = ``;
        data["ctl00$MainContent$ProblemaJuridicoTextBox"] = ``;
        data["ctl00$MainContent$DemandadoTextBox"] = ``;
        data["ctl00$MainContent$ActorTextBox"] = ``;
        data["ctl00$MainContent$FuenteFormalTextBox"] = ``;
        data["ctl00$MainContent$NormaDemandadaTextBox"] = ``;
        data["ctl00$TmpPerfilGestion"] = ``;
        data["__ASYNCPOST"] = `true`;
        data["ctl00$MainContent$CorporacionesTitulanDataList$ctl01$CorporacionButton"] = `Tribunal Administrativo del Caquetá`;
        let body = querystring.stringify(data);
        let method = "POST";
        let requestOptions = {method, body, headers: _headers};
        let requestURL = 'https://samai.consejodeestado.gov.co/TitulacionRelatoria/BuscadorProvidenciasTituladas.aspx';
        let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
        await getViewStateFromResponse({responsePage});
        return responsePage;
    };


/*
//search date
*/




const searchDate = async function ({argument, canonicalURL, headers}) {
        let customHeaders = {
                    "cache-control": "no-cache",
                    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "origin": "https://samai.consejodeestado.gov.co",
                    "priority": "u=1, i",
                    "referer": "https://samai.consejodeestado.gov.co/TitulacionRelatoria/BuscadorProvidenciasTituladas.aspx",
                    "sec-ch-ua": "\"Chromium\";v=\"124\", \"Google Chrome\";v=\"124\", \"Not-A.Brand\";v=\"99\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Linux\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "x-microsoftajax": "Delta=true",
                    "x-requested-with": "XMLHttpRequest"
                };
        let _headers = Object.assign(customHeaders, headers);
        const data = {};
        data["ctl00$MainContent$ScriptManager1"] = `ctl00$MainContent$PanelUpdate|ctl00$MainContent$OQueContengaFechaLinkButton`;
        data["ctl00$TiempoSessionHiddenField"] = ``;
        data["stepactive"] = `1`;
        data["ctl00$MainContent$BusquedaRapidaTextBox"] = ``;
        data["ctl00$MainContent$NumeroRadicacionTextBox"] = ``;
        data["ctl00$MainContent$InternoTextBox"] = ``;
        data["ctl00$MainContent$PonenteTextBox"] = ``;
        data["ctl00$MainContent$FirmanteBuscadorTextBox"] = ``;
        data["ctl00$MainContent$FechaDesdeTextBox"] = `${argument.from}`;
        data["ctl00$MainContent$FechaHastaTextBox"] = `${argument.to}`;
        data["ctl00$MainContent$DescriptorBuscadorTextBox"] = ``;
        data["ctl00$MainContent$TemaTextoTextBox"] = ``;
        data["ctl00$MainContent$ProvidenciaTextoTextoTextBox"] = ``;
        data["ctl00$MainContent$ProblemaJuridicoTextBox"] = ``;
        data["ctl00$MainContent$DemandadoTextBox"] = ``;
        data["ctl00$MainContent$ActorTextBox"] = ``;
        data["ctl00$MainContent$FuenteFormalTextBox"] = ``;
        data["ctl00$MainContent$NormaDemandadaTextBox"] = ``;
        data["ctl00$TmpPerfilGestion"] = ``;
        data["__EVENTTARGET"] = `ctl00$MainContent$OQueContengaFechaLinkButton`;
        data["__EVENTARGUMENT"] = ``;
        data["__VIEWSTATE"] =   `${getSharedVariable('viewstate')}`;
        data["__VIEWSTATEGENERATOR"] = `${getSharedVariable('viewstategenerator')}`;
        data["__SCROLLPOSITIONX"] = `0`;
        data["__SCROLLPOSITIONY"] = `0`;
        data["__VIEWSTATEENCRYPTED"] = ``;
        data["__EVENTVALIDATION"] =  `${getSharedVariable('eventvalidation')}`;
          data["__ASYNCPOST"] = `true`;
        let body = querystring.stringify(data);
                let method = "POST";
                let requestOptions = {method, body, headers: _headers};
                let requestURL = 'https://samai.consejodeestado.gov.co/TitulacionRelatoria/BuscadorProvidenciasTituladas.aspx';
                let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
                await getViewStateFromResponse({responsePage});
                return responsePage;
            };


/*
  //search by final value
*/




const getSearch = async function ({argument, canonicalURL, headers}) {
        let customHeaders = {
                    "cache-control": "no-cache",
                    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "origin": "https://samai.consejodeestado.gov.co",
                    "priority": "u=1, i",
                    "referer": "https://samai.consejodeestado.gov.co/TitulacionRelatoria/BuscadorProvidenciasTituladas.aspx",
                    "sec-ch-ua": "\"Chromium\";v=\"124\", \"Google Chrome\";v=\"124\", \"Not-A.Brand\";v=\"99\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Linux\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "x-microsoftajax": "Delta=true",
                    "x-requested-with": "XMLHttpRequest"
                };
        let _headers = Object.assign(customHeaders, headers);
        const data = {};
        data["ctl00$MainContent$ScriptManager1"] = `ctl00$MainContent$PanelUpdate|ctl00$MainContent$BuscarProvidenciasLinkButton`;
        data["ctl00$TiempoSessionHiddenField"] = ``;
        data["stepactive"] = `1`;
        data["ctl00$MainContent$BusquedaRapidaTextBox"] = ``;
        data["ctl00$MainContent$NumeroRadicacionTextBox"] = ``;
        data["ctl00$MainContent$InternoTextBox"] = ``;
        data["ctl00$MainContent$PonenteTextBox"] = ``;
        data["ctl00$MainContent$FirmanteBuscadorTextBox"] = ``;
        data["ctl00$MainContent$FechaDesdeTextBox"] = ``;
        data["ctl00$MainContent$FechaHastaTextBox"] = ``;
        data["ctl00$MainContent$DescriptorBuscadorTextBox"] = ``;
        data["ctl00$MainContent$TemaTextoTextBox"] = ``;
        data["ctl00$MainContent$ProvidenciaTextoTextoTextBox"] = ``;
        data["ctl00$MainContent$ProblemaJuridicoTextBox"] = ``;
        data["ctl00$MainContent$DemandadoTextBox"] = ``;
        data["ctl00$MainContent$ActorTextBox"] = ``;
        data["ctl00$MainContent$FuenteFormalTextBox"] = ``;
        data["ctl00$MainContent$NormaDemandadaTextBox"] = ``;
        data["ctl00$TmpPerfilGestion"] = ``;
        data["__EVENTTARGET"] = `ctl00$MainContent$BuscarProvidenciasLinkButton`;
        data["__EVENTARGUMENT"] = ``;
        data["__VIEWSTATE"] = `${getSharedVariable('viewstate')}` 
        data["__VIEWSTATEGENERATOR"] = `${getSharedVariable('viewstategenerator')}`;
        data["__SCROLLPOSITIONX"] = `0`;
        data["__SCROLLPOSITIONY"] = `0`;
        data["__EVENTVALIDATION"] =  `${getSharedVariable('eventvalidation')}`;
        data["__VIEWSTATEENCRYPTED"] = ``;
        data["__ASYNCPOST"] = `true`;
        let body = querystring.stringify(data);
                let method = "POST";
                let requestOptions = {method, body, headers: _headers};
                let requestURL = 'https://samai.consejodeestado.gov.co/TitulacionRelatoria/BuscadorProvidenciasTituladas.aspx';
                let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
                 await getViewStateFromResponse({responsePage});
                return responsePage;
};


const getPagination = async function ({argument, canonicalURL, headers}) {
    // throw new Error(JSON.stringify({ message: `${getSharedVariable('viewstategenerator')}`, code: 500 }));
    //throw new Error(JSON.stringify({ message: `${getSharedVariable('viewstate')}`, code: 500 }));
    let customHeaders = {
                "cache-control": "max-age=0",
                "content-type": "application/x-www-form-urlencoded",
                "origin": "https://samai.consejodeestado.gov.co",
                "priority": "u=0, i",
                "referer": "https://samai.consejodeestado.gov.co/TitulacionRelatoria/BuscadorProvidenciasTituladas.aspx",
                "sec-ch-ua": "\"Chromium\";v=\"124\", \"Google Chrome\";v=\"124\", \"Not-A.Brand\";v=\"99\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Linux\"",
                "sec-fetch-dest": "document",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "same-origin",
                "sec-fetch-user": "?1",
                "upgrade-insecure-requests": "1"
            };
    let _headers = Object.assign(customHeaders, headers);
    const data = {};
    data["__EVENTTARGET"] = `ctl00$MainContent$ResultadoBusqueda1$IrALinkButton`;
    data["__EVENTARGUMENT"] = ``;
    data["__LASTFOCUS"] = ``;
    data["__VIEWSTATE"] =  `${getSharedVariable('viewstate')}`
    data["__VIEWSTATEGENERATOR"] = `${getSharedVariable('viewstategenerator')}`;
    data["__SCROLLPOSITIONX"] = `0`;
    data["__SCROLLPOSITIONY"] = `867`;
    data["__VIEWSTATEENCRYPTED"] = ``;
    data["__EVENTVALIDATION"] =  `${getSharedVariable('eventvalidation')}`;
    data["ctl00$TiempoSessionHiddenField"] = ``;
    data["stepactive"] = `1`;
    data["ctl00$MainContent$BusquedaRapidaTextBox"] = ``;
    data["ctl00$MainContent$NumeroRadicacionTextBox"] = ``;
    data["ctl00$MainContent$InternoTextBox"] = ``;
    data["ctl00$MainContent$PonenteTextBox"] = ``;
    data["ctl00$MainContent$FirmanteBuscadorTextBox"] = ``;
    data["ctl00$MainContent$FechaDesdeTextBox"] = ``;
    data["ctl00$MainContent$FechaHastaTextBox"] = ``;
    data["ctl00$MainContent$DescriptorBuscadorTextBox"] = ``;
    data["ctl00$MainContent$TemaTextoTextBox"] = ``;
    data["ctl00$MainContent$ProvidenciaTextoTextoTextBox"] = ``;
    data["ctl00$MainContent$ProblemaJuridicoTextBox"] = ``;
    data["ctl00$MainContent$DemandadoTextBox"] = ``;
    data["ctl00$MainContent$ActorTextBox"] = ``;
    data["ctl00$MainContent$FuenteFormalTextBox"] = ``;
    data["ctl00$MainContent$NormaDemandadaTextBox"] = ``;
    data["ctl00$MainContent$ResultadoBusqueda1$CorreoTextBox"] = ``;
    data["ctl00$MainContent$ResultadoBusqueda1$OrdenRegistrosDropDownList"] = `FechaProvidencia desc`;
    data["ctl00$MainContent$ResultadoBusqueda1$IrAPaginaTextBox"] = `${argument.page}`;
    data["ctl00$TmpPerfilGestion"] = ``;
    data["__ASYNCPOST"] = `true`;
    let body = querystring.stringify(data);
    let method = "POST";
    let requestOptions = {method, body, headers: _headers};
    let requestURL = 'https://samai.consejodeestado.gov.co/TitulacionRelatoria/BuscadorProvidenciasTituladas.aspx';
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
    await getViewStateFromResponse({responsePage});
    return responsePage;
};




const getMainDocument = async function ({argument, canonicalURL, headers}) {
    let customHeaders = {
                "cache-control": "max-age=0",
                "priority": "u=0, i",
                "sec-ch-ua": "\"Chromium\";v=\"124\", \"Google Chrome\";v=\"124\", \"Not-A.Brand\";v=\"99\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Linux\"",
                "sec-fetch-dest": "document",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "none",
                "sec-fetch-user": "?1",
                "upgrade-insecure-requests": "1"
            };
    let _headers = Object.assign(customHeaders, headers);
    
    let method = "GET";
    let requestOptions = {method, headers: _headers};
    let requestURL = 'https://samai.consejodeestado.gov.co/PaginasTransversales/VerProvidencia.aspx?tokenDocumento=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9,eyJjb3Jwb3JhY2lvbiI6IjE4MDAxMjMiLCJndWlkIjoiMDg3MDkzOUM3ODg2Q0YzMjg5QUIxMTk2NzA1RTAzN0VFQ0Q1RTE0N0ZEOUI0MjZCN0Y3QTRERjFGRkYxM0ExNSIsInRpdHVsYWJsZSI6IjAiLCJ0cmFja2VyIjpudWxsLCJOdW1Qcm9jZXNvIjoiMTgwMDEzMzMzMDA0MjAyNDAwMDAzMDEiLCJ1c3VhcmlvIjoiIiwiTml2ZWxBY2Nlc28iOiIiLCJleHAiOjE3MTQwNzAyNTMuMH0,EX0ABszioKfG2VDrG18_oBvFEwYCoDPx5yTxck9BvWw';
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
    return responsePage;
};

const getEngine = async function ({argument, canonicalURL, headers}) {
        await getHome({canonicalURL, headers});
        await getDocumentType({canonicalURL, headers});
        await searchDate({argument ,canonicalURL, headers});
        let responsePage = await getSearch({argument ,canonicalURL, headers});
        responsePage = await createLinks({argument, responsePage})
        responsePage = await createDocumentLinks({argument, responsePage})
        //let responsePage = await getDocument({canonicalURL, headers});
        return responsePage;

}

const getEnginePagination = async function ({argument ,canonicalURL, headers}) {
    await getHome({canonicalURL, headers});
    await getDocumentType({canonicalURL, headers});
    await searchDate({argument ,canonicalURL, headers});
    await getSearch({argument ,canonicalURL, headers});
    let responsePage = await getPagination({argument ,canonicalURL, headers});
    responsePage = await createDocumentLinks({argument, responsePage})
    return responsePage;

}

    
async function fetchURL({ canonicalURL, headers }) {

    let patt2 = /https:\/\/samai\.consejodeestado\.gov\.co\/TitulacionRelatoria\/BuscadorProvidenciasTituladas\.aspx\?type=caqueta\&from=([0-9]{4}-[0-9]{2}-[0-9]{2})\&to=([0-9]{4}-[0-9]{2}-[0-9]{2})$/;
    let patt3 = /https:\/\/samai\.consejodeestado\.gov\.co\/TitulacionRelatoria\/BuscadorProvidenciasTituladas\.aspx\?type=caqueta\&from=([0-9]{4}-[0-9]{2}-[0-9]{2})\&to=([0-9]{4}-[0-9]{2}-[0-9]{2})\&page=([0-9]+)$/;

    if (patt2.test(canonicalURL.trim())) {
        let match = patt2.exec(canonicalURL.trim());
        let from = moment(match[1], "YYYY-MM-DD");
        let to = moment(match[2], "YYYY-MM-DD");
        let argument = {};
        argument.from = from.format("YYYY-MM-DD");
        argument.to = to.format("YYYY-MM-DD");

        let responsePage = await getEngine({ argument, canonicalURL, headers });
        return [responsePage];
    }
    else if (patt3.test(canonicalURL.trim())) {
        let match = patt3.exec(canonicalURL.trim());
        let from = moment(match[1], "YYYY-MM-DD");
        let to = moment(match[2], "YYYY-MM-DD");
        let page = match[3];
        let argument = {};
        argument.from = from.format("YYYY-MM-DD");
        argument.to = to.format("YYYY-MM-DD");
        argument.page = page;

        let responsePage = await getEnginePagination({ argument, canonicalURL, headers });
        return [responsePage];
    }

