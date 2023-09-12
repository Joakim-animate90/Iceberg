function parsePage({ URL, responseBody, referer }) {
    let jsonString = responseBody.content
    let json = null
    try{
       json= JSON.parse(jsonString);
    }catch(e){
        return []
    }
    let results = []
        let doc = {
            "case_title": null,
            "URI": [],
            "judges":null,
            "decisionNumber":null,
            "expedienteNumber":null,
            "issuer":null,
            "caseHeading":null,
            "partiesOfTheCase":null,
            "URL": [URL]
        }
    json = json[0]
    let caseHeading = json.name
    doc.caseHeading = caseHeading
    let mainIntro = json.mainIntro.value
    let mainBody = json.mainBody.value
    let uri = findHrefValue(mainBody)
    doc.URI.push(uri)
    doc.caseBody = convertHtmlToText(mainBody)
    doc.judges = findJudges(doc.caseBody)
	  doc.case_title = convertHtmlToText(mainIntro)
    let splitText= doc.case_title.split(/\.(\s+)?([A-Z])/)
    const joinedText = splitText.slice(1).join(' ');
    doc.partiesOfTheCase = joinedText

    let match = /[^\d](\d+\.?\s+[^\s0-9]+\s+\d{4}|[0-9.\-]{10})[^\d]/i.exec(doc.case_title);
    if (match) {
        doc.decision_date = match[1].replace(/[\s.]+/g, " ");
        let date = moment(doc.decision_date, ["DD.MM.YYYY","YYYY-MM-DD",'DD MMMM YYYY'], 'nn');
        doc.decision_date = date.isValid() ? date.format("YYYY-MM-DD") : doc.decision_date;
    } else doc.decision_date = null;
    match = /sak nr\. ([^()]+)/.exec(doc.case_title);
    doc.expedienteNumber = match ? match[1].trim() : null;
    match = /,([\s0-9\-_A-ZÆØÅ]{8,}),/.exec(doc.case_title);
    doc.decisionNumber = match ? match[1].trim() : null;
    doc.issuer = getCaseType(URL)
    results.push(doc)
    return results;
}

function convertHtmlToText(text){
	let $ = cheerio.load(text)
	let value = $.text()
	return value

}
//function to find href value
function findHrefValue(body){
    let $ = cheerio.load(body)
    let element = $('a')
    let href = $(element).attr('href')
    return href 

}
//create a function to match where Dommere|Dommarane and split 

function findJudges(text){
    //split text
    let judges = text.split(/Dommere:?|Dommarane:?/gi)[1]
    return judges
}
//create a function to get this hoyesterett-sivil from the url https://www.domstol.no/api/episerver/v3.0/content/?contentUrl=/no/hoyesterett/avgjorelser/2023/hoyesterett-sivil/HR-2023-1034-A/
function getCaseType(url){
    //it should be generic split from the last
    let splitUrl = url.split("/")
    return splitUrl[splitUrl.length-3]
}
