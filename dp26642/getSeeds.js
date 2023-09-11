function getSeeds(){
    //create a variable baseURL   
    let baseURL = `https://jurisprudencia.tjto.jus.br/consulta.php?q=Tocantins`
    let startDate = moment().format('YYYY-MM-DD')
    let endDate = moment().subtract(1, 'months').format('YYYY-MM-DD')
    let url = `${baseURL}&documentType=acordao&startDate=${startDate}&endDate=${endDate}&page=1`
    let seeds = []
    seeds.push(url)
    return seeds

}