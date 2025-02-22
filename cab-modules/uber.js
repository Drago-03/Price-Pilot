const puppeteer = require('puppeteer');

async function getUber(source, dest, browserInstance, cookies) {
    try {
        const page = await browserInstance.newPage();
        
        // Set cookies if available
        if (cookies) {
            await page.setCookie(...cookies);
        }

        // Navigate to Uber's fare estimation page
        await page.goto('https://m.uber.com/looking', { waitUntil: 'networkidle0' });

        // Check if logged in
        const isLoggedIn = await page.evaluate(() => {
            return !document.querySelector('button[data-test="mobile-sign-in-button"]');
        });

        if (!isLoggedIn && !cookies) {
            throw new Error('Not logged in to Uber');
        }

        // Enter pickup location
        await page.waitForSelector('input[data-test="search-pickup-input"]');
        await page.click('input[data-test="search-pickup-input"]');
        await page.type('input[data-test="search-pickup-input"]', source);
        await page.waitForTimeout(1000);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1000);

        // Enter drop location
        await page.waitForSelector('input[data-test="search-destination-input"]');
        await page.click('input[data-test="search-destination-input"]');
        await page.type('input[data-test="search-destination-input"]', dest);
        await page.waitForTimeout(1000);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(2000);

        // Wait for fare estimates to load
        await page.waitForSelector('[data-test="fare-estimate"]', { timeout: 10000 });

        // Extract fare and ETA information
        const fareData = await page.evaluate(() => {
            const fares = Array.from(document.querySelectorAll('[data-test="fare-estimate"]'));
            return fares.map(fare => {
                const priceElement = fare.querySelector('[data-test="fare-price"]');
                const etaElement = fare.querySelector('[data-test="eta-text"]');
                const typeElement = fare.querySelector('[data-test="vehicle-type"]');

                return {
                    Fare: priceElement ? parseInt(priceElement.innerText.replace(/[^0-9]/g, '')) : 0,
                    ETA: etaElement ? etaElement.innerText.replace(' min', '') : '15-20',
                    Category: typeElement ? typeElement.innerText : 'UberGo',
                    Status: 'Available'
                };
            });
        });

        // Close the page
        await page.close();

        // Return the lowest fare option if multiple options are available
        return fareData.sort((a, b) => a.Fare - b.Fare).slice(0, 1);

    } catch (error) {
        console.error('Error fetching Uber fares:', error);
        return [{
            Fare: 0,
            ETA: '15-20',
            Category: 'UberGo',
            Status: 'Unavailable'
        }];
    }
}

module.exports = {
    getUber
};
