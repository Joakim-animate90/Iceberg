function UcFirst(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}
// A MATCH TO MATCH THIS TYPE OF NUMBERS
  let match = title && /([\wóò]+).*\bN[o°]\D+(\d+(?:[-.]\d+)*)(?=\s|$)/.exec(title.trim()) || /([\wóò]+)\D+(\d+)/.exec(title.trim());
async function replaceImgsUrlsWithMediaObjects($, URL) {
    let imgs = $("img").toArray();
   
    for (let el of imgs) {
      let imgSrc = $(el).attr("src");
      if (imgSrc != null) {
     
        let imgUrl = url.resolve(URL, imgSrc);
        let mediaObject = await getCrawledPageMediaObject(imgUrl);
        if (mediaObject) {
         
          //throw new Error(JSON.stringify({mediaObject, imgSrc}, 1, null))
         $(el).attr("src", `mediaobject://${mediaObject.id}`);
        // throw new Error($.html(el));
          
        }
      }
    }
  }

function Capitalize(string) {
	return string.trim().charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function formatString(entry) {
	return entry.split(' ').map(function (p) {
		return Capitalize(p);
	}).join(' ');
}
function Capitalize(string) {
    let index = 0;

    // Remove non-alphabetical characters from the beginning
    while (index < string.length && !/[a-zA-Z]/.test(string.charAt(index))) {
        index++;
    }
    string = string.slice(index).replace(/^[^a-zA-Z]+/, '');

    // Capitalize the string if it starts with a lowercase letter
    if (index < string.length && string.charAt(index) === string.charAt(index).toLowerCase()) {
        string = string.charAt(index).toUpperCase() + string.slice(index + 1);
    }


    return string;
}


