function getSeeds() {

    let start = moment().subtract(1, 'days');
    let end = moment();

    // start = moment('2023-06-01')
    //  end = moment('2023-06-10')
    let baseUrl = 'https://www.bopa.ad/Documents?search=&'
 
    let url_complete =  baseURL + `from=${start.format("YYYY-MM-DD")}&to=${end.format("YYYY-MM-DD")}&page=0`;
   
    
    return [url_complete];
}