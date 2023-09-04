function discoverLinks({ canonicalURL, content, contentType }) {
    let hrefs = [];
    // get a regex to match the links in seed
    const isListing = canonicalURL.match(/page=.+/i)
    if (isListing && /json/.test(contentType)) {
        const queryString = canonicalURL.split('?')[1];
        const queryParams = querystring.parse(queryString);
       // throw new Error(JSON.stringify({queryParams}))
        let startDate = queryParams.startDate;
        let endDate = queryParams.endDate;
        let page = parseInt(queryParams.page)
     

        if (content) {
            let json = JSON.parse(content);
            console.log(json)
            if(page === 1){
                let getTotalPages = json.totalFilas
                if(getTotalPages) getTotalPages = parseInt(getTotalPages)
                
                if(getTotalPages > 0){
                    let pages = getTotalPages / 20
                    pages = Math.ceil(pages)
                    setSharedVariable('pages', pages)
                }
        
                let pages = getSharedVariable('pages')
        
                let hrefs = []
                let baseURL = `https://buscador.corteconstitucional.gob.ec/buscador-externo/rest/api/sentencia/100_BUSCR_SNTNCIA/?`
                for(let i = 2; i <= pages; i++){
                    let url = `${baseURL}totalPages=${getTotalPages}&startDate=${startDate}&endDate=${endDate}&page=${i}`
                    hrefs.push(url)
                }

            }
            let total = json.dato.length;
            console.log(total)
            for (let i = 0; i < total; i++) {
                let href = json.dato[i].documento.uuid;
                console.log(href)
                hrefs.push(href);
            }
        } else {
            console.log("Content is undefined or null");
        }
    }

    return hrefs;
}