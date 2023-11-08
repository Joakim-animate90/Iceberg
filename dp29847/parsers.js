async function parsePage({ URL, responseBody, html, responseURL }) {
  
    let doc = {
        URI: [URL, decodeURI(URL), encodeURI(decodeURI(URL))].filter((c, i, a) => a.indexOf(c) === i)
    };
  
    let data = []
    const dataType = "MEDIA";
    const locale = "de";
  
    html = responseBody.content
   
    if (html) {
        // clean the html before parsing
        // use sanitize-html 
  
        let $ = cheerio.load(html, { decodeEntities: false })
        // remove scripts 
        $('script').remove()
        $('noscript').remove()
        $('link').remove()
       
        
        // find the table with the id example
        doc = {
            URI: null,
            name : null,
            appendedOn : null,
            area : null,
            vDate : null,
            date : null,
            documentType : null,
            infoWithTitle : null,
            info : null,
            URL:[URL]
            
        }
      
        try{
             doc.URI = [URL, decodeURI(URL), encodeURI(decodeURI(URL))].filter((c, i, a) => a.indexOf(c) === i)
        }catch(e){
             doc.URI = [URL]
        }
        // <div class="col-md-3" <div class="first">AmRod eCommerce UG (haftungsbeschränkt)<br>Hürth</div></div>
  
        let name = $('.first').text() ? $('.first').text().replace(/\r?\n/g, '') : null
        // if name includes hinzugefügt 
        if (name.includes('hinzugefügt')) {
            name = name.split('hinzugefügt')[0]
        }
        let area = $('.part').text() ? $('.part').text().trim() : null
        let vDate = $('.date').text() ? $('.date').text().trim() : null
        // let info = $('.info').text() ? $('.info').text().trim() : null dont use trim remove whitespaces 
        let info = $('.info').text().replace(/\r?\n/g, '');
        let infoWithTitle = $('.info').find('a').text() ? $('.info').find('a').text().trim() : null
        // use moment to parse the date 
        let date = moment(vDate, 'MM/DD/YYYY').format('YYYY-MM-DD')
  
        doc.name = name
        doc.area = area
        doc.vDate = vDate
        doc.appendedOn = vDate
        doc.date = date
        doc.info = info
        doc.documentType = area 
        doc.infoWithTitle = infoWithTitle   
        // remove tag header and footer
        $('header').remove()
        $('footer').remove()
        $('h1').remove()
        $('h1, h2, h3').each(function () {
          $(this).replaceWith(`<h5>${$(this).html()}</h5>`);
        });

        // Change all <h4> tags to <h5>
        $('h4').each(function () {
          $(this).replaceWith(`<h5>${$(this).html()}</h5>`);
        });

       
        //from publication_container get the text and convert it to html 
       // remove class content-container margin_bottom_large
  
        $('.content-container margin_bottom_large').remove()
        $('div[class="container result_container global-search detail-view"]').remove()
  
  
       // remove <div class="result_pager_detail publication-nav bottom"> from removeClass
        $('.result_pager_detail').remove()
       // $('.publication_container').css('margin-center', 'auto')
        // force the full html to be on the right side
        $('.publication_container').css('margin-right')
        // remove div id cc_banner
        $('#cc_banner').remove()
        //doc.content = $.html()

        //$$('script').remove()

        //wrap content in a <div class="generated-from-iceberg vlex-toc">
        let table = $('.publication_container')
        let modifiedContent = `<div class="generated-from-iceberg vlex-toc"><section class="content-section"><h5 class="content__heading content__heading--depth1" data-content-heading-label="INTRODUCTION">Introduction</h5>${table.html()}</section></div>`;
        //return [modifiedContent]
        let $$ = cheerio.load(modifiedContent, { decodeEntities: false })
        let tbody = $$('table tbody');
        let secondTr = tbody.find('tr:nth-child(2)');
        let td = secondTr.find('td');



        let section = null;
        let remainingSections = null;
        let isInSection = false;
        let count = 0
        const children = td.children();
        //return [children.html()]
        let html1 = []
        doc.len = children.length

       
        for (let i = 0; i < children.length; i++) {
            const child = $$(children[i]);
            html1.push(child.html())
        
            if (child.is('h5, h6')) {
                if (!isInSection) {
                    // If the first header tag in the sequence, create a section
                    isInSection = true;
   
                }
               // section.append(child.clone());
            } else {
                if (isInSection) {
                      break;
                }
            }
        }
        // get the secondlast value in the html1l
        let lastValue = html1[html1.length - 2]
        doc.lastValue = lastValue || null
        
        //search for a h4 tag with that value and wrap the preceding elements inside a div tag  use the td
        const h4Element = td.find('h5:contains(' + lastValue + ')');
        
      
        if (h4Element.length > 0) {
            // Find all `hx` elements after `h4Element`
            const followingElements = h4Element.nextAll('h5, h6, h7, h8, h9');
        
            followingElements.each(function(i, elem) {
                let hx = $$(this); // Convert the DOM element to a jQuery object
                // wrap the text in a section similar to your example
                let section = `<section class="content-section"><h5 class="content__heading content__heading--depth1" data-content-heading-label="${hx.text()}">${hx.text()}</h5></section>`;
                // replace the `hx` with the section
                hx.replaceWith(section);
            });
        }


        doc.html= html1

        doc.count = count
        modifiedContent = $$('td').html()
        doc.htmlContent = {content: modifiedContent
            , locale, fileFormat: "text/html", dataType} || null;
     
  
        data.push(doc)





    //    // let sanitizedHtml = $.html().replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, ''); 
    //    let sanitizedHtml =$.html()
       
    //     //remove the text from the sanitizedHtml Search Result – Federal Gazette 
    //     sanitizedHtml = sanitizedHtml.replace(/Search Result – Federal Gazette/g, '')
    //     //sanitizedHtml = sanitizedHtml.replace(/\sX\s/gi, '')
    //    // the html is in removeClass2
    //     doc.htmlContent = {content:  
    //         sanitizeHtml(sanitizedHtml, {
    //             allowedTags: sanitizeHtml.defaults.allowedTags.concat(['tr', 'td']), // Allow tr and td tags
    //             allowedAttributes: {
    //               '*': ['style'], // Allow the style attribute on all elements
    //               'tr': ['bgcolor'], // Allow the bgcolor attribute on tr elements
           
    //             },
    //          }) 
    //       , locale, fileFormat: "text/html", dataType} || null;
   

    //     data.push(doc)
    }
    return data
  
    

  }
