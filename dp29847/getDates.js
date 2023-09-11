async function getNumPages({canonicalURL, headers}) {
    let responses = [];
    const match = canonicalURL.match(/from=(\d{4}-\d{2}-\d{2})\&to=(\d{4}-\d{2}-\d{2})\&pg=(\d+)/i);
    let from = match[1];
    let to = match[2];
    let pageNumber = match[3]
    //const puppeteerManager = await puppeteer.launch({ headless: false })
    console.log('start')
    from = moment(from).format("MM/DD/YYYY");
    to = moment(to).format("MM/DD/YYYY");
  //t puppeteerManager = await puppeteer.launch()
  //const puppeteerManager = await puppeteer.launch({ headless: false })
  console.log('start')
  const page = await puppeteerManager.newPage({
            incognito: true,
            userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15",
        });
  
  console.log("GOTO>>>>>> " + 'https://www.bundesanzeiger.de/pub/en/search');
  await page.goto('https://www.bundesanzeiger.de/pub/en/search', {
      waitUntil: 'load', timeout: 30000
  }).catch((err) => {
      console.error("Page did not load.", err);
  });
  
  
  while(true){
    try {
  
  await page.evaluate(() => document.querySelector("button[id='cc_all']").click());
  break ;
  
   
    } catch (error) {
        console.log("ERROR: " + error);
    }
  }
  
  while (true){
    try {
  //throw from;
  await page.waitForSelector("input[name='start_date']", {visible: true});
  await page.$eval("input[name='start_date']", (el, startDate) => el.value = `${startDate}`, from);
  await page.$eval("input[name='end_date']", (el, endDate) => el.value = `${endDate}`, to);
  break;
  
    } catch (error) {
        console.log("ERROR: " + error);
    }
  }
  
  
  while (true){
    try {
      await page.waitForTimeout(10000);
  await page.click('[data-target="#part_search-collapse"]');
  
  
   await page.waitForTimeout(10000);
  
  
  await page.click('[data-target="#area22"]');
      
      await page.waitForTimeout(10000);
  
  await page.click('input[type="radio"][value="9999922"]');
  break;
    } catch (error) {
        console.log("ERROR: " + error);
    }
    }
  
  
  await page.waitForTimeout(2000);
  //throw await page.content();
  
  //await page.waitForSelector("input[name='search-button']", {visible: true});
  await page.evaluate(() => document.querySelector("input[name='search-button']").click())
  await page.waitForSelector('div.page_count span', {visible: true});
  const span = await page.$('div.page_count span');
  const text = await page.evaluate(span => span.textContent, span);
  const numPages = parseInt(text);
  let responseBody = await page.evaluate(() => document.documentElement.innerHTML);
  responses.push(
    simpleResponse({
      canonicalURL,
      mimeType: "text/html",
      responseBody: responseBody,
 }));
   return responses;
  }