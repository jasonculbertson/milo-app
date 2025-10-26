# 🧩 Milo v0.3 — Core System Specs Addendum

> Engineering + Design Specification for Family Alpha Release (Free Tier)  
> Scope: iOS (React Native/Expo + Supabase)

---

## 1. 🔒 Data Privacy & Security Spec

### Overview

Milo handles sensitive data including health-related signals, family contact information, and motion events. The privacy model emphasizes *local-first processing*, explicit consent, and transparent data storage.

### Design Goals

* **Process data locally where possible** (e.g., fall detection, reminders)
* **Use minimal personally identifiable information (PII)**
* **Encrypt all network and at-rest data**
* **Allow users and family members to delete data at any time**

### Implementation

#### Local Processing
```typescript
// Motion events stored locally first
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

class PrivacyFirstStorage {
  // Store locally first
  async storeEvent(event: Event) {
    // Save to local storage
    await AsyncStorage.setItem(
      `event_${event.id}`,
      JSON.stringify(event)
    );
    
    // Attempt cloud sync if online
    const netInfo = await NetInfo.fetch();
    if (netInfo.isConnected) {
      await this.syncToCloud(event);
    }
  }
  
  // Sync when connectivity returns
  async syncPendingEvents() {
    const keys = await AsyncStorage.getAllKeys();
    const eventKeys = keys.filter(k => k.startsWith('event_'));
    
    for (const key of eventKeys) {
      const event = await AsyncStorage.getItem(key);
      await this.syncToCloud(JSON.parse(event));
      await AsyncStorage.removeItem(key); // Clean up after sync
    }
  }
}
```

#### Network Security
- **All traffic via HTTPS (TLS 1.3)**
- **Certificate pinning** for Supabase endpoints
- **JWT token rotation** every 24 hours

```typescript
import { supabase } from './supabase';

// Refresh token on app launch
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Auth token refreshed');
  }
});
```

#### Storage Encryption
- **Supabase tables encrypted at rest** (AES-256)
- **Local AsyncStorage** encrypted via iOS Keychain
- **Sensitive data** (location, health) stored with additional encryption

```sql
-- Row Level Security (RLS) policies
CREATE POLICY "Users can only see their own data"
  ON events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Family can see linked senior data"
  ON events FOR SELECT
  USING (
    user_id IN (
      SELECT senior_id FROM family_links 
      WHERE family_id = auth.uid()
    )
  );
```

#### Consent Flow
```typescript
function ConsentScreen() {
  const [consents, setConsents] = useState({
    data_collection: false,
    family_sharing: false,
    fall_detection: false,
  });

  return (
    <View>
      <Text style={styles.title}>Your Privacy Matters</Text>
      
      <ConsentItem
        checked={consents.data_collection}
        onChange={(val) => setConsents({ ...consents, data_collection: val })}
        title="Store my check-ins and reminders"
        description="We'll save your data securely to help Milo learn your preferences."
      />
      
      <ConsentItem
        checked={consents.family_sharing}
        onChange={(val) => setConsents({ ...consents, family_sharing: val })}
        title="Share daily summaries with family"
        description="Your family will see if you've checked in and completed reminders."
      />
      
      <ConsentItem
        checked={consents.fall_detection}
        onChange={(val) => setConsents({ ...consents, fall_detection: val })}
        title="Enable fall detection"
        description="Milo will monitor motion sensors and alert family if needed."
      />
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => saveConsents(consents)}
      >
        <Text>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}
```

#### Data Deletion
```typescript
// Complete account deletion
async function deleteAccount(userId: string) {
  // Cascade delete (handled by Supabase foreign keys)
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);
  
  if (!error) {
    // Clear local storage
    await AsyncStorage.clear();
    
    // Sign out
    await supabase.auth.signOut();
  }
}
```

### Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| **Unauthorized access** | JWT-based auth, RLS enforcement, session timeouts |
| **Accidental data leaks** | Only store event metadata, not content; no audio stored |
| **Family access misuse** | One-to-one verified linking via code, audit logs |
| **Third-party breaches** | Minimal external APIs, encrypted connections only |
| **Device theft** | Biometric auth required, remote wipe capability |

---

## 2. 🔁 Behavioral Loop & Engagement Spec

### Overview

Engagement is built through gentle daily rituals — *check-in, reminder, reflection*. The loop drives consistent use without pressure.

