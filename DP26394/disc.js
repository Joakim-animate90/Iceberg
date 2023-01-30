import cheerio from "cheerio";
import url from "url";

export default function discoverLinks({ content, requestURL, contentType, canonicalURL }) {
    const hrefs = [];
    
    if (/https:.+page=[0-9]+/.test(canonicalURL) && contentType === "application/json") {
      const records = JSON.parse(content);
      console.log()
      records.forEach((record) => {
        hrefs.push(url.resolve(requestURL, record.Url));
      });
      
      if(records.length === 100) {
        let { page } = url.parse(canonicalURL, true).query;
        for (let i = 1; i < 10 + 1; i++) {
          hrefs.push(canonicalURL.replace(/page=[0-9]/, `page=${page * 1 + i}`));
        }
      }
    } else if (/https.+\/adjudications-search\/adjudications\/.+/.test(canonicalURL) && contentType === "text/html") {
      const $ = cheerio.load(content);
      $("a[href]").each(function () {
        let href = $(this).attr('href');
        href = href ? url.resolve(requestURL, href) : null;
        if (href)
          links.push(href)
      })
    }
    
    return hrefs;
  }
 