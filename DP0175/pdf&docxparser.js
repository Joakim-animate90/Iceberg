function get_date(st_date){
	var meses = {"enero": "01", "febrero": "02", "marzo": "03", "abril": "04", "mayo": "05", "junio": "06", "julio": "07", "agosto": "08", "setiembre": "09", "septiembre": "09", "octubre": "10", "noviembre": "11", "diciembre": "12"};
	var re = RegExp('(\\d{1,2}) de (' + Object.keys(meses).join("|") + ') del? (\\d{4})', "i");
	if (match = re.exec(st_date)){
		match[1] = match[1].replace(/^(\d)$/,'0'+'$1');
		return match[3]+ "-" + meses[match[2].toLowerCase()] + "-" + match[1]
	}
	return null;
}

function parsePage({URL, responseBody, html}) {
    const out = {
        URI: [URL]
    };
 
    encoding = [
      {mediaObjectId: responseBody.id, fileFormat: responseBody.fileFormat}
    ];
  
  if (html) {
    //Try to get date
    var txt = cheerio.load(html).text().slice(0,1000).replace(/\s+/g, " ");

    if (match = /Lima[\,\.]\s+a?(?:lunes|martes|miércoles|jueves|viernes|sábado|domingo)? ?(\d{1,2} de (?:enero|febrero|marzo|abril|mayo|junio|julio|agosto|sep?tiembre|octubre|noviembre|diciembre) del? \d{4})/i.exec(txt)){
         out['fecha_resolucion'] = get_date(match[1]);
    }
    if (responseBody.fileFormat != "application/pdf") {
        html = injectStyles(html);
    	html = sanitizeHtml(html,{
           allowedTags: false,
           allowedAttributes: false,
           exclusiveFilter: function(frame) {
          	return frame.tag === 'meta' || frame.tag === 'head';
		   },
           transformTags: {
             "html": "div",
			 "body": "div",
             "a": (tagName, attribs) => {
               if (attribs.href && !/^#/.test(attribs.href)) {
                 delete attribs.href;
                 attribs.class = attribs.class ? attribs.class + " lnk" : "lnk";
                 tagName = "span";
               }

               return {
                 tagName,
                 attribs
               }
             },
             "img": () => {
              	return {tagname: "span", attribs: {}} 
             }
           }
         })
    }
    
  	encoding.push({content: html, fileFormat: "text/html"})
  }
  
  out.encoding = encoding;

  return [out];
}