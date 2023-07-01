const MERGE_PDFS = true;

async function parsePage({ URL, responseBody, referer }) {
    const results = []
    const $ = cheerio.load(responseBody.content)
    let URI = [URL]

    let text = $('body > form').text().trim().replace(/\s+/g, ' ')
    let dates = $('body > form > font:contains("FECHA DE PUBLICACIÓN:") + br + font').text().trim()
    let match = /Fecha .*? (\b\d{1,2}\b del? \w+ del? \d{4})/i.exec(text)
    let dateOriginal = /(\d{1,2}\/\d{1,2}\/\d{4})/g.exec(dates) ? dates : match && match[1]
    let d = moment(dateOriginal && dateOriginal.replace(/\sdel?/g, ''), ['DD/MM/YYYY', 'DD MMMM YYYY'], 'es');
    let date = d && d.isValid() ? d.format("YYYY-MM-DD") : null;
    let doc = { URI: [URL], ['Publicada en la WEB CREG el']: dateOriginal, ['Publicada en la WEB CREG el_YYYYMMDD']: date, URL: [URL] }

    doc.pdf_urls = []
    doc.docUrls = []



    $("a[href*='$FILE/Aviso'], a[href*='$FILE/AVISO'], a[title^='AVISO'], font:contains('ARCHIVO AVISO')+br+a, font:contains('ARCHIVO AVISO')+br+a+a").each(function() {
            let href = $(this).attr('href');
            href = href ? url.resolve(URL, href) : null;
            if (/pdf$/i.test(href)) {
                doc.pdf_urls.push(href)
            }
            if (/docx$/i.test(href)) {
                doc.docUrls.push(href)
            }
            if (/doc$/i.test(href)) {
                doc.docUrls.push(href)
            }


        })
        //a[href$='pdf'], a[href$='docx'], a[href$='doc']
    $("a[href*='$FILE/Auto'], a[href*='$FILE/AUTO'], a[title^='AUTO'], font:contains('ARCHIVO AUTO')+br+a, font:contains('ARCHIVO AUTO')+br+a+a").each(function() {
        let href = $(this).attr('href');
        href = href ? url.resolve(URL, href) : null;
        if (/pdf$/i.test(href)) {
            doc.pdf_urls.push(href)
        }
        if (/docx$/i.test(href)) {
            doc.docUrls.push(href)
        }
        if (/doc$/i.test(href)) {
            doc.docUrls.push(href)
        }


    })
    if (MERGE_PDFS) {
        const locale = 'es'
        try {
            doc.merged_pdf = await mergePdfsToPdf({ pdf_urls: doc.pdf_urls, locale });
            doc.merged_html = doc.merged_pdf && await transcodeMediaObject({ mediaObjectId: doc.merged_pdf.mediaObjectId, filter: "pdf2htmlEx", locale });
            doc.merged_html = doc.merged_html || doc.merged_pdf && await transcodeMediaObject({ mediaObjectId: doc.merged_pdf.mediaObjectId, filter: "pdftohtml", locale });
            doc.merged_text = doc.merged_pdf && await transcodeMediaObject({ mediaObjectId: doc.merged_pdf.mediaObjectId, filter: "pdftotext_raw", locale });
        } catch (e) {
            console.error("Error merging and trascoding pdfs", e);
        }

    }

    results.push(doc)
    return results
}

const mergePdfsToPdf = async function({ pdf_urls, locale }) {
    let res = await joinPDFsToMediaObject(pdf_urls);
    //throw(JSON.stringify([pdf_urls, locale, res],null,3))
    return res && {
        mediaObjectId: res.id,
        dataType: "MEDIA",
        locale
    } || null;
};

async function transcodeMediaObject({ mediaObjectId, filter, locale }) {
    try {
        const resp = await graphql(`
    mutation {
      transcodeMediaObject (input: {
        clientMutationId: "0",
        filter: "${filter}",
        mediaObjectId: "${mediaObjectId}"

      }) {
        mediaObject {
          id
        }
      }
    }
  `)

        return resp && resp.transcodeMediaObject && resp.transcodeMediaObject.mediaObject && {
            mediaObjectId: resp.transcodeMediaObject.mediaObject.id,
            dataType: "MEDIA",
            locale
        };
    } catch (err) {
        console.error(`Error transcoding mediaObject ${mediaObjectId} using ${filter}`, err);
    }
}