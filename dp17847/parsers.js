async function parsePage({ URL, responseBody, html, responseURL }) {

    let data = []
    let json = JSON.parse(responseBody.content);
    let total = json.results.length;


    for (i = 0; i < total; i++) {

        let doc = {
            URI: [URL, decodeURI(URL), encodeURI(decodeURI(URL))].filter((c, i, a) => a.indexOf(c) === i),
            resolutionNumber: null,
            resolutionDate: null,
            resolutionDateOriginal: null,
            year: null,
            categoria: null,
            documentType: 'Resolucion',
            documentNo: null,
            URL: [URL, decodeURI(URL), encodeURI(decodeURI(URL))].filter((c, i, a) => a.indexOf(c) === i)

        };

        let href = json.results[i].ver;
        href = href ? url.resolve(URL, href) : null;
        doc.URI = href;

        let text = json.results[i].titulo.toString();
        //doc.title = text
        // on text match this type of numbers Resolución No TAT-ICC-006 de 01 de febrero de 2023 
        //  TAT-ICC-006
        let regexResolutionNumber = /(\w{2,3}(\s+)?-(\s+)?\w{2,3}(\s+)?-(\s+)?\d{3})/;
        let resolutionNumberMatch = text.match(regexResolutionNumber);
        doc.resolutionNumber = resolutionNumberMatch && resolutionNumberMatch[0] || null;
        text = text.replace(/de/gi, " ")
        const spanishMonthsLong = /[0-9]{1,2}(\s+)?(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)(\s+)?[0-9]{4}/i;
        const spanishMonthsLongMatch = text.match(spanishMonthsLong);
        let date = spanishMonthsLongMatch && spanishMonthsLongMatch[0] || null;



        const dateParts = date.replace(/[\s\n]+/g, " ").trim().split(" ");

        const day = dateParts[0];
        const month = monthNameMap[dateParts[1]];
        const year = dateParts[2];

        const formattedDate = moment(`${year}-${month}-${day}`).format("YYYY-MM-DD") || null;
        doc.resolutionDateOriginal = date;
        doc.resolutionDate = formattedDate;
        doc.year = json.results[i].año;
        doc.categoria = json.results[i].categoria;
        doc.documentNo = json.results[i].descargar;
        data.push(doc);


    }
    // return data above this resolutionDate  March 6, 2023 
    //  2023-03-06
    let dataAbove = data.filter((item) => {
        //if resolutionDate is after 2023-03-06 return 
        return moment(item.resolutionDate).isAfter("2023-03-06")
    });

    return dataAbove

}
const monthNameMap = {
    enero: "01",
    febrero: "02",
    marzo: "03",
    abril: "04",
    mayo: "05",
    junio: "06",
    julio: "07",
    agosto: "08",
    septiembre: "09",
    octubre: "10",
    noviembre: "11",
    diciembre: "12"
};