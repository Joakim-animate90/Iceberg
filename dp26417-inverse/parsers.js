const PARSE_PDF_DATE = false;

async function parsePage({ URL, responseBody, referer }) {
    let $ = cheerio.load(responseBody.content)
    const results = []
    const table = $('.table__wrapper, .paragraph, .tablesorter #table98554')
    if (/(section-22|notices-of-consent|section-17|section-18|section-22a|library|s22m|consent-notices|s17|s22a|s22)$/i.test(URL)) {
        let section = $('h1.page-title').text().trim()
        table.find("tbody tr").each(function() {
            let tr = $(this)
            const mother = { URI: null, URL, isMother: true }
            let date = tr.find('td').eq(0).text().trim() || null
            let trainOperator = tr.find('td').eq(1).text().trim() || null
            let number = tr.find('td').eq(2).text().trim() || null
            let { motherTitle, motherURI } = createMother({ trainOperator, number, date });
            mother.URI = motherURI
            mother.title = motherTitle;
            mother.trainOperator = trainOperator
            mother.dateOriginal = date;
            mother.date = formatDate(mother.dateOriginal)
            mother.number = number.length < 10 && /\d+/.test(number) && /th/.test(number) ? number : null;
            mother.section = section
            results.push(mother)

            const events = [];
            tr.find('td a').each(function(i) {
                let a = $(this)
                let title = a.text();
                let href = a.attr('href')
                let order = i + 1
                events.push({ href, title, order, motherURI })
            })
            let totalEvents = events.length
            for (let i = 0; i < events.length; i++) {
                const doc = { URI: null, URL, isChild: true }
                let { href, title, order, motherURI } = events[i];
                href = href ? url.resolve(URL, href) : null;
                doc.URI = href
                doc.title = title
                doc.parentURI = motherURI
                doc.class = order === 1 ? 'Initial Bill' : null
                doc.order = order
                doc.inverseOrder = totalEvents + 1 - i
                doc.section = section
                if (/\.[pd][do][fc]/i.test(href)) {
                    results.push(doc)
                }
            }
        });
    } else if (/(legal-notices)$/i.test(URL)) {
        let section = ''
        $('.accordion__content .paragraph .field').each(function() {
            let doc = { URI: null, URL };
            let paragraph = $(this);
            let s = paragraph.find('h2').text().trim() || null
            if (s) { section = s }
            doc.section = section
            let a = paragraph.find('article a.media-link');
            let href = a.attr('href')
            href = href ? url.resolve(URL, href) : null;
            doc.URI = href
            let title = a.text().trim()
            doc.title = title
            href && results.push(doc);
        });
    } else if (/(closures|depot-applications-decisions|appeals|transport-for-london-appeal-under-regulation-29-and-complaint-under-regulation-30)$/i.test(URL)) {
        let section = $('h1.page-title').text().trim()
        let subsection = null
        $('.node__content .paragraph .field>').each(function() {
            let paragraph = $(this);
            let tag = paragraph[0].name;
            if (/(div|h3|h4)/.test(tag) || /(h2)/.test(tag)) {
                subsection = paragraph.text();
            }
            paragraph.find('li a[href], p a[href]').each(function() {
                let doc = { URI: null, URL };
                let a = $(this)
                let href = a.attr('href');
                href = href ? url.resolve(URL, href) : null;
                doc.URI = href;
                let title = a.text().trim()
                let match = /(\d{1,2}\s+\w+\s+\d{4})/.exec(title)
                let dateOriginal = match && match[1]
                doc.dateOriginal = dateOriginal
                doc.date = formatDate(dateOriginal)
                doc.title = title;
                doc.section = section
                doc.subsection = subsection;
                if (/[dp][od][cf]/i.test(href) || /show\/nav\.\d+$/i.test(URL)) {
                    results.push(doc)
                }
            })
        });
    } else if (/(control-period-6|new-operators)$/i.test(URL)) {
        let section = $('h1.page-title').text().trim()
        $('.field__item article').each(function() {
            let doc = { URI: null, URL };
            let a = $(this).find('a')
            let href = a.attr('href')
            href = href ? url.resolve(URL, href) : null;
            doc.URI = href
            let title = a.text().trim()
            doc.title = title
            let date = $(this).find('.orr-published-date').text()
            let match = /(\d{1,2}\s+\w+\s+\d{4})/.exec(title) || /(\b\d{1,2}\b.*\b\d{4}\b)/.exec(date)
            let dateOriginal = match && match[0]
            doc.dateOriginal = dateOriginal
            doc.date = formatDate(dateOriginal)
            doc.section = section
            results.push(doc)
        })
    } else if (/show\/nav\.\d+$/.test(URL)) {
        let section = $('h1.contentTitle').text().trim()
        $('ul.multiList li').each(function() {
            let doc = { URI: null, URL };
            let li = $(this)
            let a = li.find('a')
            let href = a.attr('href')
            href = href ? url.resolve(URL, href) : null;
            doc.URI = href
            let title = a.text().trim()
            doc.title = title
            let date = li.find('.publishedDate').text().trim()
            doc.dateOriginal = date
            doc.date = formatDate(doc.dateOriginal)
            doc.section = section
            results.push(doc)
        })
    } else if (/(regulation-29-appeal-by-dbs)$/i.test(URL)) {
        let section = $('h1.page-title').text().trim()
        let subsection = null
        $('.node__content .field .field__item>').each(function() {
            let paragraph = $(this);
            let tag = paragraph[0].name;
            if (/(div|h3|h4)/.test(tag) || /(h2)/.test(tag)) {
                subsection = paragraph.text();
            }
            paragraph.find('li a[href], p a[href]').each(function() {
                let doc = { URI: null, URL };
                let a = $(this)
                let href = a.attr('href');
                href = href ? url.resolve(URL, href) : null;
                doc.URI = href;
                let title = a.text().trim()
                let match = /(\d{1,2}\s+\w+\s+\d{4})/.exec(title)
                let dateOriginal = match && match[1]
                doc.dateOriginal = dateOriginal
                doc.date = formatDate(dateOriginal)
                doc.title = title;
                doc.section = section
                doc.subsection = subsection;
                results.push(doc)
            })
        });
    }
    //return results
    let final = []
    let originalDocs = []
    for (const obj of results) {
        let { URI: uri, date: listingDate } = obj
        if (!listingDate && PARSE_PDF_DATE) {
            let output = await parseRemoteUrl(uri);
            let pmatch = output && output.filter(obj => obj.URI[0] === uri)
            let dateOriginal = pmatch && pmatch[0] && pmatch[0].dateOriginal
            let date = pmatch && pmatch[0] && pmatch[0].date
            final.push(Object.assign(obj, { date, dateOriginal }))
                //originalDocs.push({d, dateOriginal, date})
        } else {
            final.push(obj)
        }
    }
    return final.map(record => {
        // clean the title
        if (/\s+(pdf|icon).+/i.test(record.title)) {
            return Object.assign(record, { title: record.title.replace(/\s+(pdf|icon).+/ig, '').trim() })
        } else return record
    });
}

