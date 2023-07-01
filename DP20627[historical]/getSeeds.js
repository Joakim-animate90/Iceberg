function getSeeds() {
    let urls = [];
 	let start = moment().subtract(1, 'month');
	let end = moment()
  	//let end = start;
	let initial = end.clone();
    let listaOrgaoJulgador = [1-2,1-3,1-4,1-5,1-6,1-7,1-8,1-9,1-10,1-11,1-12,1-13,1-14,1-15,1-16,1-17,1-18,1-19]
  	while (initial.isSameOrAfter(start)) {
        for(let i = 0; i < listaOrgaoJulgador.length; i++){
            let url_complete = `https://www5.tjmg.jus.br/jurisprudencia/formEspelhoAcordao.do?from=${initial.format("YYYY-MM-DD")}&to=${initial.format("YYYY-MM-DD")}&listaOrgaoJulgador=${listaOrgaoJulgador[i]}`;
            urls.push(url_complete);
            let pg = 1;
            while(pg <= 2){
                let url_pag = `https://www5.tjmg.jus.br/jurisprudencia/formEspelhoAcordao.do?from=${initial.format("YYYY-MM-DD")}&to=${initial.format("YYYY-MM-DD")}&listaOrgaoJulgador=${listaOrgaoJulgador[i]}&pg=${pg}`;
                urls.push(url_pag);
                pg++;
            }
        }
      	initial = initial.subtract(1, 'days');
  	}
  return urls;
}