async function parsePage({ URL, responseBody, html, responseURL }) {

    let doc = {
        URI: [URL, decodeURI(URL), encodeURI(decodeURI(URL))].filter((c, i, a) => a.indexOf(c) === i)
    };
  
    let data = []
    const dataType = "MEDIA";
    const locale = "es";
    let listing = URL.match(/from=(.*)&to=(.*)&Circunscripción=(.*)&tipoDeResolucion=(.*)&page=([^&]*)/i)
  
    html = responseBody.content
    if (html) {
        // clean the html before parsing
        // use sanitize-html 
  
        let $ = cheerio.load(html, { decodeEntities: false })

        // remove scripts 
        // table id JDatatable0
        let table = $('#MainContent_listaResultadoTabla')
        let tbody = table.find('tbody')
        let rows = tbody.find('tr')
           rows = rows.slice(0, rows.length - 1)
        // use a for loop to iterate over the rows
        let circ = null
        let tipo = null
        for(i = 1; i < rows.length; i++){
           if(listing){
            circ = listing[3]
            tipo = listing[4]
           }
     
            
            let doc = {
                URI: [URL, decodeURI(URL), encodeURI(decodeURI(URL))].filter((c, i, a) => a.indexOf(c) === i),
                nroResolucion: null,
                anoResolución: null,
                fechaDelaResolucion :null,
                tribunalDeOrigen :null,
                tipoDeResolución :null,
                circunscripción :null,
                contenidoEnPDF:null,
            
    
            };

            let row = rows[i]
            // get the td elements
            let tds = $(row).find('td')
            // get the fourth td
            let nroResolucion = $(tds[0]).text()
            let anoResolución = $(tds[1]).text()
            let fechaDelaResolucion = $(tds[2]).text()
            let tribunalDeOrigen = $(tds[3]).text()
            let tribunaldeSmallCase = tribunalDeOrigen.toLowerCase()
            tribunaldeSmallCase = tribunaldeSmallCase.replace(/\s/g, '-')
            tribunaldeSmallCase = tribunaldeSmallCase.replace(/\---/g, '-')
            let tribunaldeUrl = `http://www.csj.gov.py/resoluciones/tribunales/${tribunaldeSmallCase}`
            let tipoDeResolución = $(tds[4]).text()
            let link = $(tds[5]).find('a')
            let href = $(link).attr('href')
            doc.URI = href


             doc.nroResolucion = nroResolucion
                doc.anoResolución = anoResolución
                doc.fechaDelaResolucion = fechaDelaResolucion
                doc.tribunalDeOrigen = {name: tribunalDeOrigen, url: tribunaldeUrl}
                doc.tipoDeResolución = tipoDeResolución
                doc.contenidoEnPDF = href
                doc.circunscripción = {name: circ, url: `http://www.csj.gov.py/resoluciones/circunscripciones/${circ.replace(/\s/g, '-')}`}

                
                
                

            data.push(doc)
        }

    }



    return data
  
  }  