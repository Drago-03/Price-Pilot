const puppeteer = require('puppeteer');

async function getOla(source, dest, browserInstance, cookies) {
    try {
        const page = await browserInstance.newPage();
        
        // Set cookies if available
        if (cookies) {
            await page.setCookie(...cookies);
        }

        // Navigate to Ola's booking page
        await page.goto('https://book.olacabs.com', { waitUntil: 'networkidle0' });

        // Check if logged in
        const isLoggedIn = await page.evaluate(() => {
            return !document.querySelector('#login-link');
        });

        if (!isLoggedIn && !cookies) {
            throw new Error('Not logged in to Ola');
        }

        // Enter pickup location
        await page.waitForSelector('#pickup');
        await page.click('#pickup');
        await page.type('#pickup', source);
        await page.waitForTimeout(1000);
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1000);

        // Enter drop location
        await page.waitForSelector('#drop');
        await page.click('#drop');
        await page.type('#drop', dest);
        await page.waitForTimeout(1000);
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(2000);

        // Wait for fare estimates to load
        await page.waitForSelector('.ride-card', { timeout: 10000 });

        // Extract fare and ETA information
        const fareData = await page.evaluate(() => {
            const rides = Array.from(document.querySelectorAll('.ride-card'));
            return rides.map(ride => {
                const fareElement = ride.querySelector('.fare-estimate');
                const etaElement = ride.querySelector('.eta');
                const categoryElement = ride.querySelector('.category-name');

                return {
                    Fare: fareElement ? parseInt(fareElement.innerText.replace(/[^0-9]/g, '')) : 0,
                    ETA: etaElement ? etaElement.innerText.replace(' min', '') : '15-20',
                    Category: categoryElement ? categoryElement.innerText : 'Mini',
                    Status: 'Available'
                };
            });
        });

        // Close the page
        await page.close();

        // Return the lowest fare option if multiple options are available
        return fareData.sort((a, b) => a.Fare - b.Fare).slice(0, 1);

    } catch (error) {
        console.error('Error fetching Ola fares:', error);
        return [{
            Fare: 0,
            ETA: '15-20',
            Category: 'Mini',
            Status: 'Unavailable'
        }];
    }
}

module.exports = {
    getOla
};
