function parsePage({responseBody, URL, html}) {
    const $ = cheerio.load(responseBody.content, {xml: true});
    let results = [];
    $("TEXTE_JURI_JUDI").each(function (i, root) {
        root = $(root);
        let doc = {};
        //Meta Commun
        doc.issuer = root.find('META_SPEC>META_JURI>JURIDICTION').first().text().trim();
    
        results.push(doc)
    });
    return results;
}