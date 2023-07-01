async function fetchPage({
  canonicalURL,
  requestURL,
  requestOptions,
  headers,
}) {
  if (!requestOptions) requestOptions = { method: "GET", headers };
  if (!canonicalURL) canonicalURL = requestURL;
  if (!requestURL) requestURL = canonicalURL;
  if (requestURL.match(/^https/i)) {
    requestOptions.agent = new https.Agent({
      rejectUnauthorized: false,
      keepAlive: true,
    });
  }
  return await fetchWithCookies(
    requestURL,
    requestOptions,
    "zone-2captcha-country-br"
  ).then((response) => {
    return {
      canonicalURL,
      request: Object.assign({ URL: requestURL }, requestOptions),
      response,
    };
  });
}
const randomDelay = Math.floor(Math.random() * 3) + 3; // Random delay between 3 and 5 seconds
const getVerificarLogin = async function ({ argument, canonicalURL, responsePage }) {
  let html = await responsePage.response.buffer();
  responsePage.response = new fetch.Response(html, responsePage.response);

  const $ = cheerio.load(html);
  //on the head get the third script and get the src
  let src = $('head').find('script').eq(2).attr('src');
  throw(src.text())
  let customHeaders = {
    "Cache-Control": "no-cache",
    DNT: "1",
    Pragma: "no-cache",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "cross-site",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
    "sec-ch-ua":
      '"Not_A Brand";v="99", "Google Chrome";v="109", "Chromium";v="109"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Linux"',
    "Accept-Encoding": "gzip, deflate, br",
  };
  let _headers = Object.assign(customHeaders, headers);
  let method = "GET";
  let requestOptions = { method, headers: _headers };
  let requestURL = src;
  let responsePage = await fetchPage({
    canonicalURL,
    requestURL,
    requestOptions,
  });
  return responsePage;
}


const home = async function ({ argument, canonicalURL, headers }) {
  //let captcha = await resolveCaptcha({});
 // if (captcha) setSharedVariable("captcha", captcha);
  //throw(captcha)
  //await resolveCaptcha()
  let customHeaders = {
    "Cache-Control": "no-cache",
    DNT: "1",
    Pragma: "no-cache",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "cross-site",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
    "sec-ch-ua":
      '"Not_A Brand";v="99", "Google Chrome";v="109", "Chromium";v="109"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Linux"',
    "Accept-Encoding": "gzip, deflate, br",
  };
  let _headers = Object.assign(customHeaders, headers);
  let method = "GET";
  let requestOptions = { method, headers: _headers };
  let requestURL = "https://esaj.tjms.jus.br/cjsg/consultaCompleta.do";
  let responsePage = await fetchPage({
    canonicalURL,
    requestURL,
    requestOptions,
  });
  await getVerificarLogin({ canonicalURL, responsePage });
  await getuuidCaptcha({ canonicalURL, headers });

  //throw(responsePage)
  captcha = await resolveCaptcha({});
  if (captcha) setSharedVariable("captcha", captcha);
  //throw(captcha)
  return responsePage;
};
const sleepForSeconds = function (seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}


const getuuidCaptcha = async function ({ argument, canonicalURL, headers }) {
  let customHeaders = {
    "Cache-Control": "no-cache",
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    DNT: "1",
    Origin: "https://esaj.tjms.jus.br",
    Pragma: "no-cache",
    Referer: "https://esaj.tjms.jus.br/cjsg/consultaCompleta.do",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin",
    "X-Requested-With": "XMLHttpRequest",
    "sec-ch-ua":
      '"Not_A Brand";v="99", "Google Chrome";v="109", "Chromium";v="109"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "Accept-Encoding": "gzip, deflate, br",
  };
  let _headers = Object.assign(customHeaders, headers);
  const data = {};
  data["uuidCaptcha"] = ``;
  data["conversationId"] = ``;
  let body = querystring.stringify(data);
  let method = "POST";
  let requestOptions = { method, body, headers: _headers };
  let requestURL = "https://esaj.tjms.jus.br/cjsg/captchaControleAcesso.do";
  let responsePage = await fetchPage({
    canonicalURL,
    requestURL,
    requestOptions,
  });
  let json = await responsePage.response.json();
  let uuidCaptcha = json.uuidCaptcha;
  //throw(uuidCaptcha)
  if (uuidCaptcha) setSharedVariable("uuidCaptcha", uuidCaptcha);
  return uuidCaptcha;
};


function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}


