async function fetchPage({ canonicalURL, requestURL, requestOptions, headers }) {
    if (!requestOptions) requestOptions = { method: "GET", headers };
    if (!canonicalURL) canonicalURL = requestURL;
    if (!requestURL) requestURL = canonicalURL;

    return await fetchWithCookies(requestURL, requestOptions, "zone-g1-country-mx")
        .then(response => {
            return {
                canonicalURL,
                request: Object.assign({ URL: requestURL }, requestOptions),
                response
            };
        });
}

const regexObj = {
    COMUNICACIONES_OFICIALES: /COMUNICACIONES OFICIALES/gi,
    SOLICITUDES_DE_LICENCIA: /SOLICITUDES DE LICENCIA/gi,
    INICIATIVAS: /INICIATIVAS/gi,
    Dictámenes_a_discusión: /Dictámenes a discusión/gi,
    Proposiciones: /Proposiciones/gi,
    Reincorporaciones_de_ciudadanos_legialadores: /Reincorporaciones de ciudadanos legialadores/gi,
    Convocatorias: /Convocatorias/gi,
    Minutas: /Minutas/gi,
    Iniciativas_de_ley_o_decreto_de_senadores: /Iniciativas de ley o decreto de senadores/gi,
    Efemérides: /Efeméride(s)?/gi,
    Proposiciones_de_urgente_u_obvia_resolución: /Proposiciones de urgente u obvia resolución/gi,
    Dictámenes_negativos_de_proposiciones: /Dictámenes negativos de proposiciones/gi,
    Declaratoria_de_publicidad_de_dictámenes: /Declaratoria de publicidad de dictámenes/gi,
    Acuerdos: /Acuerdos/gi,
    Declaratoria_de_entrada_en_vigor_del_Código_Nacional_de_Procedimeintos_Penales: /Declaratoria de entrada en vigor del Código Nacional de Procedimeintos Penales/gi,
    Iniciativas_de_las_legislaturas_locales: /Iniciativas de las legislaturas locales/gi,
};


