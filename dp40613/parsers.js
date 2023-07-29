function parsePage({ responseBody, URL }) {
    let $ = cheerio.load(responseBody.content);
    let results = [];

    let content = $('.cont_relleno')
        //check for all p elements in content
    let p = content.find('p')

    for (let i = 0; i < p.length; i++) {
        let $currentP = $(p[i]);
        let currentSection = $currentP.html();
        //check if currentSection has more than one a tag
        let aTag = $currentP.find('a');
        if (aTag.length > 1) {
            //split where the a tags are
            let split = currentSection.split('<a');
            //create a html for each
            for (let i = 0; i < split.length; i++) {
                let $newDiv = $('<div class="record"></div>');
                let newSection = split[i];
                //add the a tag back in
                if (i > 0) {
                    newSection = '<a' + newSection;
                }
                //append the new section to the new div
                $newDiv.append(newSection);
                let record = $newDiv.text()
                results.push({ record });
            }

        }
        let truthy = checkIfTextStartsWithResolu(currentSection);

        if (truthy) {
            // Check if the next element contains an anchor tag
            let $nextElement = $(p[i + 1]);

            if ($nextElement.find('a').length === 0) {
                // Create a new <div> tag with class "record"
                let $newDiv = $('<div class="record"></div>');

                // Append the current <p> and the next <p> to the new <div>
                $newDiv.append($currentP).append($nextElement);
                let record = $newDiv.text()
                results.push({ record });
            }
        }


    }
    //for each results getMetadata use map
    results = results.map(result => {
        let metadata = getMetadata(result.record)
        result.metadata = metadata
        return result
    })

    return results
}

function checkIfTextStartsWithResolu(html) {
    let $ = cheerio.load(html);

    let aTag = $('a');
    let textInsideATag = aTag.text().trim();

    return textInsideATag.startsWith('Reso');
}

function getMetadata(html) {
    let $ = cheerio.load(html)
    let metadata = { URI: null, resolutionNo: null, actaNo: null, summary: null, date: null, year: null, title: null }
        // a regex to match this type of Resolución N°7, Acta N°52 de fecha 25.07.19
    let regex = /Resoluci(ó|o)n\s?N°\s?(\d+),\s?Acta\s?N°\s?(\d+) .+ (\d{2}.\d{2}.\d{2})/gi
    let aTagtext = $('a').text()
    let matches = aTagtext.match(regex)
    if (matches) {
        let resolutionNo = matches ? match[1] : null
        let actaNo = matches ? match[2] : null
        let date = matches ? match[3] : null
        metadata.resolutionNo = resolutionNo
        metadata.actaNo = actaNo
        metadata.date = date
    }
    let summary = $('p').text()
    metadata.summary = summary
    let title = metadata.actaNo ? 'Acta' + metadata.actaNo : metadata.resolutionNo ? 'Resolucion' + metadata.resolutionNo : null
    metadata.title = title
    return metadata
}