### Loop Framework (Hook Model)

| Stage | Trigger | Action | Reward | Investment |
|-------|---------|--------|--------|------------|
| **Trigger** | Daily notification | Open Milo | Reassurance | Daily streak saved |
| **Action** | Respond with voice | Confirmation | Social reassurance (family summary) | Improved AI tone |
| **Reward** | Small praise | "Nice to hear from you!" | Emotional | Habit reinforcement |
| **Investment** | Set new reminder | Future reward | Retained daily streak | Personalized experience |

### Visual Representation

```
┌─────────────────────────────────────────┐
│     Daily Notification (Trigger)        │
│     "Good morning! How are you?"        │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│     User Opens App (Action)             │
│     Taps "I'm OK" or uses voice         │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│     Immediate Feedback (Reward)         │
│     "Great! That's 5 days in a row 🎉" │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│     User Sets Reminder (Investment)     │
│     Creates future trigger point        │
└─────────────────────────────────────────┘
```

### Implementation

```typescript
// Track engagement loop
class EngagementTracker {
  async recordInteraction(userId: string, type: string) {
    // Log interaction
    await supabase.from('events').insert({
      user_id: userId,
      type,
      timestamp: new Date().toISOString(),
    });
    
    // Update streak
    const streak = await this.updateStreak(userId);
    
    // Provide reward feedback
    if (streak % 7 === 0) {
      return {
        message: `Amazing! ${streak} days in a row! 🎉`,
        badge: 'weekly_champion',
      };
    } else if (streak > 1) {
      return {
        message: `That's ${streak} days straight!`,
        badge: null,
      };
    }
    
    return {
      message: 'Thanks for checking in!',
      badge: null,
    };
  }
  
  async updateStreak(userId: string) {
    const { data: recentCheckins } = await supabase
      .from('events')
      .select('timestamp')
      .eq('user_id', userId)
      .eq('type', 'checkin')
      .order('timestamp', { ascending: false })
      .limit(30);
    
    let streak = 0;
    let currentDate = new Date();
    
    for (const checkin of recentCheckins || []) {
      const checkinDate = new Date(checkin.timestamp);
      const daysDiff = Math.floor(
        (currentDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysDiff === streak) {
        streak++;
        currentDate = checkinDate;
      } else {
        break;
      }
    }
    
    // Save streak
    await supabase.from('users').update({ 
      current_streak: streak 
    }).eq('id', userId);
    
    return streak;
  }
}
```

### Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Daily active users** | ≥ 70% | Count unique daily check-ins |
| **7-day retention** | ≥ 60% | Users active on day 7 after signup |
| **Average daily interactions** | 1.5+ | Mean events per user per day |
| **Streak completion** | ≥ 50% reach 7 days | Percentage maintaining week streak |

---

## 3. 💬 Conversational UX & Intent Framework

### Overview

Milo's voice interface relies on clear, predictable intents and empathetic fallback handling.

### Intent Types

| Intent | Example Utterances | Action |
|--------|-------------------|--------|
| `reminder.create` | "Remind me to take pills at 8 PM." | Creates reminder |
| `reminder.check` | "What reminders do I have today?" | Reads list |
| `status.checkin` | "I'm fine today." | Logs wellness check |
| `help.request` | "I need help." | Escalates to family |
| `smalltalk` | "Good morning!" | Friendly response |
| `question.general` | "What's the weather?" | GPT-4o query |
| `document.explain` | "What does this letter say?" | OCR + summary |

### Flow Diagram

```
Speech Input
    ↓
Transcription (expo-speech)
    ↓
Intent Classification
    ├─ Local Rules (regex patterns)
    └─ GPT Fallback (ambiguous cases)
    ↓
Action Execution
    ├─ Supabase (reminders, events)
    ├─ Local (quick responses)
    └─ External API (weather, etc.)
    ↓
Response Generation
    ↓
Voice Output (TTS)
```

### Implementation

```typescript
import Voice from '@react-native-voice/voice';
import * as Speech from 'expo-speech';
import { openai } from './openai';

