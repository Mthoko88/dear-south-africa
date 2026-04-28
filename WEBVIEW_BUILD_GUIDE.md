# Simple WebView Build Guide for Dear South Africa

This approach loads your live website in a native Android wrapper - no build errors!

## Prerequisites (One-Time Setup)

### Install Android Studio
1. Download from: https://developer.android.com/studio
2. Install with default options
3. Let it download Android SDK (takes 30-45 minutes)

## Build Steps

### Step 1: Install Capacitor
In your terminal (in the Dear SA folder):

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
```

### Step 2: Add Android Platform
```bash
npx cap add android
```

This creates the `android` folder with your Android project.

### Step 3: Open in Android Studio
```bash
npx cap open android
```

Android Studio opens automatically with your project.

### Step 4: Wait for Gradle Sync
- Android Studio will sync Gradle files (2-5 minutes)
- Wait until you see "Sync successful" at the bottom

### Step 5: Generate Signed AAB

1. Click: **Build** → **Generate Signed Bundle / APK**
2. Choose: **Android App Bundle**
3. Click: **Create new...** (first time only)

**Keystore Details:**
- Keystore path: Save as `dear-sa-keystore.jks` somewhere safe
- Password: Create strong password (WRITE IT DOWN!)
- Alias: `dearsa-key`
- Alias password: Same as above
- Validity: 25 years
- Fill in your business details (from your PDF)

4. Click **Next**
5. Select: **release**
6. Check: V1 and V2 signature versions
7. Click: **Finish**

### Step 6: Find Your AAB File

After building (2-3 minutes):
- Click the "locate" link that appears
- Or go to: `android/app/release/app-release.aab`

**This is your file for Google Play Store!**

## How Updates Work

When you update your app on Vercel:
1. Users automatically see updates when they open the app
2. No need to rebuild or reupload to Play Store
3. Only rebuild if you change app name, icon, or version number

## Troubleshooting

**"Gradle sync failed"**
- Wait for Android Studio to finish indexing (check bottom right)
- Try: File → Invalidate Caches / Restart

**"SDK not found"**
- In Android Studio: Tools → SDK Manager
- Install Android 13 (API 33) or higher

**Need help?** Share the error message!
