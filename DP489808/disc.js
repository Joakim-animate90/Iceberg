import url from 'url';
export function discoverLinks({ content, contentType, canonicalURL, requestURL }) {
  const links = [];

  if (/json/i.test(contentType)) {
    if (content) {
      const json = JSON.parse(content);
      for (const item of json.files) {
        const uriItem = item.linkdownload;
        const resolvedUriItem = uriItem ? url.resolve(canonicalURL, uriItem) : null;
        if (resolvedUriItem) {
          links.push(resolvedUriItem);
        }
      }

      const href = json.pagination;
      if (/Siguiente/i.test(href)) {
        const url = new URL(canonicalURL);
        const id = url.searchParams.get("id");
        let page = url.searchParams.get("page");
        if (page) {
          page = parseInt(page) + 1;
        } else {
          page = 1;
        }
        const href = `https://www.msp.gob.do/web/Transparencia/wp-admin/admin-ajax.php?juwpfisadmin=false&action=wpfd&task=files.display&view=files&id=${id}&rootcat=25&page=${page}&orderCol=ordering&orderDir=asc`;
        links.push(href);
      }
    }
  } else {
    const $ = cheerio.load(content);
    $("a[href]").each(function () {
      let href = $(this).attr("href");
      href = href ? url.resolve(canonicalURL, href) : null;
      if (href) {
        links.push(href);
      }
    });
  }

  return links;
}


  
