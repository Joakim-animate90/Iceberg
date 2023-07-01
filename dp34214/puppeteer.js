
async function fetchPage({ canonicalURL, requestURL, requestOptions, headers }) {
    if (!requestOptions) requestOptions = { method: "GET", headers };
    if (!canonicalURL) canonicalURL = requestURL;
    if (!requestURL) requestURL = canonicalURL;
    requestOptions.agent = new https.Agent({rejectUnauthorized: false, keepAlive: true});
   
  
    return await fetchWithCookies(requestURL, requestOptions)
      .then(response => {
        return {
          canonicalURL,
          request: Object.assign({ URL: requestURL }, requestOptions),
          response
        };
      });
  }
  
  const binaryDownload = async function ({canonicalURL, requestURL, headers, requestOptions}) {
  
  
    let responsePage = await fetchPage({canonicalURL, requestURL, headers, requestOptions});
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
  
  
  async function home({ canonicalURL, headers }) {
    let responses = [];
    //from=01-01-2018&to=09-05-2023&Circunscripción=amambay&tipoDeResolucion=acuerdoSentencia&page=1

    const match = canonicalURL.match(/from=(.*)&to=(.*)&Circunscripción=(.*)&tipoDeResolucion=(.*)&page=(.*)&pg=([^&]*)/i);

  
    let from = match[1];
    let to = match[2];
    let circunscripcion = match[3];
    let tipoDeResolucion = match[4];
    let pageNumber = match[5];

    let circunValue = null
    let tipoDeValue = null

    let circunDic = {
        altoParaguay: '18',
        amambay: '5',
        caazapa: '16',
        canindeyu: '15',
        capital: '1',
        central: '11',
        concepcion: '4',
        cordirella: '12',
        itapua: '3',
        misiones: '9',
        neembucu: '8',
        paraguari: '14',
        presidenteHayes: '19',
        sanPedro: '17',
    }
    let tipoDeDic = {
        acuerdoSentencia: '2',
        sentenciaDefinitiva: '3',
        autoInterlocutorio: '1'
    }


    if(circunscripcion === 'amambay'){
        circunValue = circunDic.amambay
    }else if(circunscripcion === 'caazapa'){
        circunValue = circunDic.caazapa
    }else if(circunscripcion === 'canindeyu'){
        circunValue = circunDic.canindeyu
    }else if(circunscripcion === 'capital'){
        circunValue = circunDic.capital
    }else if(circunscripcion === 'central'){
        circunValue = circunDic.central
    }else if(circunscripcion === 'concepcion'){
        circunValue = circunDic.concepcion
    }else if(circunscripcion === 'cordirella'){
        circunValue = circunDic.cordirella
    }else if(circunscripcion === 'itapua'){
        circunValue = circunDic.itapua
    }else if(circunscripcion === 'misiones'){
        circunValue = circunDic.misiones
    }else if(circunscripcion === 'neembucu'){
        circunValue = circunDic.neembucu
    }else if(circunscripcion === 'paraguari'){
        circunValue = circunDic.paraguari
    }else if(circunscripcion === 'presidenteHayes'){
        circunValue = circunDic.presidenteHayes
    }else if(circunscripcion === 'sanPedro'){
        circunValue = circunDic.sanPedro
    }else if(circunscripcion === 'altoParaguay'){
        circunValue = circunDic.altoParaguay
    }


    if(tipoDeResolucion === 'acuerdoSentencia'){
        tipoDeValue = tipoDeDic.acuerdoSentencia
    }else if(tipoDeResolucion === 'sentenciaDefinitiva'){
        tipoDeValue = tipoDeDic.sentenciaDefinitiva
    }else if(tipoDeResolucion === 'autoInterlocutorio'){
        tipoDeValue = tipoDeDic.autoInterlocutorio
    }




  
  
    // const puppeteerManager = await puppeteer.launch({ headless: false })
     const page = await puppeteerManager.newPage({
      incognito: true,
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15",
      downloadContentTypes: ["application/pdf"]
    });
  
  
    console.log("GOTO>>>>>> " + '');
    await page.goto('https://www.csj.gov.py/ResolucionesWeb/Formularios/inicio.aspx', {
      waitUntil: 'load',timeout : 60000
    }).catch((err) => {
      console.error("Page did not load.", err)
    });
  
    //<input name="ctl00$MainContent$datepickerDesde" type="text" id="MainContent_datepickerDesde" class="form-control hasDatepicker" autocomplete="off">
    // wait for the selector to appear in page
    await page.waitForSelector('input[name="ctl00$MainContent$datepickerDesde"]', { visible: true });
  
    //clear the input
    await page.evaluate(() => {
      document.querySelector('input[name="ctl00$MainContent$datepickerDesde"]').value = '';
  
    });
    // fill the form
    await page.type('input[name="ctl00$MainContent$datepickerDesde"]', `${from}`);
  
    await page.evaluate(() => {
      document.querySelector('input[name="ctl00$MainContent$datepickerHasta"]').value = '';
  
    });
  
  
    await page.type('input[name="ctl00$MainContent$datepickerHasta"]', `${to}`);
  
    await page.select('#MainContent_ddCircunscripcion', `${circunValue}`);
  
    await page.select('#MainContent_ddTipoResolucion', `${tipoDeValue}`);
  
    // <input type="submit" name="ctl00$MainContent$btnFiltro" value="Consultar" id="MainContent_btnFiltro" class="btn btn-primary" style="width: 120px; height: 38px;">
     // Click on a link that opens a new window
     await page.click('#MainContent_btnFiltro');
     console.log('click')
     await page.waitForSelector('#MainContent_listaResultadoTabla_lnkabrirPdf_0', { visible: true });
  
    
  
    // get  the number of pages 
   // <span id="MainContent_listaResultadoTabla_lblTotalNumberOfPages">7</span>
   let numberOfPages = await page.evaluate(() => document.querySelector('#MainContent_listaResultadoTabla_lblTotalNumberOfPages').innerText);
    console.log('numberOfPages', numberOfPages)
    
    // convert to number
    numberOfPages = parseInt(numberOfPages)
    numberOfPages = numberOfPages -1
    while (pageNumber < numberOfPages) {
      let responseBody = await page.evaluate(() => document.documentElement.innerHTML);
      const $ = cheerio.load(responseBody);
      const table = $('#MainContent_listaResultadoTabla')
      const tbody = table.find('tbody')
      const trs = tbody.find('tr')
    
      for (let i = 1; i < trs.length; i++) {
        //get tds 
        const tds = $(trs[i]).find('td')
        let nroResolucion = $(tds[0]).text()
        let fechaDelaResolucion = $(tds[2]).text()
        let canonicalURL = `https://www.csj.gov.py/ResolucionesWeb/Formularios/documentoPDF.aspx?resolucionArchivo&nroResolucion=${nroResolucion}&fechaResolucion=${fechaDelaResolucion}`
    
        // get the link
        const link = $(tds[5]).find('a')
        // get the href and replace the url
         $(link).attr('href', canonicalURL)
  
  
    
      }
  
          let response = null;
          if(pageNumber === 1){
          // get the html USE SIMPLE RESPONSE 
            response =   simpleResponse({
            canonicalURL,
            mimeType: "text/html",
            responseBody: $.html(),
       })
      }else {
        // get the html USE SIMPLE RESPONSE
          response =   simpleResponse({
          canonicalURL:`https://www.csj.gov.py/ResolucionesWeb/Formularios/inicio.aspx?from=${from}&to=${to}&Circunscripción=${circunscripcion}&tipoDeResolucion=${tipoDeResolucion}&page=${pageNumber}&pg=new`,
          mimeType: "text/html",
          responseBody: $.html(),
        })
      }
       responses.push(response)
  
       await page.click('#MainContent_listaResultadoTabla_btnNext');
  
       await page.waitForSelector('#MainContent_listaResultadoTabla_lnkabrirPdf_0', { visible: true });
  
       pageNumber++;
  
      
          
  
  
    }
    return responses
  
  
  
  }
  
  async function fetchURL({ canonicalURL, headers }) {
    // https://www.csj.gov.py/ResolucionesWeb/Formularios/inicio.aspx?from=01-01-1900&to=20-04-2023&page=1
    if (/page=\d+/i.test(canonicalURL)) {
  
      return await home({ canonicalURL, headers });
    }
    // use page only to test
  else {
      return [await fetchPage({ canonicalURL, headers })]
  }
    
    }