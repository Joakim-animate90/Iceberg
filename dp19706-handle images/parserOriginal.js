async function parsePage({URL, responseBody, html}) {
    //try{
    //test this URL  http://gaceta.diputados.gob.mx/Gaceta/63/2016/sep/20160928.html?title=Invitaciones&ano=_año_XIX&numero=_número_4627&publishedDate=_miércoles_28_de_septiembre_de_2016_&childTitle=__De_la_Comisión_de_Medio_Ambiente_y_Recursos_Naturales and return [ ]
  
    if(/=_año_XIX&numero=_número_4627&publishedDate=_miércoles_28_de_septiembre_de_2016_/i.test(URL)){
      return []
    }
  
   
    const results = []
   let out = {
       URI: [URL, decodeURI(URL), encodeURI(decodeURI(URL))].filter((c, i, a) => a.indexOf(c) === i)
   };
   const dataType = "MEDIA";
   const locale = "es";
  
   html = responseBody.content;
   if (html) {
         out= {
       URI:[URL, decodeURI(URL), encodeURI(decodeURI(URL))].filter((c, i, a) => a.indexOf(c) === i),
       
       
       anoOriginal : null,
       ano: null,
       numero:null,
       publishedDate:null,
       publishedDateOriginale:null,
         title:null,
         section2:null,
       year:null,
       section:null,
       URL:[URL, decodeURI(URL), encodeURI(decodeURI(URL))].filter((c, i, a) => a.indexOf(c) === i),
       parentURL:null,
       
       documentType: null
  
   };
       let $ = cheerio.load(html, {decodeEntities: false});
      //  let testForNulls = ('div').text()
      //  if(testForNulls === 'null') return []
  
     
       //await replaceImgsUrlsWithMediaObjects($, URL)
    
  
       $("script").remove();
       $("img").remove()
       $("a[href]").each(function (i) {
           let a = $(this);
           a.replaceWith(a.html());
       });
      out.htmlContent = {fileFormat: "text/html", content: $.html(), locale, dataType};
      // http://gaceta.diputados.gob.mx/PDF/64/2020/nov/20201104-A.pdf?title=Anexo_A&ano=_año_XXIII&numero=_número_5645&publishedDate=_miércoles_4_de_noviembre_de_2020&anexo%7D
      let isChildListingAnexo1 =  URL.match(/title=(.*)&anexo=(.*)&title=(.*)&ano=(.*)&numero=(.*)&publishedDate=(.*)&childTitle=([^&]*)/i)
      let isChildListingAnexo =  URL.match(/title=(.*)&anexo=(.*)&title=(.*)&ano=(.*)&numero=(.*)&publishedDate=(.*)/i)
      let isChildListingNormal = URL.match(/title=(.*)&ano=(.*)&numero=(.*)&publishedDate=(.*)&childTitle=([^&]*)/i)
   
  
   // get the metadatas
  
   if(isChildListingAnexo){
       // before inserting in the out replace _ with space
    
  
  
       out.title = isChildListingAnexo[3].replace(/_/g, " ")
       out.anoOriginal = isChildListingAnexo[4].replace(/_/g, " ")
       out.anoCleaned = out.anoOriginal ? out.anoOriginal.replace(/ano|año/, "") : null
       let numeral = out.anoOriginal !== undefined ? out.anoOriginal.trim().split(" ")[1] : null
       out.ano = numeral ? convertNumeral(numeral) : null
       let numero = isChildListingAnexo[5].replace(/_/g, " ")
   
       out.numero = /undefined/i.test(numero) ? undefined : numero.match(/\d+/)[0]
       if(/undefined/i.test(out.numero)){
          return []
       }
       let numero_clean = out.numero !== undefined ? out.numero : null
       out.numero_clean = numero_clean ? numero_clean.match(/\d+/)[0] : null
       let publishedDate = isChildListingAnexo[6].replace(/_/g, " ")
       out.publishedDateOriginale = publishedDate
       publishedDate = publishedDate
    
       // remove miércoles 28 de abril de 2021 miércoles and replace with empty string
       // remove anything before the date check if starts with a number if not remove the first word
  
       publishedDate = publishedDate.split(" ")
       // remove the first word if it is not a number
       let i = 0;
       while (!/^\d+/i.test(publishedDate[i])){
           publishedDate.shift()
           i++
       }
       if (/^\d+/i.test(publishedDate[0])){
           publishedDate = publishedDate.join(" ")
       }else{
           publishedDate.shift()
           publishedDate = publishedDate.join(" ")
       }
       // match the four digit year  it should start with  20
       let year = publishedDate.match(/20\d{2}/i)
       out.year = year[0]
       const formatString = 'D [de] MMMM [de] YYYY';
  
      
    
       out.publishedDate = moment(publishedDate, formatString, 'es').format("YYYY-MM-DD")
       out.section = isChildListingAnexo[3].replace(/_/g, " ")
       out.documentType = isChildListingAnexo[1].replace(/_/g, " ")
       out.parentURL = URL.split('?')[0] + "?title=" + isChildListingAnexo[1] + "&anexo=" + isChildListingAnexo[2] 
       out.section = isChildListingAnexo[1].replace(/_/g, " ")
       try {
       let section2 = await parseRemoteUrl(out.parentURL, "A06rtogb48u5u80");
       out.section2 = section2
       if (section2 && section2[0] && section2[0].section2){
        out.section2 = section2[0].section2
        }
    } catch (error) {
        console.log(error)
    }
       results.push(out)
  
  
   }else if (isChildListingNormal){
  
       out.title = isChildListingNormal[5].replace(/_/g, " ")
       out.anoOriginal = isChildListingNormal[2].replace(/_/g, " ")
       out.anoCleaned = out.anoOriginal ? out.anoOriginal.replace(/ano|año/, "") : null
       let numeral = out.anoOriginal !== undefined ? out.anoOriginal.trim().split(" ")[1] : null
       out.ano = numeral ? convertNumeral(numeral) : null
       out.numero = isChildListingNormal[3].replace(/_/g, " ")
       out.numero = /undefined/i.test(out.numero) ? undefined : out.numero.match(/\d+/)[0]
       if(/undefined/i.test(out.numero)){
          return []
       }
        
       let numero_clean = out.numero !== undefined ? out.numero : null
       out.numero_clean = numero_clean ? numero_clean.match(/\d+/)[0] : null
       let publishedDate = isChildListingNormal[4].replace(/_/g, " ")
       out.publishedDateOriginale = publishedDate
       // remove miércoles 28 de abril de 2021 miércoles and replace with empty string
       publishedDate = publishedDate.split(" ")
    
      
       //use moment to parse the date
  
  
  
       // remove the first word if it is not a number
       let i = 0;
       while (!/^\d+/i.test(publishedDate[i])){
           publishedDate.shift()
           i++
       }
       if (/^\d+/i.test(publishedDate[0])){
           publishedDate = publishedDate.join(" ")
       }else{
           publishedDate.shift()
           publishedDate = publishedDate.join(" ")
       }
       let year = publishedDate.match(/20\d{2}/i)
       out.year = year[0]
       publishedDate = publishedDate.split("&")[0]
       out.publishedDateOriginale = publishedDate
       const formatString = 'D [de] MMMM [de] YYYY';
       out.publishedDate =  moment(publishedDate, formatString, 'es').format("YYYY-MM-DD")
       out.section = isChildListingNormal[1].replace(/_/g, " ")
       out.parentURL = URL.split('?')[0]
       out.documentType = isChildListingNormal[1].replace(/_/g, " ")
       results.push(out) 
  
   }
  
   }
  
   
  
   return results;
    // }catch(e){
    //   return []
    // }
  }