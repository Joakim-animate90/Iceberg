import nodeFetch from "node-fetch";
import url from "url";
import querystring from "querystring";
import moment from "moment";
import fetchCookie from 'fetch-cookie'
import https from "https";
import discoverLinks from "./disc.js";
const fetchWithCookies = fetchCookie(nodeFetch)
const customHeaders = {
    authority: 'www.scj.gob.cl',
    'cache-control': 'no-cache',
    dnt: '1',
    pragma: 'no-cache',
    'sec-ch-ua': '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'same-origin',
    'upgrade-insecure-requests': '1',
    'Accept-Encoding': 'gzip, deflate, br',
     accept: "*/*", 
     Referer: "https://psauthority.org.uk/Regulatory-Decisions",
    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36'
  }
async function fetchPage({canonicalURL, requestURL, requestOptions, headers}) {
    if (!requestOptions) requestOptions = {method: "GET", headers};
    if (!canonicalURL) canonicalURL = requestURL;
    if (!requestURL) requestURL = canonicalURL;
     if (requestURL.match(/^https/i)) {
       requestOptions.agent = new https.Agent({rejectUnauthorized: false, keepAlive: true});
       console.log("using a custom agent");
     }
  
    return await fetchWithCookies(requestURL, requestOptions)
      .then(response => {
      return {
        canonicalURL, request: Object.assign({URL: requestURL}, requestOptions), response
      };
    });
  }
  
  async function fetchURL({canonicalURL, headers}) {
    if(/https:.+page=[0-9]+/.test(canonicalURL)){
      const requestURL = canonicalURL.replace(url.parse(canonicalURL).search, "");
      const { startdate, enddate , page} = url.parse(canonicalURL, true).query;
    
      const _startdate = moment(startdate);
      const _enddate = moment(enddate);
      
      
      const customHeaders = { accept: "*/*", "content-type": "application/x-www-form-urlencoded; charset=UTF-8", Referer: "https://psauthority.org.uk/" }
      const _headers = Object.assign(customHeaders, headers);
      
      const data = {
        daterange: `${_startdate.format("DD/MM/YYYY")} - ${_enddate.format("DD/MM/YYYY")}`,
        startdate: _startdate.format("YYYY-MM-DD"),
        enddate: _enddate.format("YYYY-MM-DD"),
        searchinput: "",
        page: page || 0,    
        bucketPaths:"/sitecore/content/Home/Regulatory Decisions/Adjudications Search",
      };
      
      
      const body = querystring.stringify(data);
     
      const method = "POST";;
      const  requestOptions = { method, body, headers:_headers };
      const responsePage = await fetchPage({canonicalURL, requestURL, requestOptions });
      responsePage.response.headers.set("content-type", "application/json");
      
      
      return [responsePage];
    } else{
      return nodeFetch({canonicalURL, headers});
    }
  }

  fetchURL({canonicalURL: "https://psauthority.org.uk/api/sitecore/AdjudicationSearch/GetAdjudications?startdate=2022-11-30&enddate=2022-11-01&page=0", headers: customHeaders}).then(async response => {
    // get the body of the response
    const content = await response[0].response.text();
    const contentType = response[0].response.headers.get("content-type");
     
    const disc = discoverLinks({content, contentType, canonicalURL: response[0].canonicalURL, requestURL: response[0].request.URL, headers: customHeaders});
    console.log(disc)
    console.log(disc.length)
     
  });
