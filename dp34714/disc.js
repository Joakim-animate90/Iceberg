function discoverLinks({ canonicalURL, content, contentType }) {
    let hrefs = [];
    // get a regex to match the links in seed
    const isListing = canonicalURL.match(/type=.+/i)
    if (isListing && /json/.test(contentType)) {
        let json = JSON.parse(content);
        let total = json.files.length;
    

        for (let i = 0; i < total; i++) {
            let href = json.files[i].linkdownload;
            hrefs.push(href);
        }
    }

    return hrefs;

}