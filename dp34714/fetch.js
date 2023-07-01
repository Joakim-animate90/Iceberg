
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

  const fetchFolder = async function ({  canonicalURL, headers }) {
    await home({  canonicalURL, headers });
    //Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8
    //Accept-Encoding: gzip, deflate, br
    //Accept-Language: en-US,en;q=0.9
    let customHeaders = {
      
      "Accept-Language": "en-US,en;q=0.9",
      "Cache-Control": "no-cache",
      "DNT": "1",
      "Pragma": "no-cache",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-User": "?1",
      "Sec-Fetch-Site": "none",
      "Upgrade-Insecure-Requests": "1",
      "sec-ch-ua": "\"Not_A Brand\";v=\"99\", \"Google Chrome\";v=\"109\", \"Chromium\";v=\"109\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
  
      "Accept-Encoding": "gzip, deflate, br",
       "Accept": "application/json, text/javascript, */*; q=0.01",
     

    };
    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    let requestOptions = { method, headers: _headers };
    //https://ambiente.gob.do/wp-admin/admin-ajax.php?juwpfisadmin=false&action=wpfd&task=files.display&view=files&id=${i}&rootcat=704&page=&orderCol=title&orderDir=asc&page_limit=100&type=reglamentos

    let requestURL = canonicalURL.split('&type=')[0]
    //return requestURL
    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });
    let text = responsePage.response.text()
     let hrefs = [];

        let json = JSON.parse(text);
        let total = json.files.length;
        return [total]
    

        for (let i = 0; i < total; i++) {
            let href = json.files[i].linkdownload;
            hrefs.push(href);
        
    }
    return hrefs

    return responsePage;
  };
  

  const home = async function ({  canonicalURL, headers }) {
    //
    //Accept-Encoding: gzip, deflate, br
    //Accept-Language: en-US,en;q=0.9
    let customHeaders = {
       "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Cache-Control": "no-cache",
      "DNT": "1",
      "Pragma": "no-cache",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-User": "?1",
      "Sec-Fetch-Site": "none",
      "Upgrade-Insecure-Requests": "1",
      "sec-ch-ua": "\"Not_A Brand\";v=\"99\", \"Google Chrome\";v=\"109\", \"Chromium\";v=\"109\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
  
      "Accept-Encoding": "gzip, deflate, br",
       
     

    };
    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    let requestOptions = { method, headers: _headers };

  
    let responsePage = await fetchPage({ canonicalURL,  requestOptions });

    return responsePage;
  };
  

  async function fetchURL({ canonicalURL, headers }) {
   
  
    if (/type=.+/i.test(canonicalURL)) {
      return [await fetchFolder({ canonicalURL, headers })]
    } else if (/\.(pdf|docx?)\b/i.test(canonicalURL)) {
      return [await binaryDownload({ canonicalURL, headers })];
        
    }else {
      
      return [await fetchPage({ canonicalURL, headers })]
    
    }
  
  }

