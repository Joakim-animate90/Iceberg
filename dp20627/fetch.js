async function fetchPage({ canonicalURL, requestURL, requestOptions, headers }) {
    if (!requestOptions) requestOptions = { method: "GET", headers };
    if (!canonicalURL) canonicalURL = requestURL;
    if (!requestURL) requestURL = canonicalURL;
    return await fetchWithCookies(requestURL, requestOptions, "zone-g1-country-br")
        .then(response => {
            return {
                canonicalURL,
                request: Object.assign({ URL: requestURL }, requestOptions),
                response
            };
        });
}


const getListing = async function({ canonicalURL, headers }) {
    //const links = [];

    const match = canonicalURL.match(/\?from=(\d{4}-\d{2}-\d{2})\&to=(\d{4}-\d{2}-\d{2})/i);
    const match_page = canonicalURL.match(/\?from=(\d{4}-\d{2}-\d{2})\&to=(\d{4}-\d{2}-\d{2})\&pg=([0-9]+)/i);
    if (match) {
        var from = moment(match[1]).format("DD/MM/YYYY");
        var to = moment(match[2]).format("DD/MM/YYYY");;
    }

    var page = null;
    if (match_page) {
        page = match_page[3]
    }

    let customHeaders = {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "Accept-Language": "es-ES,es;q=0.9,en;q=0.8,und;q=0.7,it;q=0.6,pt;q=0.5,fr;q=0.4",
        "Cache-Control": "max-age=0",
        "Connection": "keep-alive",
        "Referer": "https://www5.tjmg.jus.br/jurisprudencia/formEspelhoAcordao.do",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-origin",
        "Upgrade-Insecure-Requests": '1',
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36"
    };
    let _headers = Object.assign(customHeaders, headers);

    let method = "GET";
    let requestOptions = { method, headers: _headers };
    let requestURL;
    if (page) {
        requestURL = `https://www5.tjmg.jus.br/jurisprudencia/pesquisaPalavrasEspelhoAcordao.do?numeroRegistro=1&totalLinhas=1&palavras=&pesquisarPor=ementa&orderByData=2&codigoOrgaoJulgador=&listaOrgaoJulgador=1-1&codigoCompostoRelator=&classe=&codigoAssunto=&dataPublicacaoInicial=&dataPublicacaoFinal=&dataJulgamentoInicial=${from}&dataJulgamentoFinal=${to}&siglaLegislativa=&referenciaLegislativa=Clique+na+lupa+para+pesquisar+as+refer%EAncias+cadastradas...&numeroRefLegislativa=&anoRefLegislativa=&legislacao=&norma=&descNorma=&complemento_1=&listaPesquisa=&descricaoTextosLegais=&observacoes=&linhasPorPagina=50&pesquisaPalavras=Pesquisar&paginaNumero=${page}`;
        requestURL = requestURL ? url.resolve(canonicalURL, requestURL) : null;
    } else {
        requestURL = `https://www5.tjmg.jus.br/jurisprudencia/pesquisaPalavrasEspelhoAcordao.do?numeroRegistro=1&totalLinhas=1&palavras=&pesquisarPor=ementa&orderByData=2&codigoOrgaoJulgador=&listaOrgaoJulgador=1-1&codigoCompostoRelator=&classe=&codigoAssunto=&dataPublicacaoInicial=&dataPublicacaoFinal=&dataJulgamentoInicial=${from}&dataJulgamentoFinal=${to}&siglaLegislativa=&referenciaLegislativa=Clique+na+lupa+para+pesquisar+as+refer%EAncias+cadastradas...&numeroRefLegislativa=&anoRefLegislativa=&legislacao=&norma=&descNorma=&complemento_1=&listaPesquisa=&descricaoTextosLegais=&observacoes=&linhasPorPagina=50&pesquisaPalavras=Pesquisar`;
        requestURL = requestURL ? url.resolve(canonicalURL, requestURL) : null;
    }
    //let requestURL = canonicalURL;
    let responsePage = await fetchPage({ requestURL, requestOptions });

    if (responsePage.response.status == 401) {
        //throw JSON.stringify(responsePage.response.headers._headers["set-cookie"]);
        let session_id;
        if (responsePage.response.headers._headers["set-cookie"][0].match(/JSESSIONID=([^;]+);/))
            session_id = responsePage.response.headers._headers["set-cookie"][0].match(/JSESSIONID=([^;]+);/)[1];

        let customHeaders = {
            "Accept-Encoding": "gzip, deflate, br",
            "Content-Type": "application/x-www-form-urlencoded",
            "Referer": "https://www5.tjmg.jus.br/jurisprudencia/formEspelhoAcordao.do"
        };
        let _headers = Object.assign(customHeaders, headers);
        let captchaResult = null;
        let tries = 0;
        while (!captchaResult && ++tries <= 3) {
            let x = await getAndSolveCaptcha({ headers });
            captchaResult = x && x.captchaResult;
        }

        if (!captchaResult) throw Error("Couldn't solve captcha");
        await postCaptcha({ captchaResult, session_id, req: requestURL, headers });
    }
    responsePage = await fetchPage({ requestURL, requestOptions });
    const htmlB = await responsePage.response.buffer()
    responsePage.response = new fetch.Response(iconv.decode(htmlB, "utf-8"), responsePage.response)
    responsePage.response.headers.set('content-type', 'text/html')

    return responsePage;
};


