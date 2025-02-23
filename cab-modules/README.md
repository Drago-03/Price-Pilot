# Price Pilot

## Overview

The cab comparison modules provide functionality to fetch and compare fare estimates from multiple cab service providers (Uber, Ola, and Rapido) using web scraping techniques. The system uses Puppeteer for browser automation and provides a unified interface for price comparison.

## Table of Contents

1. [Installation](#installation)
2. [Module Structure](#module-structure)
3. [Usage](#usage)
4. [API Reference](#api-reference)
5. [Error Handling](#error-handling)
6. [Browser Configuration](#browser-configuration)
7. [Contributing](#contributing)

## Installation

```bash
# Install dependencies
npm install puppeteer

# Optional: Install types for better IDE support
npm install --save-dev @types/puppeteer
```

## Module Structure

```
cab-modules/
├── index.js      # Main module coordinating all services
├── uber.js       # Uber fare estimation module
├── ola.js        # Ola fare estimation module
├── rapido.js     # Rapido fare estimation module
└── README.md     # Documentation
```

## Usage

### Basic Usage

```javascript
const { getAllCabPrices, validateLocation, sanitizeLocation } = require('./cab-modules');

async function comparePrices() {
    const source = "Central Park, New York";
    const destination = "Times Square, New York";
    
    // Validate and sanitize inputs
    if (!validateLocation(source) || !validateLocation(destination)) {
        throw new Error('Invalid location input');
    }
    
    const sanitizedSource = sanitizeLocation(source);
    const sanitizedDest = sanitizeLocation(destination);
    
    // Get fare estimates
    const results = await getAllCabPrices(sanitizedSource, sanitizedDest);
    console.log(results);
}
```

### Response Format

```javascript
[
    {
        Service: "Uber",
        Details: [
            {
                Type: "UberGo",
                Fare: "₹250",
                ETA: "5 mins"
            },
            // ... more options
        ]
    },
    // ... other services
]
```

## API Reference

### Main Module (index.js)

#### `getAllCabPrices(source, destination)`

Fetches fare estimates from all supported cab services.

- **Parameters:**
  - `source` (string): Pickup location address
  - `destination` (string): Drop-off location address
- **Returns:** Promise<Array> of fare estimates from all services
- **Throws:** Error if browser initialization fails

#### `validateLocation(location)`

Validates location input string.

- **Parameters:**
  - `location` (string): Location address to validate
- **Returns:** boolean

#### `sanitizeLocation(location)`

Sanitizes location input string.

- **Parameters:**
  - `location` (string): Location address to sanitize
- **Returns:** string (sanitized location)

### Service-Specific Modules

#### Uber Module (uber.js)

`getUber(source, destination, browserInstance)`

- **Parameters:**
  - `source` (string): Pickup location
  - `destination` (string): Drop-off location
  - `browserInstance` (Browser): Puppeteer browser instance
- **Returns:** Promise<Array> of Uber fare estimates

#### Ola Module (ola.js)

`getOla(source, destination, browserInstance)`

- **Parameters:**
  - `source` (string): Pickup location
  - `destination` (string): Drop-off location
  - `browserInstance` (Browser): Puppeteer browser instance
- **Returns:** Promise<Array> of Ola fare estimates

#### Rapido Module (rapido.js)

`getRapido(source, destination, browserInstance)`

- **Parameters:**
  - `source` (string): Pickup location
  - `destination` (string): Drop-off location
  - `browserInstance` (Browser): Puppeteer browser instance
- **Returns:** Promise<Array> of Rapido fare estimates

## Error Handling

The modules implement comprehensive error handling:

1. **Network Errors:**
   - Timeout handling (60s default)
   - Connection failure recovery
   - Invalid URL handling

2. **Scraping Errors:**
   - Element not found handling
   - Content parsing errors
   - Navigation errors

3. **Input Validation:**
   - Empty input checking
   - Special character sanitization
   - Input length validation

4. **Error Response Format:**

```javascript
{
    Type: 'Error',
    Fare: 'N/A',
    ETA: 'N/A'
}
```

## Browser Configuration

The system uses a shared Puppeteer browser instance with the following configuration:

```javascript
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
```

### Configuration Options

- **headless**: Runs browser in headless mode
- **no-sandbox**: Disables Chrome's sandbox (required in some environments)
- **disable-dev-shm-usage**: Prevents memory issues in containerized environments
- **window-size**: Sets viewport size for consistent rendering

## Contributing

### Adding a New Service Provider

1. Create a new module file (e.g., `newservice.js`)
2. Implement the standard interface:

   ```javascript
   async function getNewService(source, destination, browserInstance) {
       // Implementation
   }
   ```

3. Update `index.js` to include the new service
4. Add error handling and documentation

### Code Style Guidelines

1. Use JSDoc comments for all functions
2. Implement proper error handling
3. Follow consistent naming conventions
4. Add inline comments for complex operations
5. Update documentation for significant changes

### Testing

1. Run unit tests: `npm test`
2. Test with various locations
3. Verify error handling
4. Check response format consistency

## License

This project is licensed under the MIT License - see the LICENSE file for details.
