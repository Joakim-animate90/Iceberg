function parsePage ({ URL, responseBody, html, responseURL }) {

    const doc = {
         URI: [URL, decodeURI(URL), encodeURI(decodeURI(URL))].filter((c, i, a) => a.indexOf(c) === i)
     };
      const docChild = {
         URI: [URL, decodeURI(URL), encodeURI(decodeURI(URL))].filter((c, i, a) => a.indexOf(c) === i)
     };
     const data = []
     
     html = responseBody.content
     if (html) {
     
       const $ = cheerio.load(html, { decodeEntities: false })
       // find article
       // the first article is the parent article
       // the rest are child articles
         let last_event;
         const articles = $('article')
         articles.each((i, el) => {
            
             if (i === 0) {
                 doc.isMother = true
                 // get all the p elements in the div with class "portfolio-item"
                 const p = $(el).find('div.portfolio-item').find('p')
             if (p.length > 0) {
                 p.each((i, el) => {
                     const text = $(el).text()
                     if (text.includes('Expediente:')) {
                         const exp = text.split(':')[1].trim()
                         const expClean = exp.split(' ')[0]
                         doc.expediente = expClean
                     }
                     if (text.includes('Sala:')) {
                         const sala = text.split(':')[2].trim() 
                         doc.sala = sala
                     }
                     if (text.includes('Actor:')) {
                         const date = text.split(':')[1].trim() || null 
                         doc.fecha = date
                     }
                     if (text.includes('Demandados:')) {
                         const demandado = text.split(':')[1].trim() || null
                         doc.demandado = demandado
                     }
                     if (text.includes('Terceros:')) {
                         const terceros = text.split(':')[1].trim() || null
                         doc.terceros = terceros
                     }
                 })
                doc.URI = []
                doc.URI.push(`http://vlex.com/dockets-mx/JA/TJAD/[${doc.sala}]/[${doc.expediente}]`)
                
                doc.URL = URL
                 
             }
 
             }else {
                 
                 // docChild.isChild = true
                 // get all the p elements in the div with class "portfolio-item"
                 const p = $(el).find('div.portfolio-item').find('p')
             if (p.length > 0) {
                 p.each((i, el) => {
                     const text = $(el).text()
                     if (text.includes('Fecha Acuerdo:')) {
                         const date = text.split(':')[1].trim() || null 
                         docChild.fechaAcuerdoOriginale = date
                         docChild.fechaAcuredo = moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD')
                         
                     }
                     if (text.includes('Fecha Publicación:')) {
                         const date = text.split(':')[1].trim() || null 
                         docChild.fechaPublicacionOriginale = date
                         last_event = date 
                         docChild.fechaPublicacion = moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD')
                     }
                     docChild.comment = text.trim()
                     docChild.URL = URL
                     docChild.URI = []
                     docChild.URI.push(`http://vlex.com/dockets-mx/JA/TJAD/[${doc.sala}]/[${doc.expediente}]/[${docChild.fechaPublicacion}]`) 
                     docChild.expediente = doc.expediente
        
         
                 data.push(docChild)
   
 
             })
 
         }
        doc.lastDateEventOriginale = last_event
        doc.lastDateEvent = moment(last_event, 'DD/MM/YYYY').format('YYYY-MM-DD')

 
 
       
     }
   
     
    })
  } 
   data.push(doc) 
   return data
 }