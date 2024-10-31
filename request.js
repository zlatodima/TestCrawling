/**
 * 1) -----------------------------------------------------------------------------------------------------------
 *      Use got-scraping to crawl in sequence the following urls.
 *      Check response status code (200, 404, 403), proceed only in case of code 200, throw an error in other cases.
 * 
 *      Using cheerio extract from html:
 *          - fullPrice (it has to be a number)
 *          - discountedPrice (it has to be a number, if it does not exist same as fullPrice)
 *          - currency (written in 3 letters [GBP, USD, EUR...])
 *          - title (product title)
 *
 *      Result example
 *      {
 *          url: ${urlCrawled},
 *          fullPrice: 2000.12,
 *          discountedPrice: 1452.02,
 *          currency: 'EUR',
 *          title: 'Abito Bianco con Stampa Grafica e Scollo a V Profondo'
 *      }
 * --------------------------------------------------------------------------------------------------------------
 * 2) -----------------------------------------------------------------------------------------------------------
 *      Like the first exercise but the urls must be crawled in parallel
 * --------------------------------------------------------------------------------------------------------------
 */

import { gotScraping } from 'got-scraping';
import { load } from 'cheerio';

const urls = [
    'https://www.miinto.it/p-de-ver-s-abito-slip-3059591a-7c04-405c-8015-0936fc8ff9dd',
    'https://www.miinto.it/p-abito-a-spalline-d-jeny-fdac3d17-f571-4b55-8780-97dddf80ef35',
    'https://www.miinto.it/p-abito-bianco-con-stampa-grafica-e-scollo-a-v-profondo-2b03a3d9-fab1-492f-8efa-9151d3322ae7'
];

const errorStatusCodes = new Set([404, 403]);

async function getProductData(url){
    const { body, statusCode, statusMessage } = await gotScraping({ url });

    if (errorStatusCodes.has(statusCode)) throw new Error(statusMessage); 

    const $ = load(body);

    //find by unique attribute, because classNames have auto-generated id
    //On each application compilation id will be changed
    const fullPriceWithCurrency = $(`[data-testid="product-previous-price"]`).text();
    const discountedPriceWithCurrency = $(`[data-testid="product-price"]`)?.text() || fullPriceWithCurrency;

    const [ discountedPrice, discountedPriceCurrency ] = discountedPriceWithCurrency.split(' ');
    const [ fullPrice, fullPriceCurrency ] = fullPriceWithCurrency?.split(' ');

    const title = $(`title`)?.text() || $(`[property="og:title"]`)?.getAttribute("content");

    return {
        url,
        fullPrice: fullPrice || discountedPrice,
        discountedPrice,
        currency: discountedPriceCurrency,
        title
    }
}

async function getProductDataRecordsSequetally() {
    let productDataRecords = [];
    for (let url of urls) {
        let productDataRecord = await getProductData(url);
        productDataRecords.push(productDataRecord);
    }

    return productDataRecords;
}

async function getProductDataRecordsInParallel() {
    const promises = urls.map((url) => getProductData(url));

    return await Promise.all(promises);
}

(async () => {
    const dataRecordsSequetally = await getProductDataRecordsSequetally();
    const dataRecordsInParallel = await getProductDataRecordsInParallel();

    console.log("dataRecordsSequetally \n %o", dataRecordsSequetally);
    console.log("dataRecordsInParallel \n %o", dataRecordsInParallel);
})();