class ConversationalEngine {
  async processVoiceInput(transcript: string, userId: string) {
    // Step 1: Intent classification
    const intent = await this.classifyIntent(transcript);
    
    // Step 2: Execute action
    const response = await this.executeIntent(intent, userId);
    
    // Step 3: Speak response
    Speech.speak(response.text, {
      language: 'en-US',
      pitch: 1.0,
      rate: 0.9, // Slightly slower for clarity
    });
    
    // Step 4: Log interaction
    await supabase.from('messages').insert({
      user_id: userId,
      input_text: transcript,
      response_text: response.text,
      intent: intent.type,
    });
    
    return response;
  }
  
  async classifyIntent(transcript: string) {
    // Try local rules first (fast)
    const localIntent = this.matchLocalPatterns(transcript);
    if (localIntent) return localIntent;
    
    // Fallback to GPT for ambiguous cases
    const gptResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'system',
        content: `Classify the intent of this utterance. 
        Options: reminder.create, reminder.check, status.checkin, help.request, smalltalk, question.general, document.explain.
        Respond with just the intent name.`
      }, {
        role: 'user',
        content: transcript
      }],
      max_tokens: 10,
    });
    
    return {
      type: gptResponse.choices[0].message.content,
      confidence: 0.8,
    };
  }
  
  matchLocalPatterns(transcript: string) {
    const lower = transcript.toLowerCase();
    
    // Reminder patterns
    if (/remind me/i.test(lower) || /set.*reminder/i.test(lower)) {
      return { type: 'reminder.create', confidence: 0.95 };
    }
    
    // Check-in patterns
    if (/i'm (ok|fine|good|well)/i.test(lower)) {
      return { type: 'status.checkin', confidence: 0.95 };
    }
    
    // Help patterns
    if (/help|emergency|urgent/i.test(lower)) {
      return { type: 'help.request', confidence: 0.95 };
    }
    
    // Smalltalk patterns
    if (/^(hi|hello|hey|good morning)/i.test(lower)) {
      return { type: 'smalltalk', confidence: 0.95 };
    }
    
    return null; // No local match, use GPT
  }
  
  async executeIntent(intent: any, userId: string) {
    switch (intent.type) {
      case 'reminder.create':
        return await this.createReminder(userId);
      
      case 'status.checkin':
        await supabase.from('events').insert({
          user_id: userId,
          type: 'checkin',
          payload: { status: 'ok' },
        });
        return { text: 'Thanks for checking in! Your family has been notified.' };
      
      case 'help.request':
        await this.escalateToFamily(userId);
        return { text: "I've let your family know you need help. Someone will be in touch soon." };
      
      case 'smalltalk':
        return { text: 'Hi there! Nice to hear from you. How can I help today?' };
      
      default:
        return { text: "I'm not sure I understood. Could you try again?" };
    }
  }
}
```

### UX Rules

1. **Max 20 words per reply** - Keep responses concise
2. **Avoid medical or diagnostic language** - "You sound tired" not "You may be experiencing depression"
3. **Always confirm actions** - "Okay, I've set that reminder for 8 PM"
4. **Never leave silence > 2 seconds** - Use filler phrases if processing
5. **Empathetic fallback** - "I didn't quite catch that, but I'm here to help"

### Success Metrics

| Metric | Target |
|--------|--------|
| **Successful intent resolution** | > 90% |
| **Fallback to generic error** | < 5% |
| **Average response time** | < 3 seconds |
| **User satisfaction (post-interaction)** | > 80% |

---

## 4. 📶 Offline & Resilience Spec

### Overview

Seniors may lose connectivity frequently. Milo must continue functioning offline and sync seamlessly when reconnected.

### Implementation

```typescript
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

class OfflineManager {
  private syncQueue: any[] = [];
  
  constructor() {
    // Listen for connectivity changes
    NetInfo.addEventListener(state => {
      if (state.isConnected && this.syncQueue.length > 0) {
        this.processSyncQueue();
      }
    });
  }
  
  async saveOffline(data: any, type: string) {
    // Save locally
    const item = {
      id: `${type}_${Date.now()}`,
      type,
      data,
      timestamp: new Date().toISOString(),
      synced: false,
    };
    
    await AsyncStorage.setItem(item.id, JSON.stringify(item));
    this.syncQueue.push(item);
    
    // Try immediate sync if online
    const netInfo = await NetInfo.fetch();
    if (netInfo.isConnected) {
      await this.processSyncQueue();
    }
  }
  
