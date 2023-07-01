function parsePage({ URL, responseBody, html, responseURL }) {
  const doc = {
    URI: [URL, decodeURI(URL), encodeURI(decodeURI(URL))].filter((c, i, a) => a.indexOf(c) === i)
  };
  const dataType = "MEDIA";
  const locale = "es";


  if (responseBody.content) {
    let decoded = iconv.decode(responseBody.buffer, 'utf-8');

    let $ = cheerio.load(decoded, { decodeEntities: false });

    $("script").remove();
    $("a[href]").each(function (i) {
      let a = $(this);
      a.replaceWith(a.html());
    });
    let sanitizedHtml = sanitizeHtml($.html(), {
      allowedTags: sanitizeHtml.defaults.allowedTags,
      allowedAttributes: sanitizeHtml.defaults.allowedAttributes,
      transformTags: {
        '*': function (tagName, attribs) {
          if (attribs && attribs.style) {
            attribs.style = attribs.style.replace(/background-color:(.*?);?/g, '');
          }
          return {
            tagName,
            attribs
          };
        }
      }
    });
    // remove ----------RS----------
    sanitizedHtml = sanitizedHtml.replace(/----------RS----------/g, '');
    // remove Inteiro Teor - HTML.
    sanitizedHtml = sanitizedHtml.replace(/Inteiro Teor - HTML./g, '');

    //remove @ (PROCESSO ELETRÔNICO) all

    sanitizedHtml = sanitizedHtml.replace(/@ (PROCESSO ELETRÔNICO)/g, '');
    //for the first 10 lines if RP is found remove it
    let lines = sanitizedHtml.split('\n');
    let newLines = [];
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      if (i < 3 && line.includes('RP')) {
        continue;
      }
      newLines.push(line);
    }

    sanitizedHtml = newLines.join('\n');
    // remove RP
    sanitizedHtml = sanitizedHtml.replace(/RP/g, '');







    doc.htmlContent = {
      fileFormat: "text/html",
      content: sanitizedHtml,
      locale,
      dataType
    };
  }
  return [doc];

}