
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
const getLinksAndModify = async function ({argument, canonicalURL, responsePage}){
    let html = await responsePage.response.buffer();
    responsePage.response = new fetch.Response(html, responsePage.response);
    const $ = cheerio.load(html);
    let pagination = $('ul.pagination');
    let links = pagination.find('li');
    if(links){
        links.each((i, elem)=>{

        let link = $(elem).find('a')
        let start = $(link).attr('start')
        let rows = $(link).attr('rows')
        let page = $(link).text().trim()

        if(i === links.length - 1){
            let url = `https://jurisprudencia.tjto.jus.br/consulta.php?q=Tocantins&start=${start}&rows=${rows}&documentType=acordao&startDate=${argument.from}&endDate=${argument.to}&page=${page}&last=1`
            $(link).attr('href', url)
        }else{
            let url  = `https://jurisprudencia.tjto.jus.br/consulta.php?q=Tocantins&start=${start}&rows=${rows}&documentType=acordao&startDate=${argument.from}&endDate=${argument.to}&page=${page}&last=0`
            $(link).attr('href', url)
        }

        })
    }
    responsePage.response = new fetch.Response($.html(), responsePage.response);
    return responsePage
}


const getHomeAndFilter = async function ({argument, canonicalURL, headers}) {
        let customHeaders = {
		    "authority": "jurisprudencia.tjto.jus.br",
		    "cache-control": "no-cache",
		    "content-type": "application/x-www-form-urlencoded",
		    "origin": "https://jurisprudencia.tjto.jus.br",
		    "pragma": "no-cache",
		    "referer": "https://jurisprudencia.tjto.jus.br/consulta.php?q=Tocantins",
		    "sec-ch-ua": "\"Chromium\";v=\"112\", \"Google Chrome\";v=\"112\", \"Not:A-Brand\";v=\"99\"",
		    "sec-ch-ua-mobile": "?0",
		    "sec-ch-ua-platform": "\"Linux\"",
		    "sec-fetch-dest": "document",
		    "sec-fetch-mode": "navigate",
		    "sec-fetch-site": "same-origin",
		    "sec-fetch-user": "?1",
		    "upgrade-insecure-requests": "1",
		    "Accept-Encoding": "gzip, deflate, br"
		};
        let _headers = Object.assign(customHeaders, headers);
        const data = {};
        //get dates
        let startDate = argument.from.format('DD/MM/YYYY')
        let endDate = argument.to.format('DD/MM/YYYY')
        argument.from = startDate
        argument.to = endDate
        data["start"] = `0`;
        data["rows"] = `20`;
        data["q"] = `Tocantins`;
        data["tipo_decisao_acordao"] = `on`;
        data["tip_criterio_data"] = `RELEV`;
        data["dat_jul_ini"] = `${startDate}`;
        data["dat_jul_fim"] = `${endDate}`;
        data["numero_processo"] = ``;
        let body = querystring.stringify(data);
       // throw new Error(JSON.stringify({body}))
        let method = "POST";
        let requestOptions = {method, body, headers: _headers};
        let requestURL = 'https://jurisprudencia.tjto.jus.br/consulta.php?q=Tocantins';
        let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
        //get links and modify
        responsePage = await getLinksAndModify({argument, canonicalURL, responsePage})
        return responsePage;
};
const getPaginations = async function ({argument, canonicalURL, headers}) {
    let customHeaders = {
        "authority": "jurisprudencia.tjto.jus.br",
        "cache-control": "no-cache",
        "content-type": "application/x-www-form-urlencoded",
        "origin": "https://jurisprudencia.tjto.jus.br",
        "pragma": "no-cache",
        "referer": "https://jurisprudencia.tjto.jus.br/consulta.php?q=Tocantins",
        "sec-ch-ua": "\"Chromium\";v=\"112\", \"Google Chrome\";v=\"112\", \"Not:A-Brand\";v=\"99\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Linux\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "Accept-Encoding": "gzip, deflate, br"
    };
        let _headers = Object.assign(customHeaders, headers);
        const data = {};
        
        let start = null
        let rows = null
        const queryString = canonicalURL.split('?')[1];
        const queryParams = querystring.parse(queryString);
        start = queryParams.start
        rows = queryParams.rows
        let last = queryParams.last
        let startDate = argument.from.format('DD/MM/YYYY')
        let endDate = argument.to.format('DD/MM/YYYY')
      
        data["start"] = `${start}`;
        data["rows"] = `${rows}`;
        data["q"] = `Tocantins`;
        data["tipo_decisao_acordao"] = `on`;
        data["tip_criterio_data"] = `RELEV`;
        data["dat_jul_ini"] = `${startDate}`;
        data["dat_jul_fim"] = `${endDate}`;
        data["numero_processo"] = ``;
        let body = querystring.stringify(data);
        //throw new Error(JSON.stringify({body}))
        let method = "GET";
        let requestOptions = {method, headers: _headers};
        let requestURL = `https://jurisprudencia.tjto.jus.br/consulta.php?${body}`;
        //throw new Error(JSON.stringify({requestURL}))
        let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
        if(last)
            responsePage = await getLinksAndModify({argument, canonicalURL, responsePage})
 
        return responsePage;
};

const getDocumentAndDecode = async function ({ canonicalURL, headers }) {
    let customHeaders = {
        "authority": "jurisprudencia.tjto.jus.br",
        "cache-control": "no-cache",
        "content-type": "application/x-www-form-urlencoded",
        "origin": "https://jurisprudencia.tjto.jus.br",
        "pragma": "no-cache",
        "referer": "https://jurisprudencia.tjto.jus.br/consulta.php?q=Tocantins",
        "sec-ch-ua": "\"Chromium\";v=\"112\", \"Google Chrome\";v=\"112\", \"Not:A-Brand\";v=\"99\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Linux\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "Accept-Encoding": "gzip, deflate, br"
    };
        let _headers = Object.assign(customHeaders, headers);

    const method = 'GET'
    const requestOptions = { method, headers: _headers }
    const responsePage = await fetchPage({ canonicalURL, requestURL: null, requestOptions })
    const htmlB = await responsePage.response.buffer()
    responsePage.response = new fetch.Response(iconv.decode(htmlB, "ISO-8859-1"), responsePage.response)
    responsePage.response.headers.set('content-type', 'text/html')
    return responsePage
}

async function fetchURL({ canonicalURL, headers }) {
    if (/https?:.*https?:/i.test(canonicalURL)) {
        console.error("Rejecting URL", canonicalURL, `returning [];`);
        return [];
    }
    let argument = {}
    const match = canonicalURL.match(/startDate=(.+)&endDate=(.+)&page=(.+)&last=(.+)/i);

    if (match) {
        
        let from = moment(match[1]);
        let to = moment(match[2]);
        let page = match[3] ? parseInt(match[3]) : 1;
        let last = match[4] ? parseInt(match[4]) : 1;
        argument.from = from
        argument.to = to
        argument.page = page
        if(page === 1){
            return [await getHomeAndFilter({argument, canonicalURL, headers})]
        }else{

            if(last)
                argument.last = true
            else
                argument.last = false
              
            return [await getPaginations({argument, canonicalURL, headers})]

        }
    } else if(/documento/i.test(canonicalURL)){
        return [await getDocumentAndDecode({ canonicalURL, headers })]
    }else{
        return [await fetchPage({ canonicalURL, headers })]
    }
}