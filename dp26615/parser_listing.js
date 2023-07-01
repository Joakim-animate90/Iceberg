function parsePage({ URL, responseBody, html, responseURL }) {

    const dataType = 'MEDIA'
    const locale = 'es'
    const data = []

    html = responseBody.content
    if (html) {
        const $ = cheerio.load(html, { decodeEntities: false })
        $('script, meta, base').remove()
        // from this url https://seia.sea.gob.cl/expediente/ficha/fichaPrincipal.php
        //table class tabla_datos_linea
        const table = $('table.tabla_datos_linea')
        // on the td find all tables we need to extract data on each table
        const tr = table.find('tbody tr')

        tr.each((i, row) => {


            const tr = $(row)
            const uri = tr.find('td').eq(3).find('a').attr('href')
            const doc = {
                URI: [uri, decodeURI(uri), encodeURI(decodeURI(uri))].filter((c, i, a) => a.indexOf(c) === i)
            };
            doc.N = tr.find('td').eq(1).text().trim() || null
            doc.folio = tr.find('td').eq(2).text() || null
            doc.documento = tr.find('td').eq(3).text() || null
            // if doc.documento starts with declaracion de impacto 
            if (doc.documento.startsWith('Declaración ')) {
                doc.class = "DIA"
            } else { doc.class = null }
            doc.remitidoPor = tr.find('td').eq(4).text() || null
            doc.destinatario = tr.find('td').eq(5).text() || null
            doc.fechaOringinale = tr.find('td').eq(6).text().split(' ')[0] || null
            doc.fecha = moment(doc.fechaOringinale, 'DD/MM/YYYY').format('YYYY-MM-DD') || null
            if (URL.startsWith('https://seia.sea.gob.cl/expediente/expedientesEvaluacion.php?id_expediente')) {

                doc.parentUrl = URL.replace('expediente/expedientesEvaluacion.php?', 'expediente/expediente.php?')
                //split where the & is and remove the last element
                let split = doc.parentUrl.split('&')
                split.pop()
                doc.parentUrl = split.join('&')
            } else {
                doc.parentUrl = URL.replace('expediente/expedientesEvaluacion.php?modo=ficha&', 'expediente/expediente.php?')
            }
            doc.URL = URL

            data.push(doc)
        })


    }

    return data
}