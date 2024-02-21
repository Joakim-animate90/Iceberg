async function fetchPage({ canonicalURL, requestURL, requestOptions, headers }) {
    if (!requestOptions) requestOptions = { method: "GET", headers };
    if (!canonicalURL) canonicalURL = requestURL;
    if (!requestURL) requestURL = canonicalURL;
    return await fetchWithCookies(requestURL, requestOptions, "zone-g1-country-ec")
        .then(response => {
            return {
                canonicalURL,
                request: Object.assign({ URL: requestURL }, requestOptions),
                response
            };
        });
}

async function fetchOtrasHome({ canonicalURL, headers }) {
    //https://www.superbancos.gob.ec/bancos/otras-resoluciones/
    let suffix;
    if (/otras-resoluciones/.test(canonicalURL)) {
        suffix = "otras";
    }
    else {
        suffix = "financiero";
    }

    let requestOptions = {
        "headers": {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "accept-language": "en-US,en;q=0.9",
            "cache-control": "no-cache",
            "pragma": "no-cache",
            "sec-ch-ua": "\"Chromium\";v=\"110\", \"Not A(Brand\";v=\"24\", \"Google Chrome\";v=\"110\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Linux\"",
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "none",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1"
        },
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET"
    };
    let responsePage = await fetchPage({ canonicalURL, requestOptions });
    let html = await responsePage.response.text();
    let $ = cheerio.load(html);
    let div = $("div.wpcp-module.ShareoneDrive.files.jsdisabled");
    let listtoken = div.attr("data-token");
    listtoken && setSharedVariable(`listtoken${suffix}`, listtoken);
    let drive_id = div.attr("data-drive-id");
    drive_id && setSharedVariable(`drive_id${suffix}`, drive_id);
    let account_id = div.attr("data-account-id");
    account_id && setSharedVariable(`account_id${suffix}`, account_id);
    let folderPath = div.attr("data-path");
    folderPath && setSharedVariable(`folderPath${suffix}`, folderPath);
    let script = $("script#ShareoneDrive-js-extra");
    let obj = $(script).html().replace(/^.*var\s+ShareoneDrive_vars\s*=\s*/, "").trim().replace(/;\s*$/, "");
    let patt = /refresh_nonce.*:(.+),.*gallery_nonce/;
    let match = patt.exec(obj)
    let _ajax_nonce = match[1].replace(/"/g, "");
    _ajax_nonce && setSharedVariable(`_ajax_nonce${suffix}`, _ajax_nonce);


    responsePage.response = new fetch.Response($.html(), responsePage.response);
    return responsePage;
}

async function fetchOtrasYearsList({ canonicalURL, headers }) {
    let suffix;
    let sort;
    if (/otras-resoluciones/.test(canonicalURL)) {
        suffix = "otras";
        sort = "name:desc";
    }
    else {
        suffix = "financiero";
        sort = "datetaken: desc";
    }

    let responses = [];

    let listtoken = getSharedVariable(`listtoken${suffix}`);
    let drive_id = getSharedVariable(`drive_id${suffix}`);
    let account_id = getSharedVariable(`account_id${suffix}`);
    let folderPath = getSharedVariable(`folderPath${suffix}`);
    let _ajax_nonce = getSharedVariable(`_ajax_nonce${suffix}`);

    if (!(listtoken && drive_id && account_id && folderPath && _ajax_nonce)) {
        throw new Error("parameters for fetching years not available")
    }

    let customHeaders = {
        "Cache-Control": "no-cache",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Origin": "https://www.superbancos.gob.ec",
        "Pragma": "no-cache",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "X-Requested-With": "XMLHttpRequest",
        "sec-ch-ua": "\"Chromium\";v=\"110\", \"Not A(Brand\";v=\"24\", \"Google Chrome\";v=\"110\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Linux\"",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);

    const data = {};
    data["listtoken"] = `${listtoken}`;
    data["drive_id"] = `${drive_id}`;
    data["account_id"] = `${account_id}`;
    data["lastFolder"] = ``;
    data["folderPath"] = `${folderPath}`;
    data["sort"] = `${sort}`;
    data["action"] = `shareonedrive-get-filelist`;
    data["_ajax_nonce"] = `${_ajax_nonce}` || `47cf6f267e`;
    data["mobile"] = ``;
    data["query"] = ``;
    data["page_url"] = `${canonicalURL}`;

    let body = querystring.stringify(data);

    let method = "POST";
    let requestOptions = { method, body, headers: _headers, json: true };
    let requestURL = 'https://www.superbancos.gob.ec/bancos/wp-admin/admin-ajax.php';
    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });
    responsePage.canonicalURL = `${canonicalURL}?yearslist=`
    let json = await responsePage.response.text();
    //
    let years = [];
    let jsonObj = JSON.parse(json);
    let html = jsonObj.html;
    let $ = cheerio.load(html);
    $("div.entry.folder").each(function (i, div) {
        let id = $(div).attr('data-id');
        let driveId = $(div).attr('data-drive-id');
        let data_name = $(div).attr('data-name');
        let year = /[0-9]+/.exec(data_name)[0];
        years.push(year);
        setSharedVariable(`idFor${year}_${suffix}`, id);
        setSharedVariable(`driveIdFor${year}_${suffix}`, driveId);
    })
    let driveId = jsonObj["driveId"];
    driveId && setSharedVariable(`driveId${suffix}`, driveId);
    let accountId = jsonObj["accountId"];
    accountId && setSharedVariable(`accountId${suffix}`, accountId);
    let lastFolder = jsonObj["lastFolder"];
    lastFolder && setSharedVariable(`lastFolder${suffix}`, lastFolder);
    let folderPathForYear = jsonObj["folderPath"];
    folderPathForYear && setSharedVariable(`folderPathForYear${suffix}`, folderPathForYear);

    if (!(driveId && accountId && lastFolder && folderPathForYear)) {
        throw new Error("parameters for fetching individual years not available")
    }
    responsePage.response.headers.set('content-type', 'application/json');
    //responsePage.response.body = JSON.stringify(jsonObj);
    responsePage.response = new fetch.Response(JSON.stringify(jsonObj), responsePage.response);
    responses.push(responsePage);

    $ = cheerio.load('<div id="appended_links"></div>')
    for (let i in years) {
        let href = `${canonicalURL}?year=${years[i]}`;
        $('div#appended_links').append(`<a href=${href}>${years[i]}</a></br>`)
    }

    responses.push(simpleResponse({
        canonicalURL: `${canonicalURL}?years=`,
        mimeType: "text/html",
        responseBody: $.html(),
        locale: "es"
    }));

    return responses;
}

