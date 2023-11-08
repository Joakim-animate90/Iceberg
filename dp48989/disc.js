function discoverLinks({content, contentType, canonicalURL, requestURL}) {
    let links = [];
    if (/html/i.test(contentType)) {
        const $ = cheerio.load(content);

        //if page is the same as 1 https://justice.public.lu/fr/jurisprudence/juridictions-administratives.html?q=&eventDate=${start}&eventEndDate=${end}&page=1
        if(/page=1$/i.test(canonicalURL)){
            const match = canonicalURL.match(/eventDate=(.*)&eventEndDate=(.*)&page=(.*)/i);
            let from = match[1];
            let to = match[2];
            const searchMetaCount = $('.search-meta-count').text();
            let resultCount = searchMetaCount.match(/\d+/)[0];
            resultCount = parseInt(resultCount);

    
            const numPages = Math.ceil(resultCount / 20);
            let b = 20;
            for(i = 2; i <= numPages; i++){
                let href = `https://justice.public.lu/fr/jurisprudence/juridictions-administratives.html?q=&eventDate=${from}&eventEndDate=${to}&page=${b}`
                links.push(href)
                b += 20
            }
            console.log(numPages);
        }

        //add all a[href] links
        $("a[href]").each(function (i) {
            let a = $(this);
            let href = a.attr('href');
            href = href ? url.resolve(requestURL, href) : null;
            if (href) {
                links.push(href);
            }
        });
    }
    return links;
}