# Building Dear South Africa Android App

## Prerequisites (One-Time Setup)

### 1. Install Node.js
- Download from: https://nodejs.org/
- Install version 18 or higher
- Verify: Open terminal and run `node --version`

### 2. Install Android Studio
- Download from: https://developer.android.com/studio
- During installation, make sure to install:
  - Android SDK
  - Android SDK Platform
  - Android Virtual Device (optional, for testing)
- This takes about 30-45 minutes

### 3. Install Java Development Kit (JDK)
- Android Studio usually installs this
- If not, download JDK 17 from: https://www.oracle.com/java/technologies/downloads/

### 4. Set Environment Variables
**Windows:**
1. Search for "Environment Variables" in Start menu
2. Add these to System Variables:
   - `ANDROID_HOME`: `C:\Users\YourUsername\AppData\Local\Android\Sdk`
   - `JAVA_HOME`: `C:\Program Files\Android\Android Studio\jbr`

**Mac/Linux:**
Add to `~/.bash_profile` or `~/.zshrc`:
\`\`\`bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
\`\`\`

## First Time Build

### Step 1: Install Dependencies
\`\`\`bash
npm install
\`\`\`

### Step 2: Build Next.js App
\`\`\`bash
npm run build
\`\`\`

### Step 3: Add Android Platform
\`\`\`bash
npx cap add android
\`\`\`

### Step 4: Sync to Android
\`\`\`bash
npx cap sync
\`\`\`

### Step 5: Open Android Studio
\`\`\`bash
npx cap open android
\`\`\`

This will open your project in Android Studio.

### Step 6: Generate Keystore (First Time Only)
1. In Android Studio, click: Build → Generate Signed Bundle / APK
2. Choose "Android App Bundle"
3. Click "Create new keystore"
4. Fill in details:
   - **Keystore path**: Choose a secure location (NOT in project folder)
   - **Password**: Create a strong password (SAVE THIS!)
   - **Alias**: dearsa-key
   - **Alias password**: Create another password (SAVE THIS!)
   - **Validity**: 25 years (minimum for Play Store)
   - **Certificate info**: Fill in your details

**IMPORTANT: Backup your keystore file and passwords somewhere safe!**

### Step 7: Build AAB File
1. In Android Studio: Build → Generate Signed Bundle / APK
2. Select your keystore file
3. Enter passwords
4. Choose "release" build variant
5. Click Finish

Your AAB file will be in: `android/app/release/app-release.aab`

## Updating the App

When you make changes in v0:

### Step 1: Download Updated Code
Download the latest code from v0

### Step 2: Rebuild
\`\`\`bash
npm run build
npx cap sync
npx cap open android
\`\`\`

## Troubleshooting

### "Gradle build failed"
- Make sure Android Studio is fully updated
- Try: File → Invalidate Caches / Restart

### "SDK not found"
- Check your ANDROID_HOME environment variable
- In Android Studio: Tools → SDK Manager → Install missing SDKs

### "Keystore not found"
- Make sure you're using the correct path to your keystore
- Verify the passwords are correct

## Quick Reference

**Build commands:**
- `npm run build` - Build Next.js app
- `npx cap sync` - Sync to Android
- `npx cap open android` - Open Android Studio
- `npm run build:android` - Do all of the above

**Important files:**
- `capacitor.config.json` - App configuration
- `android/app/build.gradle` - Android build settings
- Your keystore file - KEEP SAFE!

## Support
If you get stuck, share the error message and I'll help you troubleshoot!
