function discoverLinks({ canonicalURL, content, contentType }) {
    let hrefs = [];
    // get a regex to match the links in seed
    const isListing = canonicalURL.match(/page_limit=.+/i)
    if (isListing && /json/.test(contentType)) {
        if (content) {
            let json = JSON.parse(content);
            console.log(json)
            let total = json.files.length;
            console.log(total)
            for (let i = 0; i < total; i++) {
                let href = json.files[i].linkdownload;
                console.log(href)
                hrefs.push(href);
            }
        } else {
            console.log("Content is undefined or null");
        }
    }

    return hrefs;
}