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
function encodeObjectToBase64(obj) {
  try {
    // Serialize the object directly to base64
    const base64String = Buffer.from(JSON.stringify(obj)).toString('base64');
    return base64String;
  } catch (error) {
    console.error('Error encoding object to Base64:', error);
    throw new Error(JSON.stringify({ error }));
  }
}
const home = async function ({argument, canonicalURL, headers}) {
        let customHeaders = {
		    "Cache-Control": "no-cache",
		    "Content-Type": "application/json; charset=UTF-8",
		    "Origin": "https://buscador.corteconstitucional.gob.ec",
		    "Pragma": "no-cache",
		    "Referer": "https://buscador.corteconstitucional.gob.ec/buscador-externo/principal/resultadoSentencia?search=%7B%22numSentencia%22:%22%22,%22numeroCausa%22:%22%22,%22textoSentencia%22:%22%22,%22motivo%22:%22%22,%22metadata%22:%22%22,%22subBusqueda%22:%22%22,%22tipoLegitimado%22:100,%22legitimados%22:%22%22,%22tipoAcciones%22:%5B%5D,%22materias%22:%5B%5D,%22intereses%22:%5B%5D,%22decisiones%22:%5B%5D,%22jueces%22:%5B%5D,%22derechoDemandado%22:%5B%5D,%22derechosTratado%22:%5B%5D,%22derechosVulnerado%22:%5B%5D,%22temaEspecificos%22:%5B%5D,%22conceptos%22:%5B%5D,%22fechaNotificacion%22:%22%22,%22fechaDecision%22:%222023-08-01;2023-08-31%22,%22sort%22:%22relevancia%22,%22precedenteAprobado%22:%22%22,%22precedentePropuesto%22:%22%22,%22tipoNormas%22:%5B%5D,%22asuntos%22:%5B%5D,%22analisisMerito%22:%22%22,%22paginacion%22:%7B%22page%22:1,%22pageSize%22:20,%22total%22:0,%22contar%22:true%7D,%22flag%22:true%7D",
		    "Sec-Fetch-Dest": "empty",
		    "Sec-Fetch-Mode": "cors",
		    "Sec-Fetch-Site": "same-origin",
		    "sec-ch-ua": "\"Chromium\";v=\"112\", \"Google Chrome\";v=\"112\", \"Not:A-Brand\";v=\"99\"",
		    "sec-ch-ua-mobile": "?0",
		    "sec-ch-ua-platform": "\"Linux\"",
		    "Accept-Encoding": "gzip, deflate, br"
		};
        let _headers = Object.assign(customHeaders, headers);
      
        let startDate = getSharedVariable('startDate')
        let endDate = getSharedVariable('endDate')
        let data = {
            "numSentencia": "",
            "numeroCausa": "",
            "textoSentencia": "",
            "motivo": "",
            "metadata": "",
            "subBusqueda": "",
            "tipoLegitimado": 100,
            "legitimados": "",
            "tipoAcciones": [],
            "materias": [],
            "intereses": [],
            "decisiones": [],
            "jueces": [],
            "derechoDemandado": [],
            "derechosTratado": [],
            "derechosVulnerado": [],
            "temaEspecificos": [],
            "conceptos": [],
            "fechaNotificacion": "",
            "fechaDecision": `${endDate};${startDate}`,
            "sort": "desc",
            "precedenteAprobado": "",
            "precedentePropuesto": "",
            "tipoNormas": [],
            "asuntos": [],
            "analisisMerito": "",
            "paginacion": {
                "page": 1,
                "pageSize": 20,
                "total": 0,
                "contar": true
            },
            "flag": true
        }


        const base64String = encodeObjectToBase64(data)
        //throw new Error(JSON.stringify({base64String}))
        data = {
            "dato": `${base64String}`
        };
        let body = JSON.stringify(data);
                let method = "POST";
                let requestOptions = {method, body, headers: _headers};
                let requestURL = 'https://buscador.corteconstitucional.gob.ec/buscador-externo/rest/api/sentencia/100_BUSCR_SNTNCIA';
                let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
                return responsePage;
};
const getPaginations = async function ({argument, canonicalURL, headers}) {
    let customHeaders = {
        "Cache-Control": "no-cache",
        "Content-Type": "application/json; charset=UTF-8",
        "Origin": "https://buscador.corteconstitucional.gob.ec",
        "Pragma": "no-cache",
        "Referer": "https://buscador.corteconstitucional.gob.ec/buscador-externo/principal/resultadoSentencia?search=%7B%22numSentencia%22:%22%22,%22numeroCausa%22:%22%22,%22textoSentencia%22:%22%22,%22motivo%22:%22%22,%22metadata%22:%22%22,%22subBusqueda%22:%22%22,%22tipoLegitimado%22:100,%22legitimados%22:%22%22,%22tipoAcciones%22:%5B%5D,%22materias%22:%5B%5D,%22intereses%22:%5B%5D,%22decisiones%22:%5B%5D,%22jueces%22:%5B%5D,%22derechoDemandado%22:%5B%5D,%22derechosTratado%22:%5B%5D,%22derechosVulnerado%22:%5B%5D,%22temaEspecificos%22:%5B%5D,%22conceptos%22:%5B%5D,%22fechaNotificacion%22:%22%22,%22fechaDecision%22:%222023-08-01;2023-08-31%22,%22sort%22:%22relevancia%22,%22precedenteAprobado%22:%22%22,%22precedentePropuesto%22:%22%22,%22tipoNormas%22:%5B%5D,%22asuntos%22:%5B%5D,%22analisisMerito%22:%22%22,%22paginacion%22:%7B%22page%22:1,%22pageSize%22:20,%22total%22:0,%22contar%22:true%7D,%22flag%22:true%7D",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "sec-ch-ua": "\"Chromium\";v=\"112\", \"Google Chrome\";v=\"112\", \"Not:A-Brand\";v=\"99\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Linux\"",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);
    let startDate = getSharedVariable('startDate')
    let endDate = getSharedVariable('endDate')
    let totalPages = getSharedVariable('totalPages')
    let page = getSharedVariable('page')
    let data = {
        "numSentencia": "",
        "numeroCausa": "",
        "textoSentencia": "",
        "motivo": "",
        "metadata": "",
        "subBusqueda": "",
        "tipoLegitimado": 100,
        "legitimados": "",
        "tipoAcciones": [],
        "materias": [],
        "intereses": [],
        "decisiones": [],
        "jueces": [],
        "derechoDemandado": [],
        "derechosTratado": [],
        "derechosVulnerado": [],
        "temaEspecificos": [],
        "conceptos": [],
        "fechaNotificacion": "",
        "fechaDecision": `${endDate};${startDate}`,
        "sort": "desc",
        "precedenteAprobado": "",
        "precedentePropuesto": "",
        "tipoNormas": [],
        "asuntos": [],
        "analisisMerito": "",
        "paginacion": {
            "page": `${page}`,
            "pageSize": 20,
            "total": `${totalPages}`,
            "contar": true
        },
        "flag": true
    }

    const jsonString = JSON.stringify(data);
    const base64String = encodeJsonToBase64(jsonString)

    data = {
        "dato": `${base64String}`
    };
    let body = JSON.stringify(data);
            let method = "POST";
            let requestOptions = {method, body, headers: _headers};
            let requestURL = 'https://buscador.corteconstitucional.gob.ec/buscador-externo/rest/api/sentencia/100_BUSCR_SNTNCIA';
            let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
            return responsePage;
};

