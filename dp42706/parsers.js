const regex = /Resolucion|Resolución/gi;
function processCellData($ ,td, keyword, field, doc) {
    if (new RegExp(keyword, 'i').test(td)) {
        let tds = td.nextAll('td');
        let p = td.find('p')
   
        if(p) p = p.text().trim()
        let data = tds.map((i, elem) => $(elem).text().replace(/\n/g, ' ').trim() || null).get().join(' ');

        doc[field] = data || null;
        
    }
}
async function parsePage({ URL, responseBody, html, responseURL }) {
    let data = [];
    html = await responseBody.content;
    if (html) {

        let $ = cheerio.load(html, { decodeEntities: false });
        const lastScriptTag = $('script[type="text/javascript"]').last().html()
        const regex = /{"_options":{[^}]*"pdfjsProcessing":{[^}]*"data":"([^"]*)"[^}]*}}/;
        let lastmatch = lastScriptTag.match(regex);
        if(!lastmatch){
           return []
        }
        let table = $('table')

        let tbody = table.find('tbody')
        let trs = tbody.find('tr')
        
        let doc = {
            URI: [],
            rolNo: null,
            reclamante: null,
            reclamado: null,
            resumenDelCaso: null,
            tipoDedecision: null,
            fechaDedecision: null,
            legislacionAplicada: null,
            palabrasClave: null,
            jurisprudenciaDesde: null,
            jurisprudencia: null,
            descriptoresJuridicos:null,
            descriptoresAnaliticos: null,
            consejeros: null,
            
            
            URL: [URL, decodeURI(URL), encodeURI(decodeURI(URL))].filter((c, i, a) => a.indexOf(c) === i),
        };
        let uri = URL + `&document.pdf`
        doc.URI.push(uri)
        trs.each(function(i, elem) {
            if (i === 0){
                let item = $(elem);
  
                let td = item.find('td').first().text().trim()
                td = td.replace(/Decisión ROL/, '')
                doc.rolNo = td

            }
            let item = $(elem);
            //get the first td
            let td = item.find('td').first();
            //throw new Error(JSON.stringify({td}))
            switch (true) {
                case /reclamante/i.test(td):
                    processCellData($ ,td, 'reclamante', 'reclamante', doc);
                    break;
                case /reclamado/i.test(td):
                    processCellData($ ,td, 'reclamado', 'reclamado', doc);
                    break;
                case /resumen Del Caso/i.test(td):
                    processCellData($ ,td, 'resumen Del Caso', 'resumenDelCaso', doc);
                    break;
                case /tipo De deci/i.test(td):
                    processCellData($, td, 'tipo De deci', 'tipoDedecision',doc);
                    break;
                case /legisla/i.test(td):
                    processCellData($ ,td, 'legisla', 'legislacionAplicada', doc);
                    break;
                case /palabras Clave/i.test(td):
                    processCellData($ ,td, 'palabras Clave', 'palabrasClave', doc);
                    break;
                case /jurisprudencia Desde/i.test(td):
                    processCellData($ ,td, 'jurisprudencia Desde', 'jurisprudenciaDesde', doc);
                    break;
                case /jurisprudencia/i.test(td):
                    processCellData($ ,td, 'jurisprudencia', 'jurisprudencia', doc);
                    break;
                case /descriptores juridicos/i.test(td):
                    processCellData($, td, 'Descriptores Juridicos', 'DescriptoresJuridicos', doc);
                    break;
                case /descriptores Analiticos/i.test(td):
                    processCellData($ , td, 'Descriptores Analiticos', 'DescriptoresAnaliticos', doc);
                   
                    break;
                case /consejeros/i.test(td):
                    processCellData($ , td, 'consejeros', 'consejeros', doc);
                     if(doc.consejeros){
                      let consejeros = doc.consejeros.split('-').slice(1)
                      doc.consejeros = consejeros.filter((item) => {
                        if(item && item.length > 3) return item
                        }).filter(Boolean)

                     }
                    break;
                case /fecha de/i.test(td):
                    processCellData($ , td, 'fecha de', 'fechaDedecision', doc);
                    break;
            }

           

        });
        let dateFormat = formatDate(doc.fechaDedecision)
        doc.dateFormat = dateFormat
        data.push(doc)
    }
    let targetDate = moment('2023-01-27', 'YYYY-MM-DD');
    let filteredDoc = data.filter((doc) => {
        return doc.dateFormat && moment(doc.dateFormat, 'YYYY-MM-DD').isAfter(targetDate);
    });


    return filteredDoc;
}
function formatDate(date) {
    let d = date && moment(date, ['DD MMMM YYYY', 'DD/MM/YYYY', 'DD-MM-YYYY', 'YYYY-MM-DD', 'DD.MM.YYYY'], 'es');
    return d && d.isValid ? d.format('YYYY-MM-DD') : null;
}


  