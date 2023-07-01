function getSeeds() {
    let urls = [];
  
  	let start = moment().subtract(180, 'days');
	let end = moment();
  	//let end = start;
	let initial = end.clone();
  	while (initial.isSameOrAfter(start)) {
      	let url_complete = `https://www5.tjmg.jus.br/jurisprudencia/formEspelhoAcordao.do?from=${initial.format("YYYY-MM-DD")}&to=${initial.format("YYYY-MM-DD")}`;
	  	urls.push(url_complete);
      	let pg = 1;
      	while(pg <= 2){
        	let url_pag = `https://www5.tjmg.jus.br/jurisprudencia/formEspelhoAcordao.do?from=${initial.format("YYYY-MM-DD")}&to=${initial.format("YYYY-MM-DD")}&pg=${pg}`;
    		urls.push(url_pag);
          	pg++;
        }
      	initial = initial.subtract(1, 'days');
  	}
  return urls;
}