const getAndSolveCaptcha = async function({ headers }) {
    let customHeaders = {
        "Referer": "https://www5.tjmg.jus.br/jurisprudencia/formEspelhoAcordao.do"
    };
    let _headers = Object.assign(customHeaders, headers);
    console.log("solving captcha");
    let method = "GET";
    let requestOptions = { method, headers: _headers };
    let requestURL = 'https://www5.tjmg.jus.br/jurisprudencia/captcha.svl?' + (Math.random() * 5);
    let captchaPage = await fetchPage({ canonicalURL: "https://www5.tjmg.jus.br/jurisprudencia/captcha.svl", requestURL, requestOptions });
    captchaPage.response.headers.set('content-type', "image/jpeg");
    //return captchaPage;
    let imageBuffer = await captchaPage.response.buffer();
    //captchaPage.response = new fetch.Response(imageBuffer, captchaPage.response);
    let captchaResult = await resolveCaptcha(imageBuffer, "image/jpeg");
    //throw('captcha result:', captchaResult);
    //throw(captchaResult+" "+captchaPage)
    if (!captchaResult) console.log("Captcha not solved successfully: " + captchaResult);
    return { captchaResult };
};

async function postCaptcha({ captchaResult, session_id, req, headers }) {
    let customHeaders = {
        "Content-Type": "text/plain",
        "Origin": "https://www5.tjmg.jus.br",
        "Referer": req,
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin"
    };
    let param_npage = req.replace('https://www5.tjmg.jus.br', '');
    const data = {};
    data["callCount"] = '1';
    data["npage"] = param_npage;
    data["c0-scriptName"] = 'ValidacaoCaptchaAction';
    data["c0-methodName"] = 'isCaptchaValid';
    data["c0-id"] = '0';
    data["c0-param0"] = `string:${captchaResult}`;
    data["batchId"] = '2';
    let body = querystring.stringify(data);
    let _headers = Object.assign(customHeaders, headers);
    let method = "POST";
    let requestOptions = { method, body, headers: _headers };
    let requestURL = 'https://www5.tjmg.jus.br/jurisprudencia/dwr/call/plaincall/ValidacaoCaptchaAction.isCaptchaValid.dwr';
    let responsePage = await fetchPage({ requestURL, requestOptions });
}

const getEachPage = async function({ canonicalURL, headers }) {
    let customHeaders = {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "Accept-Language": "es-ES,es;q=0.9,en;q=0.8,und;q=0.7,it;q=0.6,pt;q=0.5,fr;q=0.4",
        "Cache-Control": "max-age=0",
        "Connection": "keep-alive",
        "Referer": "https://www5.tjmg.jus.br/jurisprudencia/formEspelhoAcordao.do",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-origin",
        "Upgrade-Insecure-Requests": '1',
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36"
    };
    let _headers = Object.assign(customHeaders, headers);

    let method = "GET";
    let requestOptions = { method, headers: _headers };
    //let requestURL = canonicalURL;
    let responsePage = await fetchPage({ canonicalURL, requestOptions });

    if (responsePage.response.status == 401) {
        //throw JSON.stringify(responsePage.response.headers._headers["set-cookie"]);
        let session_id;
        if (responsePage.response.headers._headers["set-cookie"][0].match(/JSESSIONID=([^;]+);/))
            session_id = responsePage.response.headers._headers["set-cookie"][0].match(/JSESSIONID=([^;]+);/)[1];

        let customHeaders = {
            "Accept-Encoding": "gzip, deflate, br",
            "Content-Type": "application/x-www-form-urlencoded",
            "Referer": "https://www5.tjmg.jus.br/jurisprudencia/formEspelhoAcordao.do"
        };
        let _headers = Object.assign(customHeaders, headers);
        let captchaResult = null;
        let tries = 0;
        while (!captchaResult && ++tries <= 3) {
            let x = await getAndSolveCaptcha({ headers });
            captchaResult = x && x.captchaResult;
        }

        if (!captchaResult) throw Error("Couldn't solve captcha");
        await postCaptcha({ captchaResult, session_id, req: canonicalURL, headers });
    }
    responsePage = await fetchPage({ canonicalURL, requestOptions });
    const htmlB = await responsePage.response.buffer()
    responsePage.response = new fetch.Response(iconv.decode(htmlB, "utf-8"), responsePage.response)
    responsePage.response.headers.set('content-type', 'text/html')
    return responsePage;
}

async function fetchURL({ canonicalURL, headers }) {
    var responses = [];
    if (/https:\/\/www5\.tjmg\.jus\.br\/jurisprudencia\/formEspelhoAcordao\.do\?from=[0-9]+-[0-9]+-[0-9]+/.test(canonicalURL)) {
        let response = await getListing({ canonicalURL, headers });
        if (response) {
            responses.push(response);
        }

    } else if (/Pesquisar&$/.test(canonicalURL)) {
        return [await getEachPage({ canonicalURL, headers })]
    } else {
        return defaultFetchURL({ canonicalURL, headers })
    }
    return responses
}