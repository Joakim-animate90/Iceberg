async function fetchPage({ canonicalURL, requestURL, requestOptions, headers }) {
    if (!requestOptions) requestOptions = { method: "GET", headers };
    if (!canonicalURL) canonicalURL = requestURL;
    if (!requestURL) requestURL = canonicalURL;
    return await fetchWithCookies(requestURL, requestOptions, "zone-2captcha-country-br").then((response) => {
      return {
        canonicalURL,
        request: Object.assign({ URL: requestURL }, requestOptions),
        response,
      };
    });
  }
  
  function sleep(ms){
    return new Promise(resolve=>{
      setTimeout(resolve,ms)
    })
  }
  
  async function resolveCaptcha(URL) {
     console.log("resolveCaptcha for", URL);
     const AP = "10122c7066706ebba801995c2e99fbe2";
     const GOOGLE_KEY = '6Ld7VI4aAAAAAFv5gK5ePhA9j1sXMdAjV3_WX4Gg'; // this key varies by each crawled site and has to be obtained by inspecting the code
     const requestOptions = {method: "GET"};
    
     const initialCaptchaURL = `http://2captcha.com/in.php?key=${AP}&method=userrecaptcha&googlekey=${GOOGLE_KEY}&proxy=lum-customer-vlex-zone-2captcha-country-br:dcohwmkemk0n@zproxy.lum-superproxy.io.22225&pageurl=${URL}&json=1`;   
     const responseData = await fetchWithCookies(initialCaptchaURL, requestOptions).then(resp => resp.json());
     console.log("2Captcha Initial Response=", responseData);
     const requestId = responseData.request;
     const updateDataURL = `http://2captcha.com/res.php?key=${AP}&action=get&id=${requestId}`;
     await sleep(15*1000);
    
     var updateData = await fetchWithCookies(updateDataURL, requestOptions).then(resp => resp.text());
     while (updateData == "CAPCHA_NOT_READY") {
       console.log("Captcha not ready: waiting for 5sec");
       await sleep(5*1000);
       updateData = await fetchWithCookies(updateDataURL, requestOptions).then(resp => resp.text());     
     }
     
     console.log("RECAPTCHA_VALUE=", updateData);
     if(updateData.indexOf('OK|') !== -1) {
       return updateData.replace(/^OK\|/, "");
     } else {
          throw new Error('Captcha Failed');
     }
  }
  
  const handlePageLinks = async function({canonicalURL, responsePage }) { 
    const html = await responsePage.response.buffer();
    const $ = cheerio.load(html);
  
    const paginationElements = $(".trocaDePagina").first();
    paginationElements.children().each((_, childEl) => {
      let childElText = $(childEl).text().trim();
      let tag = $(childEl)[0].name;
  
      let isATag = tag === "a";
      let isHrefUndefined = $(childEl).attr("href") === undefined;
      let isNumber = /[0-9]+/.test(childElText);
  
      if (isATag && isHrefUndefined && isNumber) {
        $(childEl).attr(
          "href",
          canonicalURL.replace(/page=[0-9]/, `page=${childElText}`)
        );
      }
    });
  
    // Set-up the pdf links
    const { from, to } = url.parse(canonicalURL, true).query;
    $(".fundocinza1").each((_, row) => {
      let docketLinks = $(row).find(".ementaClass a.downloadEmenta").first();
      let cdAcordaoNumber = docketLinks.attr("cdacordao");
      docketLinks.attr(
        "href",
        `https://esaj.tjce.jus.br/cjsg/getArquivo.do?cdAcordao=${cdAcordaoNumber}&cdForo=0&pdf=true`
      );
    });
    responsePage.response = new fetch.Response($.html(), responsePage.response);
      
    return responsePage;
  }
  
  const getFirstPage = async function ({ argument, canonicalURL, headers }) {
    const {from, to, type} = url.parse(canonicalURL, true).query;
    
    let customHeaders = {
      "Cache-Control": "no-cache",
      "Content-Type": "application/x-www-form-urlencoded",
      Origin: "https://esaj.tjce.jus.br",
      Pragma: "no-cache",
      Referer: "https://esaj.tjce.jus.br/cjsg/resultadoCompleta.do",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "same-origin",
      "Sec-Fetch-User": "?1",
      "Upgrade-Insecure-Requests": "1",
      "sec-ch-ua": '"Chromium";v="104", " Not A;Brand";v="99", "Google Chrome";v="104"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"macOS"',
      "Accept-Encoding": "gzip, deflate, br",
    };
    let _headers = Object.assign(customHeaders, headers);
    const data = {};
    data["conversationId"] = ``;
    data["dados.buscaInteiroTeor"] = ``;
    data["dados.pesquisarComSinonimos"] = `S,S`;
    data["dados.buscaEmenta"] = ``;
    data["dados.nuProcOrigem"] = ``;
    data["agenteSelectedEntitiesList"] = ``;
    data["contadoragente"] = `0`;
    data["contadorMaioragente"] = `0`;
    data["codigoCr"] = ``;
    data["codigoTr"] = ``;
    data["nmAgente"] = ``;
    data["juizProlatorSelectedEntitiesList"] = ``;
    data["contadorjuizProlator"] = `0`;
    data["contadorMaiorjuizProlator"] = `0`;
    data["codigoJuizCr"] = ``;
    data["codigoJuizTr"] = ``;
    data["nmJuiz"] = ``;
    data["classesTreeSelection.values"] = ``;
    data["classesTreeSelection.text"] = ``;
    data["assuntosTreeSelection.values"] = ``;
    data["assuntosTreeSelection.text"] = ``;
    data["secoesTreeSelection.values"] = ``;
    data["secoesTreeSelection.text"] = ``;
    data["dados.dtJulgamentoInicio"] = `${from}`;
    data["dados.dtJulgamentoFim"] = `${to}`;
    data["dados.dtPublicacaoInicio"] = ``;
    data["dados.dtPublicacaoFim"] = ``;
    data["dados.origensSelecionadas"] = `T`;
    data["tipoDecisaoSelecionados"] = type === "acordao" ? "A" : "D";
    data["dados.ordenarPor"] = `dtPublicacao`;
    let body = querystring.stringify(data);
    let method = "POST";
    let requestOptions = { method, body, headers: _headers };
    let requestURL = "https://esaj.tjce.jus.br/cjsg/resultadoCompleta.do";
    let responsePage = await fetchPage({
      canonicalURL,
      requestURL,
      requestOptions,
    });
    
    responsePage = await handlePageLinks({canonicalURL, responsePage });
    
    return responsePage;
  };
  
  const getPage = async function ({ argument, canonicalURL, headers }) {
    const { page } = url.parse(canonicalURL, true).query;
    //Fetch the first page
    await getFirstPage({ canonicalURL, headers });
    
    let customHeaders = {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      Referer: "https://esaj.tjce.jus.br/cjsg/resultadoCompleta.do",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-origin",
      "X-Requested-With": "XMLHttpRequest",
      "sec-ch-ua": '"Chromium";v="104", " Not A;Brand";v="99", "Google Chrome";v="104"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"macOS"',
      "Accept-Encoding": "gzip, deflate, br",
    };
    let _headers = Object.assign(customHeaders, headers);
  
    let method = "GET";
    let requestOptions = { method, headers: _headers };
    let requestURL = `https://esaj.tjce.jus.br/cjsg/trocaDePagina.do?tipoDeDecisao=A&pagina=${page}&conversationId=`;
    let responsePage = await fetchPage({
      canonicalURL,
      requestURL,
      requestOptions,
    });
    
    responsePage = await handlePageLinks({canonicalURL, responsePage });
    
    return responsePage;
  };
  
  const retrieveUuidCaptcha = async function({ cdAcordao, headers }){
    let customHeaders = {
      "Cache-Control": "no-cache",
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      Origin: "https://esaj.tjce.jus.br",
      Pragma: "no-cache",
      Referer: `https://esaj.tjce.jus.br/cjsg/getArquivo.do?cdAcordao=${cdAcordao}&cdForo=0`,
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-origin",
      "X-Requested-With": "XMLHttpRequest",
      "sec-ch-ua": '"Chromium";v="104", " Not A;Brand";v="99", "Google Chrome";v="104"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"macOS"',
      "Accept-Encoding": "gzip, deflate, br",
    };
    let _headers = Object.assign(customHeaders, headers);
    const data = {};
    data["uuidCaptcha"] = ``;
    data["conversationId"] = ``;
    let body = querystring.stringify(data);
    let method = "POST";
    let requestOptions = { method, body, headers: _headers };
    let requestURL = "https://esaj.tjce.jus.br/cjsg/captchaControleAcesso.do";
    let responsePage = await fetchPage({
      requestURL,
      requestOptions,
    });
  
    let html = await responsePage.response.buffer();
    let $ = cheerio.load(html);
  
    const uuidString = $("body").text();
    
    return uuidString.match(/sajcaptcha_.+(?=")/)[0];
  }
  
  const fetchResolvedCaptureResponse = async function({ argument, canonicalURL, headers }) {
    const { cdAcordao, uuidCaptcha, resolvedCaptureString } = argument;
    
    let customHeaders = {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      Referer: `https://esaj.tjce.jus.br/cjsg/getArquivo.do?cdAcordao=${cdAcordao}&cdForo=0`,
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "same-origin",
      "Sec-Fetch-User": "?1",
      "Upgrade-Insecure-Requests": "1",
      "sec-ch-ua": '"Chromium";v="104", " Not A;Brand";v="99", "Google Chrome";v="104"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"macOS"',
      "Accept-Encoding": "gzip, deflate, br",
    };
    let _headers = Object.assign(customHeaders, headers);
  
    let method = "GET";
    let requestOptions = { method, headers: _headers };
    let requestURL = `https://esaj.tjce.jus.br/cjsg/getArquivo.do?conversationId=&cdAcordao=${cdAcordao}&cdForo=0&uuidCaptcha=${uuidCaptcha}&g-recaptcha-response=${resolvedCaptureString}`;
    let responsePage = await fetchPage({
      canonicalURL,
      requestURL,
      requestOptions,
    });
    return responsePage;
  }
  
  const downloadPdf = async function ({ canonicalURL, requestURL, headers }) {
    let customHeaders = {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
      "Upgrade-Insecure-Requests": "1",
      "sec-ch-ua": '"Chromium";v="104", " Not A;Brand";v="99", "Google Chrome";v="104"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"macOS"',
      "Accept-Encoding": "gzip, deflate, br",
    };
    let _headers = Object.assign(customHeaders, headers);
  
    let method = "GET";
    let requestOptions = { method, headers: _headers };
    let responsePage = await fetchPage({
      canonicalURL,
      requestURL,
      requestOptions,
    });
    
    let type = responsePage.response.headers.get("content-type");
    
    if(/text\/html/i.test(type)){
      const { cdAcordao } = url.parse(canonicalURL, true).query;
      const uuidCaptcha = await retrieveUuidCaptcha({ cdAcordao, headers });
      
        const resolvedCaptureString = await resolveCaptcha( requestURL );
      const argument = { cdAcordao, uuidCaptcha, resolvedCaptureString };
      
      responsePage = await fetchResolvedCaptureResponse({ argument, canonicalURL, headers });
    } else if(responsePage.response.ok && !/pdf/i.test(type)) {
        responsePage.response.ok = false;
      responsePage.response.statusText = `either not pdf, or request did not succeed: ${responsePage.response.status} && ${type}\n`.toUpperCase();
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
    
    if (/https.+from=.+&to=.+\&type=.+\&page=.+/.test(canonicalURL)) {
      const { page } = url.parse(canonicalURL, true).query;
      if (page * 1 === 1) {
        return [await getFirstPage({ canonicalURL, headers })];
      } else {
        return [await getPage({ canonicalURL, headers })]
      }
    } else if(/https.+pdf=true/.test(canonicalURL)) {
        const requestURL = canonicalURL.replace(/\&pdf=true/,"");
        return [await downloadPdf ({ canonicalURL, requestURL, headers })];
    } else {
      return defaultFetchURL({ canonicalURL, headers });
    }
  }