const puppeteer = require('puppeteer');

async function getRapido(source, dest, browserInstance, cookies) {
    try {
        const page = await browserInstance.newPage();
        
        // Set cookies if available
        if (cookies) {
            await page.setCookie(...cookies);
        }

        // Navigate to Rapido's booking page
        await page.goto('https://onlineapp.rapido.bike/book-ride', { waitUntil: 'networkidle0' });

        // Check if logged in
        const isLoggedIn = await page.evaluate(() => {
            return !document.querySelector('.login-button');
        });

        if (!isLoggedIn && !cookies) {
            throw new Error('Not logged in to Rapido');
        }

        // Enter pickup location
        await page.waitForSelector('#pickup-location');
        await page.click('#pickup-location');
        await page.type('#pickup-location', source);
        await page.waitForTimeout(1000);
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1000);

        // Enter drop location
        await page.waitForSelector('#drop-location');
        await page.click('#drop-location');
        await page.type('#drop-location', dest);
        await page.waitForTimeout(1000);
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(2000);

        // Wait for fare estimates to load
        await page.waitForSelector('.fare-card', { timeout: 10000 });

        // Extract fare and ETA information
        const fareData = await page.evaluate(() => {
            const rides = Array.from(document.querySelectorAll('.fare-card'));
            return rides.map(ride => {
                const fareElement = ride.querySelector('.fare-amount');
                const etaElement = ride.querySelector('.eta-time');
                const categoryElement = ride.querySelector('.ride-type');

                return {
                    Fare: fareElement ? parseInt(fareElement.innerText.replace(/[^0-9]/g, '')) : 0,
                    ETA: etaElement ? etaElement.innerText.replace(' min', '') : '10-15',
                    Category: categoryElement ? categoryElement.innerText : 'Bike',
                    Status: 'Available'
                };
            });
        });

        // Close the page
        await page.close();

        // Return the lowest fare option if multiple options are available
        return fareData.sort((a, b) => a.Fare - b.Fare).slice(0, 1);

    } catch (error) {
        console.error('Error fetching Rapido fares:', error);
        return [{
            Fare: 0,
            ETA: '10-15',
            Category: 'Bike',
            Status: 'Unavailable'
        }];
    }
}

module.exports = {
    getRapido
}; 