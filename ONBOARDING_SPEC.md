# 🚀 Milo Onboarding Flow — Dual Path (Senior & Family)

> "Milo starts with a hello — not a setup screen."

**Goal:** Create confidence and connection for two user types — seniors (the primary users) and family members (the caregivers) — with a branching experience that feels personal, not transactional.

---

## 1. Design Goals

| Goal | Description |
|------|-------------|
| **Clarity** | Determine user type immediately, no confusion. |
| **Trust** | Use voice, visuals, and tone that feel safe and human. |
| **Simplicity** | Complete setup in under 3 minutes per role. |
| **Accessibility** | Fully voice-guided, large tap targets, readable type. |
| **Connection** | End onboarding with a sense of emotional link, not setup fatigue. |

---

## 2. Flow Overview

```
Start
 └── Step 1: Who Are You? (Role Selection)
      ├── Senior Path → Full setup (voice, reminders, family link)
      └── Family Path → Simple link + alert customization
```

| Role | # of Steps | Core Purpose |
|------|-----------|--------------|
| 👵 **Senior** | 7 | Build comfort, enable voice, reminders, and family connection. |
| 👨‍👩‍👧 **Family Member** | 6 | Connect to loved one, customize alerts, verify notifications. |

---

## 3. Universal Step 1: Who Are You?

### Objective
Let the user self-identify to tailor the onboarding flow.

### Design
Two large, illustrated cards fill the screen.

| Option | Visual | Copy | Voice |
|--------|--------|------|-------|
| **I'm the person using Milo** | Older adult smiling with phone | "I'll help you stay on top of your day." | "Are you the person using Milo every day?" |
| **I'm a family member** | Younger adult holding phone with heart icon | "I'll help you stay connected to your loved one." | "Or are you someone helping a loved one?" |

**Action:** Tap one card → sets `role` in Supabase (`'senior'` or `'family'`).

### React Native Implementation

```typescript
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Speech from 'expo-speech';

function RoleSelectionScreen({ navigation }) {
  const speakPrompt = () => {
    Speech.speak("Are you the person using Milo every day? Or are you someone helping a loved one?");
  };

  const selectRole = async (role: 'senior' | 'family') => {
    // Save role to Supabase
    await supabase.from('users').update({ role }).eq('id', userId);
    
    // Navigate to appropriate flow
    if (role === 'senior') {
      navigation.navigate('SeniorOnboarding');
    } else {
      navigation.navigate('FamilyOnboarding');
    }
  };

  useEffect(() => {
    speakPrompt();
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.card}
        onPress={() => selectRole('senior')}
      >
        <Text style={styles.emoji}>👵</Text>
        <Text style={styles.title}>I'm the person using Milo</Text>
        <Text style={styles.subtitle}>I'll help you stay on top of your day.</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.card}
        onPress={() => selectRole('family')}
      >
        <Text style={styles.emoji}>👨‍👩‍👧</Text>
        <Text style={styles.title}>I'm a family member</Text>
        <Text style={styles.subtitle}>I'll help you stay connected to your loved one.</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    gap: 20,
  },
  card: {
    backgroundColor: 'white',
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
});
```

---

## 4. 🧓 Senior Onboarding Path

### Step 2: Welcome to Milo

**Visual:** Milo logo gently pulses.

**Voice:** "Hi! I'm Milo — your friendly helper for daily reminders and peace of mind."

**Action:** Tap "Let's Begin."

**Microcopy:** "You can talk to me anytime. No typing needed."

```typescript
function WelcomeScreen({ navigation }) {
  useEffect(() => {
    Speech.speak("Hi! I'm Milo — your friendly helper for daily reminders and peace of mind.");
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Image 
        source={require('./logo.png')}
        style={[styles.logo, { transform: [{ scale: pulseAnim }] }]}
      />
      <Text style={styles.greeting}>Welcome to Milo</Text>
      <Text style={styles.subtitle}>You can talk to me anytime. No typing needed.</Text>
      
      <TouchableOpacity 
        style={styles.primaryButton}
        onPress={() => navigation.navigate('Permissions')}
      >
        <Text style={styles.buttonText}>Let's Begin</Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

### Step 3: Permissions Setup

**Visual:** Three illustrated icons: Microphone 🎙️, Notifications 🔔.

**Voice:** "I'll need permission to listen when you talk and send reminders."

**Action:** One large button → sequential system prompts.

**Tip:** "You can always change these in Settings later."

```typescript
import * as Notifications from 'expo-notifications';
import Voice from '@react-native-voice/voice';

