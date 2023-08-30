function processCellData($ ,td, keyword, field, doc) {
    if (new RegExp(keyword, 'i').test(td)) {
        let tds = td.nextAll('td');
        let data = tds.map((i, elem) => $(elem).text()).get().join(' ');
        doc[field] = data;
    }
}
function parsePage({ URL, responseBody, referer }) {
    let $ = cheerio.load(responseBody.content)
    let data = []
    $('script').remove()
    let divPanelBody = $('.panel.panel-default')

    //return [divPanelBody.length]
    divPanelBody.each((i,elem) =>{
      const buttonText = $(elem).find('button.label-processo').last().text().trim();
      let href = $(elem).find('a:contains("Inteiro Teor")').attr('href');
      let ementa = $(elem).find('.content_ementa')
      let citation = $(ementa).find('b').last()
      if(!citation) citation = null

      href = `https://jurisprudencia.tjto.jus.br/${href}`
        let table = $(elem).find("table")
        let tableBody = $(table).find("tbody")
        let tableRow = $(tableBody).find("tr")
          let doc = { 
            URI: [href],
            classe: null,
            assunto: null,
            competencia:null,
            relator:null,
            dataJulgamento:null,
            procedureType:null,
            procedureNumber:buttonText,
            citation:null,
            ementa: ementa.text().trim(),
            dateFormat: null, 
            year: null,
            URL 
            }

        
    tableRow.each((i, elem) =>{


            let item = $(elem);
            //get the first td
            let td = item.find('td').first();
            //throw new Error(JSON.stringify({td}))
            switch (true) {
                case /classe/i.test(td):
                    processCellData($ ,td, 'classe', 'classe', doc);
                    break;
                case /assunto.+/i.test(td):
                    processCellData($ ,td, 'assunto.+', 'assunto', doc);
                    break;
                case /Compet.+/i.test(td):
                    processCellData($ ,td, 'Compet.+', 'competencia', doc);
                    break;
                case /Relator/i.test(td):
                    processCellData($, td, 'Relator', 'relator',doc);
                    break;
                case /Data Julgamento/i.test(td):
                    processCellData($, td, 'Data Julgamento', 'dataJulgamento',doc);
                    break;

            }
            let dateFormat = formatDate(doc.dataJulgamento)
            doc.dateFormat = dateFormat
            if(dateFormat) doc.year = moment(dateFormat, 'YYYY-MM-DD').year() || null
        
        

    });
       data.push(doc)
    });
      

    return data
}

function formatDate(date) {
    let d = date && moment(date, ['DD MMMM YYYY', 'DD/MM/YYYY', 'DD-MM-YYYY', 'YYYY-MM-DD'], 'en');
    return d && d.isValid ? d.format('YYYY-MM-DD') : null;
}
  