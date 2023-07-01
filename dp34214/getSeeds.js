let circunDic = {
    altoParaguay: 'altoParaguay',
    amambay: 'amambay',
    caazapa: 'caazapa',
    canindeyu: 'canindeyu',
    capital: 'capital',
    central: 'central',
    concepcion: 'concepcion',
    cordirella: 'cordirella',
    itapua: 'itapua',
    misiones: 'misiones',
    neembucu: 'neembucu',
    paraguari: 'paraguari',
    presidenteHayes: 'presidenteHayes',
    sanPedro: 'sanPedro',
}
let tipoDeDic = {
    acuerdoSentencia: 'acuerdoSentencia',
    sentenciaDefinitiva: 'sentenciaDefinitiva',
    autoInterlocutorio: 'autoInterlocutorio',
} 

function getSeeds() {
    let seeds = [];
    let start = moment().subtract(1, "months").format("DD-MM-YYYY");
    let end = moment().format("DD-MM-YYYY"); // Recent date
    
    //For manual ranges
    start = moment("01-03-2023")
    end = moment("09-05-2023")
  
    const baseUrl = "https://www.csj.gov.py/ResolucionesWeb/Formularios/inicio.aspx";
    
    const circunKeys = Object.keys(circunDic);
    const tipoDeKeys = Object.keys(tipoDeDic);
    
    circunKeys.forEach((circunKey) => {
      const circunValue = circunDic[circunKey];
      
      tipoDeKeys.forEach((tipoDeKey) => {
        const tipoDeValue = tipoDeDic[tipoDeKey];
        
        const url = `${baseUrl}?from=${start.format("DD-MM-YYYY")}&to=${end.format("DD-MM-YYYY")}&Circunscripción=${circunKey}&tipoDeResolucion=${tipoDeKey}&page=1&pg=1`;
        const url2 = `${baseUrl}?from=${start.format("DD-MM-YYYY")}&to=${end.format("DD-MM-YYYY")}&Circunscripción=${circunKey}&tipoDeResolucion=${tipoDeKey}&page=1&po=totalPages`;
        
        seeds.push(url);
      });
    });
    
    return seeds;
  }
  