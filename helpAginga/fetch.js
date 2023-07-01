import fetch from 'node-fetch';
import querystring from 'querystring';
import FormData from 'form-data';

const useQueryStringsToPostData = async function() {

    let headers = {
        "Cache-Control": "no-cache",
        "Content-Type": "application/x-www-form-urlencoded",
        "Origin": "http://kenyalaw.org",
        "Pragma": "no-cache",
        "Referer": "http://kenyalaw.org/caselaw/cases/advanced_search_courts",
        "Upgrade-Insecure-Requests": "1",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(headers, headers);
    const data = {};
    data["content"] = ``;
    data["subject"] = ``;
    data["case_number"] = ``;
    data["parties"] = ``;
    data["court[]"] = `190000`;
    data["date_from"] = `01+Jan+2022`;
    data["date_to"] = `31+Jan+2022`;
    data["submit"] = `Search`;
    let body = querystring.stringify(data);
    let method = "POST";
    let options = { method, body, headers: _headers };
    let url = 'http://kenyalaw.org/caselaw/cases/advanced_search/';
    let response = await fetch(url, options);

    return response;

}
const useFormDataToPostData = async function() {
    let headers = {
        "Cache-Control": "no-cache",
        "Origin": "http://kenyalaw.org",
        "Pragma": "no-cache",
        "Referer": "http://kenyalaw.org/caselaw/cases/advanced_search_courts",
        "Upgrade-Insecure-Requests": "1",
        "Accept-Encoding": "gzip, deflate, br"
    };

    let formData = new FormData();
    formData.append("content", "");
    formData.append("subject", "");
    formData.append("case_number", "");
    formData.append("parties", "");
    formData.append("court[]", "190000");
    formData.append("date_from", "01 Jan 2022");
    formData.append("date_to", "31 Jan 2022");
    formData.append("submit", "Search");

    let method = "POST";
    let options = { method, body: formData, headers };
    let url = 'http://kenyalaw.org/caselaw/cases/advanced_search/';
    let response = await fetch(url, options);

    return response;
}

const getData = async function() {
    let headers = {
        "Cache-Control": "no-cache",
        "Content-Type": "application/x-www-form-urlencoded",
        "Origin": "http://kenyalaw.org",
        "Pragma": "no-cache",
        "Referer": "http://kenyalaw.org/caselaw/cases/advanced_search_courts",
        "Upgrade-Insecure-Requests": "1",
        "Accept-Encoding": "gzip, deflate, br"
    };

    let method = "GET";
    let options = { method, headers };
    let url = 'http://kenyalaw.org/caselaw/cases/advanced_search/';
    let response = await fetch(url, options);

    return response;

}
let response = await useFormData()
let text = await response.text()

console.log(text)