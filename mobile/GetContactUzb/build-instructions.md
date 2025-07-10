# 🚀 GetContact Uzb APK Build Instructions

## Quick Build Method (Recommended)

### 1. Login to Expo
```bash
cd mobile/GetContactUzb
npx expo login
```
Enter your Expo username and password when prompted.

### 2. Build APK
```bash
npx eas build --platform android
```

### 3. Follow Prompts
- When asked "Would you like to create a new project on Expo?" → Answer: **Yes**
- Project name: **getcontact-uzb** (or accept default)
- Wait for build to complete (5-15 minutes)

### 4. Download APK
- Copy the download link from terminal
- Open link in browser
- Download the APK file

## Alternative Build Methods

### Method 2: Expo Classic Build
```bash
npx expo build:android
```

### Method 3: Local Build (if you have Android Studio)
```bash
npx react-native run-android --variant=release
```

## Troubleshooting

### If you get "Not logged in" error:
1. Run: `npx expo login`
2. Create account at https://expo.dev if needed
3. Try build again

### If you get "Project not found" error:
1. Run: `npx expo register`
2. Follow prompts to create project
3. Try build again

### If build fails:
1. Check internet connection
2. Ensure all dependencies are installed: `npm install`
3. Try again with: `npx eas build --platform android --clear-cache`

## Expected Output

When successful, you should see:
```
✅ Build completed successfully!
📱 Download your APK at: https://expo.dev/artifacts/eas/...
```

## Install APK

1. Download the APK file
2. Transfer to Android device
3. Enable "Install from unknown sources" in Android settings
4. Install the APK

---

**Need help?** Check the Expo documentation at https://docs.expo.dev/build/setup/ 