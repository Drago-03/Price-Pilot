const puppeteer = require('puppeteer');

async function getUber(source, destination, browserInstance) {
    try {
        const page = await browserInstance.newPage();
        
        // Set viewport and user agent
        await page.setViewport({ width: 1280, height: 800 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        // Go to Uber's fare estimator page
        await page.goto('https://www.uber.com/global/en/price-estimate/', {
            waitUntil: 'networkidle0',
            timeout: 60000
        });

        // Enter pickup location
        await page.waitForSelector('input[name="pickup"]');
        await page.type('input[name="pickup"]', source);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1000);

        // Enter drop location
        await page.waitForSelector('input[name="destination"]');
        await page.type('input[name="destination"]', destination);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(2000);

        // Wait for price estimates to load
        await page.waitForSelector('.fare-estimate', { timeout: 10000 });

        // Extract fare estimates
        const estimates = await page.evaluate(() => {
            const results = [];
            const cards = document.querySelectorAll('.fare-estimate');
            
            cards.forEach(card => {
                const type = card.querySelector('.vehicle-type')?.textContent?.trim() || 'N/A';
                const fare = card.querySelector('.fare')?.textContent?.trim() || 'N/A';
                const eta = card.querySelector('.eta')?.textContent?.trim() || 'N/A';
                
                results.push({
                    Type: type,
                    Fare: fare,
                    ETA: eta
                });
            });
            
            return results;
        });

        await page.close();
        return estimates;
    } catch (error) {
        console.error('Error fetching Uber prices:', error);
        return [{ Type: 'Error', Fare: 'N/A', ETA: 'N/A' }];
    }
}

module.exports = { getUber };
