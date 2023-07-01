function discoverLinks ({ content, contentType, canonicalURL, requestURL }) {
    const links = []
    if (/html/i.test(contentType)) {
      const $ = cheerio.load(content)
      //https://www.csj.gov.py/ResolucionesWeb/Formularios/inicio.aspx?from=${start}&to=${end}&Circunscripción=concepcion&tipoDeResolucion=autoInterlocutorio&page=1&pg=1`
      //https://www.csj.gov.py/ResolucionesWeb/Formularios/inicio.aspx?from=03-01-2023&to=05-09-2023&Circunscripción=concepcion&tipoDeResolucion=autoInterlocutorio&page=1&pg=1
      //match exactly page=1
        //match page=1&pg=1
        let listing = canonicalURL.match(/from=(.*)&to=(.*)&Circunscripción=(.*)&tipoDeResolucion=(.*)&page=(1)&pg=([^&]*)/i)
        let pageNumber = listing[5]
        let from = listing[1]
        let to = listing[2]
        let circ = listing[3]
        let tipo = listing[4]

        if(listing){
            let actualPage = $('#MainContent_listaResultadoTabla_lblTotalNumberOfPages').text()
            console.log('Here is my discoverlink' + actualPage)
            actualPage = parseInt(actualPage)
            pageNumber = 1
            if (pageNumber === 1) {
            if (actualPage){
                for(let i = 2 ; i < actualPage; i++){
                    //create urls for each page
                    let href = `https://www.csj.gov.py/ResolucionesWeb/Formularios/inicio.aspx?from=${from}&to=${to}&Circunscripción=${circ}&tipoDeResolucion=${tipo}&page=${i}&pg=1`
                    href = href ? url.resolve(canonicalURL, href) : null;
                    if (href)
                      links.push(href)
                
                }
                }
            }
        }



      $("a[href]").each(function () {
        let href = $(this).attr('href');
        href = href ? url.resolve(canonicalURL, href) : null;
        if (href)
          links.push(href)
      })
  
    }
  
    return links
  }