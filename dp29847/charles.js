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

const parseForm = async function({ responsePage }) {
    let html = await responsePage.response.buffer();
    responsePage.response = new fetch.Response(html, responsePage.response);
    const $ = cheerio.load(html);
    let action = $("form.search-form").first().attr('action');
    action && setSharedVariable('action', action);
};



const home = async function({ headers }) {
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
const getLocation = async function({ responsePage }) {
    let location = responsePage.response.headers.get('location');
    if (location) {
        let requestURL = location;
        setSharedVariable('location', requestURL);
    }
};

const selectArea = async function({ arguments, canonicalURL, headers }) {
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


const selectAreaRedirect = async function({ canonicalURL, headers }) {
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


const searchDates = async function({ arguments, canonicalURL, headers }) {
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
const parseResults = async function({ responsePage }) {
    let html = await responsePage.response.buffer();
    responsePage.response = new fetch.Response(html, responsePage.response);
    const $ = cheerio.load(html);
    // on the div container result_container global-search
    let container = $('div.result_container.global-search');
    // get the div with class row , row-back

    let allRows = $(container).find('.row');



    // get all the divs with class row and row back

    let results = [];

    allRows.each((index, element) => {
        let result = {};
        // get the class info 
        let info = $(element).find('.info');
        //get the a tag 
        let a = $(info).find('a');
        // div class first
        let name = $(element).find('.first').text().trim()
            //remove the space using regexes 
        name = name.replace(/\s+/g, '');
        //name = name.replace(' ', '_')
        // <div class="part">
        let area = $(element).find('.part').text().trim();
        area = area.replace(/\s+/g, '');
        //area = area.replace(' ', '_')
        // <div class="col-md-5">
        let infoText = $(element).find('.col-md-5').text().trim();
        //remove new lines and spaces
        infoText = infoText.replace(/\s+/g, '');
        infoText = infoText.replace(/\n/g, '');

        //infoText = infoText.replace(' ', '_')
        // second <div class="col-md-2">
        let date = $(element).find('div.date').text().trim();
        date = date.replace(/\s+/g, '');

        // date = date.replace(' ', '_')

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

const getEachResult = async function({ results, canonicalURL, responsePage, headers }) {
    let resultsArray = [];
    resultsArray.push(responsePage);



    //get the first element
    // results = results.slice(0, 1);
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


            let checkIfCaptchaNeeded = await checkCaptcha({ responsePage });

            if (checkIfCaptchaNeeded) {
                try {
                    let captchaResult = null;
                    let tries = 0;
                    while (!captchaResult && ++tries <= 3) {
                        let x = await getAndSolveCaptcha({ headers });
                        captchaResult = x && x.captchaResult;
                        //throw(captchaResult)
                    }


                    responsePage = await postCaptcha({ captchaResult, canonicalURL: href });
                } catch (e) {
                    console.log(e)
                }

            }

            resultsArray.push(responsePage);
        }
    }
    return resultsArray;
}

const searchRedirect = async function({ canonicalURL, headers }) {
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
  solve Captcha

   */
const getAndSolveCaptcha = async function({ headers }) {
    let customHeaders = {
        "Referer": "https://www.bundesanzeiger.de/",
    };
    let _headers = Object.assign(customHeaders, headers);
    console.log("solving captcha");
    let method = "GET";
    let requestOptions = { method, headers: _headers };
    let requestURL = getSharedVariable('captcha_img_src');


    let captchaPage = await fetchPage({ requestURL, requestOptions });
    captchaPage.response.headers.set('content-type', "image/jpeg");

    let imageBuffer = await captchaPage.response.buffer();
    //captchaPage.response = new fetch.Response(imageBuffer, captchaPage.response);

    let captchaResult = await resolveCaptcha(imageBuffer, "image/jpeg");


    //throw('captcha result:', captchaResult);
    //throw(captchaResult+" "+captchaPage)
    if (!captchaResult) console.log("Captcha not solved successfully: " + captchaResult);
    return { captchaResult };
};

const checkCaptcha = async function({ responsePage }) {
    let html = await responsePage.response.buffer();
    responsePage.response = new fetch.Response(html, responsePage.response);
    const $ = cheerio.load(html);
    //div class captcha_wrapper if contains img
    let captcha_wrapper = $('.captcha_wrapper');

    let captcha_img = $(captcha_wrapper).find('img');
    let captcha_img_src = $(captcha_img).attr('src');

    if (captcha_img_src) {
        let action = $("form").eq(1).attr('action');
        action && setSharedVariable('action_captcha', action);
        const parts = action.split("?")[1].split("-");
        const extractedPart = parts[0];

        setSharedVariable('number', extractedPart);
        setSharedVariable('captcha_img_src', captcha_img_src);
        //throw(captcha_img_src)
        return true;
    }
    return false;
};

const postCaptcha = async function({ headers, captchaResult, canonicalURL }) {
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
        "Accept-Encoding": "gzip, deflate, br",
        "Content-Type": "application/x-www-form-urlencoded"
    };
    //const body = new FormData();
    // if captchaResult then to upper case
    //captchaResult = captchaResult && captchaResult.toUpperCase();
    //body.append('solution', captchaResult);
    //body.append('confirm-button', 'OK');
    let data = {};
    data["solution"] = captchaResult;
    data["confirm-button"] = `OK`;
    let body = querystring.stringify(data);

    //throw(captchaResult)
    let _headers = Object.assign(customHeaders, headers);
    let method = "POST";
    let requestOptions = { method, body, headers: _headers };
    let requestURL = getSharedVariable('action_captcha');
    //throw(requestURL)
    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });


    return responsePage;

};





/*
  pagination 

  */
const parsePaginationMiddle = async function({ responsePage, page }) {
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

const parsePaginationRight = async function({ responsePage, page }) {
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
const paginationEngine = async function({ canonicalURL, responsePage, headers, page }) {
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

            let lastElement = results[results.length - 1];
            let key = Object.keys(lastElement)[0];
            let value = Object.values(lastElement)[0];
            responsePage = await fetchPage({ canonicalURL, requestURL: value, requestOptions });
            let continueLoop = true;
            let firstElement = null;

            // get page count
            let i = page_count - 5;
            page = parseInt(page)
            while (continueLoop) {

                await parsePaginationMiddle({ responsePage, page });

                results = await parsePaginationMiddle({ responsePage, page });
                // get the first element
                firstElement = results[0];
                // get the key
                key = Object.keys(firstElement)[0];
                // get the value
                key = parseInt(key)

                if (key === page) {
                    let value = Object.values(firstElement)[0];
                    responsePage = await fetchPage({ canonicalURL, requestURL: value, requestOptions });
                    await parsePaginationMiddle({ responsePage, page });
                    continueLoop = false;
                    break;
                } else if (page > key) {
                    //
                    let result = results.filter((result) => {
                        let key = Object.keys(result)[0];
                        key = parseInt(key);
                        return key === page;
                    });

                    if (result && result.length > 0) {
                        let value = Object.values(result[0])[0];
                        responsePage = await fetchPage({ canonicalURL, requestURL: value, requestOptions });
                        continueLoop = false;
                        break;

                    }

                } else {

                    // get the value
                    let value = Object.values(firstElement)[0];
                    responsePage = await fetchPage({ canonicalURL, requestURL: value, requestOptions });
                    await parsePaginationMiddle({ responsePage, page });
                    continueLoop = true;


                }
            }
            return responsePage;


        } else {


            let results = null;
            let lastElement = null;
            let key = null;
            let value = null;
            let i = 5;
            let continueLoop = true;
            page = parseInt(page)
            while (continueLoop) {
                results = await parsePaginationMiddle({ responsePage, page });
                // get the last element
                lastElement = results[results.length - 1];
                // get the key
                key = Object.keys(lastElement)[0];
                // get the value
                value = Object.values(lastElement)[0];

                responsePage = await fetchPage({ canonicalURL, requestURL: value, requestOptions });

                await parsePaginationRight({ responsePage, page });
                results = await parsePaginationMiddle({ responsePage, page });

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
                        continueLoop = false;
                        break;


                    } else if (page < key) {

                        let result = results.filter((result) => {
                            let key = Object.keys(result)[0];
                            key = parseInt(key)
                            return key === page;
                        });

                        if (result && result.length > 0) {
                            let value = Object.values(result[0])[0];
                            responsePage = await fetchPage({ canonicalURL, requestURL: value, requestOptions });
                            continueLoop = false;
                            break;


                        }
                    } else {
                        let value = Object.values(lastElement)[0];
                        responsePage = await fetchPage({ canonicalURL, requestURL: value, requestOptions });
                        await parsePaginationRight({ responsePage, page });
                        await parsePaginationMiddle({ responsePage, page });


                        continueLoop = true;
                    }
                }
            }

            return responsePage;
        }

    }
    // get on te current page
    let results = await parsePaginationMiddle({ responsePage, page });

    // use filter to get the key and value
    let result = results.filter((result) => {
        let key = Object.keys(result)[0];
        key = parseInt(key)
        return key === page;
    })

    // now get the value
    let value = Object.values(result[0])[0];
    responsePage = await fetchPage({ canonicalURL, requestURL: value, requestOptions });
    await parsePaginationMiddle({ responsePage, page });
    results = await parsePaginationMiddle({ responsePage, page });
    return responsePage;



}


const pagination = async function({ arguments, canonicalURL, headers, page }) {

    await home({ canonicalURL, headers });
    let responsePage = await selectArea({ arguments, canonicalURL, headers });

    responsePage = await searchDates({ arguments, canonicalURL, headers });

    await parsePaginationMiddle({ responsePage, page });
    await parsePaginationRight({ responsePage, page });
    let paginationResults = await paginationEngine({ canonicalURL, responsePage, headers, page });
    // return [paginationResults]



    let results = await parseResults({ responsePage: paginationResults, canonicalURL, headers });

    let getEachResultInPage = await getEachResult({ results, canonicalURL, responsePage: paginationResults, headers });
    return getEachResultInPage;

}
const getResults = async function({ arguments, canonicalURL, headers }) {
    await home({ canonicalURL, headers });
    let responsePage = await selectArea({ arguments, canonicalURL, headers });

    //let response = await selectAreaRedirect({ canonicalURL, headers });
    responsePage = await searchDates({ arguments, canonicalURL, headers });


    //let responsePage = await searchRedirect({ canonicalURL, headers });
    let results = await parseResults({ responsePage });

    let getEachResultInPage = await getEachResult({ results, canonicalURL, responsePage, headers });
    return getEachResultInPage;
}


const injectHtmlLinks = async function({ arguments, canonicalURL, headers }) {
    let responsePage = await home({ canonicalURL, headers });
    let html = await responsePage.response.buffer();
    let $ = cheerio.load(html);
    const contentContainer = $('.content-container');
    let accounting = $('<a>').attr('href', `https://www.bundesanzeiger.de/pub/en/search?from=${arguments.from}&to=${arguments.to}&areaName=Accounting&area=9999922&page=1`).text('Accounting');
    //let officialSection = $('<a>').attr('href', `https://www.bundesanzeiger.de/pub/en/search?from=${arguments.from}&to=${arguments.to}&areaName=OfficialSections&area=999991&page=1`).text('Official Announcements');
    //let businessClosures = $('<a>').attr('href', `https://www.bundesanzeiger.de/pub/en/search?from=${arguments.from}&to=${arguments.to}&areaName=BusinessClousures&area=999996&page=1`).text('Business Closures');
    // let judicialSection = $('<a>').attr('href', `https://www.bundesanzeiger.de/pub/en/search?from=${arguments.from}&to=${arguments.to}&areaName=JudicialSection&area=999995&page=1`).text('Judicial Section');
    let capitalMarket = $('<a>').attr('href', `https://www.bundesanzeiger.de/pub/en/search?from=${arguments.from}&to=${arguments.to}&areaName=CapitalMarket&area=999997&page=1`).text('Capital Market');
    // let various = $('<a>').attr('href', `https://www.bundesanzeiger.de/pub/en/search?from=${arguments.from}&to=${arguments.to}&areaName=Various Announcements&area=999998&page=1`).text('Various Announcements');
    //  let unofficial = $('<a>').attr('href', `https://www.bundesanzeiger.de/pub/en/search?from=${arguments.from}&to=${arguments.to}&areaName=UnnoficialSection&area=999992&page=1`).text('Unnoficial');

    //contentContainer.append(accounting, officialSection, businessClosures, judicialSection, capitalMarket, various, unofficial)
    contentContainer.append(capitalMarket)

    const modifiedHtml = $.html()
    responsePage.response = new fetch.Response(modifiedHtml, responsePage.response);

    return responsePage
}



//https://www.bundesanzeiger.de/pub/en/search?from=2021-05-23&to=2023-05-25&getSections=sections

async function fetchURL({ canonicalURL, headers }) {
    if (/https?:.*https?:/i.test(canonicalURL)) {
        console.error("Rejecting URL", canonicalURL, `returning [];`);
        return [];
    }

    const isListing = canonicalURL.match(/page=(\d+)/i);
    const isListingSections = canonicalURL.match(/getSections=sections/i);

    if (isListing) {

        let [fromDate, toDate, areaName, area] = canonicalURL.match(/from=([^&]+)&to=([^&]+)&areaName=([^&]+)&area=([^&]+)/).slice(1);
        let arguments = {};

        arguments.areaName = areaName
        arguments.area = area
        arguments.from = fromDate
        arguments.to = toDate

        let page = parseInt(isListing[1]);


        if (page === 1)
            return await getResults({ arguments, canonicalURL, headers })
        return await pagination({ arguments, canonicalURL, headers, page })


    } else if (isListingSections) {

        let [fromDate, toDate] = canonicalURL.match(/from=([^&]+)&to=([^&]+)/).slice(1);
        let arguments = {};
        arguments.from = fromDate
        arguments.to = toDate
        return [await injectHtmlLinks({ arguments, canonicalURL, headers })]
    } else {
        return [await fetchPage({ canonicalURL, headers })]
    }

}