const createMother = ({ trainOperator, number, date }) => {
    let motherTitle = `${trainOperator} ${date}`
    let t = `${trainOperator} ${date}`
    let slug = t.toLowerCase().replace(/\s+/g, '_').replace(/[\(\)]/g, '')
    let motherURI = `https://www.orr.gov.uk/guidance-compliance/rail/title=${slug}`
    return { motherURI, motherTitle }
}

const formatDate = (date) => {
    let d = date && moment(date.replace(/\sdel?/g, ''), ['DD MMMM YYYY', 'DD/MM/YYYY', 'DD-MM-YYYY'], 'es');
    return d && d.isValid ? d.format('YYYY-MM-DD') : null;
}

const sentenceCase = (input) => {
    input = input === undefined ? null : input;
    return (
        input && input.toString().toLowerCase().replace(/(^|[.?!] *)([a-z])/g,
            (match, separator, char) => separator + char.toUpperCase()
        )
    );
};

const parseRemoteUrl = async(urlToParse, parserId = "A06rfxyvl5a86k7") => {
    const urlToParseId = "H" + new Buffer(urlToParse).toString("base64");
    const urlToParseId2 = "H" + sha256(urlToParse) + ".N";
    const resp = await graphql(`
          query {
            nodes(ids: ["${urlToParseId}", "${urlToParseId2}"]) {
              id
              ... on CrawledURL {
                lastSuccessfulRequest {
                  id
                }
              }
            }
          }`);
    let parserRes;
    let node = resp.nodes && resp.nodes.filter(n => n)[0];
    if (node && node.lastSuccessfulRequest) {
        // Parse acordao listing page
        parserRes = await graphql(`
            query {
              node(id:"${parserId}") {
                ... on CrawledPageParser {
                  jsonOutputFor(requestId:"${node.lastSuccessfulRequest.id}")
                }
              }
            }`);
    }
    return parserRes && parserRes.node && parserRes.node.jsonOutputFor; //returns array, filter as necessary
};