async function fetchOtrasYear({ year, canonicalURL, headers }) {
    // //https://www.superbancos.gob.ec/bancos/otras-resoluciones/?year=2023
    let suffix;
    let sort;
    let page_url;
    if (/otras-resoluciones/.test(canonicalURL)) {
        suffix = "otras";
        sort = "name:desc"
        page_url = "https://www.superbancos.gob.ec/bancos/otras-resoluciones/";
    }
    else {
        suffix = "financiero";
        sort = "datetaken: desc";
        page_url = "https://www.superbancos.gob.ec/bancos/circulares-sistema-financiero/";
    }

    let responses = [];

    let idForYear = getSharedVariable(`idFor${year}_${suffix}`);
    let driveIdForYear = getSharedVariable(`driveIdFor${year}_${suffix}`);//usually similar with driveId
    let driveId = getSharedVariable(`driveId${suffix}`);
    let accountId = getSharedVariable(`accountId${suffix}`);
    let lastFolder = getSharedVariable(`lastFolder${suffix}`);
    let folderPathForYear = getSharedVariable(`folderPathForYear${suffix}`);

    let listtoken = getSharedVariable(`listtoken${suffix}`);
    let _ajax_nonce = getSharedVariable(`_ajax_nonce${suffix}`);

    if (!(idForYear && driveIdForYear && accountId && lastFolder && folderPathForYear)) {
        throw new Error("parameters not available for fetchotrasyear");
    }

    let customHeaders = {
        "Cache-Control": "no-cache",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Origin": "https://www.superbancos.gob.ec",
        "Pragma": "no-cache",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "X-Requested-With": "XMLHttpRequest",
        "sec-ch-ua": "\"Chromium\";v=\"110\", \"Not A(Brand\";v=\"24\", \"Google Chrome\";v=\"110\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Linux\"",
        "Accept-Encoding": "gzip, deflate, br"
    };

    let _headers = Object.assign(customHeaders, headers);

    const data = {};
    data["id"] = `${idForYear}`;
    data["drive_id"] = `${driveIdForYear}`;
    data["listtoken"] = `${listtoken}`;
    data["account_id"] = `${accountId}`;
    data["lastFolder"] = `${lastFolder}`;
    data["folderPath"] = `${folderPathForYear}`;
    data["sort"] = `${sort}`;
    data["action"] = `shareonedrive-get-filelist`;
    data["_ajax_nonce"] = `${_ajax_nonce}`;
    data["mobile"] = `false`;
    data["query"] = ``;
    data["page_url"] = `${page_url}`;

    let body = querystring.stringify(data);
    let method = "POST";
    let requestOptions = { method, body, headers: _headers, json: true };
    let requestURL = 'https://www.superbancos.gob.ec/bancos/wp-admin/admin-ajax.php';
    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });
    //extract html
    let json = await responsePage.response.text();
    let jsonObj = JSON.parse(json);
    let html = jsonObj.html;
    let $ = cheerio.load(html);

    let folderURIS = [];
    //extract params for fetching folders
    let folderElems = $("div.entry.folder").not(".pf");
    folderElems.each(function (i, div) {
        let id = $(div).attr('data-id');
        let driveId = $(div).attr('data-drive-id');
        let data_name = $(div).attr('data-name');
        setSharedVariable(`idFor${id}_${year}_${suffix}`, id);
        setSharedVariable(`driveIdFor${id}_${year}_${suffix}`, driveId);
        let href = `${canonicalURL}&folderId=${id}`;
        folderURIS.push(href);
        $(div).append(`<a id="appended_links" href=${href}>${data_name}</a>`)
    })
    let driveIdForFolder = jsonObj["driveId"];
    setSharedVariable(`driveIdFor${year}Folder${suffix}`, driveIdForFolder);
    let accountIdForFolder = jsonObj["accountId"];
    setSharedVariable(`accountIdFor${year}Folder${suffix}`, accountIdForFolder);
    let lastFolderForFolder = jsonObj["lastFolder"];
    setSharedVariable(`lastFolderFor${year}Folder${suffix}`, lastFolderForFolder);
    let folderPathForFolder = jsonObj["folderPath"];
    setSharedVariable(`folderPathFor${year}Folder${suffix}`, folderPathForFolder);

    if (!(driveIdForFolder && accountIdForFolder && lastFolderForFolder && folderPathForFolder)) {
        throw new Error("content not available for year");
    }
    //
    for (let j in folderURIS) {
        let canonicalURL = folderURIS[j];
        let id = /folderId=(.+)/.exec(canonicalURL.trim())[1];
        let folderHtml = await fetchFolder({ year, id, canonicalURL, headers, notFromDisc: true });
        jsonObj[`folderHtmlFor${id}`] = folderHtml;
    }
    //
    responses.push(
        simpleResponse({
            canonicalURL: `${canonicalURL}&html=`,
            mimeType: "text/html",
            responseBody: $.html(),
            locale: "es"
        })
    )

    responsePage.response.headers.set('content-type', 'application/json');
    responsePage.response = new fetch.Response(JSON.stringify(jsonObj), responsePage.response);
    responses.push(responsePage);
    return responses;

}

