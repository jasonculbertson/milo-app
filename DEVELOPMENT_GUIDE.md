# 🛠️ Milo Development Guide

## Quick Start

### Prerequisites
- Node.js 18+ installed
- iOS device or simulator with iOS 16+
- Xcode (for iOS development)
- Expo account (free)

### Installation

1. **Install Dependencies**
```bash
npm install
```

2. **Start Development Server**
```bash
npm start
```

3. **Run on Device**
```bash
# iOS
npm run ios

# Or scan QR code with Expo Go app
```

---

## Development Workflow

### Project Structure

```
milo-app/
├── src/
│   ├── screens/          # Screen components
│   ├── services/         # Business logic & API calls
│   ├── components/       # Reusable UI components
│   ├── theme/           # Design system
│   ├── config/          # Storage & configuration
│   ├── contexts/        # React contexts (Auth, etc.)
│   └── types/           # TypeScript definitions
│
├── App.tsx              # Root component with navigation
├── app.json             # Expo configuration
├── eas.json             # Build configuration
└── package.json         # Dependencies
```

### Key Files to Know

#### 🎨 **Theme System**
`src/theme/index.ts` - Centralized colors, spacing, typography
- Follow Airbnb-inspired design patterns
- Use consistent spacing scale
- Semantic colors for states

#### 🔧 **Services Layer**

**`src/services/aiService.ts`**
- Mock AI responses (replace with real API)
- Natural language parsing
- Document explanation

**`src/services/voiceService.ts`**
- Audio recording with expo-av
- Speech-to-text (mock)
- Text-to-speech (iOS native)

**`src/services/fallDetectionService.ts`**
- Accelerometer monitoring
- Fall detection algorithm
- Family alerts

**`src/services/permissionsService.ts`**
- Centralized permission management
- User-friendly explanations

#### 📱 **Screens**

**Voice Assistant** - `src/screens/VoiceAssistantScreen.tsx`
- Main AI interaction interface
- Tap-to-talk with animations
- Chat history

**Explain Document** - `src/screens/ExplainDocumentScreen.tsx`
- Camera/photo library integration
- OCR processing
- Voice summaries

**Reminders** - `src/screens/RemindersScreen.tsx`
- Natural language reminder creation
- Local notifications
- Reminder management

---

## Testing Features

### Voice Assistant
```typescript
// Test the voice flow:
1. Go to "Milo" tab
2. Grant microphone permission
3. Tap the microphone button
4. Speak or wait for mock transcription
5. Verify AI response appears
6. Listen to TTS output
```

### Document Explanation
```typescript
// Test OCR flow:
1. Go to "Explain" tab
2. Grant camera/photos permission
3. Take photo or choose from library
4. Wait for "processing" animation
5. Verify summary appears
6. Test "Read Again" button
```

### Reminders
```typescript
// Test reminder creation:
1. Go to "Reminders" tab
2. Tap "+ Add Reminder"
3. Enter: "Take pills at 8 PM"
4. Verify notification scheduled
5. Check upcoming reminders list
```

### Fall Detection
```typescript
// Test fall detection:
1. Go to Settings > Safety Features
2. Enable "Fall detection"
3. Shake device vigorously
4. Verify alert notification appears
5. Tap "I'm OK" to cancel
```

---

## Mock Data & Endpoints

### Current Mock Implementations

#### AI Responses (`aiService.ts`)
```typescript
// Mock responses based on keywords
"weather" → "It's sunny and 72 degrees today"
"time" → Current time
"date" → Current date
"hello" → Friendly greeting
```

Replace with real GPT-4 API:
```typescript
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are Milo, a kind AI assistant...' },
      { role: 'user', content: request.text }
    ],
    max_tokens: 50,
  }),
});
```

#### Speech-to-Text (`voiceService.ts`)
```typescript
// Mock transcription
export async function transcribeAudio(audioUri: string): Promise<string> {
  // Currently returns test phrases
  // Replace with OpenAI Whisper or Google Speech-to-Text
}
```

Replace with Whisper API:
```typescript
const formData = new FormData();
formData.append('file', audioFile);
formData.append('model', 'whisper-1');

const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` },
  body: formData,
});
```

#### OCR (`aiService.ts`)
```typescript
// Mock document summaries
// Replace with Google Vision API or AWS Textract
```

---

## Environment Variables

Create `.env` file (not committed):
```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...

# ElevenLabs (optional, for premium TTS)
ELEVENLABS_API_KEY=...
```

Access in code:
```typescript
import Constants from 'expo-constants';

const apiKey = Constants.expoConfig?.extra?.openaiApiKey;
```

---

## Building for Production

### 1. EAS Build Setup
```bash
# Login to Expo
npx eas-cli login

# Configure build
npx eas-cli build:configure

# Update app.json with project ID
```

### 2. Build for iOS
```bash
# Development build (TestFlight)
npm run build:dev

