# GetContact Uzb Mobile App

A React Native mobile application for searching phone numbers to see how others have saved them in their contacts.

## Features

- 🔐 User authentication (login/register)
- 📱 Contact permission management
- 🔍 Phone number search functionality
- 👥 View how others saved contact names
- 🎨 Modern, intuitive UI design
- 🔒 Secure JWT token authentication

## Prerequisites

- Node.js (v14 or higher)
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- Backend API running (see backend README)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Install Additional Dependencies

```bash
npm install react-native-contacts react-native-permissions @react-navigation/native @react-navigation/stack react-native-screens react-native-safe-area-context react-native-gesture-handler
```

### 3. iOS Setup (macOS only)

```bash
cd ios && pod install && cd ..
```

### 4. Start the Backend

Make sure the backend API is running on `http://localhost:5000` (see backend README for setup).

### 5. Run the App

#### Android
```bash
npx react-native run-android
```

#### iOS (macOS only)
```bash
npx react-native run-ios
```

## App Structure

```
src/
├── navigation/
│   └── AppNavigator.tsx      # Main navigation setup
├── screens/
│   ├── LoginScreen.tsx       # User login screen
│   ├── RegisterScreen.tsx    # User registration screen
│   ├── ContactPermissionScreen.tsx  # Contact permission request
│   └── MainAppScreen.tsx     # Main app with search functionality
└── components/               # Reusable components (future)
```

## Screens

### Login Screen
- Phone number and password input
- API integration for authentication
- Navigation to registration

### Register Screen
- User registration with name, phone, and password
- Form validation
- Success/error handling

### Contact Permission Screen
- Explains why contact access is needed
- Requests permission from user
- Option to skip permission

### Main App Screen
- Phone number search functionality
- Displays search results with contact names
- Shows frequency of each name
- User logout functionality

## API Integration

The app connects to the backend API at `http://localhost:5000`:

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/contacts/search` - Search phone numbers
- `POST /api/contacts/upload` - Upload contacts (future feature)

## Development

### Adding New Features

1. Create new screen components in `src/screens/`
2. Add navigation routes in `src/navigation/AppNavigator.tsx`
3. Update TypeScript types as needed
4. Test on both Android and iOS

### Styling

The app uses React Native StyleSheet for styling with a consistent design system:
- Primary color: `#007AFF`
- Background: `#f5f5f5`
- Text colors: `#333`, `#666`, `#999`
- Consistent spacing and border radius

## Troubleshooting

### Common Issues

1. **Metro bundler issues**: Clear cache with `npx react-native start --reset-cache`
2. **iOS build issues**: Run `cd ios && pod install` after installing new dependencies
3. **Android build issues**: Clean and rebuild with `cd android && ./gradlew clean`
4. **Network errors**: Ensure backend is running on `http://localhost:5000`

### Debug Mode

Enable debug mode by shaking the device or pressing `Cmd+D` (iOS) / `Cmd+M` (Android) in the simulator.

## Production Build

### Android
```bash
cd android && ./gradlew assembleRelease
```

### iOS
```bash
cd ios && xcodebuild -workspace GetContactUzb.xcworkspace -scheme GetContactUzb -configuration Release
```

## License

MIT License 