async function fetchPage({canonicalURL, requestURL, requestOptions, headers}) {
    if (!requestOptions) requestOptions = {method: "GET", headers};
    if (!canonicalURL) canonicalURL = requestURL;
    if (!requestURL) requestURL = canonicalURL;
    return await fetchWithCookies(requestURL, requestOptions)
        .then(response => {
            return {
                canonicalURL,
                request: Object.assign({URL: requestURL}, requestOptions),
                response
            };
        });
}




const getFirstPage = async function ({arguments, canonicalURL, headers}) {
        let customHeaders = {
                    "Cache-Control": "no-cache",
                    "Content-Type": "application/json",
                    "Origin": "https://www.bopa.ad",
                    "Pragma": "no-cache",
                    "Referer": "https://www.bopa.ad/",
                    "Sec-Fetch-Dest": "empty",
                    "Sec-Fetch-Mode": "cors",
                    "Sec-Fetch-Site": "cross-site",
                    "sec-ch-ua": "\"Chromium\";v=\"116\", \"Not)A;Brand\";v=\"24\", \"Google Chrome\";v=\"116\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Linux\"",
                    "Accept-Encoding": "gzip, deflate, br"
                };
        let _headers = Object.assign(customHeaders, headers);
        let data = {
                "textSearch": "",
                "temaFilter": [],
                "dateFilter": [
                    {
                        "filterType": "ge",
                        "filterValue": `${arguments.from}`
                    },
                    {
                        "filterType": "le",
                        "filterValue": `${arguments.to}`
                    }
                ],
                "organismeFilter": [],
                "butlletiFilter": "",
                "anyFilter": [],
                "size": 50,
                "skip": arguments.page,
                "orderBy": "DataPublicacioButlleti desc, DataArticle desc,OrganismeOrder,OrganismeChildOrder"
        };
        let body = JSON.stringify(data);
        let method = "POST";
        let requestOptions = {method, body, headers: _headers};
        let requestURL = 'https://bopaazurefunctions.azurewebsites.net/api/GetPaginatedDocuments?code=PJcaar13MjFNATASEiyt7hSz4mzHfMFEKdPccu3qfloYAzFui5Ni6A==';
        let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
        return responsePage;
};




const getDocumentByFileName = async function ({argument, canonicalURL, headers}) {
        let customHeaders = {
                    "Cache-Control": "no-cache",
                    "Origin": "https://www.bopa.ad",
                    "Pragma": "no-cache",
                    "Referer": "https://www.bopa.ad/",
                    "Sec-Fetch-Dest": "empty",
                    "Sec-Fetch-Mode": "cors",
                    "Sec-Fetch-Site": "cross-site",
                    "sec-ch-ua": "\"Chromium\";v=\"116\", \"Not)A;Brand\";v=\"24\", \"Google Chrome\";v=\"116\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Linux\"",
                    "Accept-Encoding": "gzip, deflate, br"
                };
        let _headers = Object.assign(customHeaders, headers);
        
        let method = "GET";
        let requestOptions = {method, headers: _headers};
        //let requestURL = 'https://bopaazurefunctions.azurewebsites.net/api/GetDocumentByFileName?name=SAIGF_2023_10_02_11_30_05';
        let responsePage = await fetchPage({canonicalURL, requestOptions});
        return responsePage;
};

async function fetchURL({canonicalURL, headers}) {
    if (/https?:.*https?:/i.test(canonicalURL)) {
        console.error("Rejecting URL", canonicalURL, `returning [];`);
        return [];
    }

    if(/page=\d+/i.test(canonicalURL)){
        let arguments = {}
        const parsedUrl = url.parse(canonicalURL, true);
        const queryParams = parsedUrl.query;
        arguments.from = queryParams.from;
        arguments.to = queryParams.to;
        arguments.page = queryParams.page;
      
        return [await getFirstPage({arguments, canonicalURL, headers})]
    }else if(/name=.+/i.test(canonicalURL)){
        return [await getDocumentByFileName({arguments, canonicalURL, headers})]
    }else {
        return [await fetchPage({ canonicalURL, headers })]
    }

    




}