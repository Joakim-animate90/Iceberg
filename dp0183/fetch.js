function getDocuments(titleAll) {
    var pattern = /\.-/g; //note the g flag
    var indices = [];
    var docs = []; //array containing all docs
    var match;
    while (match = pattern.exec(titleAll)) {
        indices.push(match.index);

    }

    if (indices.length > 1) {


        var whereToStartSlicing = 0;

        indices.shift(); //remove first occurence of mark so that loop starts from second occurence

        while (indices.length) {
            var match;
            var pos;
            var doc; //single doc
            //check if the occurence of mark is preceded by certain words
            var currentIndex = indices.shift(); //index of the current mark
            var lookForAcuerdo = titleAll.slice(currentIndex - 7, currentIndex);
            var lookForDECRETO = titleAll.slice(currentIndex - 15, currentIndex);
            var lookForFeDeErratas = titleAll.slice(currentIndex - 13, currentIndex);

            if (lookForAcuerdo.toUpperCase().trim() === "ACUERDO")
                pos = currentIndex - 7;
            else if (match = lookForDECRETO.toUpperCase().replace(/\s+/g, " ").match(/DECRETO NO\. [0-9]+/)) {
                pos = (currentIndex - 15) + match.index;
            } else if (lookForFeDeErratas.toUpperCase().trim() === "FE DE ERRATAS")
                pos = currentIndex - 13;
            else { //case when .- is not preceded by any of the patterns or key words
                continue;
            }

            doc = titleAll.slice(whereToStartSlicing, pos);
            docs.push(doc);
            whereToStartSlicing = pos;

        }
        //add the last slice which is left out by the above loop
        var remainingSlice = titleAll.slice(whereToStartSlicing);
        //special case noted of a last document not marked by .-
        if (match = remainingSlice.match(/DECRETO No\. 317/)) {
            let pos = match.index;
            docs.push(remainingSlice.slice(0, pos));
            docs.push(remainingSlice.slice(pos));

        } else {
            docs.push(remainingSlice);
        }
        return docs;
    } else {
        docs.push(titleAll);
        return docs;
    }

}

function parsePage({ URL, responseBody, html }) {
    const $ = cheerio.load(responseBody.content);
    var docs = [];
    var contents = $('div.luna tbody');

    var documentsExcludingHeader = $(contents).find('tr').slice(1);
    documentsExcludingHeader.each(function(i, elem1) {
        var doc = {};
        var gazette_date = $(elem1).find('td').first().text().trim();
        var gazette_number = $(elem1).find('td').eq(1).text().trim();
        var linkRelative = $(elem1).find('a').attr('href');
        var link = url.resolve("http://periodico.tlaxcala.gob.mx/indices/", linkRelative);
        doc.gazette_date = gazette_date;
        doc.gazette_number = gazette_number;
        //doc.link = link;
        //title
        var titleAll = $(elem1).find('td').eq(2).text().trim();
        var documents = getDocuments(titleAll);
        if (documents) {
            for (var i in documents) {
                var docn = Object.assign({}, doc);
                docn.title = documents[i].trim();
                docn.title = docn.title.replace(/^"|"$/g, "");

                docn.title = docn.title.split(/\.(?:-)?\s/).map(title => {
                    title = title.trim();
                    return title.slice(0, 1).toUpperCase() + title.slice(1).toLowerCase();
                }).join(". ");


                const upperCaseList = ["tribunal", "superior", "justicia", "estado", "tlaxcala"]

                for (let str of upperCaseList) {
                    docn.title = docn.title.replace(str, str.slice(0, 1).toUpperCase() + str.slice(1).toLowerCase());
                }


                let docnum = ++i;
                let docnLink = link + "&doc=" + docnum;
                docn.link = [docnLink];
                docs.push(docn);
            }
        }

    })
    return docs;
}