  async processSyncQueue() {
    const itemsToSync = [...this.syncQueue];
    
    for (const item of itemsToSync) {
      try {
        // Sync to Supabase
        await this.syncItem(item);
        
        // Mark as synced
        await AsyncStorage.setItem(
          item.id,
          JSON.stringify({ ...item, synced: true })
        );
        
        // Remove from queue
        this.syncQueue = this.syncQueue.filter(i => i.id !== item.id);
      } catch (error) {
        console.error('Sync failed:', error);
        // Will retry on next connectivity change
      }
    }
  }
  
  async syncItem(item: any) {
    switch (item.type) {
      case 'checkin':
        await supabase.from('events').insert(item.data);
        break;
      
      case 'reminder':
        await supabase.from('reminders').insert(item.data);
        break;
      
      case 'fall_event':
        await supabase.from('events').insert(item.data);
        break;
    }
  }
}
```

### Offline Mode UI

```typescript
function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
    });
    
    return unsubscribe;
  }, []);
  
  if (isOnline) return null;
  
  return (
    <View style={styles.offlineBanner}>
      <Text style={styles.offlineText}>
        📡 No connection — I'll save this until later
      </Text>
    </View>
  );
}
```

### Feature Availability Matrix

| Feature | Local | Cloud | Notes |
|---------|-------|-------|-------|
| **Check-ins** | ✅ | ✅ | Synced when online |
| **Reminders** | ✅ | ✅ | Local notifications work offline |
| **Fall events** | ✅ | ✅ | Queued for upload |
| **Family alerts** | ❌ | ✅ | Requires connectivity |
| **Voice AI** | ❌ | ✅ | Needs internet for GPT |
| **TTS output** | ✅ | ✅ | Apple Neural Voice (on-device) |

### Success Metrics

| Metric | Target |
|--------|--------|
| **Data loss rate** | < 1% |
| **Offline recovery success** | ≥ 95% |
| **Sync latency** | < 30 seconds after reconnection |

---

## 5. 📊 Analytics & Insights Spec

### Overview

Early analytics focus on understanding use frequency, reliability, and emotional tone (without collecting personal data).

### Metrics Architecture

```
App Events → Supabase Analytics Table → PostHog → Dashboard
```

### Tracked Events

```typescript
// Analytics event structure
interface AnalyticsEvent {
  event_type: string;
  user_id: string;
  timestamp: string;
  metadata: {
    // Event-specific data (non-PII)
    [key: string]: any;
  };
}

// Example events
await logEvent({
  event_type: 'checkin_completed',
  user_id: userId,
  timestamp: new Date().toISOString(),
  metadata: {
    method: 'voice', // or 'button'
    response_time_seconds: 3.2,
  },
});

await logEvent({
  event_type: 'reminder_set',
  user_id: userId,
  timestamp: new Date().toISOString(),
  metadata: {
    reminder_type: 'medication', // or 'appointment', 'task'
    time_of_day: 'evening',
  },
});
```

### Key Metrics

| Category | Metric | Goal | How Measured |
|----------|--------|------|--------------|
| **Engagement** | Active seniors/day | 75% | Unique daily check-ins |
| **Retention** | 30-day returning seniors | 50% | Users active on day 30 |
| **Safety** | Avg response to fall | < 5 min | Time from fall alert to family response |
| **Family** | % summaries opened | 70% | Notification open rate |
| **Mood** | Avg daily sentiment | Positive trend | Sentiment analysis of check-ins |
| **Reliability** | Success rate | > 95% | Successful interactions / total attempts |

### Implementation

```typescript
// Supabase analytics table
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES users(id),
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_user_timestamp ON analytics_events(user_id, timestamp DESC);
```

### Privacy-Preserving Analytics

```typescript
class PrivacyFirstAnalytics {
  async logEvent(event: AnalyticsEvent) {
    // Remove any PII before logging
    const sanitized = {
      ...event,
      metadata: this.sanitizeMetadata(event.metadata),
    };
    
    await supabase.from('analytics_events').insert(sanitized);
  }
  
  sanitizeMetadata(metadata: any) {
    // Remove any potential PII
    const sanitized = { ...metadata };
    delete sanitized.name;
    delete sanitized.email;
    delete sanitized.phone;
    delete sanitized.address;
    delete sanitized.transcript; // Never log raw speech
    
    return sanitized;
  }
}
```

### Dashboard Queries

```sql
-- Daily active users
SELECT 
  DATE(timestamp) as date,
  COUNT(DISTINCT user_id) as active_users
