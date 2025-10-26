# Quick Setup Guide for Milo

## 🎯 What You Need

- Apple Developer Account ($99/year) ✅ You have this!
- Mac computer with Xcode
- Physical iPhones (notifications don't work in simulator)
- 15-20 minutes

## 📝 Setup Steps

### Step 1: Install Dependencies (2 minutes)

```bash
cd /Users/jasonculbertson/Documents/GitHub/checkin
npm install
```

### Step 2: Set Up EAS Build (5 minutes)

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo (create free account if needed)
eas login

# Configure the project
eas build:configure
```

This will:
- Create an `eas.json` file
- Give you a project ID
- Set up build profiles

**Important**: Copy the project ID and update it in `app.json`:
```json
"extra": {
  "eas": {
    "projectId": "paste-your-project-id-here"
  }
}
```

### Step 3: Configure Apple Developer Account (5 minutes)

1. Go to https://developer.apple.com
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click **Identifiers** → **+** button
4. Select **App IDs** → **App**
5. Configure:
   - Description: "Milo"
   - Bundle ID: `com.milo.app` (explicit)
   - Capabilities: Enable **Push Notifications**
6. Click **Continue** → **Register**

### Step 4: Build the App (5-10 minutes)

For development/testing:
```bash
eas build --platform ios --profile development
```

For App Store (when ready):
```bash
eas build --platform ios --profile production
```

The build will:
- Take 10-20 minutes
- Run on Expo's servers
- Generate an `.ipa` file
- Provide a download link

### Step 5: Install on Devices (3 minutes)

**Option A: Development Build (Easiest for Testing)**
1. Download the build from EAS dashboard
2. Install via Xcode or TestFlight
3. On your iPhone: Trust the developer certificate in Settings

**Option B: TestFlight (Best for Family)**
```bash
eas submit --platform ios
```
Then invite family via TestFlight app

**Option C: App Store (For Public Release)**
```bash
eas submit --platform ios
```
Then go through App Store review

## 👥 Setting Up Accounts

### On Mom's iPhone:

1. Open the app
2. Tap **"Don't have an account? Sign Up"**
3. Fill in:
   - Name: "Mom" (or her name)
   - Phone: Her phone number (e.g., "555-123-4567")
   - Tap **"I'm Mom"**
   - PIN: Last 4 digits of phone (e.g., "4567")
4. Tap **"Sign Up"**
5. Grant notification permissions when asked

### On Your iPhone:

1. Open the app
2. Tap **"Don't have an account? Sign Up"**
3. Fill in:
   - Your name
   - Your phone number
   - Tap **"I'm Family"**
   - PIN: Last 4 digits of your phone
4. Tap **"Sign Up"**
5. Grant notification permissions

### On Sister's iPhone:

Same as above - sign up as "Family"

## ✅ Verification

### Test That It Works:

1. **On Mom's phone**:
   - Open the app
   - Tap the big green "I'm OK ✅" button
   - Should see "Success!" message

2. **On Your Phone**:
   - Open the app
   - Pull down to refresh
   - Should see mom's check-in with green ✅
   - Should also get a push notification

3. **Test Notification**:
   - Background the app on mom's phone
   - Wait for 9 AM tomorrow OR
   - Change the time in code to test immediately

## 🔧 Customizing Notification Time

To change when the notification appears, edit:

`src/contexts/AuthContext.tsx` line ~75:
```typescript
notification_time: '09:00:00',  // Change to '08:00:00' for 8 AM
```

Then rebuild the app.

## 📱 Daily Workflow

### Mom's Daily Routine:
1. 🌅 9 AM: Notification appears
2. 📱 Swipe down on notification
3. ✅ Tap "I'm OK" button
4. ✨ Done! (Never opens app)

### Your Daily Routine:
1. 📲 Get notification when mom checks in
2. 👀 Open app to see status (optional)
3. ☎️ Call button if needed

## 🐛 Troubleshooting

### "Must use physical device for Push Notifications"
- This is normal - notifications only work on real iPhones
- Use TestFlight or development build on device

### "Failed to get push token"
- Check notification permissions in Settings > Mom Check-In
- Make sure you're logged in to EAS
- Verify project ID is correct in app.json

### Family members not showing up
- Everyone needs to sign up in the app first
- Data is stored locally on each device
- Pull to refresh to check for updates

### Build fails
- Make sure you're logged into EAS: `eas login`
- Check that Bundle ID matches in app.json and Apple Developer Portal
- Verify Apple Developer account is active

## 💡 Tips

1. **Test on your phone first** before giving to mom
2. **Set notification to test time** (like 5 minutes from now) to verify it works
3. **Keep the app simple** - less is more for seniors
4. **Add mom's number to favorites** for quick calling
5. **Show mom how to use it** - practice a few times together

## 🚀 Next Steps

After basic setup works:

1. **Customize the app**:
   - Change colors in the screen files
   - Adjust button sizes if needed
   - Add mom's photo (optional)

2. **Add automation** (optional):
   - Set up iOS Shortcuts
   - Automatic missed check-in alerts

3. **Extend functionality**:
   - iCloud sync for backup
   - SMS fallback option
   - Location sharing

## 📞 Common Questions

**Q: How much will this cost to run?**  
A: $0/month. Just the $99/year Apple Developer account.

**Q: What if mom gets a new iPhone?**  
A: Just download the app and sign in with her phone/PIN.

**Q: Can we add more family members?**  
A: Yes! Anyone can sign up as "Family" and see check-ins.

**Q: Does this use mom's cellular data?**  
A: Minimal - just tiny notification messages.

**Q: What if she forgets to check in?**  
A: You can call her! The app shows a call button.

**Q: Can we use this for Android too?**  
A: The app works on Android, but interactive notifications are better on iOS.

## ✨ You're Done!

The app is now set up and ready to use. Everyone in the family can:
- Download the app
- Sign up
- Start checking in daily

Simple, reliable, and no monthly fees! 🎉