# Production build (App Store)
npm run build:ios
```

### 3. Submit to App Store
```bash
npm run submit:ios
```

---

## Debugging Tips

### Common Issues

**Microphone not working:**
```typescript
// Check permission status
import { Audio } from 'expo-av';
const { status } = await Audio.getPermissionsAsync();
console.log('Mic permission:', status);
```

**Fall detection not triggering:**
```typescript
// Test with simulation
import { simulateFall } from './src/services/fallDetectionService';
await simulateFall();
```

**Notifications not appearing:**
```typescript
// Verify notification permissions
import * as Notifications from 'expo-notifications';
const { status } = await Notifications.getPermissionsAsync();
console.log('Notification permission:', status);

// Check scheduled notifications
const notifications = await Notifications.getAllScheduledNotificationsAsync();
console.log('Scheduled:', notifications);
```

### Development Tools

**React Native Debugger:**
```bash
npm install -g react-native-debugger
open "rndebugger://set-debugger-loc?host=localhost&port=8081"
```

**Expo DevTools:**
- Press `m` in terminal to open menu
- Press `j` to open Chrome DevTools
- Press `r` to reload

**Logs:**
```bash
# Filter by tag
npx react-native log-ios | grep "Milo"

# Watch specific service
console.log('[VoiceService]', ...);
```

---

## Code Style

### TypeScript
- Use interfaces for props
- Define return types for functions
- Avoid `any` types

```typescript
// ✅ Good
interface MessageProps {
  text: string;
  sender: 'user' | 'milo';
}

function MessageBubble({ text, sender }: MessageProps): JSX.Element {
  // ...
}

// ❌ Bad
function MessageBubble(props: any) {
  // ...
}
```

### React Components
- Use functional components with hooks
- Extract complex logic to custom hooks
- Keep components focused

```typescript
// ✅ Good
export function VoiceAssistantScreen() {
  const { messages, recording, handleMicPress } = useVoiceAssistant();
  
  return (
    <SafeAreaView>
      {/* UI */}
    </SafeAreaView>
  );
}

// Custom hook for logic
function useVoiceAssistant() {
  const [messages, setMessages] = useState([]);
  // ...
  return { messages, recording, handleMicPress };
}
```

### Styling
- Use theme constants
- Avoid inline styles
- Follow mobile-first patterns

```typescript
// ✅ Good
import { colors, spacing, typography } from '../theme';

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    backgroundColor: colors.white,
  },
  title: {
    ...typography.h1,
  },
});

// ❌ Bad
<View style={{ padding: 24, backgroundColor: '#FFFFFF' }}>
```

---

## Performance Optimization

### Audio Recording
```typescript
// Use high quality but not excessive
Audio.RecordingOptionsPresets.HIGH_QUALITY // ~192 kbps
// vs
Audio.RecordingOptionsPresets.LOW_QUALITY  // ~32 kbps
```

### Fall Detection
```typescript
// Sampling interval balance
Accelerometer.setUpdateInterval(100); // 10 Hz (good balance)
// Too fast: Battery drain
// Too slow: Miss events
```

### Images
```typescript
// Compress before upload
const result = await ImagePicker.launchCameraAsync({
  quality: 0.8, // 80% quality (good for OCR)
  allowsEditing: true,
});
```

---

## Accessibility

### VoiceOver Support
```typescript
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Tap to talk to Milo"
  accessibilityHint="Opens voice assistant"
>
```

### Dynamic Type
```typescript
// Use relative font sizes
import { Text } from 'react-native';
<Text allowFontScaling={true} maxFontSizeMultiplier={1.5}>
```

### High Contrast
```typescript
// Check if high contrast mode is enabled
import { AccessibilityInfo } from 'react-native';

const highContrast = await AccessibilityInfo.isHighTextContrastEnabled();
// Adjust colors accordingly
```

---

## Contributing

### Before Submitting PR
1. Run tests (when added)
2. Check for TypeScript errors: `npx tsc --noEmit`
3. Format code (if using Prettier)
4. Test on physical device
5. Update documentation

### Commit Messages
Follow conventional commits:
```
feat: Add voice assistant screen
fix: Resolve microphone permission issue
docs: Update setup guide
style: Format code with prettier
refactor: Extract voice service logic
test: Add reminder tests
```

---

## Production Deployment Checklist

Before going live:

- [ ] Replace all mock services with real APIs
- [ ] Add error tracking (Sentry)
- [ ] Add analytics (Mixpanel, Amplitude)
- [ ] Implement proper authentication
- [ ] Set up backend (Supabase)
- [ ] Configure push notifications (APNs)
- [ ] Add crash reporting
- [ ] Test on multiple iOS devices
- [ ] Conduct accessibility audit
- [ ] Update privacy policy
- [ ] Submit to App Store review

---

## Resources

- **Expo Docs**: https://docs.expo.dev
- **React Navigation**: https://reactnavigation.org
- **OpenAI API**: https://platform.openai.com/docs
- **Supabase**: https://supabase.com/docs
- **iOS HIG**: https://developer.apple.com/design/human-interface-guidelines

---

## Getting Help

- **Issues**: Check GitHub Issues
- **Docs**: See `DOCUMENTATION_INDEX.md`
- **PRD**: Read `PRD.md` for product vision
- **Technical**: Reference `TECHNICAL_SPEC.md`

---

**Happy coding!** 🚀

