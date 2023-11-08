// Define an object that maps the Latin numerals to their Arabic equivalents
const numeralMap = {
  'I': 1,
  'V': 5,
  'X': 10,
  'L': 50,
  'C': 100,
  'D': 500,
  'M': 1000
};

// Define a function to convert a Latin numeral to its Arabic equivalent
function convertNumeral(numeral) {
    return numeral.split('').reduce((acc, val, i, arr) => {
    const curr = numeralMap[val];
    const next = numeralMap[arr[i + 1]];
    return curr < next ? acc - curr : acc + curr;
    }, 0);
}


async function parsePage({ responseBody, URL, html, referer }) {
        //try{
        console.log(`parsePage: parsing: ${responseBody.fileFormat} ${URL}`);
        const results = [];
        const dataType = "MEDIA";
        const locale = "es";
        html = iconv.decode(responseBody.buffer, "win1251");
        //if html.length is less than 100 return []


        if (html) {
        // use cheerio to parse the html
        const $ = cheerio.load(html, { decodeEntities: false });
        $("script, meta, base, iframe, frame, img").remove();

            $("a[href]").each(function (i) {
                let a = $(this);
                a.replaceWith(a.html());
            });
            let bodyText = $('body').text()

            if (/Proxy Error | < /i.test(bodyText)){
                return [];
            }
            if ($('body').text().includes('<')) {
                return []
            }



        let preContent = $.html()


        let docMother = {
            URI: [URL, decodeURI(URL), encodeURI(decodeURI(URL))].filter((c, i, a) => a.indexOf(c) === i),

            section2: null,
            section2Clean:null,
            URL: [URL, decodeURI(URL), encodeURI(decodeURI(URL))].filter((c, i, a) => a.indexOf(c) === i),
            title: null,
            numero: null,
            publishedDate: null,
            publishedDateOriginale: null,
            year: null

        };

        // split the url http://gaceta.diputados.gob.mx/Gaceta/65/2022/ago/20220818-I.html and get the -I part
        let url = URL

        let docId = URL.split('/').pop().split('.').shift();
        let numberPart = docId.split('-').pop();
        let NGaceta = $('#NGaceta');
        if (!NGaceta.length) {
            //get from center
            NGaceta = $('center');
        }


        let NGacetaText = NGaceta.text();
        if (!NGacetaText) {
            NGaceta = $('#Titulo');
            NGacetaText = NGaceta.text();

        }
        let NGacetaTextSplit = NGacetaText.split(',');
        let ano = NGacetaTextSplit[1]
        let numeral = ano.trim().split(' ')[1]
        docMother.anoOriginal = numeral
        docMother.ano = convertNumeral(numeral)
        let numero = NGacetaTextSplit[2]
        docMother.numero = numero.split(' ')[2] ? numero.split(' ')[2] : null
        let publishedDate = NGacetaTextSplit[3]
        docMother.publishedDateOriginale = publishedDate
        if (!publishedDate) {
            // 18 de marzo de 2015

            let regex = /\d+ de.+de \d+/i
            publishedDate = NGacetaText ? NGacetaText.match(regex)[0] : null
            docMother.publishedDateOriginale = publishedDate
        }
        let year = publishedDate ? publishedDate.match(/20\d{2}/i) : null
        docMother.year = year ? year[0] : null
        const formatString = 'D MMM YYYY';

        if (publishedDate) {
            publishedDate = publishedDate.replace(/\s/g, ""); // Remove spaces
            publishedDate = publishedDate.replace(/de/g, ""); // Remove spaces
            docMother.publishedDate = moment(publishedDate, formatString, 'es').format("YYYY-MM-DD");
        } else {
            docMother.publishedDate = null;
        }

       
        let section2 = $('#Contenido').find('.Seccion')
        if (!section2.length) {
            section2 = $('#center-kim').find('.Seccion');
        }
        if (!section2.length) {
            section2 = $('.BrincoG').find('.Seccion');
        }

        let sectionList = [];
        section2.each((i, el) => {

            let text = $(el).text().trim();
            let sectionName = `Anexo ${numberPart} - ${text}`;
            sectionList.push(sectionName);
        });
     
        docMother.section2 = sectionList.length ? sectionList : null;
        sectionList = sectionList.map((item, index) => {
            //start from the second element
            if (index > 0) {
                return item.split('-')[1];
            }
            return item.replace(/-/, '')
        })


 
        docMother.section2Clean = sectionList.length > 1 ? sectionList.join(', ') : sectionList

        if (!section2.length) {
            return []

        }
        // try{
        let sectionTitle = await parseRemoteUrl(referer, "A06s36hp84xmo3e");
      
            if (sectionTitle && sectionTitle[0] && sectionTitle[0].title){
                let sectionTitle = sectionTitle
                docMother.anex = sectionTitle[0].anex
                sectionTitle = sectionTitle.filter((doc) => {
                    if (doc.anex === `Anex ${numberPart}`){
                       return doc
                    }
                })
                docMother = sectionTitle
            }
        // } catch (error) {
        //     console.log(error)
        // }
        $('p').after('<br>');
            $('.Indice').remove()
            $('#Indice').remove()
            $('#Header').remove()
            $('#Titulo').remove()

            $('body').find('*').contents().each(function () {
            if (this.nodeType === 3) {
                // Check if it's a text node
                $(this).wrap('<span style="color: black;"></span>');
            }
            });

            // Get the modified HTML content
            const modifiedHtml = $.html();
            docMother.htmlContent = {fileFormat: "text/html", content: modifiedHtml, locale, dataType};

        results.push(docMother);


        }
        return results;
        // }catch(e){
        //   return []
        // }

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