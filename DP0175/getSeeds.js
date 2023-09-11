function getSeeds(){
    let i = 2;
    let baseURL = `https://www.gob.pe/institucion/smv/normas-legales/tipos/946-resolucion-smv?filter%5Border%5D=&filter%5Bterms%5D=&sheet=`
    let seeds = [];
    while (i <=14){
        baseURL = baseURL + i;
        seeds.push(baseURL);
        i++;

    }
    return seeds;
}