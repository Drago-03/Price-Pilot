const puppeteer = require('puppeteer');

async function getOla(source, destination, browserInstance) {
    try {
        const page = await browserInstance.newPage();
        
        // Set viewport and user agent
        await page.setViewport({ width: 1280, height: 800 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        // Go to Ola's fare estimator page
        await page.goto('https://book.olacabs.com/estimation', {
            waitUntil: 'networkidle0',
            timeout: 60000
        });

        // Enter pickup location
        await page.waitForSelector('#pickup-location');
        await page.type('#pickup-location', source);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1000);

        // Enter drop location
        await page.waitForSelector('#drop-location');
        await page.type('#drop-location', destination);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(2000);

        // Wait for price estimates to load
        await page.waitForSelector('.cab-estimate', { timeout: 10000 });

        // Extract fare estimates
        const estimates = await page.evaluate(() => {
            const results = [];
            const cards = document.querySelectorAll('.cab-estimate');
            
            cards.forEach(card => {
                const type = card.querySelector('.cab-type')?.textContent?.trim() || 'N/A';
                const fare = card.querySelector('.fare-amount')?.textContent?.trim() || 'N/A';
                const eta = card.querySelector('.arrival-time')?.textContent?.trim() || 'N/A';
                
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
        console.error('Error fetching Ola prices:', error);
        return [{ Type: 'Error', Fare: 'N/A', ETA: 'N/A' }];
    }
}

module.exports = { getOla };
