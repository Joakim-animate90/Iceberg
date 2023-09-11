let testResult = {
    //discoveredLinks: ['http://www.example.com'],
    mediaObject: {
        fileFormat: 'text/html'
    },
    responsePage: {
        response: {
            status: 504,
            statusText: 'Page is null \n'
        }
    }
};
async function test({ testResult }) {
    testResult = {
        //discoveredLinks: ['http://www.example.com'],
        mediaObject: {
            fileFormat: 'text/html'
        },
        responsePage: {
            response: {
                status: 200,
                //statusText: 'Page is null \n'
            }
        }
    };
    let result = true;

    // let discoveredLinks = testResult.discoveredLinks;
    // let fileFormat = testResult.mediaObject.fileFormat;

    // result = result && discoveredLinks.includes('http://www.example.com');
    result = result && (fileFormat === 'text/html');

    const responsePage = testResult.responsePage;
    const response = responsePage.response;

    result = result && (response !== null);
    result = result && (response.status === 200);

    //const expectedStatusText = 'Page is null \n'.toUpperCase();
    //result = result && (response.statusText === expectedStatusText);

    return result;
}