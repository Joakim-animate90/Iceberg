import cheerio from 'cheerio';
export default function discoverLinks ({ content, contentType, canonicalURL, requestURL }) {
    const links = []
    if (/html/i.test(contentType)) {
      const $ = cheerio.load(content)
      if (canonicalURL.startsWith('https://tjajal.gob.mx/boletines?1=1&page=')) {
        const table = $('table')
        const tbody = table.find('tbody')
        // get the expediente attribute and sala 
        
        const expedientes = tbody.find('tr').map((i, el) =>{ 
            const expediente = $(el).find('td').attr('expediente')
            const sala = $(el).find('td').attr('sala')
            return { [expediente]: sala }
        }).get()
        expedientes.forEach(expediente => {
                
            const [exp, date] = Object.keys(expediente)[0].split('/')
            const sala = Object.values(expediente)[0]
            const link = `https://tjajal.gob.mx/boletines/details?exp=${exp}%2F${date}&sala=${sala}`
            links.push(link)
        })

    }

  
    }
    
  
    return links
  }