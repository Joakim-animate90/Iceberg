import fetch from 'node-fetch';

import discoverLinks from './disc.js';
const customHeaders = {
    authority: 'www.scj.gob.cl',
    'cache-control': 'no-cache',
    dnt: '1',
    pragma: 'no-cache',
    'sec-ch-ua': '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'same-origin',
    'upgrade-insecure-requests': '1',
    'Accept-Encoding': 'gzip, deflate, br',
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36'
  }
const fetchPage = async function ({ canonicalURL, requestURL, requestOptions, headers }) {
    if (!requestOptions) requestOptions = { method: 'GET', headers }
    if (!canonicalURL) canonicalURL = requestURL
    if (!requestURL) requestURL = canonicalURL
    return await fetch(requestURL, requestOptions)
        .then(response => {
            return {
                canonicalURL,
                request: Object.assign({ URL: requestURL }, requestOptions),
                response
            }
        })

}

const sanitizePage = async function ({ canonicalURL, requestURL, requestOptions, headers }) {
    const responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions, headers })
    const html = await responsePage.response.text()
    
  
    responsePage.response.headers.set('Content-Type', 'text/html; charset=utf-8')
    return responsePage

}
async function fetchURL ({ canonicalURL, headers }) {
    if (/https?:.*https?:/i.test(canonicalURL)) {
      console.error('Rejecting URL', canonicalURL, 'returning [];')
      return []
    }
    const requestURL = null
    if (canonicalURL.startsWith('https://tjajal.gob.mx/boletines/details?exp=')) {
        return await getPage({ canonicalURL, requestURL, headers })
}
  }

const response = await fetchURL({canonicalURL:'https://tjajal.gob.mx/boletines?1=1&page=1', headers: customHeaders})

const content = await response.response.text()
const contentType = response.response.headers.get('Content-Type')

const links = discoverLinks({ content, contentType, canonicalURL: response.canonicalURL, requestURL: response.request.URL })
console.log(links)

