import puppeteer from 'puppeteer';
import moment from 'moment';


async function fetchPage({ canonicalURL, requestURL, requestOptions, headers }) {
    if (!requestOptions) requestOptions = { method: "GET", headers };
    if (!canonicalURL) canonicalURL = requestURL;
    if (!requestURL) requestURL = canonicalURL;

    return await fetchWithCookies(requestURL, requestOptions)
        .then(response => {
            return {
                canonicalURL,
                request: Object.assign({ URL: requestURL }, requestOptions),
                response
            };
        });
}




async function getSearchSentences({ canonicalURL, headers }) {
    let responses = [];
    const match = canonicalURL.match(/from=(\d{4}-\d{2}-\d{2})\&to=(\d{4}-\d{2}-\d{2})\&page=(\d+)/i);
    let from = match[1];
    let to = match[2];
    let pageNumber = match[3]
    const puppeteerManager = await puppeteer.launch({ headless: false })
    console.log('start')
    from = moment(from).format("MM/DD/YYYY");
    to = moment(to).format("MM/DD/YYYY");
    console.log('start')
    const page = await puppeteerManager.newPage({
        incognito: true,
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15",
    });

    console.log("GOTO>>>>>> " + 'https://www.bundesanzeiger.de/pub/en/search');
    await page.goto('https://www.bundesanzeiger.de/pub/en/search', {
        waitUntil: 'load',
        timeout: 30000
    }).catch((err) => {
        console.error("Page did not load.", err);
    });


    while (true) {
        try {
            console.log("CLICK>>>>>>")
            await page.evaluate(() => document.querySelector("button[id='cc_all']").click());
            console.log("ENDCLICK>>>>>>")
            break;


        } catch (error) {
            console.log("ERROR: " + error);
        }
    }

    while (true) {
        try {
            //throw from;
            await page.waitForSelector("input[name='start_date']", { visible: true });

            await page.$eval("input[name='start_date']", (el, from) => el.value = `${from}`, from);
            await page.$eval("input[name='end_date']", (el, to) => el.value = `${to}`, to);
            break;

        } catch (error) {
            console.log("ERROR: " + error);
        }
    }
    while (true) {
        try {
            await page.waitForTimeout(10000);
            await page.click('[data-target="#part_search-collapse"]');

            await page.waitForTimeout(10000);

            await page.click('[data-target="#area5"]');
            await page.waitForTimeout(10000);
            await page.click('input[type="radio"][value="999995"]');
            break;
        } catch (error) {
            console.log("ERROR: " + error);
        }
    }
    await page.waitForTimeout(2000);
    //throw await page.content();

    //await page.waitForSelector("input[name='search-button']", {visible: true});
    await page.evaluate(() =>
        document.querySelector("input[name='search-button']").click()
    );
    await page.waitForSelector("div.page_count span", { visible: true });
    await page.click('.select2-selection__arrow');

    // Wait for the element to appear in the DOM
    await page.waitForTimeout(1000);


    // Wait for the elements to appear in the DOM
    await page.waitForSelector('li[id^="select2-id35-result-"]');

    // click on the last li element
    const elements = await page.$('li[id^="select2-id35-result-"]:last-child');

    // Click on the element using element.click()
    if (elements) {
        await elements.click();
    }

    // Wait for some time to ensure the click action has taken effect
    await page.waitForTimeout(2000);


    //   const span = await page.$("div.page_count span");
    //   const text = await page.evaluate((span) => span.textContent, span);
    //   const numPages = parseInt(text);
    // if (pageNumber > 1) {

    //   // click on the next page
    //   let j = 2;
    //   while (j <= pageNumber) {
    //     try {
    //        //await page.waitForSelector("a[href*='search~table~row~panel-publication~link']", {visible: true});
    //         await page.waitForTimeout(10000);
    //        let pagerDiv = await page.$('.result_pager.bottom');
    //        pagerDiv.$eval(`.middle a[title="To page ${j}"]`, link => link.click())

    //         j++;



    //    } catch (err) {
    //          console.log('Here is page' + err)
    //    }

    //  }
    // }


    //   while (true) {
    //     try {
    //       //https://www.bundesanzeiger.de/pub/en/search2?45-1.-search~table~panel-rows-0-search~table~row~panel-info_fundname_forcelink
    //       // await page.waitForSelector("a[href*='search~table~row~panel-publication~link']", {visible: true});
    //       await page.waitForTimeout(15000);
    //       await page.evaluate(() =>
    //         document
    //           .querySelector("a[href*='search~table~row~panel-publication~link']")
    //           .click()
    //       );
    //       break;
    //     } catch (error) {
    //       console.log("ERROR: " + error);
    //     }
    //   }

    //   let i = 0;
    //   while (i < 10) {
    //     try {
    //       await page.evaluate(() =>
    //         document.querySelector("button[id='cc_all']").click()
    //       );
    //     } catch (error) {
    //       continue;
    //     }

    //     // Get the captcha image element
    //     const captchaImageElement = await page.$("img[src*='captcha_image']");
    //     await page.waitForTimeout(1000);
    //     if (captchaImageElement) {
    //       while (true) {
    //         try {
    //           await page.waitForSelector("img[src*='captcha_image']", {
    //             visible: true,
    //           });
    //           break;
    //         } catch (error) {
    //           console.log("ERROR: on captcha image element " + error);
    //         }
    //       }
    //       // Get the bounding box of the captcha image element
    //       const captchaBoundingBox = await captchaImageElement.boundingBox();

    //       // Take a screenshot of the captcha image
    //       const captchaScreenshot = await page.screenshot({
    //         clip: {
    //           x: captchaBoundingBox.x,
    //           y: captchaBoundingBox.y,
    //           width: captchaBoundingBox.width,
    //           height: captchaBoundingBox.height,
    //         },
    //       });

    //       if (captchaScreenshot) {
    //         try {
    //           let captchaResult = await resolveCaptcha(
    //             Buffer.from(captchaScreenshot)
    //           );
    //           await page.waitForTimeout(3000);

    //           // Enter the captcha <input value="" name="solution" id="id101" data-argus="L127" type="text" placeholder="Please solve the security query" class="form-control">
    //           await page.$eval(
    //             "input[name='solution']",
    //             (el, captcha) => (el.value = `${captcha}`),
    //             captchaResult
    //           );
    //           await page.evaluate(() =>
    //             document.querySelector("input[name='confirm-button']").click()
    //           );
    //         } catch (error) {
    //           console.log("ERROR: on captchaScreenshot " + error);
    //           //console.log(captcha) continue
    //           continue;
    //         }
    //         //throw(captchaResult)
    //       }
    //     }

    //     while (true) {
    //       try {
    //         //next entry
    //         await page.waitForSelector("a[href*='top~nav~panel-next~link']", {
    //           visible: true,
    //         });
    //         break;
    //       } catch (error) {
    //         console.log("ERROR: on top nav panel next link " + error);
    //       }
    //     }

    //     let responseBody = await page.evaluate(
    //       () => document.documentElement.outerHTML
    //     );

    //     console.log("PROCESSING URLLLL... " + canonicalURL);
    //     // get this from the document <div class="first">Fedder Verwaltungsgesellschaft mbH<br>Ruppichteroth</div>
    //     let name = await page.$eval("div[class='first']", (el) => el.innerText);

    //     let area = await page.$eval("div[class='part']", (el) => el.innerText);
    //     let vDate = await page.$eval("div[class='date']", (el) => el.innerText);
    //     let info = await page.$eval("div[class='info']", (el) => el.innerText);

    //     let url1 = `https://www.bundesanzeiger.de/pub/en/search2?date=${vDate}&area=${area}&name=${name}&info=${info}&page=${pageNumber}~row~panel`;
    //    // url1 = url1 ? url.resolve(canonicalURL, url1) : null;
    //     responses.push(

    //       url1,
    //     );
    //     await page.evaluate(() =>
    //       document.querySelector("a[href*='top~nav~panel-next~link']").click()
    //     );
    //     //const [link] = await page.$x("//a[@title='Next entry']");
    //     while (true) {
    //       try {
    //         //next entry
    //         // await page.waitForSelector("a[href*='top~nav~panel-next~link']", {visible: true});
    //         await page.waitForTimeout(10000);
    //         break;
    //       } catch (error) {
    //         console.log("ERROR: wait page for waitForTimeout on the top nav panel next link " + error);
    //       }
    //     }
    //     //await page.waitForXPath("//a[@title='Next entry']");
    //     i++;
    //   }
    //   const buttonSelector = 'a.btn.btn-green[title="Back to search result"]';
    //   console.log("Clicking the button... back to search result");
    //   while (true) {
    //     try {
    //       await page.waitForSelector(buttonSelector); // Wait for the button to be available
    //       break;
    //     } catch (error) {
    //       console.log("ERROR:  wait for button selector" + error);
    //     }
    //   }
    //   await page.click(buttonSelector);
    //   console.log("Clicked the button... back to search result");
    //   //console.log(responses)

    return responses;

}





const downloadPdf = async function({ canonicalURL, headers }) {
    //let requestURL = canonicalURL.replace(/\&id.+/,'');
    let canonical = canonicalURL.match(/\&id=(.+)\&type=html/)[1];
    let requestURL = canonical;
    canonical = canonical + '&type=attachament';
    let responsePdf = await fetchPage({ canonicalURL: canonical, requestURL: requestURL, headers });
    return responsePdf;
};

async function fetchURL({ canonicalURL, headers }) {


    if (/https:\/\/www\.bundesanzeiger\.de\/pub\/en\/search\?from=/.test(canonicalURL)) {

        return await getSearchSentences({ canonicalURL, headers });
    } else {

        return defaultFetchURL({ canonicalURL, headers })
    }

}

fetchURL({ canonicalURL: `https://www.bundesanzeiger.de/pub/en/search?from=2023-03-12&to=2023-05-13&page=1` }).catch((err) => { console.log(err) }).then((res) => { console.log(res) })