/**
 * 1) -----------------------------------------------------------------------------------------------------------
 *      Use puppeteer navigate to the following urls.
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
 *
 * 2) -----------------------------------------------------------------------------------------------------------
 *      Extract product options (from the select form) and log them
 *      Select/click on the second option (if the second one doesn't exist, select/click the first)
 *
 *      Log options example:
 *      [
 *          {
 *              value: 'Blu - L/XL',
 *              optionValue: '266,1033', // Attribute "value" of option element
 *          }
 *      ]
 * --------------------------------------------------------------------------------------------------------------
 */

const urls = [
    'https://www.outdoorsrlshop.it/catalogo/1883-trekker-rip.html',
    'https://www.outdoorsrlshop.it/catalogo/2928-arco-man-t-shirt.html'
];

const currencyCodes = new Map([
    ["$", "USD"],
    ["€", "EUR"],
    ["£", "GBP"],
    ["¥", "JPY"],
    ["CHF", "CHF"],
    ["R$", "BRL"],
    ["R", "ZAR"],
    ["₹", "INR"],
    ["₩", "KRW"],
    ["kr", "SEK"],
    ["zł", "PLN"],
    ["$", "CAD"],
    ["$", "AUD"],
    ["$", "MXN"],
    ["$", "SGD"],
    ["$", "HKD"]
]);

const errorStatusCodes = new Set([404, 403]);

function getCurrencyCodeBySign(currencySign) {
    return currencyCodes.get(currencySign);
}

async function getProductData(page, url) {
    const response = await page.goto(url, { waitUntil: 'networkidle0' });

    if (errorStatusCodes.has(response.status())) throw new Error(response.statusText()); 
    
    const pageHTML = await page.evaluate(() => document.querySelector('*').outerHTML);
    const $ = load(pageHTML);
    const fullPriceWithCurrency = $('.upyPrezzoFinale').text();
    const [currencySign, fullPrice] = fullPriceWithCurrency.split(" ");
    const currencyCode = getCurrencyCodeBySign(currencySign);
    const title = $('main section h1').text();
    
    return {
        url,
        fullPrice,
        discountedPrice: fullPrice,
        currency: currencyCode,
        title
    }
}

import puppeteer from 'puppeteer';
import { load } from 'cheerio';

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    let productDataRecords = [];
    for (let url of urls) {
        let productData = await getProductData(page, url);
        productDataRecords.push(productData);
    }

    console.log(productDataRecords)
    await browser.close();
})();