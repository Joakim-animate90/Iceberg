async function parsePage({ responseBody, URL }) {

    if (responseBody.fileFormat !== "text/html") { return [] }


    let $ = cheerio.load(responseBody.content);
    let results = [];
    let parent = $('.wrapper-documentos.mb-5')
    let records = parent.find('.documento-item')
    //records each
    records.each((i, el) => {   
        let doc = {URI:null,resolutionNo:null,date:null, year:null, summary:null,dateFormat:null}
        //on each el get text
        let text = $(el).text() 
        let uri = $(el).find('a')
        uri = uri.attr('href')
        uri = url.resolve(URL, uri)
        doc.URI = [uri]
        // a regex to match Resolución No. RES-MARD-2021-23, the MARD can be any letter

        let regex = /Resoluci(ó|o)n(\s+)No.?(\s+)?RES-[a-zA-Z]+-\d{4}-\d+/gi
        let res = text.match(regex)
        if(res){
            let resolutionNo = res && res[0].match(/RES-[a-zA-Z]+-\d{4}-\d+/gi)
            resolutionNo && resolutionNo[0] ? doc.resolutionNo = resolutionNo[0] : doc.resolutionNo = null
        }
        getSpanishDate(text,doc)
        // regex date 15/04/2021 
        let regexDate = /\d{2}\/\d{2}\/\d{4}/gi
        let resDate = text.match(regexDate)
        if(!doc.date){
        if(resDate){
            doc.date = resDate[0]
        }
    }
    let summary = doc.resolutionNo ? text.split(doc.resolutionNo) : null
    summary = summary ? summary[1] : null
    summary = summary.replace(/Detalles(\s+)?Descargar/i, "")

    doc.summary = summary
    results.push(doc)
      
    })

  
    return results
}

function getSpanishDate(text, doc){
     if (text) {
        let match = text.match(/fecha.*(\d{1,2}).*(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre).*(\d{4})(\s+)?/gi);
        if (match && match.length) {
            let date = match[0];
            
            let dateFormat= null
            doc.date = date;
            let day = date.match(/\b\d{2}\b/) 
            
        
            //if(!day || parseInt(day[0]) > 31) day = date.match(/\b\d{1}\b/) || null
            if(!day) day = date.match(/\b\d{1}\b/) || null
               // doc.day = day
            let month = date.match(/(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/gi);
            let year = date.match(/20\d{2}/gi);
            day = day && day.length ? day[day.length - 1] : null;

            month = month && month[0] ? month[0] : null 
            year = year && year[0] ? year[0] : null
            if(day && month && year){
            date  = day + " " + month + " " + year
            doc.date = date
            dateFormat= moment(date, "DD MMM YYYY", 'es').format("YYYY-MM-DD");
            dateFormat = moment(dateFormat)
            if (!dateFormat.isValid()) {
                doc.dateFormat= null
            }else{
            doc.dateFormat = dateFormat.format("YYYY-MM-DD");
            doc.year = dateFormat.year()
            }
            }

        }
    }
}