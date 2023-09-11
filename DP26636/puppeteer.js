import puppeteer from 'puppeteer';
import moment from 'moment';





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
  
  
  async function home({ canonicalURL, headers }) {


    
     const page = await puppeteerManager.newPage({
      incognito: true,
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15",
      downloadContentTypes: ["application/pdf"]
    });
  
  
    console.log("GOTO>>>>>> " + '');
    await page.goto('https://esaj.tjms.jus.br/cjsg/consultaCompleta.do', {
      waitUntil: 'load',timeout : 60000
    }).catch((err) => {
      console.error("Page did not load.", err)
    });
    // contentSV:frm2:sancion_valores
    //wait for the selector to load


  
  }
  
  async function fetchURL({ canonicalURL, headers }) {
    // https://wl.superfinanciera.gov.co/SiriWeb/publico/sancion/rep_sanciones_general.jsf?page=1
  
    if (/page=\d+/i.test(canonicalURL)) {
      return await home({ canonicalURL, headers });
    }
  }
  
  
  
 

 