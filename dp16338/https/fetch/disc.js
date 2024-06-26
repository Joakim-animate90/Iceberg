function discoverLinks({ content, contentType, canonicalURL, requestURL }) {
    const links = [];
      let $ = cheerio.load(content)
      $("a[href]").each(function () {
          let href = $(this).attr('href');
          href = href ? url.resolve(canonicalURL, href) : null;
          if (href)
              links.push(href)
          })
  
  
    return links;
  }