const home = async function ({ argument, canonicalURL, headers }) {
    let responses2 = [];
    let customHeaders = {
        "Cache-Control": "no-cache",
        "DNT": "1",
        "Pragma": "no-cache",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "cross-site",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        "sec-ch-ua": "\"Not_A Brand\";v=\"99\", \"Google Chrome\";v=\"109\", \"Chromium\";v=\"109\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    let requestOptions = { method, headers: _headers };
    // const requestURL = 'https://www.camsantiago.cl/sentencias-arbitrales/indice-por-arbitros/'
    let responsePage = await fetchPage({ canonicalURL, requestOptions });


    let html = await responsePage.response.text();
    let mother = html

    let $ = cheerio.load(mother);
    mother = simpleResponse({
        canonicalURL,
        mimeType: "text/html",
        responseBody: $.html(),
    })

    //return [mother]



    console.log(html)

    let response = await wrapInDivTag(html, canonicalURL);


    responsePage = simpleResponse({
        canonicalURL,
        mimeType: "text/html",
        responseBody: response[0],
    })

    responses2.push(responsePage)

    responsePage = await createDocument(response, canonicalURL);
   
    

    //responsePage.push(responsePage1)
    return responsePage;
};
const homeAnexo = async function ({ argument, canonicalURL, headers }) {
    let responses2 = [];
    let customHeaders = {
        "Cache-Control": "no-cache",
        "DNT": "1",
        "Pragma": "no-cache",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "cross-site",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        "sec-ch-ua": "\"Not_A Brand\";v=\"99\", \"Google Chrome\";v=\"109\", \"Chromium\";v=\"109\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    let requestOptions = { method, headers: _headers };
    // split canonicalURL ?
    let canonicalURLSplit = canonicalURL.split('?');
    let requestURL = canonicalURLSplit[0];

    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });
    // check the content type
    let contentType = responsePage.response.headers.get("content-type");
    // if content type is not html, return the response
    if (!contentType || !contentType.includes("text/html")) {
        return responsePage;
    }
    // get viewstate
    let html = await responsePage.response.text();

    console.log(html)

    let response = await wrapInDivTag(html, canonicalURL);


    responsePage = simpleResponse({
        canonicalURL,
        mimeType: "text/html",
        responseBody: response[0],
    })
    //return responsePage



    let responsePage2 = await createDocument(response, canonicalURL);
    responsePage2.push(responsePage)
    if (response[1]) {
    responsePage2.push(response[1])
    }


    return responsePage2



};
const wrapInDivTag = async function (html, canonicalURL) {
    let responses = []
    let $ = cheerio.load(html);
    //extract metadata from id NGaceta

    let NGaceta = $('#NGaceta');
    if (!NGaceta.length) {
        //get from center
        NGaceta = $('center');
    }


    let NGacetaText = NGaceta.text();
    if (!NGacetaText) {
        NGaceta = $('#Titulo');
        NGacetaText = NGaceta.text();

    }
    let NGacetaTextSplit = NGacetaText.split(',');
    let ano = NGacetaTextSplit[1]
    let numero = NGacetaTextSplit[2]
    let publishedDate = NGacetaTextSplit[3]

    setSharedVariable('ano', ano);
    setSharedVariable('numero', numero);
    setSharedVariable('publishedDate', publishedDate);

    let versales = $('#Contenido').find('.Versales');
    if (!versales.length) {
        versales = $('#BrincoG').find('.Seccion');
    }



    versales.each(function () {
        let $versale = $(this);
        $versale.attr('style', 'color: #9D0000; font-size: 12pt; font-variant: small-caps;');
    });

    let seccion = $('#Contenido').find('.Seccion');
    if (!seccion.length) {
        seccion = $('#BrincoG').find('.Seccion');
    }

    seccion.each(function () {
        let $seccion = $(this);
        $seccion.attr('style', 'COLOR: #9D0000; font-size: 16pt; text-align: center;');
    });
    let titulito = $('.Titulito');
    if (titulito.length) {
        titulito.each(function () {
            let $titulito = $(this);
            let titulitoText = $titulito.text();

            // loop through the keys in the regexObj
            for (let key in regexObj) {
                let regex = regexObj[key];

                if (regex.test(titulitoText)) {
                    createSession($titulito, $);
                    break; // exit the loop if a match is found
                }
            }
        });
    }
    if (!seccion.length) {
        seccion = $('.Seccion');
    }



    for (let i = 0; i < seccion.length; i++) {
        let currentSection = $(seccion[i]);
        let uniqueId = `center-kim`;
        let $wrapper = $(`<div id="${uniqueId}"></div>`);
        let $nextSiblings = currentSection.nextUntil('.Seccion');

        currentSection.wrap($wrapper);
        currentSection.after($nextSiblings);
    }


    // Get the updated HTML
    html = $.html();

    // Load the HTML using cheerio
    let $$ = cheerio.load(html);
    let centerKimDivs = $$('div[id^="center-kim"]');

    for (let i = 0; i < centerKimDivs.length; i++) {
        let $this = $$(centerKimDivs[i]);
        // Select all .Versales elements within the current div with id="center-kim"
        let $versales = $this.find('.Versales');

        // Loop through each .Versales element

        for (let j = 0; j < $versales.length; j++) {
            let currentSection = $$($versales[j]);
            let uniqueId = `joe`;
            let $wrapper = $(`<div id="${uniqueId}"></div>`);

            let $nextSiblings = currentSection.nextUntil('.Versales');
            currentSection.wrap($wrapper);
            currentSection.after($nextSiblings);

        }
    }
    // on the div id joe get every img and get the src attribute
    let joes = $$('div[id^="joe"]');
    for (let i = 0; i < joes.length; i++) {
        let $this = $$(joes[i]);
        //get all imgs
        let imgs = $this.find('img');
        imgs.each(async function () {
            let src = $(this).attr('src');
            src = src ? url.resolve(canonicalURL, src) : null;
            
            if (src) {
                //assign the src to the href attribute
                $(this).attr('src', src);
             
            }
        });
    }
    



    // Get the final HTML
    html = $$.html();

    return html;



}
const createSession = function ($titulito, $) {
    $titulito.attr('style', 'COLOR: #9D0000; font-size: 16pt; text-align: center;');
    //wrap in div .Seccion class 
    let $wrapper = $(`<div class="Seccion"></div>`);
    $titulito.wrap($wrapper);
}






