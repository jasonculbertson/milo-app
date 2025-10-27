# Milo - Your Friendly AI Assistant

**"Technology that feels like care."**

Milo is a voice-first mobile AI assistant designed for older adults. It combines daily check-ins with powerful AI features: voice conversations, document explanation, smart reminders, and fall detection—all wrapped in a warm, accessible interface.

## 🎯 Core Features

### 💙 Voice Assistant (Milo)
- **Tap-to-talk interface**: Just tap and ask anything
- **Conversational AI**: Friendly responses in simple language
- **Voice output**: Speaks answers back to you
- **Quick actions**: Common questions ready to go

### 📄 Document Explanation
- **Take a photo** of bills, letters, prescriptions
- **AI-powered summaries** in plain English
- **Voice readback**: Listen to explanations
- **Confidence indicators**: Know when to double-check

### ⏰ Smart Reminders
- **Natural language**: "Remind me to take pills at 8 PM"
- **Intelligent parsing**: Understands times and dates
- **Push notifications**: Never miss important tasks
- **Easy management**: Complete or delete with one tap

### 🤕 Fall Detection
- **Passive monitoring**: Uses phone's motion sensors
- **Automatic alerts**: Notifies family if fall detected
- **User confirmation**: "I'm OK" cancels alerts
- **Privacy-first**: No always-on recording

### 🏠 Daily Check-ins
- **One-tap check-ins**: Let family know you're okay
- **Streak tracking**: See your consistency
- **Family dashboard**: Real-time status for loved ones
- **Check-in history**: View past week at a glance

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

### For Seniors:
1. **Morning check-in**: Tap "I'm OK" - takes 2 seconds
2. **Ask Milo anything**: Voice assistant is always ready
3. **Explain documents**: Snap a photo, get instant explanation
4. **Set reminders**: Just tell Milo when you need to remember something
5. **Stay safe**: Automatic fall detection with family alerts

### For Family Members:
1. **Peace of mind**: See check-ins on your dashboard
2. **Safety alerts**: Get notified if fall detected or check-in missed
3. **Activity view**: See recent reminders and interactions
4. **Easy connection**: Quick call button to reach your loved one

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

## 📚 Documentation

### Getting Started
- **[NEXT_STEPS.md](NEXT_STEPS.md)** - Quick start guide (deploy in 5 minutes)
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Detailed setup instructions
- **[EAS_SETUP.md](EAS_SETUP.md)** - Building and deployment guide

### Planning & Vision
- **[PRD.md](PRD.md)** - Complete Product Requirements Document
- **[SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md)** - Technical architecture with diagrams
- **[MIGRATION_PLAN.md](MIGRATION_PLAN.md)** - Roadmap from MVP to full product
- **[DECISION_NEEDED.md](DECISION_NEEDED.md)** - Ship MVP now vs. build full PRD

### Reference
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Current MVP architecture details
- **[GITHUB_SETUP.md](GITHUB_SETUP.md)** - Repository and version control guide
- **[QUICK_START.md](QUICK_START.md)** - Fast reference card

## 📂 Project Structure

```
milo-app/
├── App.tsx                                    # Main app with navigation
├── app.json                                   # Expo configuration
├── src/
│   ├── screens/
│   │   ├── VoiceAssistantScreen.tsx          # 💙 Voice AI interface
│   │   ├── ExplainDocumentScreen.tsx         # 📄 OCR/document explain
│   │   ├── RemindersScreen.tsx               # ⏰ Smart reminders
│   │   ├── SeniorHomeScreen.tsx              # 🏠 Daily check-ins
│   │   ├── FamilyDashboardScreen.tsx         # 👨‍👩‍👧‍👦 Family view
│   │   ├── SettingsScreen.tsx                # ⚙️ App settings
│   │   └── OnboardingScreen.tsx              # First-time setup
│   │
│   ├── services/
│   │   ├── aiService.ts                      # AI/GPT integration
│   │   ├── voiceService.ts                   # Voice recording + TTS
│   │   ├── fallDetectionService.ts           # Motion-based fall detection
│   │   ├── permissionsService.ts             # Unified permissions
│   │   └── notificationService.ts            # Push notifications
│   │
│   ├── components/
│   │   ├── Button.tsx                        # Reusable buttons
│   │   ├── Card.tsx                          # Card components
│   │   ├── Input.tsx                         # Form inputs
│   │   └── Toast.tsx                         # Toast notifications
│   │
│   ├── config/
│   │   └── storage.ts                        # AsyncStorage helpers
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx                   # User authentication
│   │
│   ├── theme/
│   │   └── index.ts                          # Design system
│   │
│   └── types/
│       └── index.ts                          # TypeScript types
│
└── Documentation/
    ├── README.md                              # You are here
    ├── IMPLEMENTATION_COMPLETE.md             # 🎉 What was built
    ├── DEVELOPMENT_GUIDE.md                   # 🛠️ Dev workflow
    ├── PRD.md                                 # Product requirements
    ├── TECHNICAL_SPEC.md                      # API contracts
    └── SETUP_GUIDE.md                         # Build instructions
```

## 🔧 Tech Stack

### Frontend
- **React Native** with **Expo SDK 51**
- **TypeScript** for type safety
- **React Navigation** for routing
- **Expo AV** for audio recording/playback
- **Expo Speech** for text-to-speech
- **Expo Sensors** for motion detection
- **Expo Image Picker** for camera/photos

### AI & Services (To Integrate)
- **OpenAI GPT-4o** for conversational AI
- **OpenAI Whisper** for speech-to-text
- **Google Vision API** for OCR
- **Supabase** for backend (optional)

### Storage & Notifications
- **AsyncStorage** for local data
- **Expo Notifications** for reminders
- **Apple Push Notification Service** for family alerts

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

## 🚀 Current Status

✅ **MVP Complete** - All core features implemented:
- Voice assistant with tap-to-talk
- Document explanation with OCR
- Smart reminders with NLP
- Fall detection with motion sensors
- Daily check-ins and family dashboard
- Permissions management
- Beautiful, accessible UI

🔧 **Production Integration Needed**:
- Connect to OpenAI GPT-4 API
- Integrate Whisper for speech-to-text
- Add Google Vision for real OCR
- Set up Supabase backend (optional)
- Configure production notifications

📖 **See [IMPLEMENTATION_COMPLETE.md](IMPLEMENTATION_COMPLETE.md) for details**

## 📈 Roadmap

### Phase 2 (Q1 2026)
- [ ] Production API integrations
- [ ] Backend setup with Supabase
- [ ] Multi-device sync
- [ ] SMS fallback for alerts
- [ ] Android support

### Phase 3 (Q2 2026)
- [ ] App Store launch
- [ ] Subscription plans
- [ ] Family web dashboard
- [ ] Advanced analytics
- [ ] Spanish language support

### Phase 4 (Q3 2026)
- [ ] Medication tracking
- [ ] Calendar integration
- [ ] Health data sync
- [ ] Video calls
- [ ] B2B partnerships

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
