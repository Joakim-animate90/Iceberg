function getSeeds() {
    let urls = [];
  
  	let start = moment().subtract(1, 'days');
	let end = moment();
  	//let end = start;
	let initial = end.clone();
  	while (initial.isSameOrAfter(start)) {
      	let url_complete = `https://www.bundesanzeiger.de/pub/en/search?from=${start.format("YYYY-MM-DD")}&to=${end.format("YYYY-MM-DD")}&pg=numPages`;
	  	urls.push(url_complete);

      	initial = initial.subtract(1, 'days');
  	}
  return urls;
}