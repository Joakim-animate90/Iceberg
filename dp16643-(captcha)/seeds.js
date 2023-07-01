function getSeeds() {
    let start = moment().subtract(1, "months").format("DD/MM/YYYY");
    let end = moment().format("DD/MM/YYYY"); // Recent date
  
    //For manual ranges
    //start = moment("2022-11-01").format("DD/MM/YYYY");
    //end = moment("2023-01-06").format("DD/MM/YYYY");
  
    const documentTypes = ["acordao", "decisaoMonocratica"];
    const seedUrls = documentTypes.map(
      (type) =>
        `https://esaj.tjce.jus.br/cjsg/resultadoCompleta.do?from=${start}&to=${end}&type=${type}&page=1`
    );
    
    return seedUrls;
  }