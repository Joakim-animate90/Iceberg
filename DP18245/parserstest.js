function convert_month(st_month) {
    var months = { "enero": "01", "febrero": "02", "marzo": "03", "abril": "04", "mayo": "05", "junio": "06", "julio": "07", "agosto": "08", "setiembre": "09", "septiembre": "09", "octubre": "10", "noviembre": "11", "diciembre": "12" };
    if (months[st_month]) {
        return months[st_month];
    } else {
        return null;
    }
}

function capitalizeFirstLetter(text) {
    let array_descripcion = [];
    text.split(" ").forEach(function(item) {
        let word = item.charAt(0).toUpperCase() + item.slice(1).toLowerCase();
        array_descripcion.push(word);
    })
    let name_capitalized = array_descripcion.join(" ");
    name_capitalized = name_capitalized.replace(/ Del /g, ' del ');
    name_capitalized = name_capitalized.replace(/ De /g, ' de ');
    name_capitalized = name_capitalized.replace(/ En /g, ' en ');
    name_capitalized = name_capitalized.replace(/ El /g, ' el ');
    name_capitalized = name_capitalized.replace(/ La /g, ' la ');
    name_capitalized = name_capitalized.replace(/ Que /g, ' que ');
    name_capitalized = name_capitalized.replace(/ Los /g, ' los ');
    name_capitalized = name_capitalized.replace(/ Por /g, ' por ');
    name_capitalized = name_capitalized.replace(/ Para /g, ' para ');
    name_capitalized = name_capitalized.replace(/ Cual /g, ' cual ');
    name_capitalized = name_capitalized.replace(/ Con /g, ' con ');
    return name_capitalized;
}

function parsePage({ responseBody, URL }) {

    if (responseBody.fileFormat != "text/html") { return [] }

    var output = [];

    var $ = cheerio.load(responseBody.content);
    //throw("BODY -> html conversion present:  " + $.html());
    $('figure.foro_post_content_wrapper').each((i, e) => {
        let metadata = {};
        let urls = [];

        $(e).find('p:contains("Descargas:")').first().find('a').each((i, lnk) => {
            urls.push($(lnk).attr('href'));
        });

        // Additional extraction based on <table> and <th> elements
        $(e).find('table.table-bordered.table-condensed').each((i, table) => {
            const hasDescargas = $(table).find('th:contains("Descargas")').length > 0;
            if (hasDescargas) {
                const firstRow = $(table).find('tbody tr').first();
                const downloadLink = firstRow.find('td a').attr('href');
                if (downloadLink) {
                    urls.push(downloadLink);
                }
            }
        });


        metadata["URI"] = urls;
        if (metadata["URI"] == '' || metadata["URI"] == null) {
            return;
        }

        metadata["id_asunto"] = $(e).find('div.title5').text().replace('Asunto ', '').trim();
        metadata["summary"] = $(e).find("p[align='justify']").first().text();
        metadata["summary"] = capitalizeFirstLetter(metadata["summary"]);
        metadata["promovente"] = $(e).find('p:contains("Iniciador o Promovente:")').first().text().replace('Iniciador o Promovente:', '').trim() || null;
        let fecha_presentacion = $(e).find('p:contains("Fecha de presentación:")').first().text().replace('Fecha de presentación:', '').trim() || null;
        if (fecha_presentacion && fecha_presentacion.match(/([0-9]+) +(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre) +([0-9]+)/)) {
            let day = fecha_presentacion.match(/([0-9]+) +(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre) +([0-9]+)/)[1];
            let month = fecha_presentacion.match(/([0-9]+) +(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre) +([0-9]+)/)[2];
            let year = fecha_presentacion.match(/([0-9]+) +(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre) +([0-9]+)/)[3];
            metadata["fecha_presentacion"] = year + "-" + convert_month(month) + "-" + day || null;
        }

        let fecha_turno_and_legislatura = $(e).find('p:contains("Fecha de turno:")').first().text().replace('Fecha de turno:', '').trim() || null;
        if (fecha_turno_and_legislatura && fecha_turno_and_legislatura.match(/([0-9]+) +(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre) +([0-9]+)/)) {
            let day = fecha_turno_and_legislatura.match(/([0-9]+) +(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre) +([0-9]+)/)[1];
            let month = fecha_turno_and_legislatura.match(/([0-9]+) +(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre) +([0-9]+)/)[2];
            let year = fecha_turno_and_legislatura.match(/([0-9]+) +(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre) +([0-9]+)/)[3];
            metadata["fecha_turno"] = year + "-" + convert_month(month) + "-" + day || null;
        }
        //          	throw("BODY -> html conversion present:  " + fecha_turno_and_legislatura);
        if (fecha_turno_and_legislatura && fecha_turno_and_legislatura.match(/(LX.+)$/m)) {

            let legislatura = fecha_turno_and_legislatura.match(/((LX.+))$/m)[1];
            metadata["legislatura"] = legislatura || null;
        }

        metadata["estatus"] = $(e).find('p:contains("Estatus:")').first().text().replace('Estatus:', '').trim() || null;
        metadata["tipo_turno"] = $(e).find('p:contains("Tipo de turno:")').first().text().replace('Tipo de turno:', '').trim() || null;

        metadata["se_turno_a"] = $(e).find('p:contains("Se Turnó a:")').first().text().replace('Se Turnó a:', '').trim() || null;
        metadata["comision"] = $(e).find('p:contains("Comisión:")').first().text().replace('Comisión:', '').trim() || null;
        output.push(metadata);


        //throw("BODY -> html conversion present:  " + asunto);
    });
    output.forEach((e) => {
        e.URI.forEach((uri, i) => {
            if (uri.match(/^https/)) {
                e.URI.push(uri.replace(/^https/, 'http'))
            }
        })
    })
    return output;

}