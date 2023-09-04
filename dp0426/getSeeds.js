function getSeeds(){
    //create a variable baseURL   
    let baseURL = `https://buscador.corteconstitucional.gob.ec/buscador-externo/rest/api/sentencia/100_BUSCR_SNTNCIA/?`
    let startDate = moment().format('YYYY-MM-DD')
    let endDate = moment().subtract(1, 'months').format('YYYY-MM-DD')
    let url = `${baseURL}totalPages=0&startDate=${startDate}&endDate=${endDate}&page=1`
    let seeds = []
    seeds.push(url)
    return seeds

}