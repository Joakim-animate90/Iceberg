
import puppeteer from 'puppeteer';
import moment from 'moment';

async function fetchPage({canonicalURL, requestURL, requestOptions, headers}) {
    if (!requestOptions) requestOptions = {method: "GET", headers};
    if (!canonicalURL) canonicalURL = requestURL;
    if (!requestURL) requestURL = canonicalURL;
  	// "zone-g1-country-cl"
  	return await fetchWithCookies(requestURL, requestOptions)
        .then(response => {
            return {
                canonicalURL,
                request: Object.assign({URL: requestURL}, requestOptions),
                response
            };
        });
}

async function getSearchSentences({canonicalURL, headers}) {
  	let year = canonicalURL.match(/https:\/\/www\.portaltransparencia\.cl\/PortalPdT\/directorio-de-organismos-regulados\/\?org\=AU004\?year=([0-9]+)\&month=(.+)\&type=(.+)/)[1];
  	let month = canonicalURL.match(/https:\/\/www\.portaltransparencia\.cl\/PortalPdT\/directorio-de-organismos-regulados\/\?org\=AU004\?year=([0-9]+)\&month=(.+)\&type=(.+)/)[2];
  	let type = canonicalURL.match(/https:\/\/www\.portaltransparencia\.cl\/PortalPdT\/directorio-de-organismos-regulados\/\?org\=AU004\?year=([0-9]+)\&month=(.+)\&type=(.+)/)[3];
    const puppeteerManager = await puppeteer.launch({ headless: false })
	const page = await puppeteerManager.newPage({
		incognito: true,
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15",
	});
  
  	console.log("GOTO>>>>>> " + canonicalURL);
  	await page.goto('https://www.portaltransparencia.cl/PortalPdT/directorio-de-organismos-regulados/?org=AU004', {
    	waitUntil: 'load',
        timeout: 30000
	}).catch((err) => {
    	console.error("Page did not load.", err);
	});
  
  	//await page.waitForTimeout(20000);
    const elementId = 'A6428:formInfo:j_idt28:1:datalist:0:j_idt32:1:j_idt36';
 
  	await page.waitForSelector("a[id='A6428:formInfo:j_idt28:1:datalist:0:j_idt32:1:j_idt36']", {visible: true});
  	await page.evaluate(() => document.querySelector("a[id='A6428:formInfo:j_idt28:1:datalist:0:j_idt32:1:j_idt36']").click());
  	await page.waitForTimeout(20000);
  	//var $ = cheerio.load(await page.content());
  	if (year) {
		let yearXpathSelector = `//div/a[contains(text(), '${year}')]`;
        let yearExpandButtonFound = true;
        await page.waitForXPath(yearXpathSelector, { visible: true })
        	.catch(e => {
            	console.error(`Could not find year expand button ${yearXpathSelector}`);
                yearExpandButtonFound = false;
		});
        
      	if (yearExpandButtonFound) {
        	let elements = await page.$x(yearXpathSelector)
            console.log(`${elements.length} year selectors matched Xpath ${yearXpathSelector}`);
            await elements[0].click();
            await page.waitForTimeout(2000);
		}
  	} else {
  		return [];
  	}
  
  	if (month) {
    	let monthXpathSelector = `//li/a[contains(text(), '${month}')]`;
        let monthExpandButtonFound = true;
        await page.waitForXPath(monthXpathSelector, { visible: true })
        	.catch(e => {
            	console.error(`Could not find year expand button ${monthXpathSelector}`);
                monthExpandButtonFound = false;
			});
		if (monthExpandButtonFound) {
        	let elements = await page.$x(monthXpathSelector)
            console.log(`${elements.length} year selectors matched Xpath ${monthXpathSelector}`);
            await elements[0].click();
            await page.waitForTimeout(2000);
		}
  	} else {
        return [];
  	}
  
  	if (type) {
    	let typeXpathSelector = `//li/a[contains(text(), '${type}')]`;
        let typeExpandButtonFound = true;
        await page.waitForXPath(typeXpathSelector, { visible: true })
        	.catch(e => {
            	console.error(`Could not find year expand button ${typeXpathSelector}`);
                typeExpandButtonFound = false;
			});
		if (typeExpandButtonFound) {
        	let elements = await page.$x(typeXpathSelector)
            console.log(`${elements.length} year selectors matched Xpath ${typeXpathSelector}`);
            await elements[0].click();
            await page.waitForTimeout(2000);
		}
  	} else {
  		return [];
  	}
  
  	//await page.waitForSelector("a[id='A6428:formInfo:j_idt79:7:j_idt80']", {visible: true});
  	//await page.evaluate(() => document.querySelector("a[id='A6428:formInfo:j_idt79:7:j_idt80']").click());
  
  	let responseBody = await page.evaluate(() => document.documentElement.outerHTML);
  	let canonical = canonicalURL.replace(/ +/g,'_');
  	console.log("PROCESSING URLLLL... " + canonicalURL);
  	return [
    	simpleResponse({
      		canonicalURL: canonical,
      		mimeType: "text/html",
      		responseBody: responseBody,
    	})
  	];
}

