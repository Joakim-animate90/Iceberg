function parsePage({ responseBody, URL }) {
    let $ = cheerio.load(responseBody.content);
    let results = [];

    let content = $('.DNPNavtab-container').html()
    let docsArr = content.split(/El\s+Departamento/);
  
    for (let i = 0; i <= docsArr.length + 1 ; i++) {
        let family = `<div class="record"><p>El Departamento${docsArr[i]}</p><div>`;
        $ = cheerio.load(family);
        let s = $.text().replace(/\s+/g, ' ').replace(/,/g, '')
        let summary = /(.+:.+@dnp\.gov\.co)/.exec(s);
        summary = summary && summary[1] || s
        let type = /(Proyecto de (?:(d|D)ecreto|resolución|\w+))/i.exec(s)
        type = type && type[1].replace(/Memoria/i, '')
        let t = /[“"].*?(Por(?:\n|.)*?)[”"]/gi.exec(s) || /[“"]((?:\n|.)*?)[”"]/gi.exec(s) || /((?:por|Regulatoria)(?:\n|.)*?electrónicos?)/.exec(s)
        let motherTitle = t && `${type && type} ${t[1]}`.trim().toLowerCase();
        if(motherTitle) {
        motherTitle = motherTitle && motherTitle.charAt(0).toUpperCase() + motherTitle.slice(1)
        // Find the index of the word "por"
        const indexPor = motherTitle.indexOf('por');
        // Extract the substring from the beginning of the sentence until "por"
        const substring1 = motherTitle.substring(0, indexPor).trim();
        // Extract the substring from "por" until the end of the sentence
        let substring2 = motherTitle.substring(indexPor).trim();
        substring2 = `"${substring2}"`
        motherTitle = `${substring1} ${substring2}`
        
        let url = [`https://www.dnp.gov.co/${motherTitle && motherTitle.replace(/\s+/g, '_')}`,
            `http://www.dnp.gov.co/${motherTitle && motherTitle.replace(/\s+/g, '_')}`
        ]

        let match = /(?:entre|del)\D+(\d{1,2}) (?:y|hasta|al)\D+(\d{1,2})(?: de)? (\w+) de (\d{4})/.exec(s)
        let fromDate = match && match[1];
        let toDate = match && match[2];
        let toMonth = match && match[3];
        let fromMonth = match ;
        let toYear = match && match[4];
        let fromYear = match && match[4];
        
        let firstCommentDateSpanish = `${fromDate} de ${fromMonth} de ${fromYear}`;
        let lastCommentDateSpanish = `${toDate} de ${toMonth} de ${toYear}`;

        if (!match) {
            match = /comentarios\D*(?:del|entre)?\D*(\d{1,2} de [a-z]+ de \d{1,4}\b) (?:y|hasta|al)\D+(\d{1,2} de [a-z]+ de \d{1,4}\b)/.exec(s)
            firstCommentDateSpanish = match && match[1]
            lastCommentDateSpanish = match && match[2]
        }
        if (!match) {
            match = /(?:entre|del)\D+(\d{1,2}(?: de)? \w+) (?:y|hasta|al)\D+(\d{1,2} de \w+) de (\d{1,4})/.exec(s)
            firstCommentDateSpanish = `${match && match[1]} de ${match && match[3]}`;
            lastCommentDateSpanish = `${match && match[2]} de ${match && match[3]}`;
        }
        if (!match) {
          // fecha y hasta el 2 de septiembre​​ de 2015 
            match = /(?:fecha|y) hasta el (\d{1,2} de \w+ de \d{4})/.exec(s) || /hasta el día (\d{1,2} de \w+ de \d{4})/.exec(s)
            lastCommentDateSpanish = match && match[1]
        }
        if (!match) {
            match = /partir del (\d{1,2} de \w+ de \d{4})/.exec(s)
            firstCommentDateSpanish = match && match[1]
        }
        if (!match){
            match = /(?:entre|del)\D+(\d{1,2}) (?:y|hasta|al)\D+(\d{1,2})(?: de)? (\w+)/.exec(s)
            let day = match && match[1]
            let month = match && match[3]
            let toDay = match && match[2]
            let year = null
            let fromDate  = `${day} de ${month} de ${year}`;
            let toDate  = `${toDay} de ${month} de ${year}`;
            firstCommentDateSpanish = fromDate
            lastCommentDateSpanish = toDate
        }

        let d = firstCommentDateSpanish && moment(firstCommentDateSpanish.replace(/\sde/g, '') || "", ['D MMMM YYYY'], 'es');
        let firstCommentDate = d && d.isValid() ? d.format("YYYY-MM-DD") : null;
        d = lastCommentDateSpanish && moment(lastCommentDateSpanish.replace(/\sde/g, '') || "", ['D MMMM YYYY'], 'es');
        let lastCommentDate = d && d.isValid() ? d.format("YYYY-MM-DD") : null;
        let year = moment(lastCommentDate, "YYYY-MM-DD").year() || moment(firstCommentDate, "YYYY-MM-DD").year() || null
         let cutoffDate = moment("2023-08-01"); // Set the cutoff date
        let children = [];
        $('a[href*=".pdf"], a[href*=".docx"], a[href*=".doc"]').each(function() {
            let href = $(this).attr('href');
            if (/.[pd][do][fc]x?\?web=1/i.test(href)) {
                href = href.replace(/\?web=1/i, '')
            }
            let parentURL = url.find(u => u.match(/^http:/));
            let match = /([^\/]*)\/*$/.exec(decodeURI(href));
            let title = match && match[0].toLowerCase().replace(/.pdf$/, '').replace(/-/g, ' ')
            title = title && title.charAt(0).toUpperCase() + title.slice(1)
            children.push({ URI: href, parentURL, title });
        })
        if (lastCommentDate) {
            let formattedLastCommentDate = moment(lastCommentDate, "YYYY-MM-DD");
            if (formattedLastCommentDate.isAfter(cutoffDate)) {

        children.length && results.push({ URI: url, isMother: true, title: motherTitle, summary, firstCommentDate, lastCommentDate, type, URL:[URL], year, match })
        for (let i = 0; i < children.length; i++) {
            const {URI, parentURL, title} = children[children.length - 1 - i];
            let sortOrder = i
            let inverseSortOrder = children.length - 1 - i;
            let Class = /Proyecto de/i.test(title) || inverseSortOrder === 0 ? "Initial bill" : null
           	results.push({URI:[URI], title, parentURL, sortOrder, inverseSortOrder, class: Class, URL})
        }
      }
     }
     }
    }

    let mothers = results.filter((item) => item.isMother && item)
    let motherURIs = mothers.map(obj => obj.URI[0])

     let duplicateMotherURIs = findDuplicates(motherURIs);

    let duplicates = [];
    duplicateMotherURIs.map((uri) => {
        let duplicateRecords = [];
        mothers.filter((mother) => {
            let { URI, lastCommentDate } = mother;
            URI[0] === uri && duplicateRecords.push({ URI, lastCommentDate });
        });
        duplicates.push(duplicateRecords);
    });
    let mothersToRemove = duplicates.map((arr) => {
        return arr.reduce((prev, curr) => {
            return prev.lastCommentDate < curr.lastCommentDate ? prev : curr;
        });
    });
    let final = results.filter((obj) => {
        let uri = obj.URI[0];
        let lastCommentDate = obj.lastCommentDate;
        let needsToBeRemoved = mothersToRemove.filter((r) => {
            let rURI = r.URI[0];
            let rLastCommentDate = r.lastCommentDate;
            let bool = lastCommentDate === rLastCommentDate && uri === rURI
            return bool
        }).length;
        if (!needsToBeRemoved) return obj
    });
    return final;
}

function findDuplicates(arr) {
    return arr.filter(
        (currentValue, currentIndex) => arr.indexOf(currentValue) !== currentIndex
    );
}