function parsePage({ URL, responseBody, html, responseURL }) {

    const dataType = 'MEDIA'
    const locale = 'es'
    const data = []

    html = responseBody.content
    if (html) {
        const $ = cheerio.load(html, { decodeEntities: false })
        $('script, meta, base').remove()
        doc = {
            URI:[URL],
            resolutionType: null,
            resolutionNumber:null,
            resolutionDate:null,
            resolutionDateOriginal:null,
            abstract: null,
            title:null,
            URL: [URL],

        } 
        doc.resolutionType = "RSMV"
        // get the number Resolución SMV N.° 003-2020 is 003-2020

        // header institution-document__header black

        let resolutionNumber = $('.institution-document__header.black').find('h2').text().trim()
        if (resolutionNumber) {
            // match the number 003-2020
            let match = resolutionNumber.match(/(\d+-\d+)/i)
            if (match) {
                doc.resolutionNumber = match[0]
            }else {
                doc.resolutionNumber = resolutionNumber
            }
        }
        // get the date
        let resolutionDateOriginal = $('.institution-document__header.black').find('p').text().trim()
        if (resolutionDateOriginal) {
            //USE MOMENT TO FORMAT THE DATE
            doc.resolutionDateOriginal = resolutionDateOriginal

            const formatString = "D [de] MMMM [de] YYYY";

            let resolutionDate = moment(resolutionDateOriginal, formatString, "es").format(
              "YYYY-MM-DD"
            );
             doc.resolutionDate = resolutionDate
            if (doc.resolutionDate === "Invalid date") {
                doc.resolutionDate = null
            }
        }

        // get abstract from class description
        let abstract = $('.description').find('p').text().trim() || $('.description').find('div').text().trim()

        // div class mt-4 find a
        let a = $('.mt-4').find('a').attr('href')
        if (a) {
            doc.URI.push(a)
        }
        if (abstract) {
            // remove new lines
            doc.abstract = abstract.replace(/\n/g, " ")
        }

        // get the title from resolution_type + resolutionNumber

        let title = doc.resolutionType + " " + resolutionNumber

        if (title) {
            doc.title = title
        }


        data.push(doc)

    }
    // return data above 2023
    if (moment(doc.resolutionDate).isAfter("2023-03-01")) {
        return data
    }else {
        return []
    }


    
}