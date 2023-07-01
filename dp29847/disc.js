function discoverLinks({ content, contentType, canonicalURL, requestURL }) {
  const links = [];
  if (/html/i.test(contentType)) {
    const $ = cheerio.load(content);

    let listing = canonicalURL.match(/from=(.*)\&to=(.*)\&areaName=(.*)\&area=(.*)\&page=(1)/i);




    if (listing) {
      let from = listing[1];
      let to = listing[2];
      let areaName = listing[3];
      let area = listing[4];
      // div.page_count span
      let actualPage = $("div.page_count").text();
      console.log("Here is my discoverlink" + actualPage);
      actualPage = parseInt(actualPage);
      if (actualPage) {
        for (let i = 1; i <= actualPage; i++) {
          //create urls for each page
          let href = `https://www.bundesanzeiger.de/pub/en/search?from=${from}&to=${to}&areaName=${areaName}&area=${area}&page=${i}`;
          href = href ? url.resolve(canonicalURL, href) : null;
          if (href) links.push(href);
        }
      }
    }
    $("a[href]").each(function () {
      let href = $(this).attr('href');
      href = href ? url.resolve(canonicalURL, href) : null;
      if (href)
        links.push(href)
    })
  }

  return links;
}