function discoverLinks({content, contentType, canonicalURL, requestURL}) {
    let links = [];
    if (/html/i.test(contentType)) {


        let match = /http:\/\/gaceta\.diputados\.gob\.mx\/Gaceta\/.+\d{8}.html$/i.test(canonicalURL);
       
        if (/http:\/\/gaceta\.diputados\.gob\.mx\/Gaceta\/.+\d+.html$/i.test(canonicalURL)) {
            // on  div id Anexos
            let $ = cheerio.load(content);
            const NGaceta = $('#NGaceta');
            const NGacetaText = NGaceta.find('p').text();
            const NGacetaTextSplit = NGacetaText.split(',');
            let ano = NGacetaTextSplit[1]
            let numero = NGacetaTextSplit[2]
            let publishedDate = NGacetaTextSplit[3]
            console.log(ano)
           console.log('i was here>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
          // on the contenido div get each img and get the src attribute
            let contenido = $('#Contenido');
            let imgs = contenido.find('img');
            imgs.each(function(){
                let src = $(this).attr('src');
                src = src ? url.resolve(canonicalURL, src) : null;
                if(src){
                    links.push(src)
                }
            })

         
        

            let anexos = $('#Anexos');
            //get all links in anexos there are inside p tags

            let a = anexos.find('a');
            console.log('Here are my anexo links>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
            console.log(a)
            a.each(function(){
                let href = $(this).attr('href');
                // get the text of the link
                let text = $(this).text();
                href = href ? url.resolve(requestURL, href) : null;
                console.log(href)
                
                if(href){
                    // if it is a pdf
                    if(/\.pdf$/i.test(href)){
                        // http://gaceta.diputados.gob.mx/Gaceta/65/2023/abr/20230412.html?Anexo II&año XXVI&número 6253&miércoles 12 de abril de 2023&anexo
                        href = `${href}?title=${text}&ano=${ano}&numero=${numero}&publishedDate=${publishedDate}&anexo}`;
                        href = href.trim()
                        href = href.replace(/\s/g, '_');
                        href = href ? url.resolve(canonicalURL, href) : null;
                        // replace spaces with _
                        //href = href.replace(/\s/g, '_');
                        links.push(href)
                        console.log(links)
                    }else {
                        href = `${href}?title=${text}&anexo=anexo}`;
                        href = href.trim()
                        href = href.replace(/\s/g, '_');
                        href = href ? url.resolve(canonicalURL, href) : null;
                        links.push(href)
                        console.log(links)
                    }

                }




            })
        }
       const $ = cheerio.load(content);
        $("a[href]").each(function () {
            let href = $(this).attr('href');
            href = href ? url.resolve(requestURL, href) : null;
            if (href)
                links.push(href)
        })

    
    return links;

}
}