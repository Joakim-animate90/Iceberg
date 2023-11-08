
function parsePage({ responseBody, URL }) {
    let $ = cheerio.load(responseBody.content);
    let results = [];
    

  const tables = $('table[style="width: 711px;"], table[style="width: 714px;"]');

    tables.each(function (i, table) {
   
        let tbody = $(table).find('tbody')
        let rows = tbody.find('tr')
        rows.each(function (i, row){
          let docMother = {
            URI: null,
            isMother: true,
            title: null,
            content: null,
            summaryMother: null,
          }

            let tds = $(row).find('td')
            let title = $(tds[0]).text().replace(/”|"|“/g, '').replace(/\s+/g, ' ').trim();
            let content = $(tds[1]).text().replace(/\s+/g, ' ').trim();
            docMother.title = title || null
            docMother.content = content || null
            let url = [`https://www.anm.gov.co/${title && title.replace(/\s+/g, '_')}`,
            `http://www.anm.gov.co/${title && title.replace(/\s+/g, '_')}`
            ]
            docMother.URI = url
            if (docMother.URI[0] === 'https://www.anm.gov.co/_COMENTARIOS_' || docMother.URI[0] === 'https://www.anm.gov.co/' || docMother.URI[0] === 'https://www.anm.gov.co/_Proyecto_') {
                return
            }

            let match = /desde?\D*(?:del|entre)?\D*(\d{1,2})\s+?de\s+?(\w+)\s+?de\s+?(\d{1,4})\s+?(hasta|al)\D+(\d{1,2})\s+?de\s+?(\w+)\s+?de\s+?(\d{1,4})/gi.exec(content)

              let fromDate = match && match[1];;
              let fromMonth = match && match[2] ;
              let fromYear = match && match[3];

              let toDate = match && match[5];
              let toMonth = match && match[6];
              let toYear = match && match[7];
              
              let firstCommentDateSpanish = `${fromDate} de ${fromMonth} de ${fromYear}`;
              let lastCommentDateSpanish = `${toDate} de ${toMonth} de ${toYear}`;
     
            if (!match) {
                match = /comentarios\s+?desde?\D*(?:del|entre)?\D*(\d{1,2})\s+?de\s+?\w+\s+?(hasta|al)\D+(\d{1,2})\s+?de\s+?(\w+)\s+?de\s+?(\d{1,4}\b)/gi.exec(content)
                let fromDate = match && match[1];
                let toDate = match && match[3];
                let toMonth = match && match[4];
                let fromMonth = match ;
                let toYear = match && match[5];
                let fromYear = match && match[4];
                
                firstCommentDateSpanish = `${fromDate} de ${toMonth} de ${toYear}`;
                lastCommentDateSpanish = `${toDate} de ${toMonth} de ${toYear}`;
    
            }
            if (!match) {
                match = /desde?\D*(?:del|entre)?\D*(\d{1,2})\s+?de\s+?(\w+)\s+?(de\s+?)?(\d{1,4})\s+?(hasta|al)\D+(\d{1,2})\s+?de\s+?(\w+)\s+?de\s+?(\d{1,4})/gi.exec(content)
                let fromDate = match && match[1];;
                let fromMonth = match && match[2] ;
                let fromYear = match && match[4];

                let toDate = match && match[6];
                let toMonth = match && match[7];
                let toYear = match && match[8];
                
                firstCommentDateSpanish = `${fromDate} de ${fromMonth} de ${fromYear}`;
                lastCommentDateSpanish = `${toDate} de ${toMonth} de ${toYear}`;
            }
            if (!match) {
                match = /hasta el (\d{1,2} de \w+ de \d{4})/.exec(content) || /hasta el día (\d{1,2} de \w+ de \d{4})/.exec(content)
                lastCommentDateSpanish = match && match[1]
            }
            if (!match) {
                match = /del (\d{1,2} de \w+ de \d{4})/.exec(content)
                firstCommentDateSpanish = match && match[1]
            }

            let d = firstCommentDateSpanish && moment(firstCommentDateSpanish.replace(/\sde/g, '') || "", ['D MMMM YYYY'], 'es');
            let firstCommentDate = d && d.isValid() ? d.format("YYYY-MM-DD") : null;
            d = lastCommentDateSpanish && moment(lastCommentDateSpanish.replace(/\sde/g, '') || "", ['D MMMM YYYY'], 'es');
            let lastCommentDate = d && d.isValid() ? d.format("YYYY-MM-DD") : null;
            let year = moment(lastCommentDate, "YYYY-MM-DD").year() || moment(firstCommentDate, "YYYY-MM-DD").year() || null
            docMother.firstCommentDate = firstCommentDate
            docMother.year = year

            let contentSplit = content.split(/descarga.?/i)
            let summaryMother = contentSplit ? contentSplit[0] : null
            docMother.summaryMother = summaryMother

            //find all hrefs in order
            let children = [];
            $(tds[1]).find('a[href*=".pdf"], a[href*=".docx"], a[href*=".doc"]').each(function() {
                let href = $(this).attr('href');
                let parentURL = url.find(u => u.match(/^http:/));
                let title = $(this).text().toLowerCase().trim(); 
                if(title === '.') return 
                title = title && title.charAt(0).toUpperCase() + title.slice(1)
                children.push({ URI: href, parentURL, title });
            })


           
            children.length &&  results.push(docMother)
            for (let i = 0; i < children.length; i++) {
                const {URI, parentURL, title} = children[children.length - 1 - i];
                let sortOrder = i
                let inverseSortOrder = children.length - 1 - i;
            
                results.push({URI:[URI], title, parentURL, sortOrder, inverseSortOrder, URL, firstCommentDate, lastCommentDate})
            }

        })

    })
    return results

}

