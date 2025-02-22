// Node modules
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const process = require("process");

// Cab modules
const uberFetch = require("./cab-modules/uber");
const olaFetch = require("./cab-modules/ola");
const rapidoFetch = require("./cab-modules/rapido");
const cabAuth = require("./cab-modules/auth");

// Constants
const PHONE_NUMBER = "9805763104";
const SESSION_FILE = path.join(__dirname, 'data', 'sessions.json');
const FARES_FILE = path.join(__dirname, 'data', 'fares.json');

// Function to load saved sessions
function loadSavedSessions() {
    try {
        if (fs.existsSync(SESSION_FILE)) {
            const sessions = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'));
            console.log('Loaded saved sessions for:', Object.keys(sessions).filter(key => sessions[key]));
            return sessions;
        }
    } catch (error) {
        console.error('Error loading saved sessions:', error);
    }
    return null;
}

// Function to save sessions
function saveSessions(sessions) {
    try {
        const dataDir = path.join(__dirname, 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir);
            console.log('Created data directory:', dataDir);
        }
        fs.writeFileSync(SESSION_FILE, JSON.stringify(sessions));
        console.log('Saved sessions for:', Object.keys(sessions).filter(key => sessions[key]));
    } catch (error) {
        console.error('Error saving sessions:', error);
    }
}

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

        console.log("\nStarting authentication process...");
        console.log("Phone number:", PHONE_NUMBER);
        
        // Start authentication process
        const authResult = await cabAuth.authenticateAll(browserInstance, PHONE_NUMBER);
        
        if (authResult.uber || authResult.ola || authResult.rapido) {
            const sessions = {
                uber: authResult.uber ? cabAuth.getSession('uber') : null,
                ola: authResult.ola ? cabAuth.getSession('ola') : null,
                rapido: authResult.rapido ? cabAuth.getSession('rapido') : null
            };
            saveSessions(sessions);
            console.log('\nAuthentication successful for:', Object.keys(sessions).filter(key => sessions[key]).join(', '));
            
            // Now prompt for source and destination
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

            // Fetch prices using saved sessions
            const fetchPromises = [];

            if (sessions.uber) {
                console.log("UBER...");
                fetchPromises.push(
                    uberFetch.getUber(source, dest, browserInstance, sessions.uber)
                        .then(uberArr => ({
                            Service: "Uber",
                            Details: uberArr
                        }))
                );
            }

            if (sessions.ola) {
                console.log("OLA...");
                fetchPromises.push(
                    olaFetch.getOla(source, dest, browserInstance, sessions.ola)
                        .then(olaArr => ({
                            Service: "Ola",
                            Details: olaArr
                        }))
                );
            }

            if (sessions.rapido) {
                console.log("RAPIDO...");
                fetchPromises.push(
                    rapidoFetch.getRapido(source, dest, browserInstance, sessions.rapido)
                        .then(rapidoArr => ({
                            Service: "Rapido",
                            Details: rapidoArr
                        }))
                );
            }

            // Wait for all price fetches to complete
            data = await Promise.all(fetchPromises);
            console.log("\nPrices fetched successfully for", data.map(d => d.Service).join(', '));

            // Save and display fare data
            saveFareData(data);
            console.log("\nFare comparison results:");
            data.forEach(service => {
                console.log(`\n${service.Service}:`);
                service.Details.forEach(detail => {
                    console.log(`- Fare: ₹${detail.Fare}, ETA: ${detail.ETA}`);
                });
            });
        } else {
            throw new Error('Authentication failed for all services');
        }

        console.log("\nWork finished successfully");
    } catch (err) {
        console.error("ERROR:", err);
        // Ensure we still create a fares.json with error state
        const errorData = [
            { Service: "Uber", Details: [{ Fare: 0, ETA: "N/A", Status: "Error" }] },
            { Service: "Ola", Details: [{ Fare: 0, ETA: "N/A", Status: "Error" }] },
            { Service: "Rapido", Details: [{ Fare: 0, ETA: "N/A", Status: "Error" }] }
        ];
        saveFareData(errorData);
        throw err;
    } finally {
        // Clean up
        if (browserInstance) {
            await browserInstance.close().catch(console.error);
        }
        if (cabAuth) {
            cabAuth.close();
        }
    }
})();

