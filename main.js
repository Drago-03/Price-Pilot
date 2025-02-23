// Node modules
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const process = require("process");

// Cab modules
const uberFetch = require("./cab-modules/uber");
const olaFetch = require("./cab-modules/ola");
const rapidoFetch = require("./cab-modules/rapido");

// Constants
const SESSION_FILE = path.join(__dirname, 'data', 'sessions.json');
const FARES_FILE = path.join(__dirname, 'data', 'fares.json');

// Function to ensure data directory exists
function ensureDataDirectory() {
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir);
        console.log('Created data directory:', dataDir);
    }
    return dataDir;
}

// Function to save fare data
function saveFareData(data) {
    try {
        ensureDataDirectory();
        fs.writeFileSync(FARES_FILE, JSON.stringify(data, null, 2));
        console.log('Saved fare data to:', FARES_FILE);
    } catch (error) {
        console.error('Error saving fare data:', error);
        throw error;
    }
}

// Main function
(async () => {
    let browserInstance;
    try {
        // Launch browser with specific options
        browserInstance = await puppeteer.launch({
            headless: false,
            defaultViewport: {
                width: 1280,
                height: 800
            },
            args: [
                "--start-maximized",
                "--disable-notifications",
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-web-security",
                "--disable-features=IsolateOrigins,site-per-process",
                "--disable-site-isolation-trials",
                "--disable-dev-shm-usage",
                "--disable-accelerated-2d-canvas",
                "--disable-gpu",
                "--window-size=1280,800"
            ],
            ignoreHTTPSErrors: true,
            waitForInitialPage: true,
            timeout: 60000
        });

        // Set up browser-wide event listeners
        browserInstance.on('disconnected', () => {
            console.log('Browser disconnected');
        });

        browserInstance.on('targetdestroyed', (target) => {
            console.log('Target destroyed:', target.url());
        });

        // Create readline interface for location input
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const source = await new Promise(resolve => readline.question('\nEnter pickup location: ', resolve));
        const dest = await new Promise(resolve => readline.question('Enter drop location: ', resolve));
        
        readline.close();
        
        console.log("\nFetching data for cabs\nFROM:", source, "\nTO:", dest);

        let data = [];
        console.log("\nFetching prices for:");

        // Fetch prices without requiring authentication
        const fetchPromises = [
            uberFetch.getUber(source, dest, browserInstance)
                .then(uberArr => ({
                    Service: "Uber",
                    Details: uberArr
                }))
                .catch(() => ({
                    Service: "Uber",
                    Details: [{ Fare: "N/A", ETA: "N/A", Status: "Error" }]
                })),
            
            olaFetch.getOla(source, dest, browserInstance)
                .then(olaArr => ({
                    Service: "Ola",
                    Details: olaArr
                }))
                .catch(() => ({
                    Service: "Ola",
                    Details: [{ Fare: "N/A", ETA: "N/A", Status: "Error" }]
                })),
            
            rapidoFetch.getRapido(source, dest, browserInstance)
                .then(rapidoArr => ({
                    Service: "Rapido",
                    Details: rapidoArr
                }))
                .catch(() => ({
                    Service: "Rapido",
                    Details: [{ Fare: "N/A", ETA: "N/A", Status: "Error" }]
                }))
        ];

        // Wait for all price fetches to complete
        data = await Promise.all(fetchPromises);
        console.log("\nPrices fetched successfully");

        // Save and display fare data
        saveFareData(data);
        console.log("\nFare comparison results:");
        data.forEach(service => {
            console.log(`\n${service.Service}:`);
            service.Details.forEach(detail => {
                console.log(`- Fare: ${detail.Fare}, ETA: ${detail.ETA}`);
            });
        });

        console.log("\nWork finished successfully");
    } catch (err) {
        console.error("ERROR:", err);
        // Ensure we still create a fares.json with error state
        const errorData = [
            { Service: "Uber", Details: [{ Fare: "N/A", ETA: "N/A", Status: "Error" }] },
            { Service: "Ola", Details: [{ Fare: "N/A", ETA: "N/A", Status: "Error" }] },
            { Service: "Rapido", Details: [{ Fare: "N/A", ETA: "N/A", Status: "Error" }] }
        ];
        saveFareData(errorData);
        throw err;
    } finally {
        // Clean up
        if (browserInstance) {
            await browserInstance.close().catch(console.error);
        }
    }
})();

