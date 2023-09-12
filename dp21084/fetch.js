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
  
  async function docsPagination({ canonicalURL, headers }) {
    console.log("URLRLLR", canonicalURL);
    var type = canonicalURL.match(/(circulares|autos)\?page\=([0-9]+)/)[1]
    var page = canonicalURL.match(/(circulares|autos)\?page\=([0-9]+)/)[2];
    let pageNext = parseInt(page) + 20
    var query = querystring.stringify({
      "p":"next",
      "p1": page,
      "p2": pageNext
    });
  
    let requestOptions = {
      method: "POST", body: query, headers: {
        'Connection': 'keep-alive',
        'Cache-Control': 'max-age=0',
        'sec-ch-ua': '"Google Chrome";v="95", "Chromium";v="95", ";Not A Brand";v="99"',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'X-Requested-With': 'XMLHttpRequest',
        'sec-ch-ua-mobile': '?1',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Mobile Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://www.supernotariado.gov.co',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Dest': 'document',
        'Referer': `https://www.supernotariado.gov.co/transparencia/normatividad/${type}/`,
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8,und;q=0.7,it;q=0.6,pt;q=0.5,fr;q=0.4'
      }
    };
    let req = `https://www.supernotariado.gov.co/transparencia/normatividad/${type}/`;
    let responsePage = await fetchPage({ canonicalURL: canonicalURL, requestURL: req, requestOptions });
    //-------------------------------------------
    let html = await responsePage.response.text();
    let $ = cheerio.load(html);
    $('div[class*="download"]').each((i, e) => {
      let link = $(e).find('a').attr('href');
      if (link) {
        console.log("LINK_PDF:", link);
        let link_modified = link.replace('servicios', 'www');
        $(e).find("a").attr("href", link_modified);
  
      }
  
    })
    responsePage.response = new fetch.Response($.html(), responsePage.response);
    //--------------------------------------------
    return [responsePage];
  }
  async function fetchFirst({ canonicalURL, headers }) {
  
    let requestOptions = {
      method: "GET", headers: {
        'Connection': 'keep-alive',
        'Cache-Control': 'max-age=0',
        'sec-ch-ua': '"Google Chrome";v="95", "Chromium";v="95", ";Not A Brand";v="99"',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'X-Requested-With': 'XMLHttpRequest',
        'sec-ch-ua-mobile': '?1',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Mobile Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://www.supernotariado.gov.co',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Dest': 'document',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8,und;q=0.7,it;q=0.6,pt;q=0.5,fr;q=0.4'
      }
    };
  
    let responsePage = await fetchPage({ canonicalURL, requestOptions });
    //-------------------------------------------
    let html = await responsePage.response.text();
    let $ = cheerio.load(html);
    $('div[class*="download"]').each((i, e) => {
      let link = $(e).find('a').attr('href');
      if (link) {
        console.log("LINK_PDF:", link);
        let link_modified = link.replace('servicios', 'www');
        $(e).find("a").attr("href", link_modified);
  
      }
  
    })
    const resultCountText = $('.elementor-widget-container.paginacion_top form div').text();
    const matches = resultCountText.match(/resultados (\d+)/);
    let resultCount = matches ? matches[1] : null;
    resultCount = parseInt(resultCount)
    const type = canonicalURL.match(/(circulares|autos)\?page\=([0-9]+)/)[1]
    //create a link adding 20 on each https://www.supernotariado.gov.co/transparencia/normatividad/autos?page=${page}
    //use resultCount 
    for(let i = 20 ; i <= resultCount ; i+=20){
        //create url 
        let url = `https://www.supernotariado.gov.co/transparencia/normatividad/${type}?page=${i}`
        appendLinkToBody($,i, url)
    }
    responsePage.response = new fetch.Response($.html(), responsePage.response);
    //--------------------------------------------
    return [responsePage];
  
  }

function appendLinkToBody($,linkText, href) {
    let linkElement = $('<a></a>').attr('href',href).text(linkText);
    $('body').append(linkElement);
  }

  
  async function fetchURL({ canonicalURL, headers }) {
    if (/https:\/\/www\.supernotariado\.gov\.co\/transparencia\/normatividad\/(circulares|autos)\/$/.test(canonicalURL)) {
      return await fetchFirst({ canonicalURL, headers });
    }
    else if (/https:\/\/www\.supernotariado\.gov\.co\/transparencia\/normatividad\/(circulares|autos)\?page\=[0-9]+/.test(canonicalURL)) {
      return await docsPagination({ canonicalURL, headers });
    } else if (/https:\/\/(servicios|www)\.supernotariado\.gov\.co\/files\/(snrcirculares|autos)/.test(canonicalURL)) {
      //check if canonicalURL has www 
      if(/www/i.test(canonicalURL)){
        canonicalURL = canonicalURL.replace('www', 'servicios')
      }

      let canonicalURL_modified = canonicalURL.replace('servicios', 'www');

      console.log("LINK_modified:", canonicalURL_modified);
      let requestOptions = {
        method: "GET", body: {}, headers: {
          'Connection': 'keep-alive',
          'Cache-Control': 'max-age=0',
          'sec-ch-ua': '"Google Chrome";v="95", "Chromium";v="95", ";Not A Brand";v="99"',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
          'sec-ch-ua-mobile': '?1',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Mobile Safari/537.36',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-User': '?1',
          'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8,und;q=0.7,it;q=0.6,pt;q=0.5,fr;q=0.4'
        }
      };
      let responsePage = await fetchPage({ canonicalURL: canonicalURL_modified, requestURL: canonicalURL, requestOptions });
      responsePage.response.headers.set("content-type", "application/pdf");
      return [responsePage];
    }
    else {
      return defaultFetchURL(({ canonicalURL, headers }));
  
    }
  }