function caesarCipherDecode(encodedText, shift) {
    let decodedText = '';

    for (let i = 0; i < encodedText.length; i++) {
        let char = encodedText[i];

        if (char.match(/[a-z]/i)) {
            const charCode = encodedText.charCodeAt(i);
            let decodedCharCode;

            if (char === char.toUpperCase()) {
                decodedCharCode = ((charCode - 65 - shift + 26) % 26) + 65; // Uppercase letters (A-Z)
            } else {
                decodedCharCode = ((charCode - 97 - shift + 26) % 26) + 97; // Lowercase letters (a-z)
            }

            char = String.fromCharCode(decodedCharCode);
        }

        decodedText += char;
    }

    return decodedText;
}

const createHeaderTitles = ($) => {
    const regexPattern = /(?:^|(?<=.))\f?SUPERINTENDENCIA\b((?:.|[\r\n])*?)COLOMBIA\b/g;

    //SUPERINTENDENCIA BANCARIA ¡ DE COLOMBIA

    // Find all text nodes that match the regex
    $('div').each(function() {
        const divElement = $(this);

        divElement.find('p').each(function() {
            const paragraphElement = $(this);
            const originalText = paragraphElement.text();

            if (regexPattern.test(originalText)) {
                // Wrap the matched text in <b> tags and center the paragraph
                const modifiedHtml = $('<p>')
                    .css('text-align', 'center') // Apply the center alignment style
                    .html(`<b><br>${originalText}<br><br></b>`); // Wrap the matched text in <b> tags

                paragraphElement.replaceWith(modifiedHtml);
            }
        });
    });

}
const removeName = (text, name, out) => {
    //if name contains accents remove them and add them to the regex to be matched
    let newName = removeAccents(name);

    const prepositions = [
        'a', 'ante', 'bajo', 'cabe', 'con', 'contra', 'de', 'desde',
        'durante', 'en', 'entre', 'hacia', 'hasta', 'mediante', 'para',
        'por', 'según', 'sin', 'so', 'sobre', 'tras', 'versus', 'vía', 'del', 'y', 'la', 'en', '_', "\n", "o", "-", "colombia", "capital"
    ];
    name = name.replace(/^\s+|\s+$/g, '');
    newName = newName.replace(/^\s+|\s+$/g, '');
    let concatName = name + " " + newName;
    const wordRegex = /[\s\n]+/g;
    const words = concatName
        .split(wordRegex)
        .filter(word => {
            const regex = new RegExp(`\\b(${prepositions.join('|')})\\b`, 'gi');
            return !regex.test(word);
        })
        .map(word => {
            const wordWithAccent = word.replace(/([áéíóú])/gi, '[$1]?');
            return `\\b\\s*${wordWithAccent}\\s*\\b`
        }).join('|');
    const regex = new RegExp(`${words}`, 'gi');

    let nameCount = 0;
    let replacedCount = 0;
    let replacedNames = [];

    const replacedText = text.replace(regex, (match) => {
        if (match.trim() === '') {
            return match; // Return the empty match as is
        }
        nameCount++;
        replacedCount++;
        replacedNames.push(match); // Store the replaced name in the array
        return ' LAPARTE ';
    });

    out.namecount = nameCount;
    out.replacedCount = replacedCount;
    out.replacedNames = replacedNames;

    console.log('Number of names:', nameCount);
    console.log('Number of replaced names:', replacedCount);
    console.log('Replaced names:', replacedNames);


    return replacedText;
};

const removeAccents = (text) => {
    const accents = [ // Array of accent characters 
        'á', 'é', 'í', 'ó', 'ú', 'Á', 'É', 'Í', 'Ó', 'Ú',
        'à', 'è', 'ì', 'ò', 'ù', 'À', 'È', 'Ì', 'Ò', 'Ù',
        'ä', 'ë', 'ï', 'ö', 'ü', 'Ä', 'Ë', 'Ï', 'Ö', 'Ü',
        'â', 'ê', 'î', 'ô', 'û', 'Â', 'Ê', 'Î', 'Ô', 'Û',
        'ã', 'ñ', 'õ', 'Ã', 'Ñ', 'Õ',
    ]
    const accentsRegex = new RegExp(`[${accents.join('')}]`, 'g');
    const accentsMap = {
        'á': 'a',
        'é': 'e',
        'í': 'i',
        'ó': 'o',
        'ú': 'u',
    }
    const accentsMapRegex = new RegExp(`[${Object.keys(accentsMap).join('')}]`, 'g');

    return text

}

const handleConsiderando = ($) => {
    const regexPattern = /CONSIDERANDO:?/g;
    const textNodes = $('body')
        .contents()
        .filter(function() {
            return this.nodeType === 3 && regexPattern.test($(this).text()); // Filter only text nodes that match the regex
        });
    //return [textNodes.length]
    // Process each matching text node
    textNodes.each(function() {
        const matchedText = $(this).text();
        // put break after the matched text
        const modifiedText1 = matchedText.replace(regexPattern, function(match) {
            return '<br><br><center><b>' + match + '</b></center><br><br><br><br>';
        });
        $(this).replaceWith(modifiedText1);

        // Wrap the modified text with a <center> tag and make it bold
        const modifiedText2 = '<br><br><center><b>' + modifiedText1 + '</b></center><br><br><br>';

        $(this).replaceWith(modifiedText2);

    });
}