FROM analytics_events
WHERE event_type = 'checkin_completed'
  AND timestamp >= NOW() - INTERVAL '30 days'
GROUP BY DATE(timestamp)
ORDER BY date DESC;

-- Average response time to fall alerts
SELECT 
  AVG(EXTRACT(EPOCH FROM (family_response.timestamp - fall_detected.timestamp))) / 60 as avg_minutes
FROM analytics_events fall_detected
JOIN analytics_events family_response 
  ON fall_detected.user_id = family_response.metadata->>'senior_id'
WHERE fall_detected.event_type = 'fall_detected'
  AND family_response.event_type = 'alert_acknowledged';
```

### Success Metrics

| Metric | Target |
|--------|--------|
| **Event logging accuracy** | > 99% |
| **Data anonymization validated** | Manual audit every sprint |
| **Dashboard load time** | < 2 seconds |

---

## 6. 🧑‍⚕️ Partner / Health Integrations (Future)

### Overview

Later phases may integrate Milo with Apple Health or clinic dashboards to extend longevity and revenue potential.

### Roadmap

| Phase | Integration | Goal | Timeline |
|-------|-------------|------|----------|
| **v0.4** | Apple Health (steps, sleep) | Enrich reminders | Q2 2026 |
| **v0.5** | EHR APIs (FHIR) | Share check-in summaries with clinics | Q3 2026 |
| **v1.0** | Insurance partnerships | Wellness plan compliance | Q4 2026 |

### Technical Hooks

```typescript
// Apple Health integration (future)
import AppleHealthKit from 'react-native-health';

async function syncHealthData(userId: string) {
  const permissions = {
    permissions: {
      read: ['Steps', 'SleepAnalysis'],
    },
  };
  
  AppleHealthKit.initHealthKit(permissions, async (error) => {
    if (error) return;
    
    // Get today's steps
    const steps = await AppleHealthKit.getStepCount({});
    
    // Enrich reminder context
    if (steps < 1000) {
      // Suggest gentle walk reminder
      await suggestReminder({
        type: 'activity',
        message: 'You've been resting today. Would you like a reminder to take a short walk?',
      });
    }
  });
}
```

### FHIR Integration (Conceptual)

```typescript
// FHIR API integration for EHR
interface FHIRObservation {
  resourceType: 'Observation';
  status: 'final';
  code: {
    coding: [{ system: string; code: string; display: string }];
  };
  subject: { reference: string };
  effectiveDateTime: string;
  valueString: string;
}