const resolveCaptcha = async function ({
  siteURL = "https://esaj.tjms.jus.br/cjsg/resultadoCompleta.do",
}) {
  const config = {
    headers: {}, //any custom headers
    apiKey: "10122c7066706ebba801995c2e99fbe2", //2captcha subscription key
    siteKey: "6Ld7VI4aAAAAAFv5gK5ePhA9j1sXMdAjV3_WX4Gg", //k or data-sitekey
    invisible: true, //is it invisible recaptcha?
    proxy: `lum-customer-vlex-zone-2captcha-country-br:dcohwmkemk0n@zproxy.lum-superproxy.io.22225`, //match or remove country if necessary
  };
  let customHeaders = {
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode6Ld7VI4aAAAAAFv5gK5ePhA9j1sXMdAjV3_WX4Gg": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    Pragma: "no-cache",
    "Cache-Control": "no-cache",
    "Accept-Encoding": "gzip, deflate, br",
  };
  let _headers = Object.assign(customHeaders, config.headers);

  let method = "GET";
  let requestOptions = { method, headers: _headers };
  let requestURL = `https://2captcha.com/in.php?key=${
    config.apiKey
  }&method=userrecaptcha&googlekey=${config.siteKey}&proxy=${
    config.proxy
  }&pageurl=${siteURL}${config.invisible ? "&invisible=1" : ""}&json=1`;
  let responsePage = await fetchPage({ requestURL, requestOptions });
  let j =
    (responsePage.response && (await responsePage.response.text())) || null;
  // throw(j)
  let json = j && JSON.parse(j);
  if (!json || json.status !== 1 || !json.request) {
    console.error(`Error resolving recaptcha: ${j}`);
    return null;
  }
  //wait for resolution
  requestURL = `https://2captcha.com/res.php?key=${config.apiKey}&action=get&id=${json.request}&json=1`;
  let gResponse = null;
  let waitLoops = 0;
  do {
    waitLoops++;
    responsePage = await fetchPage({ requestURL, requestOptions });
    j = responsePage.response && (await responsePage.response.text());
    console.log(j);
    if (!j || /CAPCHA_NOT_READY/i.test(j)) {
      await sleepForSeconds(10);
      continue;
    }
    try {
      json = j && JSON.parse(j);
    } catch (e) {
      //json error
      console.error(`Error parsing JSON`, e);
      continue;
    }
    //if (json.status !== 1 || !json.request) throw `Error resolving recaptcha: ${j}`;
    gResponse = (json && json.request) || gResponse;
  } while (!gResponse && waitLoops < 10);
  if (!gResponse) {
    console.error(
      `Error resolving recaptcha, captcha not resolved after total wait duration: ${j}`
    );
    return null;
  }

  setSharedVariable("recaptcha", gResponse);
  setSharedVariable("recaptcha-time", new Date().getTime());
  return gResponse;
};

const searchByDate = async function ({ argument, canonicalURL, headers }) {
  await home({ canonicalURL, headers });

  let captcha = await resolveCaptcha({});
  if (captcha) setSharedVariable("captcha", captcha);
 


  const { from, to, type } = url.parse(canonicalURL, true).query;
  //return [from, to]

  captcha = getSharedVariable("captcha");
  let uuidCaptcha = getSharedVariable("uuidCaptcha");
  let customHeaders = {
    "Cache-Control": "no-cache",
    "Content-Type": "application/x-www-form-urlencoded",
    Origin: "https://esaj.tjms.jus.br",
    Pragma: "no-cache",
    Referer: "https://esaj.tjms.jus.br/cjsg/consultaCompleta.do",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "same-origin",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
    "sec-ch-ua":
      '"Chromium";v="112", "Google Chrome";v="112", "Not:A-Brand";v="99"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Linux"',
    "Accept-Encoding": "gzip, deflate, br",
  };
  let _headers = Object.assign(customHeaders, headers);
  const data = {};
  data["conversationId"] = ``;
  data["dados.buscaInteiroTeor"] = ``;
  data["dados.pesquisarComSinonimos"] = `S,S`;
  data["dados.buscaEmenta"] = ``;
  data["dados.nuProcOrigem"] = ``;
  data["dados.nuRegistro"] = ``;
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
  data["dados.dtJulgamentoInicio"] = from;
  data["dados.dtJulgamentoFim"] = to;
  data["dados.dtPublicacaoInicio"] = ``;
  data["dados.dtPublicacaoFim"] = ``;
  data["dados.origensSelecionadas"] = `T`;
  data["tipoDecisaoSelecionados"] = `A`;
  data["dados.ordenarPor"] = `dtPublicacao`;
  data["recaptcha_response_token"] = captcha;
  data["uuidCaptcha"] = uuidCaptcha;
  let body = querystring.stringify(data);
  let method = "POST";
  let requestOptions = { method, body, headers: _headers };
 
  let requestURL = "https://esaj.tjms.jus.br/cjsg/resultadoCompleta.do";
  let responsePage = await fetchPage({
    canonicalURL,
    requestURL,
    requestOptions,
  });
  //let html = await responsePage.response.text()
  //throw(html)
  return responsePage;
};

async function fetchURL({ canonicalURL, headers }) {
  if (/https?:.*https?:/i.test(canonicalURL)) {
    console.error("Rejecting URL", canonicalURL, `returning [];`);
    return [];
  }
  const match = canonicalURL.match(/page=\d+/i);
  if (match) {
    return [await searchByDate({ canonicalURL, headers })];
  } else {
    return defaultFetchURL({ canonicalURL, headers });
  }
}
