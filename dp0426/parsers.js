function parsePage({responseBody, URL, html, referer}) {
    console.log(`parsePage: parsing: ${responseBody.fileFormat} ${URL}`);
    let json;
    try {
        json = JSON.parse(responseBody.content);
    } catch (e) {
        console.error("error parsing json ", e);
        return [];
    }
    let doc = {
        numeroDeCaso:null,
        tipoDeAccion:null,
        processoDeOrigen:null,
        motivo:null,
        desicionResumen:null,
        desicion:null,
        conceptos:null,
        derechos:null,
        legitimados:null,
        casosAcumulados:null,
        senteciasRelacionados:null

    }
    return [doc];
}


