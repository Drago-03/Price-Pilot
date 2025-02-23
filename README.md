# Price Pilot

## Overview

Price Pilot is a web application that allows users to compare prices of various services. It currently supports cab service comparisons across multiple providers (Uber, Ola, and Rapido), with plans to expand to food delivery, grocery delivery, and medicine delivery services.

## Features

- Compare prices of various services in real-time
- Get accurate fare estimates with ETA
- User-friendly interface with modern design
- Location-based service with map integration
- Support for multiple service providers
- Responsive design for all devices
- Dark theme support
- Real-time route visualization
- Fare history tracking

### Current Services
- **Cab Services**
  - Uber
  - Ola
  - Rapido

### Coming Soon
- **Food Delivery**
  - Zomato
  - Swiggy
- **Grocery Delivery**
  - BigBasket
  - Instamart
  - Blinkit
  - Zepto
- **Medicine Delivery**
  - PharmEasy
  - Netmeds
  - 1mg

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Google Maps API key
- Modern web browser
- Internet connection

## Installation

1. Clone the repository
```bash
git clone https://github.com/Drago-03/Price-Pilot.git
cd Price-Pilot
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your API keys and configuration
```

4. Start the server
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Configuration

### Environment Variables
```env
# Firebase Configuration
FIREBASE_API_KEY=your_api_key
FIREBASE_APP_ID=your_app_id
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket

# Backend Configuration
BACKEND_URL=http://localhost:8000
API_VERSION=v1

# Redis Configuration
REDIS_URL=redis://localhost:6379

# API Keys
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
UBER_API_KEY=your_uber_api_key
OLA_API_KEY=your_ola_api_key
RAPIDO_API_KEY=your_rapido_api_key
```

## Project Structure

```
Price-Pilot/
├── cab-modules/          # Cab service modules
├── server/              # Backend server
├── public/              # Static files
├── src/                 # Source files
├── tests/               # Test files
├── docs/                # Documentation
└── scripts/             # Utility scripts
```

## Usage

1. Open the application in your browser
2. Select the service you want to compare (e.g., Cabs)
3. Enter pickup and drop-off locations
4. Click "Compare Prices"
5. View real-time price comparisons and choose the best option

## API Documentation

Detailed API documentation is available in the following files:
- [Cab Modules Documentation](cab-modules/README.md)
- [Technical Specification](cab-modules/TECHNICAL.md)

## Development

### Running Tests
```bash
# Run all tests
npm test

# Run specific test suite
npm run test:cab-modules
npm run test:integration
npm run test:e2e
```

### Code Style
We use ESLint and Prettier for code formatting. Run:
```bash
# Check code style
npm run lint

# Fix code style issues
npm run lint:fix
```

### Building for Production
```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch
```bash
git checkout -b feature/amazing-feature
```
3. Commit your changes
```bash
git commit -m 'Add amazing feature'
```
4. Push to the branch
```bash
git push origin feature/amazing-feature
```
5. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and development process.

## Team

- **Mantej Singh Arora** - Lead Developer
- **Ishaan Sharma** - Backend Developer
- **Gagandeep** - DevOps Engineer
- **Ayush Saini** - UI/UX Designer
- **Dhruv Pandey** - Quality Assurance

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Google Maps Platform for mapping services
- Bootstrap for UI components
- Font Awesome for icons
- All our service provider partners

## Support

For support, please email mantejarora@gmail.com or open an issue in the repository.

## Roadmap

- [ ] Add food delivery comparison
- [ ] Implement grocery delivery services
- [ ] Add medicine delivery comparison
- [ ] Implement user accounts and history
- [ ] Add fare prediction using ML
- [ ] Implement real-time price tracking
- [ ] Add price alerts feature
- [ ] Develop mobile applications

## Security

Please report any security issues to mantejarora@gmail.com. Do not create public issues for security vulnerabilities.

