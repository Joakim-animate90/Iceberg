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


function parsePage({responseBody, URL, html, referer}) {
    console.log(`parsePage: parsing: ${responseBody.fileFormat} ${URL}`);
    const results = [];
     const dataType = "MEDIA";
    const locale = "es";
    html = iconv.decode(responseBody.buffer, "win1251");
    // html = iconv.decode(responseBody.buffer, "utf-8");
    if (html){
        // use cheerio to parse the html
        const $ = cheerio.load(html, {decodeEntities: false});
        $("script, meta, base, iframe, frame").remove();
        $("a[href]").each(function (i) {
            let a = $(this);
            a.replaceWith(a.html());
        });
         let preContent = $.html()

        
          let docMother = {
            URI:[URL, decodeURI(URL), encodeURI(decodeURI(URL))].filter((c, i, a) => a.indexOf(c) === i),

            section2:null,
            URL:[URL, decodeURI(URL), encodeURI(decodeURI(URL))].filter((c, i, a) => a.indexOf(c) === i),
            title:null,
            numero:null,
            publishedDate:null,
            publishedDateOriginale:null,
            year:null,
            

  
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
        let year = publishedDate.match(/20\d{2}/i)
        docMother.year = year[0]
        const formatString = 'D [de] MMMM [de] YYYY';
   
       publishedDate = publishedDate.trim().split(" ")
       // remove the first item and join
    

     
        docMother.publishedDate = moment(publishedDate, formatString, 'es').format("YYYY-MM-DD")

        //get for each Seccion the text 
         let section2 = $('#Contenido').find('.Seccion')  

          if (!section2.length) {
              section2 = $('.BrincoG').find('.Seccion');
            }
  
        let sectionList = [];
        section2.each((i, el) => {
            
            let text = $(el).text().trim();
            let sectionName = `Anexo ${numberPart} - ${text}`;
            sectionList.push(sectionName);
        });
        docMother.section2 = sectionList;
     
        results.push(docMother);
        
     


    

    }
    return results;

   

}