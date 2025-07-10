const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting GetContact Uzb APK Build Process...\n');

try {
  // Check if we're in the right directory
  console.log('1. Checking project structure...');
  if (!fs.existsSync('package.json')) {
    throw new Error('package.json not found. Please run this script from the project root.');
  }
  console.log('✅ Project structure verified\n');

  // Install dependencies if needed
  console.log('2. Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed\n');

  // Try to build with EAS
  console.log('3. Starting EAS build for Android...');
  try {
    execSync('npx eas build --platform android --non-interactive', { stdio: 'inherit' });
    console.log('✅ EAS build started successfully!');
  } catch (easError) {
    console.log('⚠️ EAS build failed, trying alternative method...');
    
    // Try Expo build
    try {
      execSync('npx expo build:android', { stdio: 'inherit' });
      console.log('✅ Expo build started successfully!');
    } catch (expoError) {
      console.log('❌ Both build methods failed.');
      console.log('Please ensure you are logged in to Expo: npx expo login');
      console.log('Then try: npx eas build --platform android');
    }
  }

} catch (error) {
  console.error('❌ Build process failed:', error.message);
  process.exit(1);
}

console.log('\n🎉 Build process completed!');
console.log('📱 Check your Expo dashboard for the APK download link.'); 