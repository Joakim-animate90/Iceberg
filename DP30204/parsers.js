import cheerio from 'cheerio'
function parsePage ({ URL, responseBody, html, responseURL }) {

    const dataType = 'MEDIA'
    const locale = 'es'
    const data = []
  
    html = responseBody.content
    if (html) {
    
      const $ = cheerio.load(html, { decodeEntities: false })
      // find article
      // the first article is the parent article
      // the rest are child articles
        let last_event = null
        const articles = $('article')
        articles.each((i, el) => {
            const doc = {}
            if (i === 0) {
                doc.isMother = true
                // get all the p elements in the div with class "portfolio-item"
                const p = $(el).find('div.portfolio-item').find('p')
            if (p.length > 0) {
                p.each((i, el) => {
                    const text = $(el).text()
                    if (text.includes('Expediente:')) {
                        const exp = text.split(':')[1].trim()
                        // 1766/2017 Sala
                        // remove Sala
                        const expClean = exp.split(' ')[0]
                        doc.expediente = expClean
                    }
                    if (text.includes('Sala:')) {
                        const sala = text.split(':')[1].trim() 
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
             
               
                
            }

            }else {
                const docChild = {}
                docChild.isChild = true
                // get all the p elements in the div with class "portfolio-item"
                const p = $(el).find('div.portfolio-item').find('p')
            if (p.length > 0) {
                p.each((i, el) => {
                    const text = $(el).text()
                    if (text.includes('Fecha Acuerdo:')) {
                        const date = text.split(':')[1].trim() || null 
                        docChild.fecha_acuerdo = date
                    }
                    if (text.includes('Fecha Publicación:')) {
                        const date = text.split(':')[1].trim() || null 
                        docChild.fecha_publicacion = date
                    }
                    docChild.comment = text.trim()
                    // if i is the last element
                    if (i === p.length - 1) {
                        // get the fecha publicacion
                        if (text.includes('Fecha Publicación:')) {
                            const date = text.split(':')[1].trim() || null 
                            last_event = date
                        }
                    }

            })
        }
        docChild.expediente = doc.expediente
        doc.last_event = last_event
        data.push(docChild)


      
    }
  
   
  })
}
    return data
}