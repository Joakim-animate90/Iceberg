async function parsePage({ URL, responseBody, html, responseURL }) {

    let data = []
    let json = JSON.parse(responseBody.content);
    let total = json.files.length;
        for(i = 0; i < total; i++){
   
            let doc = {
                URI: [URL, decodeURI(URL), encodeURI(decodeURI(URL))].filter((c, i, a) => a.indexOf(c) === i),
                title: null,
                number:null,
                publicationDate :null,
                year :null,
                id :null,
                publicationDateOriginal :null,
                documentType :null,
                hits: null,
                URL: [URL, decodeURI(URL), encodeURI(decodeURI(URL))].filter((c, i, a) => a.indexOf(c) === i)

            };
            let pdfURL = json.files[i].linkdownload;
            doc.URI =  pdfURL

            let title = json.files[i].post_title;
            let publicationDate = json.files[i].created
            const regex = /(\d{3}-\d{4})/;
            const match = title.match(regex);
           const regex1 = /(?<=\D)-|-(?=\D)/g;

           let resultTitle = title.replace(regex1, ' ');
           // remove any character that is like this (3) or parentheses
              const regex2 = /\(\d+\)/g
                const match2 = resultTitle.match(regex2);
                if(match2){
                    resultTitle = resultTitle.replace(regex2, '');
                }
            // Res. No. 012-2011 Que promulga el Reglamento para la declaracion de areas protegidas privadas o conservacion voluntaria de la Rep. Dom (
                // remove (
                const regex3 = /\(/g
                const match3 = resultTitle.match(regex3);
                if(match3){
                    resultTitle = resultTitle.replace(regex3, '');
                }
                // remove )
                const regex4 = /\)/g
                const match4 = resultTitle.match(regex4);
                if(match4){
                    resultTitle = resultTitle.replace(regex4, '');
                }
                
             doc.title =  resultTitle
            let number = null
            if (match) {
                number = match[1]
                
            } 
             doc.number = number
            doc.publicationDateOriginal = publicationDate
            //20-04-2023
            let momentDate  = moment(publicationDate, 'DD-MM-YYYY').format('YYYY-MM-DD')
            if(momentDate !== 'Invalid date'){
                doc.publicationDate = momentDate
                // get the year 
                let year = momentDate.split('-')[0]
                doc.year = year

            }else {
                doc.publicationDate = null
            }
            let documentType = URL.split('type=')[1]    
            doc.documentType = documentType
            doc.hits = json.files[i].hits
            doc.id = json.files[i].ID
            data.push(doc)

        }

    return data
  
  }  