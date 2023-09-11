// Define an object that maps the Latin numerals to their Arabic equivalents
const numeralMap = {
  I: 1,
  V: 5,
  X: 10,
  L: 50,
  C: 100,
  D: 500,
  M: 1000,
};

// Define a function to convert a Latin numeral to its Arabic equivalent
function convertNumeral(numeral) {
  return numeral.split("").reduce((acc, val, i, arr) => {
    const curr = numeralMap[val];
    const next = numeralMap[arr[i + 1]];
    return curr < next ? acc - curr : acc + curr;
  }, 0);
}

async function replaceImgsUrlsWithMediaObjects($) {
  let imgs = $("img").toArray();

  for (let el of imgs) {
    let imgSrc = $(el).attr("src");
    if (imgSrc != null) {
      let mediaObject = await getCrawledPageMediaObject(imgSrc);
      if (mediaObject) {
        //throw JSON.stringify(mediaObject, 1, null)
        $(el).attr("src", `mediaobject://${mediaObject.id}`);
      }
    }
  }
}

async function parsePage({ URL, responseBody, html }) {
  const results = [];
  let out = {
    URI: [URL, decodeURI(URL), encodeURI(decodeURI(URL))].filter(
      (c, i, a) => a.indexOf(c) === i
    ),
  };
  const dataType = "MEDIA";
  const locale = "es";

  html = responseBody.content;
  if (html) {
    out = {
      URI: [URL, decodeURI(URL), encodeURI(decodeURI(URL))].filter(
        (c, i, a) => a.indexOf(c) === i
      ),

      anoOriginal: null,
      ano: null,
      numero: null,
      publishedDate: null,
      publishedDateOriginale: null,
      title: null,
      section2: null,
      year: null,
      section: null,
      URL: [URL, decodeURI(URL), encodeURI(decodeURI(URL))].filter(
        (c, i, a) => a.indexOf(c) === i
      ),
      parentURL: null,

      documentType: null,
    };
    let $ = cheerio.load(html, { decodeEntities: false });

    await replaceImgsUrlsWithMediaObjects($);

    $("script").remove();
    $("a[href]").each(function (i) {
      let a = $(this);
      a.replaceWith(a.html());
    });
    out.htmlContent = {
      fileFormat: "text/html",
      content: sanitizeHtml($.html(), {
        allowedTags: false,
        allowedAttributes: false,
        transformTags: false,
      }),
      locale,
      dataType,
    };

    // http://gaceta.diputados.gob.mx/PDF/64/2020/nov/20201104-A.pdf?title=Anexo_A&ano=_año_XXIII&numero=_número_5645&publishedDate=_miércoles_4_de_noviembre_de_2020&anexo%7D
    let isChildListingAnexo = URL.match(
      /title=(.*)&anexo=(.*)&title=(.*)&ano=(.*)&numero=(.*)&publishedDate=(.*)&childTitle=([^&]*)/i
    );
    let isChildListingNormal = URL.match(
      /title=(.*)&ano=(.*)&numero=(.*)&publishedDate=(.*)&childTitle=([^&]*)/i
    );

    // get the metadatas

    if (isChildListingAnexo) {
      // before inserting in the out replace _ with space

      out.title = isChildListingAnexo[3].replace(/_/g, " ");
      out.anoOriginal = isChildListingAnexo[4].replace(/_/g, " ");
      let numeral = out.anoOriginal.trim().split(" ")[1];
      out.ano = convertNumeral(numeral);
      let numero = isChildListingAnexo[5].replace(/_/g, " ");
      out.numero = numero.match(/\d+/)[0] ? numero.match(/\d+/)[0] : null;
      let publishedDate = isChildListingAnexo[6].replace(/_/g, " ");
      out.publishedDateOriginale = publishedDate;
      publishedDate = publishedDate;
      // remove miércoles 28 de abril de 2021 miércoles and replace with empty string
      // remove anything before the date check if starts with a number if not remove the first word

      publishedDate = publishedDate.split(" ");
      // remove the first word if it is not a number
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
      // match the four digit year  it should start with  20
      let year = publishedDate.match(/20\d{2}/i);
      out.year = year[0];
      const formatString = "D [de] MMMM [de] YYYY";

      out.publishedDate = moment(publishedDate, formatString, "es").format(
        "YYYY-MM-DD"
      );
      out.section = isChildListingAnexo[3].replace(/_/g, " ");
      out.documentType = isChildListingAnexo[1].replace(/_/g, " ");
      out.parentURL =
        URL.split("?")[0] +
        "?title=" +
        isChildListingAnexo[1] +
        "&anexo=" +
        isChildListingAnexo[2];
      out.section = isChildListingAnexo[1].replace(/_/g, " ");
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
      out.title = isChildListingNormal[5].replace(/_/g, " ");
      out.anoOriginal = isChildListingNormal[2].replace(/_/g, " ");
      let numeral = out.anoOriginal.trim().split(" ")[1];
      out.ano = convertNumeral(numeral);
      out.numero = isChildListingNormal[3].replace(/_/g, " ");
      let publishedDate = isChildListingNormal[4].replace(/_/g, " ");
      out.publishedDateOriginale = publishedDate;
      // remove miércoles 28 de abril de 2021 miércoles and replace with empty string
      publishedDate = publishedDate.split(" ");

      //use moment to parse the date

      // remove the first word if it is not a number
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
      publishedDate = publishedDate.split("&")[0];
      out.publishedDateOriginale = publishedDate;
      const formatString = "D [de] MMMM [de] YYYY";
      out.publishedDate = moment(publishedDate, formatString, "es").format(
        "YYYY-MM-DD"
      );
      out.section = isChildListingNormal[1].replace(/_/g, " ");
      out.parentURL = URL.split("?")[0];
      out.documentType = isChildListingNormal[1].replace(/_/g, " ");
      results.push(out);
    }
  }

  return results;
}

const parseRemoteUrl = async (urlToParse, parserId) => {
  const urlToParseId = "H" + new Buffer(urlToParse).toString("base64");
  const urlToParseId2 = "H" + sha256(urlToParse) + ".N";
  const resp = await graphql(`
        query {
          nodes(ids: ["${urlToParseId}", "${urlToParseId2}"]) {
            id
            ... on CrawledURL {
              lastSuccessfulRequest {
                id
              }
            }
          }
        }`);

  let parserRes;
  let node = resp.nodes && resp.nodes.filter((n) => n)[0];
  if (node && node.lastSuccessfulRequest) {
    // Parse acordao listing page
    parserRes = await graphql(`
          query {
            node(id:"${parserId}") {
              ... on CrawledPageParser {
                jsonOutputFor(requestId:"${node.lastSuccessfulRequest.id}")
              }
            }
          }`);
  }

  return parserRes && parserRes.node && parserRes.node.jsonOutputFor; //returns array, filter as necessary
};