async function fetchFolder({ year, id, canonicalURL, headers, notFromDisc }) {
    let suffix;
    let sort;
    let page_url;
    if (/otras-resoluciones/.test(canonicalURL)) {
        suffix = "otras";
        sort = "name:desc";
        page_url = "https://www.superbancos.gob.ec/bancos/otras-resoluciones/";
    }
    else {
        suffix = "financiero";
        sort = "datetaken: desc";
        page_url = "https://www.superbancos.gob.ec/bancos/circulares-sistema-financiero/";
    }

    let responses = [];

    let idForFolder = getSharedVariable(`idFor${id}_${year}_${suffix}`);
    let driveIdForFolder = getSharedVariable(`driveIdFor${id}_${year}_${suffix}`);
    let listtoken = getSharedVariable(`listtoken${suffix}`);
    let driveId = getSharedVariable(`driveIdFor${year}Folder`);//same as driveIdForFolder
    let accountIdForFolder = getSharedVariable(`accountIdFor${year}Folder${suffix}`);
    let lastFolderForFolder = getSharedVariable(`lastFolderFor${year}Folder${suffix}`);
    let folderPathForFolder = getSharedVariable(`folderPathFor${year}Folder${suffix}`);
    let _ajax_nonce = getSharedVariable(`_ajax_nonce${suffix}`);

    if (!(idForFolder && driveIdForFolder && listtoken && accountIdForFolder && lastFolderForFolder && folderPathForFolder && _ajax_nonce)) {
        throw new Error("did not find some parameters to fetch folder");
    }

    let customHeaders = {
        "Cache-Control": "no-cache",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Origin": "https://www.superbancos.gob.ec",
        "Pragma": "no-cache",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "X-Requested-With": "XMLHttpRequest",
        "sec-ch-ua": "\"Chromium\";v=\"110\", \"Not A(Brand\";v=\"24\", \"Google Chrome\";v=\"110\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Linux\"",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);

    const data = {};
    data["id"] = `${idForFolder}`;
    data["drive_id"] = `${driveIdForFolder}`;
    data["listtoken"] = `${listtoken}`;
    data["account_id"] = `${accountIdForFolder}`;
    data["lastFolder"] = `${lastFolderForFolder}`;
    data["folderPath"] = `${folderPathForFolder}`;
    data["sort"] = `${sort}`;
    data["action"] = `shareonedrive-get-filelist`;
    data["_ajax_nonce"] = `${_ajax_nonce}`;
    data["mobile"] = `false`;
    data["query"] = ``;
    data["page_url"] = `${page_url}`;


    let body = querystring.stringify(data);

    let method = "POST";
    let requestOptions = { method, body, headers: _headers, json: true };
    let requestURL = 'https://www.superbancos.gob.ec/bancos/wp-admin/admin-ajax.php';
    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });
    //extract folder html
    let json = await responsePage.response.text();
    let jsonObj = JSON.parse(json);
    let html = jsonObj.html;
    let $ = cheerio.load(html);
    //check if json html has files or folders
    let hasFiles = $("div.entry.file").length || $("div.entry.folder").not(".pf").length
    hasFiles && responses.push(
        simpleResponse({
            canonicalURL: `${canonicalURL}&html=`,
            mimeType: "text/html",
            responseBody: $.html(),
            locale: "es"
        })
    )

    responsePage.response.headers.set('content-type', 'application/json');
    responsePage.response = new fetch.Response(JSON.stringify(jsonObj), responsePage.response);
    responses.push(responsePage);
    if (notFromDisc) {
        return html;
    }
    else {
        return responses;
    }

}

