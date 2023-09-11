async function parsePage({ URL, responseBody, html, responseURL }) {

    let data = []
    let json = JSON.parse(responseBody.content);
    let total = json.files.length;


    for (i = 0; i < total; i++) {

        let doc = {
            URI: [URL, decodeURI(URL), encodeURI(decodeURI(URL))].filter((c, i, a) => a.indexOf(c) === i),
            title: null,
            dateFromPdf: null,
            resolutionNumber: null,
            creationDate: null,
            year: null,
            id: null,
            creationDateOriginal: null,
            documentType: 'Resolucion',
            hits: null,
            URL: [URL, decodeURI(URL), encodeURI(decodeURI(URL))].filter((c, i, a) => a.indexOf(c) === i)

        };
        let pdfURL = json.files[i].linkdownload;
        doc.URI = pdfURL
        const regexYear = /(20\d{2})/;
        const matchesYear = pdfURL.match(regexYear);

        if (matchesYear && matchesYear.length > 1) {
            const year = matchesYear[0];
            doc.dateFromPdf = year;
        } else {
            console.log('No match found.');
        }


        let title = json.files[i].post_title;
        doc.summary = title
        let creationDate = json.files[i].created
        let regex = /(\d+(-|\/)\d{4})/
        let match = title.match(regex);
        if (!match) {
            regex = /(\d+(-|\/)\d{2})/
            match = title.match(regex);
        }
        const regex1 = /(?<=\D)-|-(?=\D)/g;

        let resultTitle = title.replace(regex1, ' ');
        // remove any character that is like this (3) or parentheses
        const regex2 = /\(\d+\)/g
        const match2 = resultTitle.match(regex2);
        if (match2) {
            resultTitle = resultTitle.replace(regex2, '');
        }
        // Res. No. 012-2011 Que promulga el Reglamento para la declaracion de areas protegidas privadas o conservacion voluntaria de la Rep. Dom (
        // remove (
        const regex3 = /\(/g
        const match3 = resultTitle.match(regex3);
        if (match3) {
            resultTitle = resultTitle.replace(regex3, '');
        }
        // remove )
        const regex4 = /\)/g
        const match4 = resultTitle.match(regex4);
        if (match4) {
            resultTitle = resultTitle.replace(regex4, '');
        }
        if (resultTitle) {
            //split where there is year
            const regex = /(\d{4})/
            const match = resultTitle.match(regex);
            if (match) {
                let year = match[1]
                    //split only using the first year
                let index = resultTitle.indexOf(year);

                let titleSplit = resultTitle.substring(index + year.length).trim();
                //titleSplit = titleSplit.slice(1, -1).join(year).trim();
                titleSplit = titleSplit.replace(',', '');
                //remove new lines and spaces using a regex
                const regex = /(\n)/g
                titleSplit = Capitalize(titleSplit.trim())
                doc.title = titleSplit
            } else {
                doc.title = Capitalize(resultTitle.trim())
            }



        }
        let resolutionNumber = null
        if (match) {
            resolutionNumber = match[1]
            if (resolutionNumber.includes('/')) {
                resolutionNumber = resolutionNumber.replace('/', '-')
            }
            //split the resolution number and get the resolution number
            resolutionNumber = resolutionNumber

        }
        doc.resolutionNumber = resolutionNumber
        doc.creationDateOriginal = creationDate
            //20-04-2023
        let momentDate = moment(creationDate, 'DD-MM-YYYY').format('YYYY-MM-DD')
        if (momentDate !== 'Invalid date') {
            doc.creationDate = momentDate
                // get the year 
            let year = momentDate.split('-')[0]
            doc.year = year

        } else {
            doc.creationDate = null
        }
        doc.hits = json.files[i].hits
        doc.id = json.files[i].ID
        data.push(doc)


    }

    return data

}

function Capitalize(string) {
    let index = 0;

    // Remove non-alphabetical characters from the beginning
    while (index < string.length && !/[a-zA-Z]/.test(string.charAt(index))) {
        index++;
    }
    string = string.slice(index).replace(/^[^a-zA-Z]+/, '');

    // Capitalize the string if it starts with a lowercase letter
    if (index < string.length && string.charAt(index) === string.charAt(index).toLowerCase()) {
        string = string.charAt(index).toUpperCase() + string.slice(index + 1);
    }


    return string;
}