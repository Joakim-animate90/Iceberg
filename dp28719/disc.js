function discoverLinks({responseBody, content, contentType, canonicalURL, requestURL}) {
    let links = [];
  	if (/html/i.test(contentType)) {
        const $ = cheerio.load(content);
        $("a[href]").each(function () {
            let href = $(this).attr('href');
            href = href ? url.resolve(requestURL, href) : null;
            if (href)
                links.push(href)
        })
      
    } else if (/json/i.test(contentType)) {
      	let json = JSON.parse(content)
      	const isPageOne = canonicalURL.match(/\?page=1/i);
  		const isListing = canonicalURL.match(/(http.*)\?page=(\d+)/i);
      	const isMetadataPage = /normatividad\/[\w-]+/.exec(canonicalURL)
        if (isPageOne) {   
            let count = parseInt(json.meta.count)
            let totalPages = Math.ceil(parseInt(json.meta.totalCount) / 10);
            for (let i = 1; i <= totalPages; i++) {
              let pagination = canonicalURL.replace(/page=\d+/, `page=${i}`)
              console.log('pagination', pagination)
              links.push(pagination)
            }
        }
      	if (isListing) {
            let domain = isListing && isListing[1]
        	for (let i = 0; i < json.results.length; i++) {
                const item = json && json.results[i];
                let friendlyName = item && item.friendlyName;
              	let metadataPage = `${domain}/${friendlyName}`.replace(/\/tema/, '')
              	console.log('metadataPage', metadataPage)
                links.push(metadataPage)
            }
        }  
      	if (isMetadataPage) {
            let pdfURL = json && json.files[0] && json.files[0].filePath
            let embedURL =  json && json.embedUrl  ?  json.embedUrl : null
            links.push(pdfURL)   
            if(embedURL){
                let match = /file\/d\/([_\-\w]+)\//.exec(embedURL)
                embedURL = match && `https://drive.google.com/uc?id=${match[1]}&export=download` || embedURL
                links.push(embedURL) 
            }    
        }
    }
   
    
    return links;
}