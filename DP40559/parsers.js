async function parsePage({ URL, responseBody, html, responseURL }) {

    let doc = {
        URI: [URL, decodeURI(URL), encodeURI(decodeURI(URL))].filter((c, i, a) => a.indexOf(c) === i)
    };

    let data = [];
    const dataType = "MEDIA";
    const locale = "en";

    html = await responseBody.content;
    if (html) {
        let doc = {
            URI: null,
            link: null,
            title: null,
            pubDate: null,
            creator: null,
            category: null,
            permaLink: null,
            description: null,
            content: null,
            isGlobal: null
        };

        html = iconv.decode(responseBody.buffer, 'utf-8');
        let $ = cheerio.load(html, { xmlMode: true });

        $("a[href]").each(function(i) {
            let a = $(this);
            a.replaceWith(a.html());
        });

        $('item').each(async function(i, elem) {
            let item = $(this);
            let article = {
                URI: [],
                link: item.find('link').text() ? item.find('link').text().replace(/\n/g, '').trim() : null,
                title: item.find('title').text() ? item.find('title').text().replace(/\n/g, '').trim() : null,
                pubDateOriginale: item.find('pubDate').text() ? item.find('pubDate').text().replace(/\n/g, '').trim() : null,
                pubDate: null,
                creator: item.find('dc\\:creator').text() ? item.find('dc\\:creator').text().replace(/\n/g, '').trim() : null,
                category: null,
                permaLink: item.find('guid').text() ? item.find('guid').text().replace(/\n/g, '').trim() : null,
                description: item.find('description').text().replace(/\[&#\d{4};\]|\n/g, '').trim(),
                isGlobal: false,
                URL: [URL, decodeURI(URL), encodeURI(decodeURI(URL))].filter((c, i, a) => a.indexOf(c) === i),
            };

            let pubDate = moment(article.pubDateOriginale, "ddd, DD MMM YYYY HH:mm:ss Z");
            let formattedPubDate = pubDate.format("YYYY-MM-DD");
            if (formattedPubDate === 'Invalid Date')
                article.pubDate = null;

            article.pubDate = formattedPubDate;

            article.URI.push(article.link);
            article.URI.push(article.permaLink);

            let categories = [];
            item.find('category').each(function(i, elem) {
                let category = $(this);
                categories.push(category.text());
            });
            article.category = categories;
            if (categories) {
                if (categories.includes('Global' || 'global'))
                    article.isGlobal = true;
            }

            let content = item.find('content\\:encoded').text() ? item.find('content\\:encoded').text().trim() : null;
            //article.content = content
            let $$ = cheerio.load(content, { decodeEntities: false });

            $$("a[href]").each(function(i) {
                let a = $$(this);
                a.replaceWith(a.html());
            });
            content = $$.html()

            //$$('script').remove()

            //wrap content in a <div class="generated-from-iceberg vlex-toc">

            let modifiedContent = `<div class="generated-from-iceberg vlex-toc"><section class="content-section"><h2 class="content__heading content__heading--depth1" data-content-heading-label="INTRODUCTION 1">Introduction 1</h2>${content}</section></div>`;
            const $$$ = cheerio.load(modifiedContent);
            // check on every <h2> tag and add a new section it should not pick up the first with introduction 1
            $$$('.generated-from-iceberg.vlex-toc h2').each(function(i, elem) {
                let h2 = $$(this);
                // wrap the text in a section like for the introduction
                let section = `<section class="content-section"><h2 class="content__heading content__heading--depth1" data-content-heading-label="${h2.text()}">${h2.text()}</h2></section>`;
                // replace the h2 with the section
                h2.replaceWith(section);
            })
            $$$('.generated-from-iceberg.vlex-toc h3').each(function(i, elem) {
                let h3 = $$(this);
                // wrap the text in a section like for the introduction
                let section = `<section class="content-section"><h2 class="content__heading content__heading--depth1" data-content-heading-label="${h3.text()}">${h3.text()}</h2></section>`;
                // replace the h2 with the section
                h3.replaceWith(section);
            })
            $$$('.generated-from-iceberg.vlex-toc p').each(function(i, elem) {
                let p = $$$(this);
                let strong = p.find('strong');
                if (strong.length === 1 && strong.find('em').length === 0) {
                    // wrap the text in a section
                    let section = `<section class="content-section">${p.html()}</section>`;
                    // replace the p with the section
                    p.replaceWith(section);
                }
            });
            content = $$$.html();
            const $$$$ = cheerio.load(content);
            let sections = $$$$('section');
            // for each section wrap all the following tags in it until the next section
            sections.each(function(i, elem) {
                let section = $$$$(this);
                let nextSection = section.nextUntil('section');
                let content = '';

                nextSection.each(function(i, elem) {
                    let tagName = $$$$(this).prop('tagName').toLowerCase();
                    if (tagName !== 'section') {
                        $$$$(this).appendTo(section);
                    }
                });

                section.append(content);
            });
            content = $$$$.html();


            let text = $$.text().replace(/\n/g, '').trim()
            if (text)
                article.text = { fileFormat: "text/plain", content: text, locale, dataType }
            article.htmlContent = { fileFormat: "text/html", content: content, locale, dataType };


            data.push(article)
        })
    }

    return data;
}