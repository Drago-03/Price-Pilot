const express = require('express');
const { exec } = require('child_process');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

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

app.post('/get-fare', async (req, res) => {
    try {
        const pickup = req.body.pickup;
        const drop = req.body.drop;

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

        // Create data directory if it doesn't exist
        const dataDir = path.join(__dirname, 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir);
            console.log('Created data directory:', dataDir);
        }

        // Execute the main.js script with proper error handling
        exec(`node main.js "${pickup}" "${drop}"`, { timeout: 60000 }, (error, stdout, stderr) => {
            if (error) {
                console.error('Error executing main.js:', {
                    error: error.message,
                    code: error.code,
                    signal: error.signal
                });
                return res.status(500).json({
                    error: 'Failed to fetch fare prices',
                    details: error.message
                });
            }

            console.log('main.js execution output:', stdout);
            if (stderr) {
                console.error('main.js stderr:', stderr);
            }

            // Read and parse fares.json
            const faresPath = path.join(__dirname, 'data', 'fares.json');
            console.log('Reading fares from:', faresPath);

            fs.readFile(faresPath, 'utf8', (err, data) => {
                if (err) {
                    console.error('Error reading fares.json:', {
                        error: err.message,
                        code: err.code,
                        path: faresPath
                    });
                    return res.status(500).json({
                        error: 'Error reading fare data',
                        details: err.message
                    });
                }

                try {
                    const fares = JSON.parse(data);
                    console.log('Successfully parsed fares:', {
                        services: fares.map(f => f.Service),
                        timestamp: new Date().toISOString()
                    });
                    res.json(fares);
                } catch (parseError) {
                    console.error('Error parsing fares.json:', {
                        error: parseError.message,
                        data: data.substring(0, 100) + '...' // Log first 100 chars of data
                    });
                    res.status(500).json({
                        error: 'Error parsing fare data',
                        details: parseError.message
                    });
                }
            });
        });
    } catch (error) {
        console.error('Unexpected server error:', {
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
});

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

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
    console.log(`API endpoints available at http://localhost:${port}/get-fare`);
});
