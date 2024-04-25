function getSeeds(){
    
    let startDate = moment().subtract(1,"months");
    let stopDate = moment();

    //manual override
    //startDate = moment("2023-01-01","YYYY-MM-DD");
    //stopDate = moment("2023-04-12","YYYY-MM-DD");

    if (startDate.isAfter(stopDate)){
        [startDate, stopDate] = [stopDate, startDate];
    }

    let href = `https://samai.consejodeestado.gov.co/TitulacionRelatoria/BuscadorProvidenciasTituladas.aspx?type=caqueta&from=${startDate.format("YYYY-MM-DD")}&to=${stopDate.format("YYYY-MM-DD")}`;
    return [href];

}

https://samai.consejodeestado.gov.co/TitulacionRelatoria/BuscadorProvidenciasTituladas.aspx?type=caqueta&from=2024-01-01&to=2024-04-12