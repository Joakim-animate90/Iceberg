function getSeeds() {
    let baseURLs = [
        'https://gd.aragon.es/cgi-bin/ACTA/BRSCGI?CMD=VERLST&BASE=ACTA&docs=1-100&SEC=ACTA_PUBL&SORT=-FEPU,-FERE,-NUME&SEPARADOR=&TEMA-C=&NUME-C=&OP1=Y&TIPO-C=&SENA-C=&@FEPU-GE=20180101&@FERE-LE=lafechaxx',
        'https://gd.aragon.es/cgi-bin/ACTA/BRSCGI?CMD=VERLST&BASE=ACTA&docs=101-200&SEC=ACTA_PUBL&SORT=-FEPU,-FERE,-NUME&SEPARADOR=&TEMA-C=&NUME-C=&OP1=Y&TIPO-C=&SENA-C=&@FEPU-GE=20180101&@FERE-LE=lafechaxx',
        'https://gd.aragon.es/cgi-bin/ACTA/BRSCGI?CMD=VERLST&BASE=ACTA&docs=201-300&SEC=ACTA_PUBL&SORT=-FEPU,-FERE,-NUME&SEPARADOR=&TEMA-C=&NUME-C=&OP1=Y&TIPO-C=&SENA-C=&@FEPU-GE=20180101&@FERE-LE=lafechaxx',
        'https://gd.aragon.es/cgi-bin/ACTA/BRSCGI?CMD=VERLST&BASE=ACTA&docs=301-400&SEC=ACTA_PUBL&SORT=-FEPU,-FERE,-NUME&SEPARADOR=&TEMA-C=&NUME-C=&OP1=Y&TIPO-C=&SENA-C=&@FEPU-GE=20180101&@FERE-LE=lafechaxx',

    ]
    const urls = [];
    for (let i = 0; i < baseURLs.length; i++) {
        let currentDate = moment().format('YYYY-MM-DD');
        let currentTime = moment().format('HH:mm:ss');
        let url = baseURLs[i] + '&appendDate=' + currentDate + '&appendTime=' + currentTime;
        urls.push(url);
    }
    return urls;
}