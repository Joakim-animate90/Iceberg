

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




const getHome = async function ({argument, canonicalURL, headers}) {

        let customHeaders = {
                    "Cache-Control": "no-cache",
                    "Pragma": "no-cache",
                    "Sec-Fetch-Dest": "document",
                    "Sec-Fetch-Mode": "navigate",
                    "Sec-Fetch-Site": "none",
                    "Sec-Fetch-User": "?1",
                    "Upgrade-Insecure-Requests": "1",
                    "sec-ch-ua": "\"Chromium\";v=\"116\", \"Not)A;Brand\";v=\"24\", \"Google Chrome\";v=\"116\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Linux\"",
                    "Accept-Encoding": "gzip, deflate, br"
                };
        let _headers = Object.assign(customHeaders, headers);
        
        let method = "GET";
        let requestOptions = {method, headers: _headers};
        let requestURL = 'https://justice.public.lu/fr/jurisprudence/cour-constitutionnelle.html';
        let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
        return responsePage;
};

const postHtmlPdfUrl = async function ({argument, canonicalURL, headers}) {
    let customHeaders = {
                "sec-ch-ua": "\"Chromium\";v=\"116\", \"Not)A;Brand\";v=\"24\", \"Google Chrome\";v=\"116\"",
                "sec-ch-ua-mobile": "?0",
                "Content-Type": "application/json",
                "x-dtpc": "9$169086766_514h12vNUPGAFAPSQFUMNOUCRHSDLRRCULVRWAM-0e0",
                "Referer": `${canonicalURL}`,
                "sec-ch-ua-platform": "\"Linux\"",
                "Accept-Encoding": "gzip, deflate, br"
            };
    let _headers = Object.assign(customHeaders, headers);
    let data = {
"uri": `${canonicalURL}`
};
let body = JSON.stringify(data);
    let method = "POST";
    let requestOptions = {method, body, headers: _headers};
    let requestURL = 'https://legilux.public.lu/proxy/getByUri';
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
    return responsePage;
};




const  getPagination = async function ({argument, canonicalURL, headers}) {
    const match = canonicalURL.match(/page=(.*)/i);
    let page = match[1];
        let customHeaders = {
                    "Cache-Control": "no-cache",
                    "Pragma": "no-cache",
                    "Referer": "https://justice.public.lu/fr/jurisprudence/cour-constitutionnelle.html",
                    "Sec-Fetch-Dest": "document",
                    "Sec-Fetch-Mode": "navigate",
                    "Sec-Fetch-Site": "same-origin",
                    "Sec-Fetch-User": "?1",
                    "Upgrade-Insecure-Requests": "1",
                    "sec-ch-ua": "\"Chromium\";v=\"116\", \"Not)A;Brand\";v=\"24\", \"Google Chrome\";v=\"116\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Linux\"",
                    "Accept-Encoding": "gzip, deflate, br"
                };
        let _headers = Object.assign(customHeaders, headers);
        
        let method = "GET";
        let requestOptions = {method, headers: _headers};
        let requestURL = `https://justice.public.lu/fr/jurisprudence/cour-constitutionnelle.html?b=${page}`;
        let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
        return responsePage;
    };

    async function fetchURL({canonicalURL, headers}) {
        if (/https?:.*https?:/i.test(canonicalURL)) {
            console.error("Rejecting URL", canonicalURL, `returning [];`);
            return [];
        }
        const match = canonicalURL.match(/page=(\d+)$/i);
        const match1 = canonicalURL.match(/jo$/i);
        if (match) {
            if(parseInt(match[1]) === 1 )
                return [await getHome({canonicalURL, headers})]
            else 
                return [await getPagination({canonicalURL, headers})]    
        } else if (match1){
            return [await postHtmlPdfUrl({canonicalURL, headers})]

        }else{
            return [await fetchPage({canonicalURL, headers})]    
    
        }
    }