function parsePage({responseBody, URL, html, referer}) {
    console.log(`parsePage: parsing: ${responseBody.fileFormat} ${URL}`);
    let params = querystring.parse(URL.substring(URL.indexOf('?') + 1));
    const {year} = params;
    const $ = cheerio.load(responseBody.content, {decodeEntities: false});
    const docs = [];
    let table = $('table[id^="onetidDoclibViewTbl0"]');
    let document_type = $(".titulo-pagina h1").text().replace(/\s+/g, " ").trim().replace(/proyectos/i, "Proyecto");
    let headers = {};
    table.find(">thead>tr").first().children().each(function (i) {
        let title = $(this);
        let label = title.text().replace(/\s+/g, " ").trim();
        
        if (/Año/i.test(label))
            label = 'year';
        else if (/^(name|nombre)/i.test(label))
            label = "child";

        label && (headers[i] = label);
    });
    // console.log(JSON.stringify(headers, null, 4));
    table.find(">tbody>tr").each(function (i) {
        let cells = $(this).children();
        if (cells.length < Object.keys(headers).length) return;
        let doc = {isMother: true, document_type, children: []};


        cells.each(function (j) {
            let td = $(this);
            let label = headers[j];
            if (!label) return;
            let value = td.text().replace(/\s+/g, " ").trim();
            if (/year/i.test(label))
                value = parseInt(value) || null;
            else if (/child/i.test(label)) {
                let a = td.find('a[href]');
                let label = a.text().replace(/\s+/g, " ").trim();
                let URI = a.attr('href');
                URI = URI ? [url.resolve(URL, URI)] : [];
                let child = {
                    title: label,
                    URI,
                  	class: "Initial Bill",
                    parentURL: null,
                    //summary: null,
                    //firstParticipationDate: null,
                    //lastParticipationDate: null,
                    //firstParticipationDateSpanish: null,
                    //lastParticipationDateSpanish: null,
                  	sortValue: 1,
                  	inverseSortValue: 2,
                    contacts: [],
                };
                doc.children.push(child);
            } else if (/^crea[dt]/i.test(label))
                return;
            else if (/Descrip/i.test(label)) {
                
                //title
                html = td.html().replace(/\s+/g, " ").trim().split(/\s*<br\s*\/?>\s*<br\s*\/?>\s*/ig);
                value = $(html[0]).text().replace(/\s+/g, " ").trim().replace(/^["“'\s]+|[\s"“'.”]+$/ig, "");
                label = "title";
                //child
                let child = {
                  			URI: [],
                            sortValue: 2,
                            inverseSortValue: 1,
                	};
                child.contacts = [];
                //child.summary = null;
                for (let i = 1; i < html.length; i++) {
                    let frag = html[i];
                    // console.log(frag);
                    // console.log();
                    // console.log();
                    const _$ = cheerio.load(frag);
                    let hasEmail = false;
                    let fragmentText = _$.text().replace(/\s+/g, " ").trim();
                    let match = /Conozca la ([\w]+(\s\w+)?) de\b/i.exec(fragmentText);
                    // console.log("______________________");
                    // console.log(fragmentText);
                    // console.log(match);
                    // console.log("______________________");
                    child.title = child.title || match && match[1];
                    _$("a[href*=mailto]").each(function (ii) {
                        let a = _$(this);
                        let mail = a.text().replace(/\s+/g, " ").trim();
                        if (/.+@.+/i.test(mail)) {
                            child.contacts.push(mail);
                            hasEmail = true;
                        }

                      doc.summary = fragmentText;
                    });
                    _$("a[href]:not([href*=mailto])").each(function (ii) {
                        let a = _$(this);
                        let URI = a.attr('href');
                        URI = URI ? url.resolve(URL, URI) : null;
                        /^https?:/i.test(URI) && child.URI.push(URI);
                    })
                    //check for date in fragmentText
                  	dates({doc, fragmentText});
                }
                child.title && doc.children.push(child);
               
            }
            doc[label] = value;
        });
        //do something with doc
      	if(!doc.firstParticipationDate){
        	checkParticipationDates({doc, fragmentText: doc.title});
        }
        docs.push(doc);
    });
    let results = [];
    for (let i = 0; i < docs.length; i++) {
        let mother = docs[i];
        mother.URI = mother.title && URL.replace(/\?.*/, "") + `/${mother.document_type.toLowerCase().replace(/\W+/g, "_")}/${mother.year}/${mother.title.toLowerCase().replace(/\W+/g, "_")}`
        if (mother.URI) {
          	mother.URL = URL;
            //remove all the children that have no URI with  an xlsx in the URI
            mother.children = mother.children.filter(child => child.URI.length && !/xlsx?$/i.test(child.URI));
             if (mother.children.length !== 0) results.push(mother);
      
            for (let j = 0; j < mother.children.length; j++) {
                let child = mother.children[j];
             
                child.parentURL = mother.URI;
              	child.URL = URL;
               /\.(pdf|docx?|zip)/i.test(child.URI) && child.URI.length && results.push(child);
               // results.push(child);
            }
            
        }
        delete mother.children;

    }
    return results;
}
function dates({doc, fragmentText}){
  let match = /\b(a partir|desde)\b\D* (enero|febrero|marzo|abril|mayo|junio|julio|agosto|sep?tiembre|octubre|noviembre|diciembre)\D* ?(\d{1,2})[del ]* (\d{4})\b/i.exec(fragmentText);
  let fD = match && match[3];
  let fM = match && match[2];
  let fY = match && match[4];
  match = /\b(a partir|desde)\b\D*(\d{1,2})[del ]* (enero|febrero|marzo|abril|mayo|junio|julio|agosto|sep?tiembre|octubre|noviembre|diciembre)[del ]* (\d{4})\b/i.exec(fragmentText);
  fD = fD || match && match[2];
  fM = fM || match && match[3];
  fY = fY || match && match[4];
  match = /\b(enero|febrero|marzo|abril|mayo|junio|julio|agosto|sep?tiembre|octubre|noviembre|diciembre)\D* ?(\d{1,2})[del ]* (\d{4})\b.*\b(hasta|antes)\b/i.exec(fragmentText);
  fD = fD || match && match[2];
  fM = fM || match && match[1];
  fY = fY || match && match[3];
  match = /\b(\d{1,2})[del ]* (enero|febrero|marzo|abril|mayo|junio|julio|agosto|sep?tiembre|octubre|noviembre|diciembre)[del ]* (\d{4})\b.*\b(hasta|antes)\b/i.exec(fragmentText);
  fD = fD || match && match[2];
  fM = fM || match && match[1];
  fY = fY || match && match[3];
  //|hasta|antes
  match = /\b(hasta|antes)\b\D* (enero|febrero|marzo|abril|mayo|junio|julio|agosto|sep?tiembre|octubre|noviembre|diciembre)\D* ?(\d{1,2})[del ]* (\d{4})\b/i.exec(fragmentText);
  let lD = match && match[3];
  let lM = match && match[2];
  let lY = match && match[4];
  match = /\b(hasta|antes)\b\D*(\d{1,2})[del ]* (enero|febrero|marzo|abril|mayo|junio|julio|agosto|sep?tiembre|octubre|noviembre|diciembre)[del ]* (\d{4})\b/i.exec(fragmentText);
  lD = lD || match && match[2];
  lM = lM || match && match[3];
  lY = lY || match && match[4];
  fY = fY || lY;
  fM =fM || lM;
  if(fD && fM && fY){
    let time = 'first';
  	doc[`${time}ParticipationDate`] = doc[`${time}ParticipationDate`] || null;
    doc[`${time}ParticipationDateSpanish`] = doc[`${time}ParticipationDateSpanish`] || `${fD} de ${fM} de ${fY}`;
    let d = moment(doc[`${time}ParticipationDateSpanish`].replace(/\s+del?\s+/ig, " ") || "", ["D MMMM YYYY"], 'es');
    doc[`${time}ParticipationDate`] = doc[`${time}ParticipationDate`] || d.isValid() ? d.format("YYYY-MM-DD") : null;
    doc.summary = doc.summary||fragmentText;
  }//not else
  if(lD && lM && lY){
    let time = 'last';
    doc[`${time}ParticipationDate`] = doc[`${time}ParticipationDate`] || null;
    doc[`${time}ParticipationDateSpanish`] = doc[`${time}ParticipationDateSpanish`] || `${lD} de ${lM} de ${lY}`;
    let d = moment(doc[`${time}ParticipationDateSpanish`].replace(/\s+del?\s+/ig, " ") || "", ["D MMMM YYYY"], 'es');
    doc[`${time}ParticipationDate`] = doc[`${time}ParticipationDate`] || d.isValid() ? d.format("YYYY-MM-DD") : null;
    doc.summary = doc.summary||fragmentText;
  }
}

function checkParticipationDates({doc, fragmentText}){
					let matches = fragmentText.match(/\b(a partir|desde|hasta|antes)\b\D* ?(\d{1,2})\b.* [del ]*(\d{4})\b/ig);
                    for (let i = 0; matches && i < matches.length; i++) {
                        let line = matches[i];
                        let match1 = /\b(a partir|desde|hasta|antes)\b\D* (enero|febrero|marzo|abril|mayo|junio|julio|agosto|sep?tiembre|octubre|noviembre|diciembre)\D* ?(\d{1,2})[del ]* (\d{4})\b/i.exec(line);
                        let match = /\b(a partir|desde|hasta|antes)\b\D* ?(\d{1,2})[del ]* (enero|febrero|marzo|abril|mayo|junio|julio|agosto|sep?tiembre|octubre|noviembre|diciembre) [del ]*(\d{4})\b/i.exec(line);
                      	
                        if (match1) {
                          	match = match1;
                            let time = /desde|a partir/i.test(match[1]) || match[5]? "first" : "last";
                            doc[`${time}ParticipationDate`] = doc[`${time}ParticipationDate`] || null;
                            doc[`${time}ParticipationDateSpanish`] = doc[`${time}ParticipationDateSpanish`] || `${match[3]} de ${match[2]} de ${match[4]}`;
                            let d = moment(doc[`${time}ParticipationDateSpanish`].replace(/\s+del?\s+/ig, " ") || "", ["D MMMM YYYY"], 'es');
                            doc[`${time}ParticipationDate`] = doc[`${time}ParticipationDate`] || d.isValid() ? d.format("YYYY-MM-DD") : null;
                            doc.summary = doc.summary||fragmentText;
                        }else if (match) {
                            let time = /desde|a partir/i.test(match[1]) ? "first" : "last";
                            doc[`${time}ParticipationDate`] = doc[`${time}ParticipationDate`] || null;
                            doc[`${time}ParticipationDateSpanish`] = doc[`${time}ParticipationDateSpanish`] || `${match[2]} de ${match[3]} de ${match[4]}`;
                            let d = moment(doc[`${time}ParticipationDateSpanish`].replace(/\s+del?\s+/ig, " ") || "", ["D MMMM YYYY"], 'es');
                            doc[`${time}ParticipationDate`] = doc[`${time}ParticipationDate`] || d.isValid() ? d.format("YYYY-MM-DD") : null;
                            doc.summary = doc.summary||fragmentText;
                        }
                      	if(!doc.firstParticipationDate){
                        	let match1 = /(.*)\b(enero|febrero|marzo|abril|mayo|junio|julio|agosto|sep?tiembre|octubre|noviembre|diciembre)\D* ?(\d{1,2})[del ]* (\d{4})\b.*(hasta|antes)?/i.exec(line);
                        	let match = /(.*)\b(\d{1,2})[del ]* (enero|febrero|marzo|abril|mayo|junio|julio|agosto|sep?tiembre|octubre|noviembre|diciembre) [del ]*(\d{4})\b.*(hasta|antes)?/i.exec(line);
                          	if (match1) {
                              match = match1;
                              let time = "first";
                              doc[`${time}ParticipationDate`] = doc[`${time}ParticipationDate`] || null;
                              doc[`${time}ParticipationDateSpanish`] = doc[`${time}ParticipationDateSpanish`] || `${match[3]} de ${match[2]} de ${match[4]}`;
                              let d = moment(doc[`${time}ParticipationDateSpanish`].replace(/\s+del?\s+/ig, " ") || "", ["D MMMM YYYY"], 'es');
                              doc[`${time}ParticipationDate`] = doc[`${time}ParticipationDate`] || d.isValid() ? d.format("YYYY-MM-DD") : null;
                              doc.summary = doc.summary||fragmentText;
                          }else if (match) {
                              let time = "first";
                              doc[`${time}ParticipationDate`] = doc[`${time}ParticipationDate`] || null;
                              doc[`${time}ParticipationDateSpanish`] = doc[`${time}ParticipationDateSpanish`] || `${match[2]} de ${match[3]} de ${match[4]}`;
                              let d = moment(doc[`${time}ParticipationDateSpanish`].replace(/\s+del?\s+/ig, " ") || "", ["D MMMM YYYY"], 'es');
                              doc[`${time}ParticipationDate`] = doc[`${time}ParticipationDate`] || d.isValid() ? d.format("YYYY-MM-DD") : null;
                              doc.summary = doc.summary||fragmentText;
                          }
                        }
                        //console.log(match);
                    }
}