const handleEndOfSentence = ($) => {

    // Define the regex pattern for the dot
    const regexPattern = /(?<=[.!?])\s+(?=[A-Z])/g;

    // Find all text nodes and insert a line break after every dot, excluding "S.A."
    $('body')
        .contents()
        .filter(function() {
            return this.nodeType === 3; // Filter only text nodes
        })
        .each(function() {
            const nodeText = $(this).text();
            const modifiedText = nodeText.replace(regexPattern, function(match) {
                // Make all capital letters bold
                if (match === 'S.A.') {
                    return match; // Return "S.A." without adding a line break
                } else {
                    return '<br>' + match + '<br>'; // Append a line break after the dot
                }
            });
            $(this).replaceWith(modifiedText);

        });

}
const handleFeedCharacters = ($) => {
    $('body')
        .contents()
        .filter(function() {
            return this.nodeType === 3; // Filter only text nodes
        })
        .each(function() {
            const nodeText = $(this).text();
            const cleanedText = nodeText.replace(/[^ -~]+/g, '');
            $(this).replaceWith(cleanedText);
        });


}

function textToHtml(text, name, out) {
    text = removeName(text, name, out);
    const lines = text.split('\n');
    const html = lines.map((line, index) => {
        if (line.trim() === '') {
            // Replace empty lines with the content of the next line
            if (index < lines.length - 1 && lines[index + 1].trim() !== '') {
                return '';
            }
            return '<br>'; // Skip consecutive empty lines
        } else {
            // Escape HTML entities and wrap the line in a <p> tag
            const escapedLine = line.replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
            return `<p>${escapedLine}</p>`;
        }
    }).join('');

    const centeredHtml = `<div style="text-align: center;">${html}</div>`;

    return centeredHtml;
}
async function parsePage({ URL, responseBody, filterOutputs }) {

    const mutationQuery = `mutation {
      transcodeMediaObject(input: {clientMutationId: "0", mediaObjectId: "MEDIA_OBJECT_ID_GOES_HERE", filter: "tesseractOCRSpanish"}) {    
        mediaObject {
          id
          fileFormat
          contentURL
          content	
        }
      }
    }
    `;

    const out = {
        URI: [URL, decodeURI(URL), encodeURI(decodeURI(URL))].filter((c, i, a) => a.indexOf(c) === i)

    };
    let uri = out.URI[0].replace(/tif/i, 'pdf')
    out.URI.push(uri)
    const dataType = "MEDIA";
    const locale = "es";
    if (filterOutputs && filterOutputs.tiff2pdf) {
        out.pdf = [{
            mediaObjectId: filterOutputs.tiff2pdf.id,
            dataType: "MEDIA",
            locale: "es"
        }];
        // from the  url get the name from this url https://wl.superfinanciera.gov.co/SiriWeb/publico/sancion/rep_sanciones_general.jsf?name=D.S. FRUUHGRUHV LQWHUQDFLRQDOHV GH UHDVHJXURV OWGD&fecha=2018/05/23&numero=641.pdf
        const decodedUrl = decodeURIComponent(URL);
        const parsedUrl = url.parse(decodedUrl);
        const query = querystring.parse(parsedUrl.query);
        let name = query.name;
        name = caesarCipherDecode(name, 3)
            //where there is a capital letter followed by a lowercase letter add a space
        name = name.replace(/([a-z])([A-Z])/g, '$1 $2');
        name = name.replace(/\\"/g, '')
        name = name.replace(/"/g, '')
        name = name.replace(/,/g, '')
        out.name = name;



        let html = null;
        let resp = await graphql(mutationQuery.replace(/MEDIA_OBJECT_ID_GOES_HERE/, filterOutputs.tiff2pdf.id));

        if (resp && resp.transcodeMediaObject && resp.transcodeMediaObject.mediaObject && resp.transcodeMediaObject.mediaObject.id) {
            out.html = [{
                mediaObjectId: resp.transcodeMediaObject.mediaObject.id,
                dataType: "MEDIA",
                locale: "es",
                contentURL: resp.transcodeMediaObject.mediaObject.contentURL,
                // content: resp.transcodeMediaObject.mediaObject.content


            }];
            let text = resp.transcodeMediaObject.mediaObject.content
                //return [text]
            if (text) {

                html = textToHtml(text, name, out);
                //return [html]
            }
            if (html) {
                let $ = cheerio.load(html);
                createHeaderTitles($)

                handleConsiderando($)
                handleEndOfSentence($)



                out.htmlContent = {
                    fileFormat: 'text/html',
                    content: $.html(),
                    locale,
                    dataType
                };

                text = $.text()
                out.text = text && text.trim() && { content: text, locale, fileFormat: "text/plain", dataType } || null;
                // out.text = text


            } else {
                out.htmlContent = null;
                out.text = null;
            }




        }
    } else {
        //probably not a tiff but pdf file
        let resp = await graphql(mutationQuery.replace(/MEDIA_OBJECT_ID_GOES_HERE/, responseBody.id));

        if (resp && resp.transcodeMediaObject && resp.transcodeMediaObject.mediaObject && resp.transcodeMediaObject.mediaObject.id) {
            //THE PDF will not display on iceberg since the file has a tiff mime type
            /*out.pdf = [{
                  mediaObjectId: responseBody.id,
                  fileFormat: "application/pdf",
                  locale: "es"
              }];*/
            // Transcode PDF to HTML using remote filter


            out.html = [{
                mediaObjectId: resp.transcodeMediaObject.mediaObject.id,
                dataType: "MEDIA",
                locale: "es"

            }];
            out.pdf = [{
                mediaObjectId: resp.transcodeMediaObject.mediaObject.id,
                dataType: "MEDIA",
                locale: "es"
            }];
        }
    }



    return [out];
}