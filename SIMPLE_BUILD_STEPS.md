# SIMPLE BUILD STEPS - Dear South Africa Mobile App

## What This Does
Creates a mobile app that loads your live website. No complicated builds, no API route errors.

## Prerequisites (One-Time Setup - 30 minutes)
1. **Android Studio** - Download from https://developer.android.com/studio
2. **Install Android Studio** - Accept all defaults, let it download Android SDK

## STEP 1: Deploy Your Website First (5 minutes)

Before building the mobile app, deploy your Dear SA website:

1. Go to https://vercel.com
2. Sign in with GitHub
3. Import your Dear SA repository
4. Deploy it
5. Copy your live URL (example: `https://dear-sa.vercel.app`)

## STEP 2: Update Configuration (2 minutes)

1. Open the file `capacitor.config.json`
2. Find this line:
   \`\`\`
   "url": "https://your-deployed-site.vercel.app"
   \`\`\`
3. Replace it with YOUR actual Vercel URL
4. Save the file

## STEP 3: Initialize Capacitor (3 minutes)

In terminal (in your dear-sa folder):

\`\`\`bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init
\`\`\`

When prompted:
- App name: `Dear South Africa`
- App ID: `com.zebradigitalmedia.dearsa`
- Web directory: `public`

## STEP 4: Add Android Platform (2 minutes)

\`\`\`bash
npx cap add android
\`\`\`

## STEP 5: Open in Android Studio (1 minute)

\`\`\`bash
npx cap open android
\`\`\`

Android Studio will open. Wait for Gradle sync to finish (bottom right corner shows progress).

## STEP 6: Build Signed AAB (20 minutes)

1. In Android Studio: **Build** menu → **Generate Signed Bundle / APK**
2. Choose **Android App Bundle**
3. Click **Create new...** keystore
4. Fill in details:
   - Keystore path: Save as `dear-sa-keystore.jks` somewhere safe
   - Password: Create strong password (WRITE IT DOWN!)
   - Alias: `dear-sa-key`
   - Validity: 25 years
   - Your details: Matsimela Mphahlela, Zebra Digital Media, Johannesburg, Gauteng, ZA
5. Click **OK** → **Next**
6. Select **release**
7. Check V1 and V2 signatures
8. Click **Finish**
9. Wait 2-3 minutes
10. Find file at: `android/app/release/app-release.aab`

## STEP 7: Upload to Play Store

1. Go to Google Play Console
2. Create new app
3. Upload `app-release.aab`
4. Fill in required info
5. Submit for review

## For Updates

When you make changes to your website:
- Just update on Vercel
- App automatically shows new version (no new APK needed!)
- Only rebuild AAB if you want to change app name, icon, or other native settings

## Troubleshooting

**"Gradle sync failed"**: Wait longer, it can take 5-10 minutes first time

**"SDK not found"**: In Android Studio, go to Tools → SDK Manager → Install latest Android SDK

**Can't find AAB file**: Look in `android/app/build/outputs/bundle/release/`

---

## Need Help?
This is the simplest approach. No build errors, no API route issues. Your app is just a wrapper for your website.
