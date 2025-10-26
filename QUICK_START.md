# Quick Start - Milo

## 🚀 Get Running in 5 Minutes

### 1. Install & Configure (2 min)
```bash
npm install
npm install -g eas-cli
eas login
eas build:configure
```

### 2. Update Project ID
Copy the project ID from EAS output and paste into `app.json`:
```json
"extra": {
  "eas": {
    "projectId": "YOUR-PROJECT-ID-HERE"
  }
}
```

### 3. Build for iPhone (1 min to start, 15 min to complete)
```bash
eas build --platform ios --profile development
```

### 4. Install on Phones
Download from EAS dashboard → Install via TestFlight

### 5. Sign Up on Each Phone
- Mom: Sign up as "Mom"
- You: Sign up as "Family"  
- Sister: Sign up as "Family"

PIN = Last 4 digits of phone number

## ✅ Done!

Mom will get notifications at 9 AM daily. She taps "I'm OK" and you're notified instantly.

## 💰 Cost: $0/month

Just your existing $99/year Apple Developer account!

## 📱 Daily Use

**Mom**: Tap notification at 9 AM → "I'm OK" → Done!

**You**: Get notified when she checks in. Open app to see status anytime.

## 🆘 Need Help?

Read `SETUP_GUIDE.md` for detailed instructions.

---

Built with ❤️ for keeping families connected

