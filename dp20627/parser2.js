function UcFirst(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

function Capitalize(string) {
	return string.trim().charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function formatString(entry) {
	return entry.split(' ').map(function (p) {
		return Capitalize(p);
	}).join(' ');
}

async function parsePage({ responseBody, URL }) {
	const dataType = "MEDIA";
	const locale = "pt";

	if (responseBody.fileFormat !== "text/html") { return [] }
	var output = [];
	let html = responseBody.content;
	let htmlClone = html;
	let $ = cheerio.load(html);

	//find all class cabecalho
	let items = $('div[class="cabecalho"]');
	let doc = {
		URI: URL,
		Proccesso: null,
		proccessoNumber: null,
		Relator: null,
		orgaoJulgado: null,
		Sumula: null,
		comarcaDeOrigem: null,
		dataJulgamento: null,
		dataJulgamentoOriginale: null,
		dataPublicacaoOriginale: null,
		dataPublicacao: null,
		ementa: null,
		URL: [URL],
		htmlContent: null,

	};

	for (let i = 0; i < items.length; i++) {
		let elem = $(items[i]);
		let item = elem.next();

		let text = elem.text();


		if (text.includes("Processo")) {
			// a regex that does not match numbers and ...-/      -.... ()
			let regex = /[0-9\.\-\/\(\)]/g;
			let proccesso = item.text().replace(regex, '');
			doc.Proccesso = proccesso ? proccesso.replace(/\n/g, '').trim() : '';
			// get the text in the a tags 
			let aText = item.find('a');
			// for each a tag
			let aTextArray = [];
			for (let i = 0; i < aText.length; i++) {
				let a = $(aText[i]);
				let text = a.text();
				aTextArray.push(text);
			}
			doc.proccessoNumber = aTextArray;

		}
		if (text.includes("Relator")) {
			doc.Relator = item.text() ? item.text().replace(/\n/g, '').trim() : '';
		}
		if (text.includes("Órgão Julgador")) {
			doc.orgaoJulgado = item.text() ? item.text().replace(/\n/g, '').trim() : '';
		}
		if (text.includes("Súmula")) {
			let sumula = item.text() ? item.text().replace(/\n/g, '').trim() : ''
			doc.Sumula = formatString(sumula);
		}
		if (text.includes("Comarca de Origem")) {
			doc.comarcaDeOrigem = item.text() ? item.text().replace(/\n/g, '').trim() : '';
		}
		if (text.includes("Data de Julgamento")) {
			doc.dataJulgamentoOriginale = item.text() ? item.text().replace(/\n/g, '').trim() : '';
		}

		if (text.includes("Data da publicação da súmula")) {
			doc.dataPublicacaoOriginale = item.text() ? item.text().replace(/\n/g, '').trim() : '';
		}

		if (text.includes("Ementa")) {
			doc.ementa = item.text() ? item.text().replace(/\n/g, '').trim() : '';
		}


	}
	if (moment(doc.dataJulgamentoOriginale, "DD/MM/YYYY").isValid())
		doc.dataJulgamento = moment(moment(doc.dataJulgamentoOriginale, "DD/MM/YYYY")).format('YYYY-MM-DD');

	if (moment(doc.dataPublicacaoOriginale, "DD/MM/YYYY").isValid())
		doc.dataPublicacao = moment(moment(doc.dataPublicacaoOriginale, "DD/MM/YYYY")).format('YYYY-MM-DD');
	// ond div id panel1 get the htmlContent
	let panel1 = $('div[id="panel1"]').first();

	panel1.removeAttr('style');
	panel1.find("input, button, #botaoImprimirInteiroTeor").remove();
	// remove the text that matches the ementa text
	let panelHtml = panel1.html();
	let matchIndex = panelHtml.search(/A C &#xD3; R D &#xC3; O/);

	if (matchIndex !== -1) {
		let newHtml = panelHtml.slice(matchIndex);
		panel1.html(newHtml);
	}

	doc.htmlContent = { content: $.html(panel1), fileFormat: "text/html", dataType, locale };


	doc.text = { content: panel1.text().trim(), locale, fileFormat: "text/plain", dataType } || null;
	
	output.push(doc);
	return output;
}

const runRemoteFilter = async function ({ URL, id, filter }, text) {
	let textContent = text;
	const URLId = URL && "H" + new Buffer(URL).toString("base64");
	const URLIdN = URL && "H" + sha256(URL) + ".N";
	let query = `
              query {` +
		`
                nodes(ids: ["${URL && `${URLId}", "${URLIdN}` || `${id}`}"]) {`
		+ `               id
                ... on CrawledURL {
                  lastSuccessfulRequest {
                    outputForFilter(filter: "${filter}")
                  }
                }
              }
            }`;
	const resp = await graphql(query);

	let node = resp.nodes.filter(n => n)[0];

	if (node
		&& node.lastSuccessfulRequest
		&& node.lastSuccessfulRequest.outputForFilter
		&& node.lastSuccessfulRequest.outputForFilter.length
		&& node.lastSuccessfulRequest.outputForFilter[0]
		&& node.lastSuccessfulRequest.outputForFilter[0].filterOutput
		&& node.lastSuccessfulRequest.outputForFilter[0].filterOutput.content) {
		let _text = node.lastSuccessfulRequest.outputForFilter[0].filterOutput.content;
		textContent += _text;
	} else {
	}
	return textContent;
};