function PermissionsScreen({ navigation }) {
  const [granted, setGranted] = useState({
    microphone: false,
    notifications: false,
  });

  useEffect(() => {
    Speech.speak("I'll need permission to listen when you talk and send reminders.");
  }, []);

  const requestPermissions = async () => {
    // Request microphone (for voice recognition)
    const micPermission = await Voice.isAvailable();
    
    // Request notifications
    const { status } = await Notifications.requestPermissionsAsync();
    
    setGranted({
      microphone: micPermission,
      notifications: status === 'granted',
    });

    if (status === 'granted') {
      navigation.navigate('VoiceDemo');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.permissionIcons}>
        <View style={styles.iconBox}>
          <Text style={styles.icon}>🎙️</Text>
          <Text style={styles.iconLabel}>Microphone</Text>
        </View>
        <View style={styles.iconBox}>
          <Text style={styles.icon}>🔔</Text>
          <Text style={styles.iconLabel}>Notifications</Text>
        </View>
      </View>

      <Text style={styles.explanation}>
        These permissions help me understand you and remind you at the right times.
      </Text>

      <TouchableOpacity 
        style={styles.primaryButton}
        onPress={requestPermissions}
      >
        <Text style={styles.buttonText}>Grant Permissions</Text>
      </TouchableOpacity>

      <Text style={styles.footnote}>
        You can always change these in Settings later.
      </Text>
    </View>
  );
}
```

---

### Step 4: Meet Milo (Voice Demo)

**Visual:** Large blue mic button pulses softly.

**Voice:** "Try saying: 'Remind me to take my pills at 8 PM.'"

**Response:** "Got it! I'll remind you at 8 PM."

**Goal:** Build instant success + confidence.

```typescript
import Voice from '@react-native-voice/voice';

