function getSeeds() {
    let seeds = [];
    let start = moment().subtract(1, "months").format("DD-MM-YYYY");
    let end = moment().format("DD-MM-YYYY"); // Recent date

    const baseUrl = "https://wl.superfinanciera.gov.co/SiriWeb/publico/sancion/rep_sanciones_general_par.jsf";

    const url = `${baseUrl}?from=${start.format("DD-MM-YYYY")}&to=${end.format("DD-MM-YYYY")}&page=1`;

    seeds.push(url);

    return seeds;
}