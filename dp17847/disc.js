function discoverLinks({ canonicalURL, content, contentType }) {
    let hrefs = [];
    // get a regex to match the links in seed
    const isListing = canonicalURL.match(/page=.+/i)
    if (isListing && /json/.test(contentType)) {
        if (content) {
            let json = JSON.parse(content);
            console.log(json)
            let listingUrl = json.links.next;
            hrefs.push(listingUrl);
            let total = json.results.length;
            console.log(total)
            for (let i = 0; i < total; i++) {
                let href = json.results[i].ver;
                href = href ? url.resolve(canonicalURL, href) : null;
                console.log(href)
                hrefs.push(href);
            }
        } else {
            console.log("Content is undefined or null");
        }
    }

    return hrefs;
}