function VoiceDemoScreen({ navigation }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');

  useEffect(() => {
    Speech.speak("Try saying: Remind me to take my pills at 8 PM.");

    Voice.onSpeechResults = (e) => {
      const text = e.value[0];
      setTranscript(text);
      handleVoiceCommand(text);
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startListening = async () => {
    try {
      await Voice.start('en-US');
      setIsListening(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleVoiceCommand = async (text: string) => {
    setIsListening(false);
    
    // Demo response for first-time setup
    const demoResponse = "Got it! I'll remind you at 8 PM.";
    setResponse(demoResponse);
    Speech.speak(demoResponse);

    // Continue to next step after demo
    setTimeout(() => {
      navigation.navigate('RemindersSetup');
    }, 3000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meet Milo</Text>
      <Text style={styles.subtitle}>Tap the microphone and try it out</Text>

      <TouchableOpacity 
        style={[styles.micButton, isListening && styles.micButtonActive]}
        onPress={startListening}
      >
        <Text style={styles.micIcon}>🎤</Text>
      </TouchableOpacity>

      {transcript && (
        <View style={styles.transcriptBox}>
          <Text style={styles.transcriptLabel}>You said:</Text>
          <Text style={styles.transcript}>{transcript}</Text>
        </View>
      )}

      {response && (
        <View style={styles.responseBox}>
          <Text style={styles.responseLabel}>Milo says:</Text>
          <Text style={styles.response}>{response}</Text>
        </View>
      )}
    </View>
  );
}
```

---

### Step 5: Reminders Setup

**Voice:** "You can tell me what to remember — like calls, appointments, or taking medicine."

**Visual:** Example cards:
- "Call doctor Monday"
- "Water plants at 9"
- "Take walk after lunch"

**Action:** Add first reminder (or skip).

```typescript
function RemindersSetupScreen({ navigation }) {
  const [showExamples, setShowExamples] = useState(true);

  const exampleReminders = [
    { icon: '📞', text: 'Call doctor Monday' },
    { icon: '🌱', text: 'Water plants at 9' },
    { icon: '🚶', text: 'Take walk after lunch' },
  ];

  useEffect(() => {
    Speech.speak("You can tell me what to remember — like calls, appointments, or taking medicine.");
  }, []);

  const addReminder = () => {
    navigation.navigate('VoiceInput', { 
      context: 'reminder',
      onSuccess: () => navigation.navigate('FamilyLink')
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reminders</Text>
      <Text style={styles.subtitle}>I can help you remember important things</Text>

      <View style={styles.exampleCards}>
        {exampleReminders.map((reminder, index) => (
          <View key={index} style={styles.exampleCard}>
            <Text style={styles.cardIcon}>{reminder.icon}</Text>
            <Text style={styles.cardText}>{reminder.text}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity 
        style={styles.primaryButton}
        onPress={addReminder}
      >
        <Text style={styles.buttonText}>Add My First Reminder</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.textButton}
        onPress={() => navigation.navigate('FamilyLink')}
      >
        <Text style={styles.textButtonLabel}>Skip for Now</Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

### Step 6: Add Family Contact

**Voice:** "Who should I reach if you need help?"

**Visual:** Two fields — Name + Phone/Email.

**Action:** Input contact or share link via SMS.

**Backend:** Creates `family_link` record in Supabase.

**Response:** "Got it. I'll let Laura know she's connected."

```typescript
import * as SMS from 'expo-sms';

function FamilyLinkScreen({ navigation }) {
  const [familyName, setFamilyName] = useState('');
  const [familyPhone, setFamilyPhone] = useState('');
  const [familyEmail, setFamilyEmail] = useState('');

  useEffect(() => {
    Speech.speak("Who should I reach if you need help?");
  }, []);

  const sendInvite = async () => {
    // Create invite code
    const inviteCode = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Save to database
    await supabase.from('invites').insert({
      code: inviteCode,
      senior_id: userId,
      family_name: familyName,
      family_contact: familyPhone || familyEmail,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    // Send SMS invite
    const isAvailable = await SMS.isAvailableAsync();
    if (isAvailable && familyPhone) {
      await SMS.sendSMSAsync(
        [familyPhone],
        `Hi ${familyName}! Your loved one invited you to connect on Milo. Download the app and enter code: ${inviteCode}\n\nhttps://milo.app/invite/${inviteCode}`
      );
    }

    Speech.speak(`Got it! I'll let ${familyName} know they're connected.`);
    
    setTimeout(() => {
      navigation.navigate('Completion');
    }, 3000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Family Contact</Text>
      <Text style={styles.subtitle}>Who should I reach if you need help?</Text>

      <TextInput
        style={styles.input}
        placeholder="Their name (e.g., Laura)"
        value={familyName}
        onChangeText={setFamilyName}
        autoCapitalize="words"
      />

      <TextInput
        style={styles.input}
        placeholder="Phone number"
        value={familyPhone}
        onChangeText={setFamilyPhone}
        keyboardType="phone-pad"
      />

      <TextInput
        style={styles.input}
        placeholder="Email (optional)"
        value={familyEmail}
        onChangeText={setFamilyEmail}
        keyboardType="email-address"
      />

      <TouchableOpacity 
        style={styles.primaryButton}
        onPress={sendInvite}
        disabled={!familyName || !familyPhone}
      >
        <Text style={styles.buttonText}>Send Invite</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.textButton}
        onPress={() => navigation.navigate('Completion')}
      >
        <Text style={styles.textButtonLabel}>Skip for Now</Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

### Step 7: Completion

**Visual:** Soft confetti fade + checkmark animation.

**Voice:** "All set! You can talk to me anytime or just say, 'Hey Milo.'"

**Action:** "Start Using Milo."

**Footer:** "Learn how Milo works" (optional tutorial).

```typescript
import LottieView from 'lottie-react-native';

function CompletionScreen({ navigation }) {
  useEffect(() => {
    Speech.speak("All set! You can talk to me anytime or just say, Hey Milo.");
  }, []);

  const startUsing = async () => {
    // Mark onboarding complete
    await supabase.from('users').update({ 
      onboarding_completed: true 
    }).eq('id', userId);

    // Navigate to main app
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  return (
    <View style={styles.container}>
      <LottieView
        source={require('./animations/confetti.json')}
        autoPlay
        loop={false}
        style={styles.confetti}
      />

      <View style={styles.checkmark}>
        <Text style={styles.checkmarkIcon}>✓</Text>
      </View>

      <Text style={styles.title}>All Set!</Text>
      <Text style={styles.subtitle}>
        You can talk to me anytime{'\n'}or just say, "Hey Milo"
      </Text>

      <TouchableOpacity 
        style={styles.primaryButton}
        onPress={startUsing}
      >
        <Text style={styles.buttonText}>Start Using Milo</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.textButton}
        onPress={() => navigation.navigate('Tutorial')}
      >
        <Text style={styles.textButtonLabel}>Learn how Milo works</Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

## 5. 👨‍👩‍👧 Family Member Onboarding Path

### Step 2: Welcome to Milo Family

**Voice:** "Hi! Milo helps you stay in the loop and gives peace of mind."

**Visual:** Two characters connected by a heart line.

**Action:** "Continue."

```typescript
function FamilyWelcomeScreen({ navigation }) {
  useEffect(() => {
    Speech.speak("Hi! Milo helps you stay in the loop and gives peace of mind.");
  }, []);

  return (
    <View style={styles.container}>
      <Image 
        source={require('./images/family-connected.png')}
        style={styles.illustration}
      />

      <Text style={styles.title}>Welcome to Milo Family</Text>
      <Text style={styles.subtitle}>
        Stay connected and informed about your loved one
      </Text>

      <TouchableOpacity 
        style={styles.primaryButton}
        onPress={() => navigation.navigate('LinkWithLoved One')}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

### Step 3: Link with Your Loved One

**Voice:** "Let's connect you. Enter the 4-digit code from their screen or tap the link they texted you."

**Visual:** Simple 4-digit entry field.

**Backend:** Creates `family_link` between both users.

**Success Message:** "You're now connected to Mary's Milo."

```typescript
function LinkScreen({ navigation, route }) {
  const [code, setCode] = useState(['', '', '', '']);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Check if came from deep link
    const inviteCode = route.params?.code;
    if (inviteCode) {
      validateCode(inviteCode);
    } else {
      Speech.speak("Let's connect you. Enter the 4-digit code from their screen.");
    }
  }, []);

  const validateCode = async (fullCode: string) => {
    // Look up invite in database
    const { data: invite, error } = await supabase
      .from('invites')
      .select('*, users!invites_senior_id_fkey(name)')
      .eq('code', fullCode)
      .single();

    if (error || !invite) {
      Alert.alert('Invalid Code', 'Please check the code and try again.');
      return;
    }

    // Create family link
    await supabase.from('family_links').insert({
      senior_id: invite.senior_id,
      family_id: userId,
      relation: 'family',
    });

    const seniorName = invite.users.name;
    Speech.speak(`You're now connected to ${seniorName}'s Milo.`);

    navigation.navigate('NotificationSetup', { seniorName });
  };

  const handleCodeChange = (index: number, value: string) => {
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when complete
    if (newCode.every(digit => digit !== '')) {
      validateCode(newCode.join(''));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Link with Your Loved One</Text>
      <Text style={styles.subtitle}>Enter the 4-digit code</Text>

      <View style={styles.codeInputContainer}>
        {[0, 1, 2, 3].map((index) => (
          <TextInput
            key={index}
            ref={(ref) => inputRefs.current[index] = ref}
            style={styles.codeInput}
            value={code[index]}
            onChangeText={(value) => handleCodeChange(index, value)}
            keyboardType="number-pad"
            maxLength={1}
            autoFocus={index === 0}
          />
        ))}
      </View>

      <Text style={styles.footnote}>
        You should have received this code via text message
      </Text>
    </View>
  );
}
```

---

### Step 4: Notification Setup

**Voice:** "Would you like Milo to send you reminders or safety alerts?"

**Action:** [Yes, Enable Alerts] / [Skip for Now].

**Permissions:** Push + optional SMS.

```typescript
function NotificationSetupScreen({ navigation, route }) {
  const { seniorName } = route.params;

  useEffect(() => {
    Speech.speak("Would you like Milo to send you reminders or safety alerts?");
  }, []);

  const enableAlerts = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    
    if (status === 'granted') {
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      
      // Save push token
      await supabase.from('users').update({
        expo_push_token: token,
      }).eq('id', userId);

      navigation.navigate('CustomizeAlerts', { seniorName });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stay Informed</Text>
      <Text style={styles.subtitle}>
        Get notified about {seniorName}'s daily activities and safety
      </Text>

      <TouchableOpacity 
        style={styles.primaryButton}
        onPress={enableAlerts}
      >
        <Text style={styles.buttonText}>Yes, Enable Alerts</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.textButton}
        onPress={() => navigation.navigate('FamilyCompletion')}
      >
        <Text style={styles.textButtonLabel}>Skip for Now</Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

### Step 5: Customize Alerts

| Option | Icon | Description |
|--------|------|-------------|
| 🕓 **Daily Summary** | | "A brief update on reminders completed." |
| 🚨 **Safety Alerts** | | "Instant notification if something seems wrong." |
| 💬 **Check-ins** | | "When Milo can't reach them for a while." |

**Voice:** "Choose which updates you'd like to receive."

```typescript
function CustomizeAlertsScreen({ navigation, route }) {
  const { seniorName } = route.params;
  const [alerts, setAlerts] = useState({
    daily_summary: true,
    safety_alerts: true,
    check_ins: true,
  });

  const alertOptions = [
    {
      key: 'daily_summary',
      icon: '🕓',
      title: 'Daily Summary',
      description: 'A brief update on reminders completed.',
    },
    {
      key: 'safety_alerts',
      icon: '🚨',
      title: 'Safety Alerts',
      description: 'Instant notification if something seems wrong.',
    },
    {
      key: 'check_ins',
      icon: '💬',
      title: 'Check-ins',
      description: "When Milo can't reach them for a while.",
    },
  ];

  const savePreferences = async () => {
    await supabase.from('users').update({
      notification_prefs: alerts,
    }).eq('id', userId);

    navigation.navigate('TestAlert', { seniorName });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Customize Alerts</Text>
      <Text style={styles.subtitle}>Choose which updates you'd like to receive</Text>

      {alertOptions.map((option) => (
        <TouchableOpacity
          key={option.key}
          style={styles.alertOption}
          onPress={() => setAlerts({ ...alerts, [option.key]: !alerts[option.key] })}
        >
          <Text style={styles.alertIcon}>{option.icon}</Text>
          <View style={styles.alertInfo}>
            <Text style={styles.alertTitle}>{option.title}</Text>
            <Text style={styles.alertDescription}>{option.description}</Text>
          </View>
          <View style={[styles.toggle, alerts[option.key] && styles.toggleActive]} />
        </TouchableOpacity>
      ))}

      <TouchableOpacity 
        style={styles.primaryButton}
        onPress={savePreferences}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

### Step 6: Test Alert (Safety Phrase)

**Voice:** "Here's a sample message you'll receive."

**Notification:** "Milo Test: Mary's doing great today!"

**Action:** Tap "Got it."

```typescript
function TestAlertScreen({ navigation, route }) {
  const { seniorName } = route.params;

  useEffect(() => {
    Speech.speak("Here's a sample message you'll receive.");
    
    // Send test notification
    setTimeout(() => {
      Notifications.scheduleNotificationAsync({
        content: {
          title: 'Milo Test',
          body: `${seniorName}'s doing great today!`,
          sound: true,
        },
        trigger: { seconds: 2 },
      });
    }, 1000);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test Alert</Text>
      <Text style={styles.subtitle}>
        You should receive a notification in a moment
      </Text>

      <View style={styles.sampleNotification}>
        <Text style={styles.notificationTitle}>Milo Test</Text>
        <Text style={styles.notificationBody}>
          {seniorName}'s doing great today!
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.primaryButton}
        onPress={() => navigation.navigate('FamilyCompletion', { seniorName })}
      >
        <Text style={styles.buttonText}>Got it</Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

### Step 7: Summary & Completion

**Visual:** Linked avatars with gentle motion.

**Voice:** "All connected! I'll keep you informed if anything important happens."

**Action:** "Finish Setup."

```typescript
function FamilyCompletionScreen({ navigation, route }) {
  const { seniorName } = route.params;

  useEffect(() => {
    Speech.speak("All connected! I'll keep you informed if anything important happens.");
  }, []);

  const finishSetup = async () => {
    await supabase.from('users').update({
      onboarding_completed: true,
    }).eq('id', userId);

    navigation.reset({
      index: 0,
      routes: [{ name: 'FamilyDashboard' }],
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatarConnection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarEmoji}>👵</Text>
          <Text style={styles.avatarLabel}>{seniorName}</Text>
        </View>
        <View style={styles.connectionLine} />
        <View style={styles.avatar}>
          <Text style={styles.avatarEmoji}>👤</Text>
          <Text style={styles.avatarLabel}>You</Text>
        </View>
      </View>

      <Text style={styles.title}>All Connected!</Text>
      <Text style={styles.subtitle}>
        I'll keep you informed if anything important happens
      </Text>

      <TouchableOpacity 
        style={styles.primaryButton}
        onPress={finishSetup}
      >
        <Text style={styles.buttonText}>Finish Setup</Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

## 6. Accessibility & Design Notes

### Large Buttons
- **Minimum tap area:** 44pt (iOS standard)
- **Recommended:** 60pt+ for primary actions
- **Button text:** 24pt, semibold

### Dynamic Type
- All text scales with iOS settings
- Support up to XXXL size
- Line limits: none (allow wrapping)

### Color Contrast
- **AAA compliant:** 7:1 ratio minimum
- Text on background: #222 on #FFF
- Button text: #FFF on #6B8AFF

### Voice Narration
- Every screen speaks on appear
- All interactive elements have voice labels
- VoiceOver support throughout

### Reduced Motion Mode
- Disable animations → fade-only transitions
- No pulsing, shaking, or parallax
- Simple opacity changes only

```typescript
import { AccessibilityInfo } from 'react-native';

const [reduceMotion, setReduceMotion] = useState(false);

useEffect(() => {
  AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
}, []);

// Use in animations
const animation = reduceMotion ? null : slideUpAnimation;
```

---

## 7. Key Data Model Fields (Supabase)

### `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role TEXT NOT NULL CHECK (role IN ('senior', 'family')),
  display_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  expo_push_token TEXT,
  notification_prefs JSONB DEFAULT '{}',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `family_links`
```sql
CREATE TABLE family_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  senior_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  family_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  relation TEXT, -- 'daughter', 'son', 'caregiver'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(senior_id, family_id)
);
```

### `invites`
```sql
CREATE TABLE invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  senior_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  family_name TEXT,
  family_contact TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 8. Metrics for Success

| Metric | Goal |
|--------|------|
| **Role Selection Completion** | 100% |
| **Senior Onboarding Completion** | ≥ 90% |
| **Family Onboarding Completion** | ≥ 85% |
| **Family Link Success** | ≥ 70% of seniors invite at least one contact |
| **Permission Grant Rate** | ≥ 80% mic + notification |
| **Average Time to Complete** | ≤ 3 minutes |
| **First Voice Command Success** | ≥ 85% understand and respond correctly |

---

## 9. Voice Script Summary

| Step | Script | Tone |
|------|--------|------|
| **Role Selection** | "Are you the person using Milo, or someone helping a loved one?" | Curious, calm |
| **Senior Welcome** | "Hi, I'm Milo. I'll help you stay organized and safe every day." | Warm |
| **Family Welcome** | "Hi, I'm Milo. I'll help you stay connected and informed." | Supportive |
| **Permissions** | "May I use your microphone? It helps me hear you clearly." | Honest |
| **Voice Demo** | "Try saying: Remind me to take my pills at 8 PM." | Encouraging |
| **Reminders** | "You can tell me what to remember — like calls or medicine." | Helpful |
| **Family Link** | "Who should I reach if you need help?" | Personal |
| **Completion** | "All ready! You can talk to me anytime." | Celebratory |

---

## 10. Tagline

> **"Milo connects hearts and habits — helping families stay safe, without the stress."**

---

## Next Steps

1. **Build onboarding screens** in React Native
2. **Test with 5-10 seniors** (watch for confusion points)
3. **Iterate based on feedback** (simplify where needed)
4. **A/B test voice vs. text** (which completes faster?)
5. **Measure drop-off rates** at each step

**Related Docs:**
- `DESIGN_SPEC.md` - Visual design for each screen
- `MOTION_SPEC.md` - Animations for onboarding
- `TECHNICAL_SPEC.md` - API integration details
- `PRD.md` - Overall product vision

