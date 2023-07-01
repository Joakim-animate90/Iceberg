function discoverLinks({ content, requestURL, contentType, canonicalURL }) {
    const hrefs = [];
  
    if (contentType == "text/html") {
      const $ = cheerio.load(content);
  
      if (/https.+page=[0-9]/.test(canonicalURL)) {
        const { page, type } = url.parse(canonicalURL, true).query;
        if (page * 1 === 1) {
          const selectorId = type === "acordao" ? "nomeAba-A" : "nomeAba-D";
          const totalDocuments =
            $(`#${selectorId}`)
              .text()
              .match(/[0-9]+/)[0] * 1;
          const totalPages = Math.ceil(totalDocuments / 20);
  
          for (let i = 1; i < totalPages + 1; i++) {
            let pageNumber = i;
            hrefs.push(canonicalURL.replace(/page=[0-9]+/, `page=${pageNumber}`));
          }
        }
      }
  
      $("a[href]").each(function () {
        let href = $(this).attr("href");
        if (!/https.+page=[0-9]/.test(href)) hrefs.push(href);
      });
  
      return hrefs;
    }
  }