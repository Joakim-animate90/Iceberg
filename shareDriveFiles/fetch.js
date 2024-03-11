async function getPdfPage({ canonicalURL, headers }) {
    if (isSharePointURL(canonicalURL)) {
        const page = await puppeteerManager.newPage({ downloadContentTypes: ["application/pdf"] });
        const out = [];
        let updatedHeaders = { ...headers }; 

        try {
            const response = await page.goto(canonicalURL, { waitUntil: 'domcontentloaded', timeout: 60000 });
            if (response.status() >= 300 && response.status() <= 399) {
                console.log("Redirected to:", response.headers().location);
                await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60000 });
            }
            let cookies = response.headers()['set-cookie'];
            cookies = Array.isArray(cookies) ? cookies : [cookies];
            const contentSecurityPolicy = response.headers()['content-security-policy'];
            if (cookies) {
                updatedHeaders['Cookie'] = cookies.map(cookie => cookie.split(';')[0]).join('; ');
            }
            if (contentSecurityPolicy) {
                updatedHeaders['Content-Security-Policy'] = contentSecurityPolicy;
            }
            await page.setExtraHTTPHeaders(updatedHeaders);
            await page.waitForTimeout(5000);
            const html = await page.evaluate(() => document.documentElement.outerHTML);
            out.push(simpleResponse({
                canonicalURL,
                mimeType: "text/html",
                responseBody: html,
            }));
            await page.waitForSelector('[data-automationid="download"]', { visible: true });
            console.log("CLICK");
            await page.click('[data-automationid="download"]');
            await page.waitForTimeout(5000);
            let downloads = await page.getDownloads();
            downloads = downloads.filter(d => d.canonicalURL.match(/https:\/\/minhaciendagovco.sharepoint.com\/sites\/DoctrinaDAF\/_layouts\/15\/download.aspx\?SourceUrl=.*pdf$/));
            return out.concat(downloads);
        } catch (error) {
            console.error("Error while scraping SharePoint page:", error);
            throw error;
        }
    }
}