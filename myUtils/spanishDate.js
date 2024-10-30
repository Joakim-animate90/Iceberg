const utility = {
    initialized: false,
    init: function () {
        if (this.initialized) return;
        // console.log("initializing");
        //populate other numbers <100
        for (let i = 30; i < 100; i++) {
            if (this.numbers[i]) continue;
            let tens = Math.floor(i / 10) * 10;
            let ones = i % 10;
            this.numbers[i] = this.numbers[tens] + " y " + this.numbers[ones];
        }
        this.initialized = true;
    },
    numbers: {
        "uno": 1, "dos": 2, "tres": 3, "cuatro": 4, "cinco": 5, "seis": 6, "siete": 7, "ocho": 8, "nueve": 9, 
        "diez": 10, "once": 11, "doce": 12, "trece": 13, "catorce": 14, "quince": 15, "dieciséis": 16, "diecisiete": 17, 
        "dieciocho": 18, "diecinueve": 19, "veinte": 20, "veintiuno": 21, "veintidós": 22, "veintitrés": 23, "veinticuatro": 24, 
        "veinticinco": 25, "veintiséis": 26, "veintisiete": 27, "veintiocho": 28, "veintinueve": 29, "treinta": 30, "mil": 1000
    },
    months: {
        "enero": "01", "febrero": "02", "marzo": "03", "abril": "04", "mayo": "05", "junio": "06", 
        "julio": "07", "agosto": "08", "septiembre": "09", "octubre": "10", "noviembre": "11", "diciembre": "12"
    },
    matchNo: function (text) {
        return this.numbers[text] || null;
    },
    splitBigNo: function (text) {
        this.init();
        let currentValue = 0;
        let value = this.matchNo(text);
        if (value) {
            return currentValue + value;
        }
        let match = /(.*mil\s*)/i.exec(text);
        if (match) {//hundreds
            let thousands = match[1];
            text = text.replace(thousands, "").trim();
            let howMany = thousands.replace(/\s*mil\s*$/i, "").trim();
            howMany = howMany ? this.splitBigNo(howMany) : 1;
            currentValue += 1000 * howMany;
        }
        value = this.matchNo(text);
        if (value) {
            return currentValue + value;
        }
        match = /([^\s]*cien(tos)?\s*)/i.exec(text);
        if (match) {//hundreds
            let hundreds = match[1];
            text = text.replace(hundreds, "").trim();
            if (hundreds === 'ciento') hundreds = "cien";
            let howMuch = this.matchNo(hundreds);
            currentValue += howMuch;
        }
        value = this.matchNo(text);
        if (value) {
            return currentValue + value;
        }
        return currentValue;
    },
    parseSpanishDate: function (spanishDate, URL) {
        spanishDate = spanishDate.replace(/\./, "").replace(/veintiún/i, "veintiuno").replace(/quince y/, "").replace(/\n/g, " ")
        const dayRegex = /a\s*los\s*(.+)\s*días/;
        const monthRegex = /del\s*mes\s*de\s*(\w+)/i;
        const yearRegex = /del\s*año\s*(.+)/ ;

        // Extract day, month, and year from the date string
        const dayMatch = spanishDate.match(dayRegex);
        const monthMatch = spanishDate.match(monthRegex) || spanishDate.match(/del\s*mes\s*(\w+)/i);
        const yearMatch = spanishDate.match(yearRegex) || spanishDate.match(/(dos\s*mil\s*.*)/);
      //  return [dayMatch, monthMatch, yearMatch]

        if (!dayMatch || !monthMatch || !yearMatch) {
            return null;
        }

        // Convert day and year
        const day = this.matchNo(dayMatch[1].toLowerCase().trim());
        const month = this.months[monthMatch[1].toLowerCase().trim()];
        const year = this.splitBigNo(yearMatch[1]);
        if (day && month && year) {
           //return `${year}-${month}-${day < 10 ? "0" + day : day}`;
            let formattedYear = year.toString().length === 1 ?  year + "000"  : year;
            formattedYear = year.toString().length === 2 ?  "20" + year   : year;
            let yearURL = getYearFromURL(URL) 
            if(yearURL){
             if(yearURL != formattedYear) formattedYear = yearURL
            }

            return `${formattedYear}-${month}-${day < 10 ? "0" + day : day}`;
        }
        return null;
    },

};