async function fetchURL({ canonicalURL, headers }) {
    if (/https?:.*https?:/i.test(canonicalURL)) {
        console.error("Rejecting URL", canonicalURL, `returning [];`);
        return [];
    }
    let argument = {}
    const match = canonicalURL.match(/page=(.+)/i);
    
    if (match) {
        const queryString = canonicalURL.split('?')[1];
        const queryParams = querystring.parse(queryString);
       // throw new Error(JSON.stringify({queryParams}))
        let from = moment(queryParams.startDate);
        let to = moment(queryParams.endDate);
        let page = parseInt(queryParams.page)
        let totalPages = queryParams.totalPages
        argument.from = moment(from).format('YYYY-MM-DD')
        argument.to = moment(to).format('YYYY-MM-DD')
        setSharedVariable('endDate', argument.to)
        setSharedVariable('startDate', argument.from)
        setSharedVariable('totalPages', totalPages)
        setSharedVariable('page', page)
        //throw new Error(JSON.stringify({argument}))
        argument.page = page
        if(page === 1){
            return [await home({argument, canonicalURL, headers})]
        }else{
            
            return [await getPaginations({argument, canonicalURL, headers})]

        }
    } else if(/documento/i.test(canonicalURL)){
        return [await getDocumentAndDecode({ canonicalURL, headers })]
    }else{
        return [await fetchPage({ canonicalURL, headers })]
    }
}