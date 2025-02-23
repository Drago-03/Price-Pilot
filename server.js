const express = require('express');
const { exec } = require('child_process');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { Client } = require('@googlemaps/google-maps-services-js');
const MobilityService = require('./beckn/mobility/service');

// Load environment variables
dotenv.config();

const app = express();

// Initialize Google Maps client
const googleMapsClient = new Client({});

// Beckn configuration
const becknConfig = {
    subscriberId: process.env.BECKN_SUBSCRIBER_ID,
    subscriberUri: process.env.BECKN_SUBSCRIBER_URI,
    privateKey: process.env.BECKN_PRIVATE_KEY,
    publicKey: process.env.BECKN_PUBLIC_KEY,
    uniqueKey: process.env.BECKN_UNIQUE_KEY,
    city: "std:080", // Bangalore city code
    country: "IND"
};

// Initialize mobility service
const mobilityService = new MobilityService(becknConfig);

// Enable CORS for all routes with more specific options
app.use(cors({
    origin: '*', // Allow all origins in development
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // Cache preflight requests for 24 hours
}));

// Parse URL-encoded bodies and JSON
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the cab-compare directory
app.use(express.static(path.join(__dirname, 'cab-compare')));

// Root route to serve the index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'cab-compare', 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK' });
});

// New endpoint for cab fare comparison using Beckn Protocol
app.post('/get-fare', async (req, res) => {
    try {
        const { pickup, drop } = req.body;

        console.log('Received fare request:', {
            pickup,
            drop,
            timestamp: new Date().toISOString()
        });

        if (!pickup || !drop) {
            console.error('Missing required fields:', { pickup, drop });
            return res.status(400).json({
                error: 'Both pickup and drop locations are required'
            });
        }

        // Convert addresses to GPS coordinates using Google Maps Geocoding
        const pickupCoords = await geocodeAddress(pickup);
        const dropCoords = await geocodeAddress(drop);

        // Format coordinates for Beckn protocol
        const pickupGPS = `${pickupCoords.lat},${pickupCoords.lng}`;
        const dropGPS = `${dropCoords.lat},${dropCoords.lng}`;

        // Search for cabs using Beckn protocol
        const results = await mobilityService.searchCabs(pickupGPS, dropGPS);

        // Save results to fares.json for compatibility
        const dataDir = path.join(__dirname, 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir);
        }
        fs.writeFileSync(path.join(dataDir, 'fares.json'), JSON.stringify(results, null, 2));

        res.json(results);
    } catch (error) {
        console.error('Error processing fare request:', error);
        res.status(500).json({
            error: 'Failed to fetch fare prices',
            details: error.message
        });
    }
});

// Initialize booking
app.post('/init-booking', async (req, res) => {
    try {
        const { provider, item } = req.body;
        const result = await mobilityService.initBooking(provider, item);
        res.json(result);
    } catch (error) {
        console.error('Error initializing booking:', error);
        res.status(500).json({
            error: 'Failed to initialize booking',
            details: error.message
        });
    }
});

// Confirm booking
app.post('/confirm-booking', async (req, res) => {
    try {
        const { bookingId } = req.body;
        const result = await mobilityService.confirmBooking(bookingId);
        res.json(result);
    } catch (error) {
        console.error('Error confirming booking:', error);
        res.status(500).json({
            error: 'Failed to confirm booking',
            details: error.message
        });
    }
});

// Track booking
app.get('/track-booking/:bookingId', async (req, res) => {
    try {
        const { bookingId } = req.params;
        const result = await mobilityService.trackBooking(bookingId);
        res.json(result);
    } catch (error) {
        console.error('Error tracking booking:', error);
        res.status(500).json({
            error: 'Failed to track booking',
            details: error.message
        });
    }
});

// Helper function to geocode address using Google Maps
async function geocodeAddress(address) {
    try {
        const response = await googleMapsClient.geocode({
            params: {
                address: address,
                key: process.env.GOOGLE_MAPS_API_KEY
            }
        });

        if (response.data.results && response.data.results.length > 0) {
            const location = response.data.results[0].geometry.location;
            return {
                lat: location.lat,
                lng: location.lng
            };
        } else {
            throw new Error('No results found');
        }
    } catch (error) {
        console.error('Geocoding error:', error.response ? error.response.data : error.message);
        throw new Error(`Geocoding failed for address: ${address}`);
    }
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Global error handler:', {
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method
    });
    res.status(500).json({
        error: 'Something broke!',
        details: err.message
    });
});

// Graceful shutdown function
function shutdownGracefully() {
    console.log('Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
}

// Handle shutdown signals
process.on('SIGTERM', shutdownGracefully);
process.on('SIGINT', shutdownGracefully);

// Start server function
function startServer(port) {
    return new Promise((resolve, reject) => {
        const server = app.listen(port)
            .once('listening', () => {
                console.log(`Server started successfully:`);
                console.log(`- Local: http://localhost:${port}`);
                console.log(`- API endpoint: http://localhost:${port}/get-fare`);
                resolve(server);
            })
            .once('error', (err) => {
                if (err.code === 'EADDRINUSE') {
                    console.log(`Port ${port} is busy, trying ${port + 1}...`);
                    server.close();
                    startServer(port + 1).then(resolve).catch(reject);
                } else {
                    reject(err);
                }
            });
    });
}

// Start the server with initial port
startServer(3000).catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
