async function fetchPage({ canonicalURL, requestURL, requestOptions, headers }) {
    if (!requestOptions) requestOptions = { method: "GET", headers };
    if (!canonicalURL) canonicalURL = requestURL;
    if (!requestURL) requestURL = canonicalURL;
    //lum-customer-vlex-zone-2captcha-country-co
    return await fetchWithCookies(requestURL, requestOptions, "zone-g1-country-co")
        .then(response => {
            return {
                canonicalURL,
                request: Object.assign({ URL: requestURL }, requestOptions),
                response
            };
        });
}

const getForm = async function({ headers }) {
    let customHeaders = {
        "DNT": "1",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-User": "?1",
        "Sec-Fetch-Dest": "document",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);

    let method = "GET";
    let requestOptions = { method, headers: _headers };
    let requestURL = 'https://www.procuraduria.gov.co/relatoria/index.jsp?option=co.gov.pgn.relatoria.frontend.component.pagefactory.PirelResolucionesPageFactory';
    let responsePage = await fetchPage({ canonicalURL: requestURL, requestOptions });
    return responsePage;
};

async function resolveCaptcha(URL) {
    //URL = URL || "https://www.procuraduria.gov.co/relatoria/index.jsp?option=co.gov.pgn.relatoria.frontend.component.pagefactory.PirelResolucionesPageFactory";
    URL = URL || "https://apps.procuraduria.gov.co/relatoria/index.jsp?option=co.gov.pgn.relatoria.frontend.component.pagefactory.PirelTipoDocumentoPageFactory";
    console.log("resolveCaptcha for", URL);
    const a2CaptchaKey = "10122c7066706ebba801995c2e99fbe2";
    const GOOGLE_KEY = "6LfF32QUAAAAAPgv2RJ0kFjfpBYshmBWP3RH0W3f"; // this key varies by each crawled site and has to be obtained by inspecting the code
    const requestOptions = { method: "GET" };

    const initialCaptchaURL = `http://2captcha.com/in.php?key=${a2CaptchaKey}&method=userrecaptcha&googlekey=${GOOGLE_KEY}&proxy=lum-customer-vlex-zone-2captcha-country-co:dcohwmkemk0n@zproxy.lum-superproxy.io.22225&pageurl=${URL}&json=1`;
    const responseData = await fetchWithCookies(
        initialCaptchaURL,
        requestOptions
    ).then(resp => resp.json());
    console.log("2Captcha Initial Response=", responseData);
    const requestId = responseData.request;
    const updateDataURL = `http://2captcha.com/res.php?key=${a2CaptchaKey}&action=get&id=${requestId}`;
    await sleep(15 * 1000);

    let updateData = await fetchWithCookies(
        updateDataURL,
        requestOptions
    ).then(resp => resp.text());
    while (updateData.match(/CAPCHA_NOT_READY/i)) {
        console.log("Captcha not ready: waiting for 5sec: " + updateData);
        await sleep(5 * 1000);
        updateData = await fetchWithCookies(
            updateDataURL,
            requestOptions
        ).then(resp => resp.text());
    }

    console.log("RECAPTCHA_VALUE=", updateData);
    if (updateData.indexOf("OK|") !== -1) {
        let recap = updateData.replace(/^OK\|/, "");
        // recap && setSharedVariable("recap", recap);
        recap && setSharedVariable("captcha", recap);
        return recap;
    } else {
        throw new Error("Captcha solving Failed: " + updateData);
        // return null;
    }
}

function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

const search = async function({ from, to, fallo, canonicalURL, headers }) {
    let home = await getForm({ headers });
    let customHeaders = {
        "Cache-Control": "max-age=0",
        "Origin": "https://www.procuraduria.gov.co",
        "Upgrade-Insecure-Requests": "1",
        "DNT": "1",
        "Content-Type": "application/x-www-form-urlencoded",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-User": "?1",
        "Sec-Fetch-Dest": "document",
        //"Referer": "https://www.procuraduria.gov.co/relatoria/index.jsp?option=co.gov.pgn.relatoria.frontend.component.pagefactory.PirelResolucionesPageFactory",
        "Referer": "https://apps.procuraduria.gov.co/relatoria/index.jsp?option=co.gov.pgn.relatoria.frontend.component.pagefactory.PirelTipoDocumentoPageFactory",
        "Accept-Encoding": "gzip, deflate, br"
    };

    let fallo_value = /resoluci.+n/i.test(fallo) ? "RESOLUCION" : /segunda/i.test(fallo) ? "FALLO SEGUNDA" : /apela/i.test(fallo) ? "FALLO PRIMERA NO APELADO" : "FALLO PRIMERA";
    //let fallo_value = /resoluci.+n/i.test(fallo)?"RESOLUCION":/segunda/i.test(fallo) ? "FALLO+SEGUNDA" : /apela/i.test(fallo) ? "FALLO+PRIMERA+NO+APELADO" : "FALLO+PRIMERA";
    let recap = await resolveCaptcha();
    if (!recap) throw ('Re-Catpcha solution not found')
        //throw JSON.stringify({from, to, fallo, recap},null,1)
    let _headers = Object.assign(customHeaders, headers);
    const data = {};
    data["action"] = `consultar_tipo_documento`;
    data["action_criterio"] = `consultar_tipo_documento`;
    data["tipo_documento"] = fallo_value;
    data["numero"] = ``;
    data["dependencia"] = ``;
    data["tema"] = ``;
    data["subtema"] = ``;
    data["palabra_clave"] = ``;
    data["fecha_inicial"] = from.format("YYYY-MM-DD");
    data["fecha_final"] = to.format("YYYY-MM-DD");
    data["g-recaptcha-response"] = recap;
    data["ok"] = `Buscar`;
    let body = querystring.stringify(data);
    let method = "POST";
    let requestOptions = { method, body, headers: _headers };
    //let requestURL = 'https://www.procuraduria.gov.co/relatoria/index.jsp?option=co.gov.pgn.relatoria.frontend.component.pagefactory.PirelResolucionesPageFactory';
    let requestURL = 'https://apps.procuraduria.gov.co/relatoria/index.jsp?option=co.gov.pgn.relatoria.frontend.component.pagefactory.PirelTipoDocumentoPageFactory';
    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });
    let buffer = await responsePage.response.buffer();
    const $ = cheerio.load(iconv.decode(buffer, 'utf8'), { decodeEntities: false });
    $("script, iframe").remove();
    $(".cms-table a[href *= '#']").each(function(k) {
        let a = $(this);
        let URI = a.attr('href');
        URI = URI ? url.resolve(requestURL, URI.replace(/#.+/, "")) : null;
        a.attr('href', URI);
    });
    responsePage.response = new fetch.Response($.html(), responsePage.response);
    responsePage.response.headers.set('content-type', 'text/html');
    return responsePage;
};

async function fetchURL({ canonicalURL, headers }) {
    if (/https?:.*https?:|`/i.test(canonicalURL)) {
        console.error("Rejecting URL", canonicalURL, `returning [];`);
        return [];
    }

    const match = canonicalURL.match(/\?(start|from)=(\d{4}-\d{2}-\d{2}).(end|to)=(\d{4}-\d{2}-\d{2})&fallo=(.+)$/i);
    if (match) {
        let from = moment(match[2]);
        let to = moment(match[4]);
        let fallo = decodeURIComponent(match[5]);

        return [await search({ fallo, from, to, canonicalURL, headers })]
    } else {
        return [await fetchPage({ canonicalURL, headers })];
    }
}