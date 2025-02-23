/**
 * Rapido fare estimation module
 * Fetches fare estimates from Rapido's fare calculator page using web scraping
 * @module cab-modules/rapido
 */

const puppeteer = require('puppeteer');

/**
 * Fetches Rapido fare estimates for a given route
 * @async
 * @param {string} source - Pickup location address
 * @param {string} destination - Drop-off location address
 * @param {Browser} browserInstance - Shared Puppeteer browser instance
 * @returns {Promise<Array<{Type: string, Fare: string, ETA: string}>>} Array of fare estimates
 */
async function getRapido(source, destination, browserInstance) {
    try {
        // Create a new page in the shared browser instance
        const page = await browserInstance.newPage();
        
        // Configure viewport and user agent for better compatibility
        await page.setViewport({ width: 1280, height: 800 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        // Navigate to Rapido's fare estimator page and wait for network idle
        await page.goto('https://app.rapido.bike/fare-calculator', {
            waitUntil: 'networkidle0',
            timeout: 60000
        });

        // Enter and submit pickup location
        await page.waitForSelector('#source-location');
        await page.type('#source-location', source);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1000); // Wait for location to register

        // Enter and submit drop location
        await page.waitForSelector('#destination-location');
        await page.type('#destination-location', destination);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(2000); // Wait for route calculation

        // Wait for fare estimates to load
        await page.waitForSelector('.ride-options', { timeout: 10000 });

        // Extract fare estimates using page evaluation
        const estimates = await page.evaluate(() => {
            const results = [];
            const options = document.querySelectorAll('.ride-option');
            
            // Process each ride option card
            options.forEach(option => {
                // Extract ride type (Bike, Auto, etc.)
                const type = option.querySelector('.vehicle-type')?.textContent?.trim() || 'N/A';
                
                // Extract fare with surge pricing if applicable
                const fareElement = option.querySelector('.fare-amount');
                const surgeElement = option.querySelector('.surge-multiplier');
                let fare = fareElement?.textContent?.trim() || 'N/A';
                if (surgeElement) {
                    const surgeMultiplier = surgeElement.textContent.trim();
                    fare += ` (${surgeMultiplier}x surge)`;
                }
                
                // Extract estimated arrival time
                const eta = option.querySelector('.arrival-time')?.textContent?.trim() || 'N/A';
                
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
        console.error('Error fetching Rapido prices:', error);
        // Return error state if fare fetching fails
        return [{ Type: 'Error', Fare: 'N/A', ETA: 'N/A' }];
    }
}

module.exports = { getRapido }; 