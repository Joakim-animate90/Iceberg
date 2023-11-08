
  
  function parsePage({ responseBody, URL, html, referer }) {
          
          console.log(`parsePage: parsing: ${responseBody.fileFormat} ${URL}`);
          const results = [];
          const dataType = "MEDIA";
          const locale = "es";
          html = iconv.decode(responseBody.buffer, "win1251");
       
          //if html.length is less than 100 return []
  
  
          if (html) {

            //get all the hrefs in the page
            const $ = cheerio.load(html, { decodeEntities: false });
            $("script, meta, base, iframe, frame").remove();
            $("a[href]").each(function(i, element) {
                let doc = {}
                const text = $(element).text();
                if (text.includes("Anexo")) {
                    // If the text contains "Anexo," extract the title
                    const title = $(element).parent().text().trim() || null
                    const anex = $(element).text().trim() || null
                    doc.title = title
                    doc.title = anex
                    results.push(doc)
                   
                }
            });


          }
          return results
  
  }