const getSearchSentencesDetail = async function ({canonicalURL, headers}) {
   	let requestOptions = {
      	method: "GET",
      	body: {},
      	headers: {
            "Connection": "keep-alive",
            "Cache-Control": "max-age=0",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "sec-ch-ua-mobile": "?0",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-User": "?1",
            "Sec-Fetch-Dest": "document",
            "X-Requested-With": "XMLHttpRequest",
            "Upgrade-Insecure-Requests": "1",
            "User-Agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Mobile Safari/537.36",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Accept-Language": "es-ES,es;q=0.9,en;q=0.8,und;q=0.7,it;q=0.6,pt;q=0.5,fr;q=0.4"
		}
	};
    let requestURL = canonicalURL.replace(/\&id=.+/,'');
    let canonical = canonicalURL.replace(/tokenDocumento=.+\&id/,'id');
    canonical = canonical.replace(/\:8080/,'');
    let response_detail = await fetchPage({canonicalURL: canonical, requestURL: requestURL, requestOptions});
    return response_detail;
};

const downloadPdf =  async function ({canonicalURL , headers}) {
	await fetchPage({canonicalURL, headers});
	let requestOptions = {
      	method: "GET",
      	body: {},
      	headers: {
            "Connection": "keep-alive",
            "Cache-Control": "max-age=0",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua": '"Google Chrome";v="105", "Not)A;Brand";v="8", "Chromium";v="105"',
            "sec-ch-ua-platform": '"macOS"',
            "Sec-Fetch-Site": "same-origin",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Dest": "document",
            "X-Requested-With": "XMLHttpRequest",
            "Upgrade-Insecure-Requests": "1",
            "User-Agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Mobile Safari/537.36",
            "Referer": canonicalURL,
            "Accept-Language": "es-ES,es;q=0.9,en;q=0.8,und;q=0.7,it;q=0.6,pt;q=0.5,fr;q=0.4"
    	}
	};
    let requestURL = 'https://wlhttp.sec.cl/timesM/MuestraArchivo';
    let responsePdf = await fetchPage({canonicalURL: canonicalURL, requestURL: requestURL, requestOptions});
    return responsePdf;
};

async function fetchURL({canonicalURL, headers}) {
	var responses = [];
  	if (canonicalURL.match(/^https:\/\/www\.portaltransparencia\.cl\/PortalPdT\/directorio-de-organismos-regulados\/\?org\=AU004\?year=[0-9]+\&month=.+\&type/m)){    	
		let response_listing = await getSearchSentences({canonicalURL, headers});
    	if (response_listing) {
        	responses = responses.concat(response_listing);
        }
  	} else if (/https:\/\/wlhttp\.sec\.cl\/timesM\/global\/mostrarDocumentosTransparencia\.jsp/.test(canonicalURL)){
  		let response_pdf = await downloadPdf({canonicalURL, headers});
      	if (response_pdf && response_pdf.response.status == "200") {
 			responses.push(response_pdf);
    	}
    } 
    return responses;
}
fetchURL({ canonicalURL: `https://www.portaltransparencia.cl/PortalPdT/directorio-de-organismos-regulados/?org=AU004?year=2023&month=Mayo&type=Recursos de Reposición` }).catch((err) => { console.log(err) }).then((res) => { console.log(res) })
