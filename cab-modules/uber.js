/**
 * Uber fare estimation module
 * Fetches fare estimates from Uber's fare calculator page using web scraping
 * @module cab-modules/uber
 */

const puppeteer = require('puppeteer');

/**
 * Fetches Uber fare estimates for a given route
 * @async
 * @param {string} source - Pickup location address
 * @param {string} destination - Drop-off location address
 * @param {Browser} browserInstance - Shared Puppeteer browser instance
 * @returns {Promise<Array<{Type: string, Fare: string, ETA: string}>>} Array of fare estimates
 */
async function getUber(source, destination, browserInstance) {
    try {
        // Create a new page in the shared browser instance
        const page = await browserInstance.newPage();
        
        // Configure viewport and user agent for better compatibility
        await page.setViewport({ width: 1280, height: 800 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        // Navigate to Uber's fare estimator page and wait for network idle
        await page.goto('https://www.uber.com/global/en/price-estimate/', {
            waitUntil: 'networkidle0',
            timeout: 60000
        });

        // Enter and submit pickup location
        await page.waitForSelector('input[name="pickup"]');
        await page.type('input[name="pickup"]', source);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1000); // Wait for location to register

        // Enter and submit drop location
        await page.waitForSelector('input[name="destination"]');
        await page.type('input[name="destination"]', destination);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(2000); // Wait for route calculation

        // Wait for fare estimates to load
        await page.waitForSelector('.fare-estimate', { timeout: 10000 });

        // Extract fare estimates using page evaluation
        const estimates = await page.evaluate(() => {
            const results = [];
            const cards = document.querySelectorAll('.fare-estimate');
            
            // Process each fare estimate card
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

        // Clean up by closing the page
        await page.close();
        return estimates;
    } catch (error) {
        console.error('Error fetching Uber prices:', error);
        // Return error state if fare fetching fails
        return [{ Type: 'Error', Fare: 'N/A', ETA: 'N/A' }];
    }
}

module.exports = { getUber };
