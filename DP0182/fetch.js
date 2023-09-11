function parsePage({ URL, responseBody, html, responseURL }) {

    const dataType = 'MEDIA'
    const locale = 'es'
    const data = []
        //test the sn https://www.gob.pe/institucion/sunarp/normas-legales/4321632-112-2023-sunarp-sn
    let issue = URL.match(/sunarp-([a-zA-Z]+)/i) || URL.match(/sncp-([a-zA-Z]+)/i);



    let issuer = null
    if (issue) {
        issuer = issue[1];

    } else {


        console.log("No 'issuer' found in the URL.");
    }


    if (issuer) {
        issuer = issuer;
        if (issuer === 'sn') {
            issuer = "Superintendencia Nacional";
        } else if (issuer === 'sa') {
            issuer = "Superintendencia Adjunta";
        } else if (issuer === 'sg') {
            issuer = "Secretaria General";
        } else if (issuer === 'dtr') {
            issuer = "Dirección Técnica Registral";
        } else if (issuer === 'oa') {
            issuer = "Oficina General de Administración";
        } else if (issuer === 'ogrh') {
            issuer = "Oficina General de Recursos Humanos";
        } else if (issuer === 'ogpp') {
            issuer = "Oficina General de Planeamiento y Presupuesto";
        } else if (issuer === 'cnc') {
            issuer = "Secretaría Técnica del sistema Nacional Integrado de Información Catastral Predial - SNCP";
        } else if (issuer === 'scr') {
            issuer = "Escuela de Capacitación Registral";
        } else if (issuer === 'gg') {
            issuer = "Gerencia General (Hasta 14.10.2013 por el nuevo ROF)";
        } else if (issuer === 'ogti') {
            issuer = "Oficina General de Tecnologías de la Información";
        } else {
            return [];
        }
    } else return [];

    html = responseBody.content
    if (html) {
        const $ = cheerio.load(html, { decodeEntities: false })
        $('script, meta, base').remove()
        doc = {
                pdf_url: [],
                resolutionType: null,
                issuer: issuer,
                resolution_number: null,
                hidden_date: null,
                hidden_dateOriginal: null,
                sumilla: null,
                title: null,
                URL: [URL],

            }
            ///doc.resolutionType = "RSMV"
            // get the number Resolución SMV N.° 003-2020 is 003-2020

        // header institution-document__header black

        let resolution_number = $('.institution-document__header.black').find('h2').text().trim()
        if (resolution_number) {
            // match the number 003-2020
            let match = resolution_number.match(/(\d+(\s*)?-(\s*)?\d+)/i)
            if (match) {
                doc.resolution_number = match[0]
                doc.resolutionType = resolution_number.split(doc.resolution_number)[1]
            } else {
                doc.resolution_number = resolution_number
            }
        }
        // get the date
        let hidden_dateOriginal = $('.institution-document__header.black').find('p').text().trim()
        if (hidden_dateOriginal) {
            //USE MOMENT TO FORMAT THE DATE
            doc.hidden_dateOriginal = hidden_dateOriginal

            const formatString = "D [de] MMMM [de] YYYY";

            let hidden_date = moment(hidden_dateOriginal, formatString, "es").format(
                "YYYY-MM-DD"
            );
            doc.hidden_date = hidden_date
            if (doc.hidden_date === "Invalid date") {
                doc.hidden_date = null
            }
        }

        // get sumilla from class description
        let sumilla = $('.description').children('div:first-child, p:first-child').text().trim();


        // div class mt-4 find a
        let a = $('.mt-4').find('a').attr('href')
        if (a) {
            doc.pdf_url.push(a)
        }
        if (sumilla) {
            // remove new lines
            doc.sumilla = sumilla.replace(/\n/g, " ")
        }

        // get the title from resolution_type + resolution_number

        let title = resolution_number

        if (title) {
            doc.title = title
        }


        data.push(doc)

    }
    // return data above 2023
    //  if (moment(doc.hidden_date).isAfter("2023")) {
    //  return data
    // }else {
    //   return []
    //}
    return data



}