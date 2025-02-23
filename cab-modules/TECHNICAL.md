# Technical Specification: Cab Comparison Modules

## Architecture Overview

### System Components

1. **Browser Instance Manager**
   - Shared Puppeteer browser instance
   - Resource cleanup handling
   - Memory optimization

2. **Service Modules**
   - Individual cab service handlers
   - Web scraping logic
   - Error recovery mechanisms

3. **Coordination Layer**
   - Concurrent request handling
   - Result aggregation
   - Error state management

### Data Flow

```
[User Input] → [Input Validation] → [Browser Instance] → [Service Modules] → [Result Aggregation] → [Response]
```

## Technical Implementation Details

### 1. Browser Instance Management

#### Configuration

```javascript
{
    headless: true,
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080'
    ]
}
```

#### Resource Management

- Single browser instance for multiple requests
- Page context isolation
- Automatic memory cleanup
- Connection pool management

### 2. Web Scraping Implementation

#### Page Navigation

```javascript
await page.goto(URL, {
    waitUntil: 'networkidle0',
    timeout: 60000
});
```

#### Element Selection

- Primary: CSS Selectors
- Fallback: XPath queries
- Timeout handling: 10s default

#### Data Extraction

```javascript
const data = await page.evaluate(() => {
    // DOM manipulation
    // Data formatting
    // Error checking
});
```

### 3. Error Handling Strategy

#### Levels of Error Handling

1. **Browser Level**
   - Connection errors
   - Navigation timeouts
   - Resource limits

2. **Page Level**
   - Element not found
   - Content extraction failures
   - JavaScript execution errors

3. **Service Level**
   - Invalid responses
   - Rate limiting
   - Service-specific errors

#### Error Recovery Flow

```
[Error Detection] → [Classification] → [Recovery Attempt] → [Fallback Response]
```

### 4. Performance Optimization

#### Caching Strategy

- Location geocoding results
- Service availability status
- Rate limit tracking

#### Resource Usage

- Memory: ~250MB per browser instance
- CPU: Peaks during page rendering
- Network: ~500KB per request

#### Optimization Techniques

1. Connection pooling
2. Request queuing
3. Resource cleanup
4. Response caching

### 5. Security Considerations

#### Input Validation

```javascript
function sanitizeLocation(location) {
    return location
        .trim()
        .replace(/[<>]/g, '')
        // Additional sanitization
}
```

#### Browser Security

- Sandbox configuration
- Network isolation
- Cookie handling
- Header management

### 6. Monitoring and Logging

#### Key Metrics

1. Request success rate
2. Response time
3. Error frequency
4. Resource usage

#### Log Levels

```javascript
{
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
}
```

## Integration Guidelines

### 1. Module Integration

```javascript
const { getAllCabPrices } = require('./cab-modules');

// Configuration
const config = {
    timeout: 60000,
    retries: 3,
    concurrent: true
};

// Usage
const prices = await getAllCabPrices(source, destination, config);
```

### 2. Error Handling Integration

```javascript
try {
    const results = await getAllCabPrices(source, destination);
    handleSuccess(results);
} catch (error) {
    if (error.type === 'NETWORK') {
        handleNetworkError(error);
    } else if (error.type === 'SERVICE') {
        handleServiceError(error);
    } else {
        handleGenericError(error);
    }
}
```

### 3. Response Handling

#### Success Response

```javascript
{
    status: 'success',
    data: [
        {
            Service: 'ServiceName',
            Details: [
                {
                    Type: 'VehicleType',
                    Fare: 'Amount',
                    ETA: 'Duration'
                }
            ]
        }
    ]
}
```

#### Error Response

```javascript
{
    status: 'error',
    error: {
        code: 'ERROR_CODE',
        message: 'Error description',
        details: {} // Additional information
    }
}
```

## Performance Benchmarks

### 1. Response Times

- Average: 2-3 seconds
- Peak: 5 seconds
- Timeout: 60 seconds

### 2. Resource Usage

- Memory: 200-300MB
- CPU: 1-2 cores
- Network: 0.5-1MB per request

### 3. Concurrency

- Maximum concurrent requests: 10
- Request queue size: 100
- Rate limiting: 100 requests/minute

## Development Workflow

### 1. Setup Development Environment

```bash
# Clone repository
git clone <repository>

# Install dependencies
npm install

# Set up environment
cp .env.example .env
```

### 2. Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run performance tests
npm run test:performance
```

### 3. Deployment

```bash
# Build
npm run build

# Start
npm start

# Monitor
npm run monitor
```

## Maintenance Guidelines

### 1. Regular Tasks

- Monitor error rates
- Update user agents
- Check service endpoints
- Update selectors

### 2. Troubleshooting

1. Check browser logs
2. Verify network connectivity
3. Validate service responses
4. Review error patterns

### 3. Updates

- Service endpoint changes
- Selector updates
- Browser compatibility
- Security patches
