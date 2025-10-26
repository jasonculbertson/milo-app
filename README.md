# Milo

A simple daily check-in app for elderly parents to let their family know they're doing OK with just one tap on an iPhone notification.

## 🎯 Features

- **Interactive Push Notifications**: Mom can tap "I'm OK" directly from the morning notification without opening the app
- **Daily Reminders**: Automated notification at 9 AM every day
- **Family Dashboard**: You and your sister can see check-in status in real-time
- **Simple UI**: Large, easy-to-read buttons designed for seniors
- **Check-in History**: View recent check-ins
- **Quick Call Button**: Easy way to call if someone hasn't checked in
- **No Backend Required**: All data stored locally with peer-to-peer notifications
- **Zero Monthly Costs**: Uses only Apple Push Notification Service (requires Apple Developer account)

## 💰 Cost

- **$0/month** - No backend servers or database costs
- **$99/year** - Apple Developer Account (required for push notifications)

## 🏗️ Architecture

This app uses a **peer-to-peer architecture** with no backend server:

- **Local Storage**: All data stored on device using AsyncStorage
- **Push Notifications**: Device-to-device via Apple Push Notification Service (APNs)
- **Data Sync**: Family members sync through shared check-in notifications
- **iCloud Ready**: Can be extended with iCloud sync for backup

## 📋 How It Works

### For Mom:
1. Receives a notification at 9 AM: "Good morning! Are you doing OK today?"
2. Taps "I'm OK ✅" button right on the notification
3. Done! Family members get notified instantly

### For Family Members:
1. Get notified when mom checks in
2. See her check-in status on the dashboard
3. Quick call button to reach her
4. Pull to refresh to see latest status

## 🚀 Setup Instructions

### Prerequisites

1. **Apple Developer Account** ($99/year)
   - Sign up at https://developer.apple.com
   - Needed for push notifications

2. **Node.js** installed on your computer
3. **Expo CLI** (will be installed automatically)
4. **Physical iPhone** (push notifications don't work in simulator)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Your Apple Developer Account

1. Go to https://developer.apple.com
2. Navigate to "Certificates, Identifiers & Profiles"
3. Create an App ID: `com.momcheckin.app`
4. Enable Push Notifications capability
5. Create a Push Notification certificate

### Step 3: Set Up EAS Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Login with your Expo account
eas login

# Configure the project
eas build:configure

# Update the projectId in app.json with your EAS project ID
```

### Step 4: Build the App

```bash
# Build for iOS
eas build --platform ios --profile development

# Or build for App Store
eas build --platform ios --profile production
```

### Step 5: Install on Devices

1. **Development Build** (for testing):
   - Download the build from EAS
   - Install on your devices via TestFlight or direct install

2. **Production** (for family use):
   - Submit to App Store: `eas submit --platform ios`
   - Family downloads from App Store

## 📱 First-Time Setup

### Creating Accounts:

1. **Mom's Account**:
   - Open the app
   - Tap "Don't have an account? Sign Up"
   - Enter her name and phone number
   - Select "I'm Mom"
   - Create a PIN (use last 4 digits of phone number)

2. **Family Members** (You & Sister):
   - Open the app on your phones
   - Tap "Don't have an account? Sign Up"
   - Enter your name and phone number
   - Select "I'm Family"
   - Create a PIN (use last 4 digits of phone number)

3. **Accounts Sync Automatically**:
   - All users who sign up will appear in each other's family lists
   - No manual linking required!

## 🧪 Testing

### Test Interactive Notifications:

1. Make sure you're on a physical iPhone
2. Grant notification permissions when prompted
3. The 9 AM notification will appear automatically
4. To test immediately, modify the notification time in the code

### Test Check-ins:

1. On mom's phone: Tap "I'm OK"
2. On family phones: Open app to see updated status
3. Try the "Pull to refresh" gesture

## 🎨 Customization

### Change Notification Time:

Edit `src/contexts/AuthContext.tsx`:
```typescript
notification_time: '08:00:00',  // Change to desired time
```

### Change App Name/Colors:

Edit `app.json` for app name and styling
Edit screen files for colors and layout

## 📂 Project Structure

```
checkin/
├── App.tsx                           # Main app component
├── app.json                          # Expo configuration
├── src/
│   ├── config/
│   │   └── storage.ts               # Local storage helpers
│   ├── contexts/
│   │   └── AuthContext.tsx          # User authentication
│   ├── screens/
│   │   ├── SignInScreen.tsx         # Login/signup
│   │   ├── CheckInScreen.tsx        # Mom's check-in screen
│   │   └── FamilyDashboard.tsx      # Family members' view
│   ├── services/
│   │   └── notificationService.ts   # Push notifications
│   └── types/
│       └── index.ts                 # TypeScript types
└── README.md
```

## 🔧 Tech Stack

- **Frontend**: React Native with Expo
- **Storage**: AsyncStorage (local device storage)
- **Push Notifications**: Expo Push Notifications + APNs
- **Authentication**: Simple PIN-based auth
- **No Backend**: Peer-to-peer architecture

## 🔐 Privacy & Security

- All data stored locally on devices
- No cloud database or server
- Push notifications go through Expo/Apple servers only
- Simple PIN authentication (4 digits)

## 🚨 Troubleshooting

### Notifications not working:
- Make sure you're on a physical device
- Check notification permissions in Settings
- Verify push token is registered

### Can't see family members:
- Make sure everyone has signed up in the app
- Check that phone numbers are entered correctly
- Try pulling to refresh on the family dashboard

### App crashes on startup:
- Clear app data and reinstall
- Check that all dependencies are installed: `npm install`
- Make sure you're using a compatible iOS version

## 📈 Future Enhancements

Possible additions:
- [ ] iCloud sync for data backup
- [ ] SMS backup if notification isn't responded to
- [ ] Location sharing for emergencies
- [ ] Custom message options ("At doctor", "Traveling")
- [ ] Weekly summary reports
- [ ] Multiple daily check-ins
- [ ] Medication reminders

## 🆘 Support

Common questions:

**Q: Does mom need to open the app every day?**  
A: No! She just taps the notification button.

**Q: What if she misses the notification?**  
A: She can open the app and tap the big button anytime.

**Q: Does this work on Android?**  
A: Yes, but interactive notifications work best on iOS.

**Q: How much data does this use?**  
A: Minimal - just small push notifications.

**Q: What if someone gets a new phone?**  
A: Just sign in again with the same phone number and PIN.

## 📄 License

MIT

---

Built with ❤️ for keeping families connected
