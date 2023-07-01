async function fetchPage({ canonicalURL, requestURL, requestOptions, headers }) {
    if (!requestOptions) requestOptions = { method: "GET", headers };
    if (!canonicalURL) canonicalURL = requestURL;
    if (!requestURL) requestURL = canonicalURL;
    return await fetchWithCookies(requestURL, requestOptions)
        .then(response => {
            return {
                canonicalURL,
                request: Object.assign({ URL: requestURL }, requestOptions),
                response
            };
        });
}

const parseForm = async function ({ responsePage }) {
    let html = await responsePage.response.buffer();
    responsePage.response = new fetch.Response(html, responsePage.response);
    const $ = cheerio.load(html);
    let action = $("form.search-form").first().attr('action');
    action && setSharedVariable('action', action);
};

const home = async function ({ headers }) {
    let customHeaders = {
        "Cache-Control": "no-cache",
        "DNT": "1",
        "Pragma": "no-cache",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        "sec-ch-ua": "\"Google Chrome\";v=\"113\", \"Chromium\";v=\"113\", \"Not-A.Brand\";v=\"24\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);

    let method = "GET";
    let requestOptions = { method, headers: _headers };
    let requestURL = 'https://www.bundesanzeiger.de/pub/en/search?0';
    let responsePage = await fetchPage({ canonicalURL: requestURL, requestOptions });
    await parseForm({ responsePage });
    return responsePage;
};
const getLocation = async function ({ responsePage }) {
    let location = responsePage.response.headers.get('location');
    if (location) {
        let requestURL = location;
        setSharedVariable('location', requestURL);
    }
};

const selectArea = async function ({ arguments, canonicalURL, headers }) {
    let customHeaders = {
        "Cache-Control": "no-cache",
        "Content-Type": "application/x-www-form-urlencoded",
        "DNT": "1",
        "Origin": "https://www.bundesanzeiger.de",
        "Pragma": "no-cache",
        "Referer": "https://www.bundesanzeiger.de/",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        "sec-ch-ua": "\"Google Chrome\";v=\"113\", \"Chromium\";v=\"113\", \"Not-A.Brand\";v=\"24\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);
    const data = {};
    data["fulltext"] = ``;
    data["panelCategories:groupCategories"] = arguments.area;
    data["other-options-button"] = `Refine further`;
    data["start_date"] = ``;
    data["end_date"] = ``;
    let body = querystring.stringify(data);
    let method = "POST";
    let requestOptions = { method, body, headers: _headers };
    // let requestURL = 'https://www.bundesanzeiger.de/pub/en/search?0-1.-search~form~panel-search~form';
    let requestURL = getSharedVariable('action');
    let responsePage = await fetchPage({ canonicalURL: canonicalURL || requestURL, requestURL, requestOptions });
    await parseForm({ responsePage });
    await getLocation({ responsePage });
    return responsePage;
};


const selectAreaRedirect = async function ({ canonicalURL, headers }) {
    let customHeaders = {
        "Cache-Control": "no-cache",
        "DNT": "1",
        "Pragma": "no-cache",
        "Referer": "https://www.bundesanzeiger.de/",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        "sec-ch-ua": "\"Google Chrome\";v=\"113\", \"Chromium\";v=\"113\", \"Not-A.Brand\";v=\"24\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);

    let method = "GET";
    let requestOptions = { method, headers: _headers };
    let location = getSharedVariable('location');
    let requestURL = location;
    let responsePage = await fetchPage({ canonicalURL: canonicalURL || requestURL, requestURL, requestOptions });
    await parseForm({ responsePage });
    await getLocation({ responsePage });
    return responsePage;
};


const searchDates = async function ({ arguments, canonicalURL, headers }) {
    let from = moment(arguments.from);
    let to = moment(arguments.to);
    let customHeaders = {
        "Cache-Control": "no-cache",
        "Content-Type": "application/x-www-form-urlencoded",
        "DNT": "1",
        "Origin": "https://www.bundesanzeiger.de",
        "Pragma": "no-cache",
        "Referer": "https://www.bundesanzeiger.de/",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        "sec-ch-ua": "\"Google Chrome\";v=\"113\", \"Chromium\";v=\"113\", \"Not-A.Brand\";v=\"24\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);
    const data = {};
    data["fulltext"] = ``;
    data["panelCategories:groupCategories"] = arguments.area || `61`;
    data["company"] = ``;
    data["location"] = ``;
    data["isin"] = ``;
    data["publicationtype_select"] = ``;
    data["start_date"] = from.format("MM/DD/YYYY");
    data["end_date"] = to.format("MM/DD/YYYY");
    data["search-button"] = `Search`;
    let body = querystring.stringify(data);
    let method = "POST";
    let requestOptions = { method, body, headers: _headers };
    // let requestURL = 'https://www.bundesanzeiger.de/pub/en/search?4-1.-search~form~panel-search~form';
    let requestURL = getSharedVariable('action');
    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });
    await parseForm({ responsePage });
    await getLocation({ responsePage });
    return responsePage;
};
const parseResults = async function ({ responsePage }) {
    let html = await responsePage.response.buffer();
    responsePage.response = new fetch.Response(html, responsePage.response);
    const $ = cheerio.load(html);
    // on the div container result_container global-search
    let container = $('div.result_container.global-search');
    // get the div with class row , row-back

    let allRows = $(container).find('.row');

    //return [allRows.length]

    // get all the divs with class row and row back

    let results = [];

    allRows.each((index, element) => {
        let result = {};
        // get the class info 
        let info = $(element).find('.info');
        //get the a tag 
        let a = $(info).find('a');
        // div class first
        let name = $(element).find('.first').text();
        // <div class="part">
        let area = $(element).find('.part').text();
        // <div class="col-md-5">
        let infoText = $(element).find('.col-md-5').text();
        // second <div class="col-md-2">
        let date = $(element).find('div.date').text();

        // construct url 
        let url = `https://www.bundesanzeiger.de/pub/en/search?name=${name}&area=${area}&infoText=${infoText}&date=${date}`;

        // the url should be the key and the value should be the a
        result[url] = $(a).attr('href');
        a.attr('href', url);

        results.push(result);
    });
    // remove the first element
    results.shift();
    return results;
}

const getEachResult = async function ({ results, canonicalURL, responsePage, headers }) {
    let resultsArray = [];
    resultsArray.push(responsePage);
    for (let result of results) {
        let href = Object.keys(result)[0];
        // check if the canonicalURL is absolute
        href = href ? url.resolve(canonicalURL, href) : null;
        if (href) {
            let customHeaders = {
                "Cache-Control": "no-cache",
                "DNT": "1",
                "Pragma": "no-cache",
                "Referer": "https://www.bundesanzeiger.de/",
                "Sec-Fetch-Dest": "document",
                "Sec-Fetch-Mode": "navigate",
                "Sec-Fetch-Site": "same-origin",
                "Sec-Fetch-User": "?1",
                "Upgrade-Insecure-Requests": "1",
                "sec-ch-ua": "\"Google Chrome\";v=\"113\", \"Chromium\";v=\"113\", \"Not-A.Brand\";v=\"24\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "Accept-Encoding": "gzip, deflate, br"
            };
            let _headers = Object.assign(customHeaders, headers);
            let method = "GET";
            let requestOptions = { method, headers: _headers };
            // requestURL should be the value
            let requestURL = Object.values(result)[0];
            //throw(requestURL)
            let responsePage = await fetchPage({ canonicalURL: href, requestURL, requestOptions });

            resultsArray.push(responsePage);
        }
    }
    return resultsArray;
}

const searchRedirect = async function ({ canonicalURL, headers }) {
    let customHeaders = {
        "Cache-Control": "no-cache",
        "DNT": "1",
        "Pragma": "no-cache",
        "Referer": "https://www.bundesanzeiger.de/",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        "sec-ch-ua": "\"Google Chrome\";v=\"113\", \"Chromium\";v=\"113\", \"Not-A.Brand\";v=\"24\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);

    let method = "GET";
    let requestOptions = { method, headers: _headers };
    let location = getSharedVariable('location');
    let requestURL = location;
    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });
    return responsePage;
};



/*
  pagination 

  */
const parsePaginationMiddle = async function ({ responsePage, page }) {
    let html = await responsePage.response.buffer();
    responsePage.response = new fetch.Response(html, responsePage.response);
    const $ = cheerio.load(html);
    // class result_pager bottom
    let container = $('.result_pager.bottom');
    // get class middle
    let middle = $(container).find('.middle');

    let page_count = $(container).find('.page_count')
    
    let page_count_span = $(page_count).find('span').text();
    //convert to int
    page_count_span = parseInt(page_count_span);
    setSharedVariable('page_count', page_count_span);

    // for each class page-item first
    let pageItems = $(middle).find('.page-item.first');
    let results = [];
    pageItems.each((index, element) => {
        let result = {};
        let a = $(element).find('a');
        // let the attribute href be the value and the key should be the  text
        // convert the key use parseInt
        result[parseInt($(a).text())] = $(a).attr('href');
        results.push(result);
    });
    return results;


}

const parsePaginationRight = async function ({ responsePage, page }) {
    let html = await responsePage.response.buffer();
    responsePage.response = new fetch.Response(html, responsePage.response);
    const $ = cheerio.load(html);
    // class result_pager bottom
    let container = $('div.result_pager.bottom');
    // get class middle
    let right = $(container).find('.right');
    // find all the div
    let pageItems = $(right).find('div');
    let results = [];
    pageItems.each((index, element) => {
        let result = {};
        let a = $(element).find('a');
        // let the attribute href be the value and the key should be the  text
        // convert the key use parseInt
        result[$(a).text()] = $(a).attr('href');
        results.push(result);
    });
    return results;


}
const paginationEngine = async function ({ canonicalURL, responsePage , headers, page }) {
    let html = await responsePage.response.buffer();
    responsePage.response = new fetch.Response(html, responsePage.response);
    let customHeaders = {
        "Cache-Control": "no-cache",
        "DNT": "1",
        "Pragma": "no-cache",
        "Referer": "https://www.bundesanzeiger.de/",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        "sec-ch-ua": "\"Google Chrome\";v=\"113\", \"Chromium\";v=\"113\", \"Not-A.Brand\";v=\"24\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);

    let method = "GET";
    let requestOptions = { method, headers: _headers };
    if (page > 5) {
        //split page count by 2
        let page_count = getSharedVariable('page_count');
        let page_count_split = page_count / 2;
        let page_count_split_rounded = Math.round(page_count_split);
        
        if (page > page_count_split_rounded) {
            let results = await parsePaginationRight({ responsePage, page });
            // get the last element
            let lastElement = results[results.length - 1];
            // get the key
            let key = Object.keys(lastElement)[0];
            // get the value
            let value = Object.values(lastElement)[0];

            responsePage = await fetchPage({ canonicalURL, requestURL: value, requestOptions });
            await parsePaginationMiddle({ responsePage, page });

            // get page count
            let i = page_count - 5;
            while (i !== page) {
                let results = await parsePaginationMiddle({ responsePage, page });
                // get the first element
                let firstElement = results[0];
                // get the key
                let key = Object.keys(firstElement)[0];
                // get the value


                if (key === page) {
                    let value = Object.values(firstElement)[0];
                    responsePage = await fetchPage({ canonicalURL, requestURL: value, requestOptions });
                    await parsePaginationMiddle({ responsePage, page });
                    i = page;
                    break;
                } else if (key > page) {
                    let result = results.filter((result) => {
                        let key = Object.keys(result)[0];
                        return key === page;
                    });
                    responsePage = await fetchPage({ canonicalURL, requestURL: value, requestOptions });
                    await parsePaginationMiddle({ responsePage, page });
                    i = page;

                } else {
                    // get the first element
                    let firstElement = results[0];
                    // get the key
                    let key = Object.keys(firstElement)[0];
                    // get the value
                    let value = Object.values(firstElement)[0];
                    responsePage = await fetchPage({ canonicalURL, requestURL: value, requestOptions });
                    await parsePaginationMiddle({ responsePage, page });
                    i = key;

                }
            }


        } else {
            let results = await parsePaginationMiddle({ responsePage, page });
            // get the last element
            let lastElement = results[results.length - 1];
            // get the key
            let key = Object.keys(lastElement)[0];
            // get the value
            let value = Object.values(lastElement)[0];

           responsePage = await fetchPage({ canonicalURL, requestURL: value, requestOptions });
          
            await parsePaginationRight({ responsePage, page });
            results = await parsePaginationMiddle({ responsePage, page });
            
          
            let i = 5;
            let continueLoop = true;
            page = parseInt(page)
            while (i !== page) {
             
              //throw(results)
              if (results && results.length > 0) {
                 lastElement = results[results.length - 1];
                 key = Object.keys(lastElement)[0];
                
                key = parseInt(key)
                if (key === page) {
                    let value = Object.values(lastElement)[0];
                    responsePage = await fetchPage({ canonicalURL, requestURL: value, requestOptions });
                    await parsePaginationMiddle({ responsePage, page });
                    results = await parsePaginationMiddle({ responsePage, page });
                    i = page;
                    break;
            
                 
                } else if (key < page) {
                
                  let result = results.filter((result) => {
                    let key = Object.keys(result)[0];
                    key = parseInt(key)
                    return key === page;
                  });
                  
                  if (result && result.length > 0) {
                    let value = Object.values(result[0])[0];
                    responsePage = await fetchPage({ canonicalURL, requestURL: value, requestOptions });
                    i = page;
                    break;
                  } else {
                    // Handle the case when the desired page is not found
                    //continue;
                    break;
                  }
                } else {
                  let value = Object.values(lastElement)[0];
                  responsePage = await fetchPage({ canonicalURL, requestURL: value, requestOptions });
                  await parsePaginationRight({ responsePage, page });
                  await parsePaginationMiddle({ responsePage, page });
                  results = await parsePaginationMiddle({ responsePage, page });

                  i = key;
                }
              } else {
                // Handle the case when the results array is empty
                break;
              }
            }
            
            return responsePage;
        }

    } else {
        // get on the current page
         results = await parsePaginationMiddle({ responsePage, page });

        // use filter to get the key and value
        let result = results.filter((result) => {
            let key = Object.keys(result)[0];
            key = parseInt(key)
            return key === page;
        })

        // now get the value
        let value = Object.values(result[0])[0];
        let responsePage = await fetchPage({ canonicalURL, requestURL: value, requestOptions });
        await parsePaginationMiddle({ responsePage, page });
        results = await parsePaginationMiddle({ responsePage, page });
        return responsePage;

    }
}


const pagination = async function ({ arguments, canonicalURL, headers, page }) {
   
    await home({ canonicalURL, headers });
    let result = await selectArea({ arguments, canonicalURL, headers });
   
    let responsePage = await searchDates({ arguments, canonicalURL, headers });

    await parsePaginationMiddle({ responsePage, page });
    await parsePaginationRight({ responsePage, page });
    let results = await paginationEngine({ canonicalURL, responsePage, headers, page });
    return [results]
  
    let getEachResultInPage = await parseResults({ results, canonicalURL, headers });
    return getEachResultInPage;

}
const getResults = async function ({ arguments, canonicalURL, headers }) {
    await home({ canonicalURL, headers });
    let result = await selectArea({ arguments, canonicalURL, headers });
    
    //let response = await selectAreaRedirect({ canonicalURL, headers });
    //return response
    let responsePage = await searchDates({ arguments, canonicalURL, headers });
    
    //let responsePage = await searchRedirect({ canonicalURL, headers });
    let results = await parseResults({ responsePage });
    return [results]

    let getEachResultInPage = await getEachResult({ results, canonicalURL, responsePage, headers });
    return getEachResultInPage;
}





async function fetchURL({ canonicalURL, headers }) {
    if (/https?:.*https?:/i.test(canonicalURL)) {
        console.error("Rejecting URL", canonicalURL, `returning [];`);
        return [];
    }

    const isListing = canonicalURL.match(/page=(\d+)/i);

    if (isListing) {

        let [areaName, area, fromDate, toDate] = canonicalURL.match(/areaName=([^&]+)&area=([^&]+)&from=([^&]+)&to=([^&]+)/).slice(1);
        let arguments = {};

        arguments.areaName = areaName
        arguments.area = area
        arguments.from = fromDate
        arguments.to = toDate
        let page = parseInt(isListing[1]);


        if (page === 1) 
            return await getResults({ arguments, canonicalURL, headers })
        return await pagination({ arguments, canonicalURL, headers, page })
        

    } else {
        return [await fetchPage({ canonicalURL, headers })]
    }

}
