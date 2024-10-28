/**
 * 1) -----------------------------------------------------------------------------------------------------------
 *      Analyze browser Network Tab to find apis of the following urls.
 *      Tips: extract the productId from the url string.
 *      Use gotScraping to make a request to those apis.
 *
 *      Parse the json and extract:
 *          - fullPrice (it has to be a number)
 *          - discountedPrice (it has to be a number, if it does not exist same as fullPrice)
 *          - currency (written in 3 letters [GBP, USD, EUR...])
 *          - title (product title)
 *
 *      Result example
 *      {
 *          url: ${urlCrawled},
 *          apiUrl: ${apiUrl},
 *          fullPrice: 2000.12,
 *          discountedPrice: 1452.02,
 *          currency: 'GBP',
 *          title: 'Aqualung Computer subacqueo i330R'
 *      }
 * --------------------------------------------------------------------------------------------------------------
 */

const { gotScraping } = require('got-scraping');

const urls = [
    'https://www.stoneisland.com/en-it/collection/polos-and-t-shirts/slim-fit-short-sleeve-polo-shirt-2sc17-stretch-organic-cotton-pique-81152SC17A0029.html',
    'https://www.stoneisland.com/en-it/collection/polos-and-t-shirts/short-sleeve-polo-shirt-22r39-50-2-organic-cotton-pique-811522R39V0097.html'
];

//retailed api doesn't work with stone-island, other shops work with it
async function getSalesData(url) {
    const productId = parseProductId(url);
    const apiURL = `https://www.stoneisland.com/on/demandware.store/Sites-StoneEU-Site/en_IT/ProductApi-Product?pid=${productId}`;
    const { body } = await gotScraping({
        url: apiURL,
        headers: {
            'x-api-key': "9c5d1aef-ff32-4348-8af8-b879d7ed40c3",
            'Content-Type': 'application/json'
        },
        responseType: "json",
    });
    
    if (body.error) {
        return body;
    }

    const discountedPrice = body.price.sales.discountedPrice;
    const fullPrice = body.price.sales.value;

    return {
        url,
        apiURL,
        fullPrice,
        discountedPrice: discountedPrice ? discountedPrice : fullPrice,
        currency: body.price.sales.currency,
        title: body.pageMetaTags.title
    };
}

function parseProductId(url){
    const htmlWordStr = '.html';
    const htmlWordStrLength = htmlWordStr.length;
    const urlLength = url.length;

    const regex = `[\-]([A-Za-z0-9]+)\\${htmlWordStr}$`;
    const index = url.search(regex);
    return url.slice(index + 1, urlLength - htmlWordStrLength);
}

async function getSalesDataRecords(urls) {
    const salesDataRecords = [];
    for(let url of urls) {
        let salesData = await getSalesData(url);
        salesDataRecords.push(salesData)
    }
    
    return salesDataRecords;
}

(async() => {
    const records = await getSalesDataRecords(urls)
    console.log(records);
})()