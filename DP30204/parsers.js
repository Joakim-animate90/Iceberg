function parsePage({ URL, responseBody, html, responseURL }) {

    const doc = {
        URI: [URL, decodeURI(URL), encodeURI(decodeURI(URL))].filter((c, i, a) => a.indexOf(c) === i)
    };

    const data = []

    html = responseBody.content
    if (html) {
        // clean the html before parsing
        // use sanitize-html 

        const $ = cheerio.load(html, { decodeEntities: false })
        // find article
        // the first article is the parent article
        // the rest are child articles
        let last_event;
        // you should only have one .timeline-body that  contains everything else
        // every other .timeline-body inside a .timeline-body you need to replace it with it's own .html();

        const timeline_body = $('.timeline-body')

        timeline_body.each((i, el) => {


            const articles = $(el).find('article')
            if (i === 0) {
                articles.each((i, el) => {
                    if (i === 0) {

                        doc.isMother = true
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


                    }
                    else if (i === 1) {
                        const p = $(el).find('div.portfolio-item').find('p')
                        if (p.length > 0) {
                            const docChild = { URI: [URL, decodeURI(URL), encodeURI(decodeURI(URL))].filter((c, i, a) => a.indexOf(c) === i) }
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
                                // if p has no strong tag then it is the comment
                                // comment is a list of p tags with no strong tag
                                // check if the p has a strong tag
                                const comment = []
                                if ($(el).not(':has(strong)')) {
                                    comment.push(text.trim())
                                }
                                docChild.comment = comment
                            })

                            docChild.URL = URL
                            docChild.URI = []
                            docChild.URI.push(`http://vlex.com/dockets-mx/JA/TJAD/[${doc.sala}]/[${doc.expediente}]/[${docChild.fechaPublicacion}]`)
                            docChild.expediente = doc.expediente
                            data.push(docChild)
                        }

                    } else {
                        //do nothing
                    }
                })
            } else {

                const article = $(el).find('article').first()
                const p = article.find('div.portfolio-item').find('p')
                if (p.length > 0) {
                    const docChild = { URI: [URL, decodeURI(URL), encodeURI(decodeURI(URL))].filter((c, i, a) => a.indexOf(c) === i) }
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
                        const comment = []
                        // check if p has no strong tag then it is the comment

                        if ($(el).not(':has(strong)')) {
                            comment.push(text.trim())
                        }
                        // join the comments 

                        docChild.comment = comment
                        
                    })
                    docChild.URL = URL
                    docChild.URI = []
                    docChild.URI.push(`http://vlex.com/dockets-mx/JA/TJAD/[${doc.sala}]/[${doc.expediente}]/[${docChild.fechaPublicacion}]`)
                    docChild.expediente = doc.expediente
                    data.push(docChild)
                }
            }
        })
        doc.lastDateEventOriginale = last_event
        doc.lastDateEvent = moment(last_event, 'DD/MM/YYYY').format('YYYY-MM-DD')
        // append the parent article to the data on the first position
        data.unshift(doc)
    }
    return data

}  