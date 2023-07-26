async function home({ canonicalURL, headers }) {
    let responses = []
    const page = await puppeteerManager.newPage({
        incognito: true,
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15",
        downloadContentTypes: ["application/pdf"]
    });


    console.log("GOTO>>>>>> " + '');
    await page.goto('https://docs.rscsl.org/embed/decisions', {
        waitUntil: 'load',
        timeout: 60000
    }).catch((err) => {
        console.error("Page did not load.", err)
    });

    let csrfToken = await page.evaluate(() => {
        const metaTag = document.querySelector('meta[name="csrf-token"]');
        return metaTag ? metaTag.getAttribute('content') : null;
    });
    console.log(csrfToken)
        // Click on the element with CSRF protection

    await page.waitForSelector('select[name="dt_decisions_datatables_length"]');

    // Select the <select> element with CSRF protection
    await page.select('select[name="dt_decisions_datatables_length"]', '100');
    await page.waitForTimeout(500);
    responseBody = await page.evaluate(() => document.documentElement.innerHTML);


    responses.push(
        simpleResponse({
            canonicalURL,
            mimeType: "text/html",
            responseBody: responseBody,
        })
    );
    let i = 1

    while (true) {
        const paginationLink = await page.$(`a[data-dt-idx="${i}"]`);
        if (!paginationLink) break; // Break the loop if there are no more pages

        await page.click(`a[data-dt-idx="${i}"]`, {
            headers: {
                "X-CSRF-Token": csrfToken,
            },
        });
        await page.waitForTimeout(1000);
        responseBody = await page.evaluate(() => document.documentElement.innerHTML);

        let uri = canonicalURL + `/page${i}`;
        responses.push(
            simpleResponse({
                canonicalURL: uri,
                mimeType: "text/html",
                responseBody: responseBody,
            })
        );

        i++;
    }

    return responses

}

async function fetchURL({ canonicalURL, headers }) {
    // https://wl.superfinanciera.gov.co/SiriWeb/publico/sancion/rep_sanciones_general.jsf?page=1


    return await home({ canonicalURL, headers });

}