# EAS Build Setup - Complete Instructions

## ✅ What's Already Done

I've installed and configured:
- ✅ EAS CLI installed locally (no global install needed)
- ✅ `eas.json` configuration file created
- ✅ Build profiles set up (development, preview, production)
- ✅ npm scripts added for easy building

## 🔐 Step 1: Login to Expo (1 minute)

You need to login to Expo to use EAS Build. Run:

```bash
npx eas-cli login
```

**Don't have an Expo account?**
- Create one for free at https://expo.dev
- Or run `npx eas-cli register` to create account from terminal

## 🆔 Step 2: Get Your Project ID (1 minute)

After logging in, run:

```bash
npx eas-cli init
```

This will:
1. Create a new project in your Expo account
2. Generate a unique Project ID
3. Show you the ID in the terminal

**Copy that Project ID!** It will look like: `12345678-1234-1234-1234-123456789abc`

## 📝 Step 3: Update app.json (30 seconds)

Open `app.json` and update the projectId:

```json
"extra": {
  "eas": {
    "projectId": "paste-your-project-id-here"
  }
}
```

Replace `"your-project-id-here"` with the actual ID from step 2.

## 🏗️ Step 4: Build the App! (2 minutes to start)

Now you can build! Choose one:

### Option A: Development Build (Recommended for Testing)
```bash
npm run build:dev
```

This creates a build you can install on your iPhone for testing.

### Option B: Production Build (For App Store)
```bash
npm run build:ios
```

This creates a production-ready build for the App Store.

## ⏱️ Build Time

- First build: 15-20 minutes (Expo sets up everything)
- Subsequent builds: 5-10 minutes
- Builds run on Expo's servers (not your computer)

## 📲 Step 5: Install on iPhone

After the build completes:

### Method 1: Direct Install (Development Build)
1. Build finishes → EAS gives you a URL
2. Open URL on your iPhone
3. Download and install
4. Go to Settings → General → VPN & Device Management
5. Trust the developer certificate

### Method 2: TestFlight (Easiest for Family)
```bash
npm run submit:ios
```

Then invite family via TestFlight app.

### Method 3: App Store (Public Release)
```bash
npm run submit:ios
```

Then submit for App Store review.

## 🎯 Quick Commands Reference

```bash
# Login to Expo
npx eas-cli login

# Initialize project
npx eas-cli init

# Build for development/testing
npm run build:dev

# Build for production/App Store
npm run build:ios

# Submit to App Store
npm run submit:ios

# Check build status
npx eas-cli build:list

# View project info
npx eas-cli project:info
```

## 🔍 Checking Build Status

While your build is running:

```bash
npx eas-cli build:list
```

Or visit: https://expo.dev/accounts/YOUR_USERNAME/projects/milo/builds

## 🐛 Troubleshooting

### "Invalid UUID appId"
- You need to run `npx eas-cli init` first
- Then update the projectId in `app.json`

### "No credentials found"
- EAS will automatically prompt you to create iOS credentials
- Follow the prompts to create certificates and profiles
- This happens automatically during first build

### "Build failed"
- Check the build logs on Expo dashboard
- Verify Bundle ID matches: `com.momcheckin.app`
- Make sure you're logged in: `npx eas-cli whoami`

### Build takes forever
- First build is always slower (setting up environment)
- Subsequent builds are faster
- You can close terminal - build runs on Expo's servers

## 📱 Apple Developer Portal Setup

You'll need to configure your Apple Developer account:

1. Go to https://developer.apple.com
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click **Identifiers** → **+**
4. Select **App IDs** → **App**
5. Set:
   - Description: "Milo"
   - Bundle ID: `com.milo.app` (must match app.json)
   - Capabilities: Enable **Push Notifications**
6. Save

EAS will handle the rest (certificates, provisioning profiles, etc.)!

## ✨ Next Steps After Build

Once your build completes:

1. **Install on your iPhone** (test it!)
2. **Test notifications** (grant permissions)
3. **Create accounts** (you, mom, sister)
4. **Test check-in flow** (tap "I'm OK")
5. **Verify family notifications** work
6. **Install on mom's phone**
7. **Show her how to use it**

## 💡 Pro Tips

1. **Use development build first** - faster to test
2. **TestFlight is great** for family beta testing
3. **Keep Bundle ID consistent** - don't change it
4. **Save your credentials** - EAS handles this automatically
5. **Check build status** on Expo dashboard

## 🎉 You're Ready!

Everything is set up. Just run:

```bash
npx eas-cli login
npx eas-cli init
# Copy the project ID and update app.json
npm run build:dev
```

That's it! The build will run and you'll get a download link when it's done.

---

**Need help?** Check the full guide in `SETUP_GUIDE.md` or visit https://docs.expo.dev/build/introduction/

