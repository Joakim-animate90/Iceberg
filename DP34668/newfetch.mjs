"use strict";

const querystring = require("querystring");
const FormData = require("form-data");
const moment = require('moment');
const url = require('url');
const cheerio = require('cheerio');
const fetch = require('node-fetch'); //to reconstruct response fetch.Response(html,....)

const fetcher = require("../../utils/fetcher");
let fetchWithCookies = fetcher.fetchWithCookies;
// let fetch = fetcher.fetch;//only use fetchWithCookies or defaultFetchURL for Tests
let defaultFetchURL = fetcher.defaultFetchURL;


let map = {};

function setSharedVariable(key, value) { map[key] = value; }

function getSharedVariable(key) { return map[key]; }



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




const method0 = async function({ argument, canonicalURL, headers }) {
    let customHeaders = {
        "Cache-Control": "max-age=0",
        "Origin": "https://wl.superfinanciera.gov.co",
        "Referer": "https://wl.superfinanciera.gov.co/SiriWeb/publico/sancion/rep_sanciones_general_par.jsf",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        "sec-ch-ua": "\"Chromium\";v=\"113\", \"Not-A.Brand\";v=\"24\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Linux\"",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);
    const body = new FormData();
    body.append('contentSV:frm2:idFechaDesde.day', '01');
    body.append('contentSV:frm2:idFechaDesde.month', '1');
    body.append('contentSV:frm2:idFechaDesde.year', '2020');
    body.append('contentSV:frm2:idFechaHasta.day', '31');
    body.append('contentSV:frm2:idFechaHasta.month', '12');
    body.append('contentSV:frm2:idFechaHasta.year', '2020');
    body.append('contentSV:frm2:j_id_id15pc2', '');
    body.append('contentSV:frm2:j_id_id17pc2', '');
    body.append('contentSV:frm2:j_id_id19pc2', '');
    body.append('contentSV:frm2:numeroResolucion', '');
    body.append('contentSV:frm2:j_id_id25pc2', '');
    body.append('contentSV:frm2:j_id_id26pc2', 'Buscar');
    body.append('autoScroll', '0,0');
    body.append('contentSV:frm2_SUBMIT', '1');
    body.append('javax.faces.ViewState', 'pr+/bqDJEnpDGCJov1xuz2r0p+4nrVHpcRm56rjkPFJsVVntWL78S7+MegvCsBvi/HIPpKKdbpdLAbBvw2gjnQtKoDBKLp3btRTcKgpvniZg+LcVlsMGtqsY/bslkBWH2ZczFui1fvSI/0f2Bc6t/1PccwIP+I4Jy+mEoA==');
    let method = "POST";
    let requestOptions = { method, body, headers: _headers };
    let requestURL = 'https://wl.superfinanciera.gov.co/SiriWeb/publico/sancion/rep_sanciones_general_par.jsf';
    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });
    return responsePage;
};

async function fetchURL({ canonicalURL, headers }) {
    if (/https?:.*https?:/i.test(canonicalURL)) {
        console.error("Rejecting URL", canonicalURL, `returning [];`);
        return [];
    }
    const match = canonicalURL.match(/\?(start|from)=(\d{4}-\d{2}-\d{2}).(end|to)=(\d{4}-\d{2}-\d{2})(&page=(\d+))?$/i);
    if (match) {
        let from = moment(match[2]);
        let to = moment(match[4]);
        let page = match[6] ? parseInt(match[6]) : 1;
        return [await fetchURL({ canonicalURL, headers })]
    } else {
        return defaultFetchURL({ canonicalURL, headers });
    }
}