async function shareSummaryWithClinic(userId: string, clinicId: string) {
  // Get user consent first
  const consent = await getUserConsent(userId, 'clinic_sharing');
  if (!consent) return;
  
  // Generate FHIR observation
  const observation: FHIRObservation = {
    resourceType: 'Observation',
    status: 'final',
    code: {
      coding: [{
        system: 'http://loinc.org',
        code: '85354-9',
        display: 'Wellness check-in status',
      }],
    },
    subject: { reference: `Patient/${userId}` },
    effectiveDateTime: new Date().toISOString(),
    valueString: 'Patient checked in daily for past 7 days',
  };
  
  // Send to EHR via FHIR API
  await sendToEHR(clinicId, observation);
}
```

### Risk & Regulatory

⚠️ **HIPAA Compliance Required**
- Disable until legal review complete
- Business Associate Agreement (BAA) needed with partners
- Data minimization (only aggregate summaries, never raw data)
- User consent per clinic/insurer

---

## 7. 🧰 Admin & Support Tools

### Overview

Internal lightweight web dashboard for monitoring pilot test data and resolving family queries.

### Features

| Function | Description | Access Level |
|----------|-------------|--------------|
| **User overview** | Active seniors, family links, device status | Admin |
| **Event log** | Falls, reminders, check-ins | Admin |
| **Alert viewer** | Current open safety alerts | Admin, Support |
| **Manual override** | Mark alerts as resolved | Admin only |
| **Usage analytics** | Charts and trends | Admin, Viewer |

### Implementation

```typescript
// Next.js admin dashboard
// /admin/page.tsx

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export default async function AdminDashboard() {
  const supabase = createServerComponentClient();
  
  // Check admin access
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('users')
    .select('role, admin_level')
    .eq('id', user?.id)
    .single();
  
  if (profile?.admin_level !== 'admin') {
    return <div>Unauthorized</div>;
  }
  
  // Fetch dashboard data
  const { data: activeUsers } = await supabase
    .from('users')
    .select('*, events(count)')
    .eq('role', 'senior');
  
  const { data: openAlerts } = await supabase
    .from('events')
    .select('*, users(name)')
    .eq('type', 'fall_detected')
    .is('resolved_at', null);
  
  return (
    <div className="dashboard">
      <h1>Milo Admin Dashboard</h1>
      
      <section>
        <h2>Active Seniors: {activeUsers?.length}</h2>
        <UserList users={activeUsers} />
      </section>
      
      <section>
        <h2>Open Alerts: {openAlerts?.length}</h2>
        <AlertList alerts={openAlerts} />
      </section>
    </div>
  );
}
```

### Alert Management

```typescript
async function resolveAlert(alertId: string, adminId: string, notes: string) {
  // Mark alert as resolved
  await supabase
    .from('events')
    .update({
      resolved_at: new Date().toISOString(),
      resolved_by: adminId,
      resolution_notes: notes,
    })
    .eq('id', alertId);
  
  // Log admin action
  await supabase.from('admin_actions').insert({
    admin_id: adminId,
    action_type: 'resolve_alert',
    target_id: alertId,
    notes,
  });
}
```

### Access Control

```sql
-- Admin levels table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  role TEXT, -- 'senior', 'family', 'admin'
  admin_level TEXT CHECK (admin_level IN ('viewer', 'support', 'admin')),
  ...
);

-- Admin actions audit log
CREATE TABLE admin_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES users(id),
  action_type TEXT NOT NULL,
  target_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 8. 💳 Billing & Subscription (Placeholder)

### Overview

Not active in Family Alpha, but structure ready for later phases.

### Implementation Plan (v1.0)

```typescript
// RevenueCat integration
import Purchases from 'react-native-purchases';

async function setupSubscriptions() {
  Purchases.configure({ apiKey: REVENUECAT_KEY });
  
  // Check entitlement
  const customerInfo = await Purchases.getCustomerInfo();
  const isPremium = customerInfo.entitlements.active['premium'] !== undefined;
  
  return isPremium;
}

// Sync with Supabase
async function syncSubscriptionStatus(userId: string, isPremium: boolean) {
  await supabase
    .from('users')
    .update({ subscription_tier: isPremium ? 'premium' : 'free' })
    .eq('id', userId);
}
```

### Free Tier Behavior (v0.3)

- ✅ **Unlimited use** for pilot testers
- ✅ **Local-only data retention** (30 days)
- ✅ **All features enabled**
- ❌ **No payment processing** (comes in v1.0)

---

## 9. 🧠 AI Feedback & Personalization Spec

### Overview

Milo learns tone and phrasing preferences through interaction logs (non-sensitive metadata only).

### Implementation

```typescript
class PersonalizationEngine {
  async generateResponse(userId: string, intent: string, context: any) {
    // Get user's preference profile
    const profile = await this.getUserProfile(userId);
    
    // Build personalized prompt
    const prompt = `
You are Milo, helping ${profile.name}.

User preferences:
- Tone: ${profile.tone_preference || 'friendly'}
- Brevity: ${profile.prefers_brief ? 'keep responses under 15 words' : 'normal length'}
- Recent mood: ${profile.recent_mood}

Context: ${JSON.stringify(context)}

Respond warmly and appropriately to their ${intent} intent.
`;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: prompt }],
      max_tokens: 50,
    });
    
    return response.choices[0].message.content;
  }
  
  async updateProfile(userId: string, interaction: any) {
    // Learn from interaction
    const duration = interaction.duration_seconds;
    const success = interaction.user_satisfied;
    
    // If user cuts off responses, they prefer brevity
    if (duration < 3 && !success) {
      await supabase
        .from('users')
        .update({ prefers_brief: true })
        .eq('id', userId);
    }
  }
}
```

### Personalization Dimensions