const createDocument = async function (html, canonicalURL) {
    let responses = []
    let $ = cheerio.load(html, { decodeEntities: false });
    const originalHtml = $.html();
    const centers = $('#center-kim');

    for (let i = 0; i < centers.length; i++) {
        const clonedHtml = $.load(originalHtml, { decodeEntities: false });
        const center = clonedHtml(centers[i]);
        const prevSiblings = center.parent().prevAll();
        const nextSiblings = center.parent().nextAll();
        prevSiblings.remove();
        nextSiblings.remove();
        clonedHtml('body').html(center.parent());
        const processedHtml = $('<div></div>').append(center.clone()).html();
        const originalprocessedHtml = $('<div></div>').append(center.clone()).html();
        const $$ = cheerio.load(processedHtml, { decodeEntities: false });


        const titleHeading = $$(processedHtml).find('.Seccion')
        const titleHeadingText = titleHeading.text();
        let href = null;
        if (canonicalURL.includes('?')) {
            href = `${canonicalURL}&title=${titleHeadingText}&ano=${getSharedVariable('ano')}&numero=${getSharedVariable('numero')}&publishedDate=${getSharedVariable('publishedDate')}`;
        } else {
            href = `${canonicalURL}?title=${titleHeadingText}&ano=${getSharedVariable('ano')}&numero=${getSharedVariable('numero')}&publishedDate=${getSharedVariable('publishedDate')}`;
        }

        href = href.trim()
        href = href.replace(/\s/g, '_');
        href = href ? url.resolve(canonicalURL, href) : null;
        // replace spaces with _
        href = href.replace(/\s/g, '_');
        responses.push(simpleResponse({
            canonicalURL: href,
            mimeType: "text/html",
            responseBody: processedHtml,
        }));

        // get the id

        const joes = $$(processedHtml).find('#joe')

        for (let j = 0; j < joes.length; j++) {
            const clonedHtml = $$.load(originalprocessedHtml, { decodeEntities: false });
            // throw (clonedHtml)

            const joe = clonedHtml(joes[j]);
            const prevSiblings = joe.parent().prevAll();
            const nextSiblings = joe.parent().nextAll();
            prevSiblings.remove();
            nextSiblings.remove();
            $$('body').html(joe.parent());
            const processedHtml = $('<div></div>').append(joe.clone()).html();

            const titleHeadingChild = $$(processedHtml).find('.Versales')

            const titleHeadingTextChild = titleHeadingChild.text();
            if (!titleHeadingTextChild) {
                //get from Titulito
                titleHeadingChild = $$(processedHtml).find('.Titulito')
                titleHeadingTextChild = titleHeadingChild.text();
            }
            // if canonicalurl contains ? then add & 
            let href = null


            if (canonicalURL.includes('?')) {
                href = `${canonicalURL}&title=${titleHeadingText}&ano=${getSharedVariable('ano')}&numero=${getSharedVariable('numero')}&publishedDate=${getSharedVariable('publishedDate')}&childTitle=${titleHeadingTextChild}`;
            } else {
                href = `${canonicalURL}?title=${titleHeadingText}&ano=${getSharedVariable('ano')}&numero=${getSharedVariable('numero')}&publishedDate=${getSharedVariable('publishedDate')}&childTitle=${titleHeadingTextChild}`;
            }



            href = href.trim()
            href = href.replace(/\s/g, '_');
            href = href ? url.resolve(canonicalURL, href) : null;
            // replace spaces with _
            href = href.replace(/\s/g, '_');
            responses.push(simpleResponse({
                canonicalURL: href,
                mimeType: "text/html",
                responseBody: processedHtml,
            }));


        }





    }
    return responses

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



async function fetchURL({ canonicalURL, headers }) {
    // https://www.csj.gov.py/ResolucionesWeb/Formularios/inicio.aspx?from=01-01-1900&to=20-04-2023&page=1

    // test this url http://gaceta.diputados.gob.mx/Gaceta/65/2023/abr/index.html
    if (/http:\/\/gaceta\.diputados\.gob\.mx\/Gaceta\/.+\d+.html/i.test(canonicalURL)) {

        return await home({ canonicalURL, headers })
    }
    // index.html
    else if (/index\.html$/i.test(canonicalURL)) {
        //throw('here')
        return [await fetchPage({ canonicalURL, headers })];
    } else if (/http:\/\/gaceta\.diputados\.gob\.mx\/Gaceta\/.+anexo/i.test(canonicalURL)) {
        // check if it has a .pdf somewhere in the url
        if (/\.html/i.test(canonicalURL)) {
            return await homeAnexo({ canonicalURL, headers })

        } else if (/\.docx/i.test(canonicalURL)) {
            return [await binaryDownload({ canonicalURL, headers })];
        } else if (/\.doc/i.test(canonicalURL)) {
            return [await binaryDownload({ canonicalURL, headers })];
        } else if (/\.pdf/i.test(canonicalURL)) {

            return [await binaryDownload({ canonicalURL, headers })];
        } else {
            return await homeAnexo({ canonicalURL, headers });
        }


    } else {

        return [await fetchPage({ canonicalURL, headers })];
    }


}