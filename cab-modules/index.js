/**
 * Main cab services module
 * Coordinates fare fetching from multiple cab service providers
 * @module cab-modules/index
 */

const puppeteer = require('puppeteer');
const { getUber } = require('./uber');
const { getOla } = require('./ola');
const { getRapido } = require('./rapido');

/**
 * Configuration object for browser settings
 */
const browserConfig = {
    headless: true,
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080'
    ]
};

/**
 * Fetches fare estimates from all supported cab services
 * @async
 * @param {string} source - Pickup location address
 * @param {string} destination - Drop-off location address
 * @returns {Promise<Array<{Service: string, Details: Array<{Type: string, Fare: string, ETA: string}>}>>}
 */
async function getAllCabPrices(source, destination) {
    let browser;
    try {
        // Initialize shared browser instance
        browser = await puppeteer.launch(browserConfig);
        
        // Fetch prices from all services concurrently
        const [uberPrices, olaPrices, rapidoPrices] = await Promise.allSettled([
            getUber(source, destination, browser),
            getOla(source, destination, browser),
            getRapido(source, destination, browser)
        ]);

        // Format and combine results
        const results = [];
        
        // Process Uber results
        if (uberPrices.status === 'fulfilled') {
            results.push({
                Service: 'Uber',
                Details: uberPrices.value
            });
        }
        
        // Process Ola results
        if (olaPrices.status === 'fulfilled') {
            results.push({
                Service: 'Ola',
                Details: olaPrices.value
            });
        }
        
        // Process Rapido results
        if (rapidoPrices.status === 'fulfilled') {
            results.push({
                Service: 'Rapido',
                Details: rapidoPrices.value
            });
        }

        return results;
    } catch (error) {
        console.error('Error fetching cab prices:', error);
        // Return error state for all services
        return [
            { Service: 'Uber', Details: [{ Type: 'Error', Fare: 'N/A', ETA: 'N/A' }] },
            { Service: 'Ola', Details: [{ Type: 'Error', Fare: 'N/A', ETA: 'N/A' }] },
            { Service: 'Rapido', Details: [{ Type: 'Error', Fare: 'N/A', ETA: 'N/A' }] }
        ];
    } finally {
        // Ensure browser is closed
        if (browser) {
            await browser.close();
        }
    }
}

/**
 * Validates location input
 * @param {string} location - Location address to validate
 * @returns {boolean} True if location is valid
 */
function validateLocation(location) {
    return location && location.trim().length > 0;
}

/**
 * Sanitizes location input
 * @param {string} location - Location address to sanitize
 * @returns {string} Sanitized location string
 */
function sanitizeLocation(location) {
    return location.trim().replace(/[<>]/g, '');
}

module.exports = {
    getAllCabPrices,
    validateLocation,
    sanitizeLocation
}; 