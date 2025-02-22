# Price Pilot Frontend

Mobile-first React Native application for comparing cab prices across different services.

## 📱 Features

- Real-time price comparison
- Beautiful, responsive UI
- QR code scanning
- Offline support
- Location autocomplete
- Price history visualization
- Deep linking support
- Dark mode

## 🏗 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Card.tsx
│   │   ├── price/
│   │   │   ├── PriceCard.tsx
│   │   │   └── PriceComparison.tsx
│   │   └── history/
│   │       ├── HistoryChart.tsx
│   │       └── HistoryList.tsx
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── HistoryScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── navigation/
│   │   ├── AppNavigator.tsx
│   │   └── LinkingConfiguration.ts
│   ├── services/
│   │   ├── api.ts
│   │   └── storage.ts
│   ├── hooks/
│   │   ├── useLocation.ts
│   │   └── usePrices.ts
│   ├── utils/
│   │   ├── format.ts
│   │   └── validation.ts
│   └── constants/
│       ├── Colors.ts
│       └── Layout.ts
├── assets/
│   ├── images/
│   └── fonts/
├── __tests__/
│   ├── components/
│   └── screens/
└── app.json
```

## 🚀 Quick Start

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on iOS:
```bash
npm run ios
```

4. Run on Android:
```bash
npm run android
```

## 📱 Development

### Environment Setup

1. Install Expo CLI:
```bash
npm install -g expo-cli
```

2. Configure environment variables:
```bash
cp .env.example .env
```

### Running the App

Development mode:
```bash
npm start
```

Production build:
```bash
expo build:android
expo build:ios
```

## 🎨 UI Components

The app uses custom components built on top of React Native's core components:

- `Button`: Custom button with loading states
- `Input`: Text input with validation
- `Card`: Shadowed container for content
- `PriceCard`: Displays ride pricing information
- `HistoryChart`: Visualizes price trends

## 📡 API Integration

The app communicates with the backend through a REST API:

```typescript
// services/api.ts
export const getPrices = async (pickup: Location, dropoff: Location) => {
  const response = await api.get('/compare-prices', {
    params: { pickup, dropoff }
  });
  return response.data;
};
```

## 💾 Data Persistence

Local storage is handled using AsyncStorage:

```typescript
// services/storage.ts
export const saveRecentSearch = async (search: RecentSearch) => {
  const searches = await getRecentSearches();
  await AsyncStorage.setItem(
    'recentSearches',
    JSON.stringify([search, ...searches].slice(0, 10))
  );
};
```

## 🔗 Deep Linking

The app supports deep linking for sharing ride comparisons:

```typescript
// navigation/LinkingConfiguration.ts
export default {
  prefixes: ['pricepilot://'],
  config: {
    screens: {
      Compare: 'compare/:pickup/:dropoff'
    }
  }
};
```

## 🧪 Testing

Run tests:
```bash
npm test
```

Run with coverage:
```bash
npm test -- --coverage
```

## 📱 Building for Production

1. Configure app.json:
```json
{
  "expo": {
    "name": "Price Pilot",
    "version": "1.0.0",
    "platforms": ["ios", "android"]
  }
}
```

2. Build for iOS:
```bash
expo build:ios
```

3. Build for Android:
```bash
expo build:android
```

## 🔍 Performance Optimization

- Image caching
- Lazy loading of screens
- Memoized components
- Optimized list rendering
- Reduced bundle size

## 🔒 Security

- Secure storage for sensitive data
- API key protection
- Input sanitization
- Certificate pinning
- Obfuscated builds

## 📝 Code Style

The project follows the following style guides:
- ESLint configuration
- Prettier formatting
- TypeScript strict mode
- React Native community guidelines

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Write tests
4. Submit a pull request

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev)
- [React Native Documentation](https://reactnative.dev)
- [TypeScript Documentation](https://www.typescriptlang.org) 