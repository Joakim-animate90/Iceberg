async function parsePage({ URL, responseBody, html }) {

    if (/=_año_XIX&numero=_número_4627&publishedDate=_miércoles_28_de_septiembre_de_2016_/i.test(URL)) {
      return [];
    }

    const results = [];
    let out = {
      URI: [URL, decodeURI(URL), encodeURI(decodeURI(URL))].filter((c, i, a) => a.indexOf(c) === i),
    };
    const dataType = "MEDIA";
    const locale = "es";

    html = responseBody.content;
    if (html) {
      out = {
        URI: [URL, decodeURI(URL), encodeURI(decodeURI(URL))].filter((c, i, a) => a.indexOf(c) === i),

        anoOriginal: null,
        ano: null,
        numero: null,
        publishedDate: null,
        publishedDateOriginale: null,
        title: null,
        section2: null,
        year: null,
        section: null,
        URL: [URL, decodeURI(URL), encodeURI(decodeURI(URL))].filter((c, i, a) => a.indexOf(c) === i),
        parentURL: null,
        documentType: null,
      };

      let $ = cheerio.load(html, { decodeEntities: false });

      $("script").remove();
      $("img").remove();
      $("a[href]").each(function (i) {
        let a = $(this);
        a.replaceWith(a.html());
      });

      out.htmlContent = { fileFormat: "text/html", content: $.html(), locale, dataType };

      let isChildListingAnexo1 = URL.match(/title=(.*)&anexo=(.*)&title=(.*)&ano=(.*)&numero=(.*)&publishedDate=(.*)&childTitle=([^&]*)/i);
      let isChildListingAnexo = URL.match(/title=(.*)&anexo=(.*)&title=(.*)&ano=(.*)&numero=(.*)&publishedDate=(.*)/i);
      let isChildListingNormal = URL.match(/title=(.*)&ano=(.*)&numero=(.*)&publishedDate=(.*)&childTitle=([^&]*)/i);

      // Error handling and checks for null or undefined values

      if (isChildListingAnexo) {
        out.title = isChildListingAnexo?.[3]?.replace(/_/g, " ") ?? null;
        out.anoOriginal = isChildListingAnexo[4]?.replace(/_/g, " ") ?? null;
        out.anoCleaned = out.anoOriginal ? out.anoOriginal.replace(/ano|año/, "") : null;
        let numeral = out.anoOriginal?.trim().split(" ")[1] ?? null;
        out.ano = numeral ? convertNumeral(numeral) : null;
        let numero = isChildListingAnexo[5]?.replace(/_/g, " ") ?? null;
        out.numero = /undefined/i.test(numero) ? undefined : numero.match(/\d+/)?.[0] ?? null;

        if (/undefined/i.test(out.numero)) {
          return [];
        }

        let numero_clean = out.numero !== undefined ? out.numero : null;
        out.numero_clean = numero_clean ? numero_clean.match(/\d+/)[0] : null;
        let publishedDate = isChildListingAnexo[6].replace(/_/g, " ");
        out.publishedDateOriginale = publishedDate;
        if (publishedDate) {
          publishedDate = publishedDate.split(" ");
          let i = 0;
          while (!/^\d+/i.test(publishedDate[i])) {
            publishedDate.shift();
            i++;
          }
          if (/^\d+/i.test(publishedDate[0])) {
            publishedDate = publishedDate.join(" ");
          } else {
            publishedDate.shift();
            publishedDate = publishedDate.join(" ");
          }
          let year = publishedDate.match(/20\d{2}/i);
          out.year = year[0];
          const formatString = 'D [de] MMMM [de] YYYY';
  
          out.publishedDate = moment(publishedDate, formatString, 'es').format("YYYY-MM-DD");
        }



        out.section = isChildListingAnexo[3]?.replace(/_/g, " ") ?? null;
        out.documentType = isChildListingAnexo[1]?.replace(/_/g, " ") ?? null;
        out.parentURL = URL.split('?')[0] + "?title=" + (isChildListingAnexo[1]?.replace(/_/g, " ") ?? null) + "&anexo=" + (isChildListingAnexo[2]?.replace(/_/g, " ") ?? null);
        out.section = isChildListingAnexo[1]?.replace(/_/g, " ") ?? null;

        try {
          let section2 = await parseRemoteUrl(out.parentURL, "A06rtogb48u5u80");
          out.section2 = section2;

          if (section2 && section2[0] && section2[0].section2) {
            out.section2 = section2[0].section2;
          }
        } catch (error) {
          console.log(error);
        }

        results.push(out);
      } else if (isChildListingNormal) {
        out.title = isChildListingNormal[5]?.replace(/_/g, " ");
        out.anoOriginal = isChildListingNormal[2]?.replace(/_/g, " ");
        out.anoCleaned = out.anoOriginal ? out.anoOriginal.replace(/ano|año/, "") : null;
        let numeral = out.anoOriginal?.trim().split(" ")[1] ?? null;
        out.ano = numeral ? convertNumeral(numeral) : null;
        out.numero = isChildListingNormal[3]?.replace(/_/g, " ");
        out.numero = /undefined/i.test(out.numero) ? undefined : out.numero.match(/\d+/)?.[0];

        if (/undefined/i.test(out.numero)) {
          return [];
        }

        let numero_clean = out.numero !== undefined ? out.numero : null;
        out.numero_clean = numero_clean !== null ? numero_clean.match(/\d+/)[0] : null;
        let publishedDate = isChildListingNormal[4]?.replace(/_/g, " ") ?? null;

        out.publishedDateOriginale = publishedDate;
        if (publishedDate) {
          publishedDate = publishedDate.split(" ");
          let i = 0;
          while (!/^\d+/i.test(publishedDate[i])) {
            publishedDate.shift();
            i++;
          }
          if (/^\d+/i.test(publishedDate[0])) {
            publishedDate = publishedDate.join(" ");
          } else {
            publishedDate.shift();
            publishedDate = publishedDate.join(" ");
          }
          let year = publishedDate.match(/20\d{2}/i);
          out.year = year[0];
          const formatString = 'D [de] MMMM [de] YYYY';
  
          out.publishedDate = moment(publishedDate, formatString, 'es').format("YYYY-MM-DD");
        }

        out.section = isChildListingNormal[1]?.replace(/_/g, " ") ?? null;
        out.parentURL = URL.split('?')[0];
        out.documentType = isChildListingNormal[1]?.replace(/_/g, " ") ?? null;
        results.push(out);
      }
    }

    return results;

}

async function parsePage({ URL, responseBody, html }) {
    return Promise.race([
        parsePageWithTimeout({ URL, responseBody, html }),
        sleep(30)
    ]).catch(() => []); // catch any errors and return an empty array
}

function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}
