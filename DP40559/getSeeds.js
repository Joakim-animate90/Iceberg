function getSeeds() {
    let baseURL = 'https://lawstreetmedia.com/categories/analytics/feed/';
    let currentDate = moment().format('YYYY-MM-DD');
    let currentTime = moment().format('HH:mm:ss');
    let url = baseURL + '?appendDate=' + currentDate + '&appendTime=' + currentTime;
    return [url];

}