function parsePage({ URL, responseBody, html }) {

    let results = []
    let doc = {};
    let $ = cheerio.load(responseBody.content);
    //main content div
    let article = $('div#main');
    let titleElem = article.find('h2').first();
    let titleText = titleElem.text().trim();
    let patt = /(RJ)?[0-9]+.*\/.*[0-9]\)?/;
    let match = patt.exec(titleText);
    let docket_number = match && match[0] ? match[0] : 'kim';
    doc.docket_number = docket_number;
    
    //paragraph containing date DD/MM/YYYY or DD-MM-YYYY
    let dateElem = $(article).find('p').first();
    let dateElemText = $(dateElem).text().trim();
    dateElemText = dateElemText.replace(/\s+/g," ");
    let dateText = "";
    //find the text following the word julgamento in dateElemText
    match = /.*julgamento(.*)/i.exec(dateElemText);
    if (match){
    //if contains the word BRT or BRST then remove
    if (/BRS?T/.test(match[1])){
    dateText = match[1].trim().replace(/[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}\s*BRS?T/i,"");
    }
    else dateText = match[1].trim();
    let originalDate = moment(dateText,["DD/MM/YYYY","DD-MM-YYYY","ddd MMM DD YYYY","YYYY"]);
    if (originalDate.isValid()){
    let resolution_date = originalDate.format("YYYY-MM-DD");
    doc.resolution_date = resolution_date;
    }
    else doc.resolution_date = moment().format("YYYY-MM-DD");
    }
    else doc.resolution_date = moment().format("YYYY-MM-DD");
    
    let ementaP = $(dateElem).nextUntil('div');
    let ementaPText = $(ementaP).text().trim();
    let ementa = ementaPText.replace(/Ementa:?/gi,"").trim();
    doc.ementa = ementa;
    
    //pdf URL
    let urlPart = $(article).find('a.download').attr('href');
    doc.URI = urlPart && [url.resolve("http://conteudo.cvm.gov.br/",urlPart), url.resolve("https://conteudo.cvm.gov.br/",urlPart)];
    
    doc.URI && results.push(doc);
    let res =  parseNewResultsHtml(URL,responseBody)
  
    if(results.length === 0) return res
    return results;
    
    }

function parseNewResultsHtml( URL, responseBody) {

    let results = []

    let $ = cheerio.load(responseBody.content);
    //main content div
    let body = $('body');
    let article= body.find('article')
  
    
    
    //use each
    article.each(function(i, elem) {
        let doc = {};
        let a = $(elem).find('a').text()
        let docket_number = a
        doc.docket_number = docket_number
        let content = $(elem).find('.contentDesc').text().trim()
        let ementa = content.replace(/Ementa:?/gi,"").trim();
        doc.ementa = ementa;
        let date = $(elem).find('.infoItem').find('p').text()
        date = date.replace(/Data:/, "")
        let originalDate = moment(date,["DD/MM/YYYY","DD-MM-YYYY","ddd MMM DD YYYY","YYYY"]);
        if (originalDate.isValid()){
        let resolution_date = originalDate.format("YYYY-MM-DD");
        doc.resolution_date = resolution_date;
        }else doc.resolution_date = null
        let urlPart = $(elem).find('a').attr('href');
        doc.URI = urlPart && [url.resolve("http://conteudo.cvm.gov.br/",urlPart), url.resolve("https://conteudo.cvm.gov.br/",urlPart)];
        
        results.push(doc)

    })
    let res =  parseNewResultsHtml1(URL,responseBody)
  
    if(results.length === 0) return res
    return results;
    
    }

function parseNewResultsHtml1( URL, responseBody) {

    let results = []
    
    let $ = cheerio.load(responseBody.content);
    //main content div
    let contentDiv = $('.contentMaisRecentes.form-group');
   
    let li = contentDiv.find('li')
 
    
    
    //use each
    li.each(function(i, elem) {
        let doc = {};
        let text = $(elem).text()
        let a = $(elem).find('a').text()
        let docket_number = a
        let ementa = text.split(/Ementa:?/gi)[1]
        let date = text.split(/Ementa:?/gi)[0]
        date = date.replace(a, "")
        let originalDate = moment(date,["DD/MM/YYYY","DD-MM-YYYY","ddd MMM DD YYYY","YYYY"]);
        if (originalDate.isValid()){
        let resolution_date = originalDate.format("YYYY-MM-DD");
        doc.resolution_date = resolution_date;
        }else doc.resolution_date = null
        doc.dateOriginale = date
        doc.text = text 
        doc.docket_number = docket_number
        doc.ementa = ementa
        let urlPart = $(elem).find('a').attr('href');
        doc.URI = urlPart && [url.resolve("http://conteudo.cvm.gov.br/",urlPart), url.resolve("https://conteudo.cvm.gov.br/",urlPart)];

        results.push(doc)
    })
    return results;
    
    }
    