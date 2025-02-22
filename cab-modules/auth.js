const puppeteer = require('puppeteer');
const readline = require('readline');

// Create readline interface for OTP input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Promise wrapper for readline
const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

// Sleep function
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Authentication class to handle logins
class CabAuth {
    constructor() {
        this.sessions = {
            uber: null,
            ola: null,
            rapido: null
        };
        this.page = null;
    }

    async setupPage(browserInstance) {
        // Create a new page
        this.page = await browserInstance.newPage();
        
        // Set viewport and user agent for better compatibility
        const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
        await this.page.setViewport({ width: 1280, height: 800 });
        await this.page.setUserAgent(userAgent);
        
        // Set longer timeouts
        this.page.setDefaultNavigationTimeout(60000);
        this.page.setDefaultTimeout(60000);
        
        // Block unnecessary resources
        await this.page.setRequestInterception(true);
        this.page.on('request', request => {
            if (
                request.resourceType() === 'image' ||
                request.resourceType() === 'font' ||
                request.resourceType() === 'media'
            ) {
                request.abort();
            } else {
                request.continue();
            }
        });

        // Add error handlers
        this.page.on('error', err => {
            console.error('Page error:', err);
        });

        this.page.on('pageerror', err => {
            console.error('Page error:', err);
        });

        // Add navigation error handler
        this.page.on('requestfailed', request => {
            console.error('Request failed:', request.url(), request.failure().errorText);
        });
    }

    async loginToUber(phoneNumber) {
        try {
            console.log('\nAttempting Uber login...');
            
            await this.page.goto('https://auth.uber.com/v2/mobile_sign_in', {
                waitUntil: 'networkidle0',
                timeout: 60000
            });
            
            // Wait for page to stabilize
            await sleep(3000);
            
            // Log current URL
            console.log('Current Uber URL:', await this.page.url());
            
            // Wait for and enter phone number
            console.log('Waiting for phone input field...');
            await this.page.waitForSelector('input[type="tel"]', { visible: true, timeout: 60000 });
            await this.page.type('input[type="tel"]', phoneNumber, { delay: 100 });
            
            // Find and click the continue/next button
            await this.page.waitForSelector('button[type="submit"]', { visible: true, timeout: 60000 });
            await this.page.click('button[type="submit"]');
            console.log('Clicked submit button');
            
            // Wait for OTP input from terminal
            console.log('\nWaiting for Uber OTP...');
            const otp = await askQuestion('Enter OTP received for Uber: ');
            
            try {
                // Wait for OTP input field
                await this.page.waitForSelector('input[type="text"]', { visible: true, timeout: 60000 });
                await this.page.type('input[type="text"]', otp, { delay: 100 });
                
                // Find and click verify button
                await this.page.waitForSelector('button[type="submit"]', { visible: true, timeout: 60000 });
                await this.page.click('button[type="submit"]');
                console.log('Clicked verify button');
                
                // Wait for successful login
                await this.page.waitForNavigation({ timeout: 60000 });
                
                // Store cookies
                this.sessions.uber = await this.page.cookies();
                return true;
            } catch (error) {
                console.error('Uber OTP verification error:', error);
                return false;
            }
        } catch (error) {
            console.error('Uber login error:', error);
            return false;
        }
    }

