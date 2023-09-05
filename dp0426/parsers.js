function parsePage({responseBody, URL, html, referer}) {
    console.log(`parsePage: parsing: ${responseBody.fileFormat} ${URL}`);
    let json;
    let results = []
    json = JSON.parse(responseBody.content);
 

    let doc = {
        URI:[], 
        numeroDeCaso:null,
        numero:null,
        tipoDeAccion:null,
        processoDeOrigen:null,
        motivo:null,
        decisionResumen:null,
        decision:null,
        conceptos:null,
        derechos:null,
        legitimados:null,
        casosAcumulados:null,
        senteciasRelacionados:null,
        URL:[URL]
    }
    
    doc.URI = [json.dato.documento.uuid];
    doc.documentType = json.dato.documento.nombreDocumento;
    doc.fechaDecision = json.dato.fechaDecision;
    doc.numeroDeCaso = json.dato.causa.numero
    doc.numero = json.numero
    doc.tipoDeAccion = json.dato.causa.tipoAccion.nombre
    doc.processoDeOrigen = json.procesoOrigen
    doc.motivo = json.dato.motivo
    doc.decision = json.dato.decision.nombre
    doc.decisionResumen = json.dato.decision.resumenDecision
    doc.conceptos = json.dato.conceptos
    let legitimados = json.dato.legitimados;
    results.push(doc)
        
    

    return results;
}


