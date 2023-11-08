function discoverLinks({ canonicalURL, content, contentType }) {
    let hrefs = [];
    // get a regex to match the links in seed
    const isListing = canonicalURL.match(/page=.+/i)
    if (isListing && /json/.test(contentType)) {
        const parsedUrl = url.parse(canonicalURL, true);
        const queryParams = parsedUrl.query;
        const from = queryParams.from;
        const to = queryParams.to;
       
        if (content) {
            let json = JSON.parse(content);
            console.log(json)
            let total = json.totalCount;
            console.log(total)
            for (let i = 0; i < total; i+=50) {
                let href = `https://www.bopa.ad/Documents?search=&from=${from}&to=${to}&page=${i}`
                hrefs.push(href);
            }
            for(let i = 0 ; i < total; i++){
                let name = json.paginatedDocuments[i].document.nomDocument
                let href = `https://bopaazurefunctions.azurewebsites.net/api/GetDocumentByFileName?name=${name}`
                let hrefPdf = `https://bopadocuments.blob.core.windows.net/bopa-documents/035120/pdf/${name}.pdf`
                let hrefxml = `https://bopadocuments.blob.core.windows.net/bopa-documents/xml/035120/${name}.xml`
                hrefs.push(href, hrefPdf, hrefxml);
            }
        } 
    }

    return hrefs;
}