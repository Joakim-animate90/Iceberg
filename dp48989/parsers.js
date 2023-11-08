function removeExtraSpaces(string) {
    return string.replace(/(\n|\s{2,})/g, "").trim();
  }
  
  function convertDate({ dateString, locale = "en", originFormat }) {
    return moment(dateString, originFormat, locale).format("YYYY-MM-DD");
  }
  

  
async function parsePage({ responseBody, URL, html, referer }) {
    const $ = cheerio.load(responseBody.content);
    let results = [];
    $("ol.search-results > li").each((_, li) => {
        let doc = {
            URI: [],
            caseNumber: null,
            originalDate: null,
        };
        let a = $(li).find("a");
        let href = a.attr("href");
        doc.URI.push(href);
        let caseNumber = $(li).find("h2").text().trim();
        doc.caseNumber = caseNumber;
        doc.caseNumberClean = caseNumber ? caseNumber.replace(/.pdf/i, '') : null

        if(/cour-cassation/i.test(URL)){
            let uri = href ? url.resolve(URL, href) : null;
            doc.URI = [uri]
            let docketNumber = extractNumberInsideBracket(caseNumber)
            doc.docketNumber = docketNumber
        }




        let originalDate = $(li).find("time").attr("datetime");
        doc.originalDate = originalDate;

        let summary = $(li).find('.article-summary').text().trim() || null
        doc.summary = summary

        function convertDate({ dateString, locale = "en", originFormat }) {
            const momentDate = moment(dateString, originFormat, locale);
            if (momentDate.isValid()) {
                return momentDate.format("YYYY-MM-DD");
            } else {
                return null;
            }
        }

        doc.date = convertDate({
            dateString: doc.originalDate,
            locale: "fr",
            originFormat: "DD/MM/YYYY",
        });
        if(!doc.date) {
            doc.date = convertDate({
                dateString: doc.originalDate,
                locale: "fr",
                originFormat: "YYYY-MM-DD HH:mm",
            });
        }

        let extractedPairs = extractKeyValuePairsWithFormatting($ , li)
        let court = null
        if(/jurisprudence-judoc/i.test(URL)){
            //get the value of this key in extractedPairs juridiction
            court = extractedPairs.juridiction
        }
        court = testCourt(URL, extractedPairs.juridiction)
        doc.court = court

        if(!checkForProperties(extractedPairs, URL)){ 
            extractedPairs = {
                ...extractedPairs,
                ...checkForProperties(extractedPairs, URL)
            }

        }

        doc = Object.assign(doc, extractedPairs);

        doc.URL = [URL];

        results.push(doc);
    });
    // on each results get each doc URI use a for loop
    if (/cour-constitutionnelle/i.test(URL)) {
        await Promise.all(
            results.map(async (doc) => {
                let uri = doc.URI[0];

                try {
                    let links = await parseRemoteUrl(uri, "A06s3fiukc2xzo9");
                    if (links && links[0] && links[0].links) {
                        let getLinks = links[0].links;
                        for (let k = 0; k < getLinks.length; k++) {
                            let link = getLinks[k];
                            if (/html|pdf/i.test(link)) {
                                //push in the results uri
                                doc.URI.push(link);
                            }
                        }
                    }
                } catch (error) {
                    console.error(error);
                }
                console.log("No links found");
            })
        );
    }
    
    


    return results;
}


function extractKeyValuePairsWithFormatting($, li) {
    const pairs = {};
    $(li).find("ul.nude.article-custom li").each((_, li) => {
        const key = $(li)
            .find("span")
            .text()
            .trim()
            .replace(/:$/, "")
            .toLowerCase()
            .replace(/\s+/g, '')
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
        const value = $(li).find("b").text().trim();
        pairs[key] = value;
    });
    return pairs;
}

 function testCourt(URL, value){

    let court = null
    if(/juridictions-administratives/i.test(URL)){
        court = 'Juridictions Administratives'
    }else if(/cour-cassation/i.test(URL)){
        court = 'Cour de Cassation'
    }else if(/cour-constitutionnelle/i.test(URL)){
        court = 'Cour Constitutionnelle'
    }else{
        court = value || null
    }
    return court
 }

//a function to check for properties of pairs
function checkForProperties(pairs, URL){
    if(/cour-cassation/i.test(URL)){
        //it should have this keys matiere thematique registre
        //if it doesn't have this keys it should create a key and return null
        if(!pairs.matiere){
            pairs.matiere = null
        }
        if(!pairs.thematique){
            pairs.thematique = null
        }
        if(!pairs.registre){
            pairs.registre = null
        }
        return pairs
    }else if(/cour-constitutionnelle/i.test(URL)){
        //it should have this keys matiere conformite constitution loi
        //if it doesn't have this keys it should create a key and return null
        if(!pairs.matiere){
            pairs.matiere = null
        }
        if(!pairs.conformite){
            pairs.conformite = null
        }
        if(!pairs.constitution){
            pairs.constitution = null
        }
        if(!pairs.loi){
            pairs.loi = null
        }
        return pairs

    }else if(/juridictions-administratives/i.test(URL)){
        //it should have this keys typedecontentieux instance chambre
        //if it doesn't have this keys it should create a key and return null

        if(!pairs.typedecontentieux){
            pairs.typedecontentieux = null
        }
        if(!pairs.instance){
            pairs.instance = null
        }
        if(!pairs.chambre){
            pairs.chambre = null
        }
        return pairs


    }else if(/jurisprudence-judoc/i.test(URL)){
        //it should have this keys numeroderole decision juridiction
        //if it doesn't have this keys it should create a key and return null
        if(!pairs.numeroderole){
            pairs.numeroderole = null
        }
        if(!pairs.decision){
            pairs.decision = null
        }
        if(!pairs.juridiction){
            pairs.juridiction = null
        }
        return pairs
    }

    return pairs

}

function extractNumberInsideBracket(str) {
    const regex = /\((\d+)\)/; // matches the number inside the bracket
    const match = str.match(regex);
    if (match) {
        return match[1]; // returns the captured number
    }
    return null; // returns null if no match is found
}

const parseRemoteUrl = async (urlToParse, parserId) => {
    const urlToParseId = "H" + new Buffer(urlToParse).toString("base64");
    const urlToParseId2 = "H" + sha256(urlToParse) + ".N";
    const resp = await graphql(`
          query {
            nodes(ids: ["${urlToParseId}", "${urlToParseId2}"]) {
              id
              ... on CrawledURL {
                lastSuccessfulRequest {
                  id
                }
              }
            }
          }`);
  
    let parserRes;
    let node = resp.nodes && resp.nodes.filter(n => n)[0];
    if (node && node.lastSuccessfulRequest) {
        // Parse acordao listing page
        parserRes = await graphql(`
            query {
              node(id:"${parserId}") {
                ... on CrawledPageParser {
                  jsonOutputFor(requestId:"${node.lastSuccessfulRequest.id}")
                }
              }
            }`);
    }
  
    return parserRes && parserRes.node && parserRes.node.jsonOutputFor;//returns array, filter as necessary
  };

 
 
  