    async loginToOla(phoneNumber) {
        try {
            console.log('\nAttempting Ola login...');
            
            await this.page.goto('https://book.olacabs.com', {
                waitUntil: 'networkidle0',
                timeout: 60000
            });
            
            // Wait for page to stabilize
            await sleep(3000);
            
            // Log current URL
            console.log('Current Ola URL:', await this.page.url());
            
            // Wait for phone input
            console.log('Looking for phone input field...');
            await this.page.waitForSelector('#phone-number', { visible: true, timeout: 60000 });
            await this.page.type('#phone-number', phoneNumber, { delay: 100 });
            
            // Click get OTP button
            await this.page.waitForSelector('#get-otp', { visible: true, timeout: 60000 });
            await this.page.click('#get-otp');
            console.log('Clicked get OTP button');
            
            // Wait for OTP input from terminal
            console.log('\nWaiting for Ola OTP...');
            const otp = await askQuestion('Enter OTP received for Ola: ');
            
            try {
                // Enter OTP
                await this.page.waitForSelector('#otp', { visible: true, timeout: 60000 });
                await this.page.type('#otp', otp, { delay: 100 });
                
                // Click verify button
                await this.page.waitForSelector('#verify-otp', { visible: true, timeout: 60000 });
                await this.page.click('#verify-otp');
                console.log('Clicked verify button');
                
                // Wait for successful login
                await this.page.waitForNavigation({ timeout: 60000 });
                
                // Store cookies
                this.sessions.ola = await this.page.cookies();
                return true;
            } catch (error) {
                console.error('Ola OTP verification error:', error);
                return false;
            }
        } catch (error) {
            console.error('Ola login error:', error);
            return false;
        }
    }

    async loginToRapido(phoneNumber) {
        try {
            console.log('\nAttempting Rapido login...');
            
            await this.page.goto('https://onlineapp.rapido.bike/login', {
                waitUntil: 'networkidle0',
                timeout: 60000
            });
            
            // Wait for page to stabilize
            await sleep(3000);
            
            // Log current URL
            console.log('Current Rapido URL:', await this.page.url());
            
            // Wait for phone input
            console.log('Looking for phone input field...');
            await this.page.waitForSelector('input[type="tel"]', { visible: true, timeout: 60000 });
            await this.page.type('input[type="tel"]', phoneNumber, { delay: 100 });
            
            // Click continue button
            await this.page.waitForSelector('button[type="submit"]', { visible: true, timeout: 60000 });
            await this.page.click('button[type="submit"]');
            console.log('Clicked continue button');
            
            // Wait for OTP input from terminal
            console.log('\nWaiting for Rapido OTP...');
            const otp = await askQuestion('Enter OTP received for Rapido: ');
            
            try {
                // Enter OTP
                await this.page.waitForSelector('input[type="number"]', { visible: true, timeout: 60000 });
                await this.page.type('input[type="number"]', otp, { delay: 100 });
                
                // Click verify button
                await this.page.waitForSelector('button[type="submit"]', { visible: true, timeout: 60000 });
                await this.page.click('button[type="submit"]');
                console.log('Clicked verify button');
                
                // Wait for successful login
                await this.page.waitForNavigation({ timeout: 60000 });
                
                // Store cookies
                this.sessions.rapido = await this.page.cookies();
                return true;
            } catch (error) {
                console.error('Rapido OTP verification error:', error);
                return false;
            }
        } catch (error) {
            console.error('Rapido login error:', error);
            return false;
        }
    }

    async authenticateAll(browserInstance, phoneNumber) {
        try {
            // Set up page
            await this.setupPage(browserInstance);

            console.log('\nStarting authentication process for all services...');
            console.log(`Phone number: ${phoneNumber}`);
            
            // Start login process for all services sequentially
            const uberSuccess = await this.loginToUber(phoneNumber);
            console.log('Uber login:', uberSuccess ? 'Success' : 'Failed');
            
            const olaSuccess = await this.loginToOla(phoneNumber);
            console.log('Ola login:', olaSuccess ? 'Success' : 'Failed');
            
            const rapidoSuccess = await this.loginToRapido(phoneNumber);
            console.log('Rapido login:', rapidoSuccess ? 'Success' : 'Failed');

            return {
                uber: uberSuccess,
                ola: olaSuccess,
                rapido: rapidoSuccess
            };
        } catch (error) {
            console.error('Authentication error:', error);
            await this.close();
            return {
                uber: false,
                ola: false,
                rapido: false
            };
        }
    }

    // Get session cookies for a specific service
    getSession(service) {
        return this.sessions[service];
    }

    // Close all resources
    async close() {
        try {
            if (this.page) {
                await this.page.close().catch(console.error);
            }
        } catch (error) {
            console.error('Error closing resources:', error);
        } finally {
            rl.close();
        }
    }
}

module.exports = new CabAuth(); 