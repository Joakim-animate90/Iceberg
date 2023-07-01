function getSeeds() {
    // get a dict of areas
    let areas = {
        "OfficialSection": 999991,
    }
    let start = moment().subtract(1, 'days');
    let end = moment();
    let initial = end.clone();
    let baseURL = `https://www.bundesanzeiger.de/pub/en/search?0 `;
    let urls = [];

    while (initial.isSameOrAfter(start)) {
        let areaNames = Object.keys(areas); // Get the area names
        areaNames.forEach(areaName => {
            let url_complete =  baseURL + `&areaName=${areaName}&area=${areas[areaName]}&from=${start.format("YYYY-MM-DD")}&to=${end.format("YYYY-MM-DD")}&page=1`;
            urls.push(url_complete);
        });

        initial = initial.subtract(1, 'days');
    }
    
    return urls;
}


// https://www.bundesanzeiger.de/pub/en/search?0&areaName=OfficialSection&area=999991&from=2021-10-01&to=2021-10-05&page=1