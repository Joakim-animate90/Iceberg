import url from 'url';
export  function discoverLinks({ content, contentType, canonicalURL, requestURL }) {

    const links = [];
    if (/json/i.test(contentType)){
        if (content) {
            let json = JSON.parse(content);
            for (let i = 0; i < json.files.length; i++) {
                let item = json.files[i];
                let uriItem = item.linkdownload;
                uriItem = uriItem ? url.resolve(canonicalURL, uriItem) : null;
                if (uriItem){
                    links.push(uriItem);
                }
 
            }
            let href = json.pagination
            console.log(href)
            if(/Siguiente/i.test(href)){
                //https://www.msp.gob.do/web/Transparencia/wp-admin/admin-ajax.php?juwpfisadmin=false&action=wpfd&task=files.display&view=files&id=1557&rootcat=25&page=&orderCol=ordering&orderDir=asc
                    console.log('Inside siguient')
                    const url = new URL(canonicalURL);
                    let page = url.searchParams.get("page");
                    const id = url.searchParams.get("id")
                    console.log(page)
                    console.log(id)
                    if(page){
                        page = parseInt(page) + 1 
                        let href = `https://www.msp.gob.do/web/Transparencia/wp-admin/admin-ajax.php?juwpfisadmin=false&action=wpfd&task=files.display&view=files&id=${id}&rootcat=25&page=${page}&orderCol=ordering&orderDir=asc`
                        links.push(href)
                    }else{
                        console.log('Inside index 0 url')
                        page = 1
                        let href = `https://www.msp.gob.do/web/Transparencia/wp-admin/admin-ajax.php?juwpfisadmin=false&action=wpfd&task=files.display&view=files&id=${id}&rootcat=25&page=${page}&orderCol=ordering&orderDir=asc`
                        links.push(href)
                    }

                  

            }
        
        }
    }else{
  
      let $ = cheerio.load(content)
      $("a[href]").each(function () {
          let href = $(this).attr('href');
          href = href ? url.resolve(canonicalURL, href) : null;
          if (href)
              links.push(href)
          })
    }
  
  
    return links;
  }


  