async function fetchDoc({ canonicalURL, headers }) {
    let requestOptions = {
        "headers": {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "accept-language": "en-US,en;q=0.9",
            "cache-control": "no-cache",
            "pragma": "no-cache",
            "sec-ch-ua": "\"Chromium\";v=\"110\", \"Not A(Brand\";v=\"24\", \"Google Chrome\";v=\"110\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Linux\"",
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "none",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1"
        },
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET"
    };

    let responsePage = await fetchPage({ canonicalURL, requestOptions });
    let type = responsePage.response.headers.get('content-type');
    let contentDisposition = responsePage.response.headers.get('Content-Disposition')
    if (/zip/.test(contentDisposition) || /zip/.test(type)) {
        return await handleZip({ canonicalURL, requestOptions, headers });
    } else {
        let responsePage = await binaryDownload({ canonicalURL, requestOptions });
        return [responsePage];
    }
};

const handleZip = async function ({ canonicalURL, requestOptions, headers }) {
    let responsePage = await fetchPage({ canonicalURL, requestOptions, headers });
    let out = [];
    if (responsePage && responsePage.response.ok) {
        out = await unzip({ request: responsePage.request, response: responsePage.response });
        let accepted = [];
        let $ = cheerio.load("<html lang='en'><body><h2>Contents</h2><ol id='zip-content-links'></ol></body></html>");
        let ul = $("ol#zip-content-links");
        for (let i = 0; i < out.length; i++) {
            let responsePage = out[i];
            responsePage.canonicalURL = encodeURI(decodeURI(responsePage.canonicalURL));
            ul.append(`<li><a href="${responsePage.canonicalURL}">${responsePage.canonicalURL}</a></li>\n`);
            let contentType = responsePage.response.headers.get("content-type");
            if (/empty|spreadsheet|excel/i.test(contentType)) {
                continue;
            }
            if (/\.pdf$/i.test(responsePage.canonicalURL)) {
                responsePage.response.headers.set('content-type', "application/pdf");
            } else if (/\.doc$/i.test(responsePage.canonicalURL)) {
                responsePage.response.headers.set('content-type', "application/msword");
            } else if (/\.docx$/i.test(responsePage.canonicalURL)) {
                responsePage.response.headers.set('content-type', "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
            } else if (/\.html?$/i.test(responsePage.canonicalURL)) {
                responsePage.response.headers.set('content-type', "text/html");
            } else if (/\.txt$/i.test(responsePage.canonicalURL)) {
                responsePage.response.headers.set('content-type', "text/plain");
            } else if (/\.xml$/i.test(responsePage.canonicalURL)) {
                responsePage.response.headers.set('content-type', "text/xml");
            } else if (/\.json$/i.test(responsePage.canonicalURL)) {
                responsePage.response.headers.set('content-type', "application/json");
            } else {
                continue;
            }
            accepted.push(responsePage);
        }
        out = accepted;
        out.push(simpleResponse({ canonicalURL, mimeType: "text/html", responseBody: $.html() }))
    }
    return out;
};

const binaryDownload = async function ({ canonicalURL, requestURL, headers, requestOptions }) {
    let responsePage = await fetchPage({ canonicalURL, requestURL, headers, requestOptions });
    let type = responsePage.response.headers.get('content-type');
    if (/octet/i.test(type)) {
        let name = responsePage.response.headers.get('content-disposition');
        let newtype = /\.pdf/i.test(name) ? "application/pdf" : /\.docx/i.test(name) ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" : /\.doc/i.test(name) ? "application/msword" : null;
        console.log('disposition:', type, name);
        if (newtype) {
            responsePage.response.headers.set('content-type', newtype);
            type = newtype;
            type && console.log(`TYPE = ${type}`);
        }
    }
    type && console.log(`TYPE = ${type}`);
    if (responsePage.response.ok && /pdf|word/i.test(type)) {//Make sure your binary fileType is permitted by this regex
        let contentSize = parseInt(responsePage.response.headers.get('content-length') || "-1");
        let buffer = await responsePage.response.buffer();
        let bufferLength = buffer.length;
        if (contentSize < 0 || bufferLength === contentSize) {
            responsePage.response = new fetch.Response(buffer, responsePage.response);
        } else if (contentSize == 0 || bufferLength == 0) {//empty response
            responsePage.response.ok = false;
            responsePage.response.status = 404;
            responsePage.response.statusText = `Empty ${type} document download: ${contentSize} > ${bufferLength}\n`.toUpperCase();
            responsePage.response = new fetch.Response(responsePage.response.statusText, responsePage.response);
        } else {
            responsePage.response.ok = false;
            responsePage.response.status = 502;
            responsePage.response.statusText = `incomplete ${type} document download: ${contentSize} > ${bufferLength}\n`.toUpperCase();
            responsePage.response = new fetch.Response(responsePage.response.statusText, responsePage.response);
        }
    } else if (responsePage.response.ok && !/pdf|word/i.test(type)) {
        responsePage.response.ok = false;
        responsePage.response.statusText = `either not pdf, or request did not succeed: ${responsePage.response.status} && ${type}\n`.toUpperCase();
        responsePage.response.status = 502;
        responsePage.response = new fetch.Response(responsePage.response.statusText, responsePage.response);
    }
    return responsePage;
};

async function fetchURL({ canonicalURL, headers }) {
    if (/https?:.*https?:/i.test(canonicalURL)) {
        console.error("Rejecting URL", canonicalURL, `returning [];`);
        return [];
    }

    let docPatt1 = /https:\/\/www\.superbancos\.gob\.ec\/bancos\/wp-admin\/admin-ajax\.php\?action=shareonedrive-download\&dl=1\&id=.+\&drive_id=.+\&account_id=.+\&listtoken=.+/;//Descargar fichero
    let docPatt2 = /https:\/\/www\.superbancos\.gob\.ec\/bancos\/wp-admin\/admin-ajax\.php\?action=shareonedrive-download\&id=.+\&dl=1\&account_id=.+\&drive_id=.+\&listtoken=.+/;
    let docPatt3 = /https:\/\/www\.superbancos\.gob\.ec\/bancos\/wp-admin\/admin-ajax\.php\?action=shareonedrive-download\&id=.+\&account_id=.+\&drive_id=.+\&listtoken=.+/;


    if (/https:\/\/www\.superbancos\.gob\.ec\/bancos\/(otras-resoluciones|circulares-sistema-financiero)\/$/.test(canonicalURL)) {
        let responsePage = await fetchOtrasHome({ canonicalURL, headers });
        let responses = await fetchOtrasYearsList({ canonicalURL, headers });
        responses.unshift(responsePage);
        return responses;

    }
    else if (/https:\/\/www\.superbancos\.gob\.ec\/bancos\/(otras-resoluciones|circulares-sistema-financiero)\/\?year=[0-9]+$/.test(canonicalURL)) {
        let year = /year=([0-9]{4})/.exec(canonicalURL.trim())[1];
        let responses = await fetchOtrasYear({ year, canonicalURL, headers });
        return responses;
    }
    else if (/https:\/\/www\.superbancos\.gob\.ec\/bancos\/(otras-resoluciones|circulares-sistema-financiero)\/\?year=[0-9]+.+folderId=.+/.test(canonicalURL)) {
        let patt = /https:\/\/www\.superbancos\.gob\.ec\/bancos\/(otras-resoluciones|circulares-sistema-financiero)\/\?year=([0-9]+).+folderId=(.+)/;
        let match = patt.exec(canonicalURL.trim());
        let year = match[2];
        let id = match[3];
        id = decodeURIComponent(id.trim());
        let responses = await fetchFolder({ year, id, canonicalURL, headers })
        return responses;

    }
    else {
        let responses = await fetchDoc({ canonicalURL, headers });
        return responses;
    }

}