| Trait | Example Adaptation | Data Source |
|-------|-------------------|-------------|
| **Tone** | More concise replies | Interaction duration patterns |
| **Timing** | Reminders clustered earlier in day | Completion time analysis |
| **Emotion** | Adjusts warmth level based on mood trend | Sentiment analysis (opt-in) |
| **Topics** | Remembers frequent questions | Query history |

### Risks

- ❌ **Avoid overfitting** - AI shouldn't mimic emotional tone literally
- ❌ **No medical inference** - Don't diagnose based on mood
- ✅ **User control** - Allow reset to default personality

---

## 10. 🧪 Testing & QA Spec

### Overview

The alpha build will be validated with real family testers in controlled conditions.

### Test Matrix

| Category | Devices | Tests |
|----------|---------|-------|
| **Compatibility** | iPhone SE → 16 Pro | Install, performance, UI scaling |
| **Motion** | iPhone 13–16 | Fall detection sensitivity |
| **Voice** | All | Speech-to-text accuracy (various accents) |
| **Notifications** | All | Push reliability, timing accuracy |
| **Accessibility** | iPhone 12+ | VoiceOver, large text, reduce motion |

### QA Plan

#### Unit Tests
```typescript
// Example: Reminder creation test
describe('ReminderService', () => {
  it('should create reminder from voice input', async () => {
    const input = 'Remind me to take pills at 8 PM';
    const reminder = await ReminderService.createFromVoice(input);
    
    expect(reminder.title).toBe('take pills');
    expect(reminder.when_ts).toContain('20:00');
  });
  
  it('should handle ambiguous times', async () => {
    const input = 'Remind me to call Laura tomorrow';
    const reminder = await ReminderService.createFromVoice(input);
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    expect(new Date(reminder.when_ts).getDate()).toBe(tomorrow.getDate());
  });
});
```

#### Integration Tests
```typescript
// Example: Check-in flow test
describe('Check-in Flow', () => {
  it('should complete full check-in and notify family', async () => {
    // Senior checks in
    const checkin = await checkIn(seniorUserId, 'ok');
    expect(checkin.status).toBe('ok');
    
    // Verify family notification sent
    const notifications = await getNotificationsFor(familyUserId);
    expect(notifications).toContainEqual(
      expect.objectContaining({
        type: 'summary',
        senior_id: seniorUserId,
      })
    );
  });
});
```

#### End-to-End Tests
- Check-in → family alert → resolution loop
- Reminder creation → notification → completion
- Fall detection → escalation → family response

#### Beta Test
- **Duration:** 14 days
- **Participants:** 10 families (10 seniors + 20 family members)
- **Data collection:** Daily surveys, usage logs, crash reports
- **Success criteria:** See metrics below

### Success Metrics

| Metric | Target | Measurement Method |
|--------|--------|--------------------|
| **Crash rate** | < 5% | Firebase Crashlytics |
| **Feature reliability** | 95% | Successful operations / total attempts |
| **User satisfaction** | > 80% | Post-test survey (NPS) |
| **Voice accuracy** | > 90% | Correct intent classification |
| **Notification delivery** | > 98% | Delivered / scheduled |

---

## ✅ Summary

This addendum completes the Milo v0.3 foundation for engineering and design. The system now includes:

✅ **Local-first privacy model** with encryption and RLS  
✅ **Defined behavioral loop** and conversational intents  
✅ **Offline resilience** with queue-based syncing  
✅ **Analytics and admin visibility** (privacy-preserving)  
✅ **Structured AI feedback** and personalization  
✅ **QA and beta readiness** with comprehensive testing  
✅ **Future integrations** (health, EHR) with regulatory awareness  
✅ **Admin tools** for pilot support  

---

> **"Build trust first. Everything else — reminders, AI, growth — flows from that."**

---

## Next Steps

1. **Review & approve** this addendum with team
2. **Prioritize implementation** (privacy & offline are must-haves)
3. **Build admin dashboard** for pilot support
4. **Set up analytics** pipeline (Supabase → PostHog)
5. **Prepare beta test** materials (consent forms, surveys)
6. **Launch Family Alpha** with 10 families

**Related Docs:**
- `TECHNICAL_SPEC.md` - API & database specifications
- `NOTIFICATION_SPEC.md` - Daily notification system
- `ONBOARDING_SPEC.md` - User onboarding flows
- `DESIGN_SPEC.md` - UI/UX specifications
- `PRD.md` - Product vision & roadmap

