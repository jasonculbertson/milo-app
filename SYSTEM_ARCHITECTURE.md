# 🧭 Milo System Architecture Diagram (Visual Overview)

## Architecture Overview

Milo's architecture consists of four key layers that connect voice input, AI reasoning, motion detection, and family notifications:

```mermaid
graph TD;
  A[User: Senior] -->|Tap to Talk / Passive Sensors| B[Milo iOS App];
  B -->|Speech-to-Text| C[AI Layer: GPT-4o];
  C -->|Response Text| D[TTS Layer: ElevenLabs / Apple Neural Voice];
  B -->|OCR Images| E[Vision API (Google Vision)];
  E -->|Extracted Text| C;
  B -->|Reminders + Fall Events| F[Supabase Backend];
  F -->|Triggers Alerts| G[Notification Service];
  G -->|Push/SMS/Email| H[Family Member];
  B -->|Motion Data (Accelerometer / Gyroscope)| I[Fall Detection Module];
  I -->|Potential Fall| F;
  I -->|No Response > 60s| G;
  G -->|Escalation Message| H;
```

## Layer Summary

| Layer                        | Key Components                             | Description                                                              |
| ---------------------------- | ------------------------------------------ | ------------------------------------------------------------------------ |
| **1. Frontend (Milo App)**   | SwiftUI, CoreMotion, AVFoundation          | Manages user interactions, voice, reminders, and passive fall detection. |
| **2. AI Layer**              | GPT-4o, Tuned Prompt                       | Provides natural, empathetic reasoning and summarization.                |
| **3. Vision Layer**          | Google Vision OCR                          | Converts document images into readable text for summarization.           |
| **4. Backend (Supabase)**    | Tables: users, messages, reminders, events | Stores user data, reminders, logs, and fall events.                      |
| **5. Notification Service**  | PushKit, Twilio, Firebase                  | Sends alerts to family members or caregivers when triggered.             |
| **6. Family View (Web/App)** | Web dashboard                              | Displays summaries, reminders, and safety status.                        |

## Data Flow

### 1. Voice Request Flow
```
User taps "Talk" 
  → Milo captures speech (AVFoundation)
  → Transcribes (iOS Speech Recognition)
  → Sends to GPT-4o
  → Response spoken back (TTS)
  → Logged to Supabase
```

### 2. Explain Task Flow
```
User takes photo
  → OCR extraction (Google Vision)
  → Text sent to GPT-4o for summarization
  → Summary spoken reply
  → Document stored in Supabase
```

### 3. Reminder Flow
```
User: "Remind me to take pills at 8pm"
  → NLP parsing (GPT-4o extracts time + action)
  → Stored in Supabase reminders table
  → Local iOS notification scheduled
  → Push notification at 8pm
  → User taps "Done" → marked complete
```

### 4. Fall Detection Flow
```
CoreMotion detects:
  → Acceleration > 2.5g + Inactivity > 60s
  → Local alert: "Are you okay?"
  → Buttons: [I'm OK] [Need Help]
  
If no response after 60s:
  → Event logged to Supabase
  → Notification to family via:
     • Push notification
     • SMS (Twilio)
     • Email (optional)
  → Includes: timestamp, location, battery level
```

### 5. Family Notification Flow
```
Event triggered (fall, missed reminder, etc.)
  → Supabase function processes event
  → Retrieves family contacts
  → Sends via multiple channels:
     • iOS Push (immediate)
     • SMS (backup)
     • Email (record)
  → Family dashboard updates
  → Event marked as "notified"
```

## Detailed Component Architecture

### Frontend (iOS App)

```
┌─────────────────────────────────────────────┐
│          Milo iOS App (SwiftUI)            │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────────┐  ┌──────────────┐       │
│  │ Voice Screen │  │  Explain     │       │
│  │  (Tap Talk)  │  │  (Camera)    │       │
│  └──────────────┘  └──────────────┘       │
│                                             │
│  ┌──────────────┐  ┌──────────────┐       │
│  │  Reminders   │  │   Safety     │       │
│  │   Screen     │  │   Monitor    │       │
│  └──────────────┘  └──────────────┘       │
│                                             │
├─────────────────────────────────────────────┤
│            Services Layer                   │
├─────────────────────────────────────────────┤
│                                             │
│  • SpeechService (STT)                     │
│  • TTSService (Voice output)               │
│  • AIService (GPT-4o integration)          │
│  • OCRService (Google Vision)              │
│  • FallDetectionService (CoreMotion)       │
│  • ReminderService (Scheduling)            │
│  • NotificationService (Push)              │
│  • SupabaseService (Backend)               │
│                                             │
└─────────────────────────────────────────────┘
```

### Backend (Supabase)

```
┌─────────────────────────────────────────────┐
│           Supabase Backend                  │
├─────────────────────────────────────────────┤
│                                             │
│  Database (PostgreSQL)                      │
│  ┌──────────────────────────────────────┐  │
│  │ users          (profiles, contacts)  │  │
│  │ messages       (voice interactions)  │  │
│  │ reminders      (scheduled tasks)     │  │
│  │ events         (falls, alerts)       │  │
│  │ documents      (OCR scans)           │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  Edge Functions                             │
│  ┌──────────────────────────────────────┐  │
│  │ /ask           (AI query handler)    │  │
│  │ /explain       (OCR + summarize)     │  │
│  │ /reminder      (create/update)       │  │
│  │ /fall_alert    (emergency notify)    │  │
│  │ /daily_summary (family reports)      │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  Auth & Realtime                            │
│  • Magic link authentication                │
│  • Row-level security (RLS)                 │
│  • Realtime subscriptions                   │
│                                             │
└─────────────────────────────────────────────┘
```

### AI Layer (GPT-4o)

```
┌─────────────────────────────────────────────┐
│         OpenAI GPT-4o Integration           │
├─────────────────────────────────────────────┤
│                                             │
│  System Prompt:                             │
│  ┌──────────────────────────────────────┐  │
│  │ "You are Milo, a kind, calm AI who  │  │
│  │  helps older adults. Always respond │  │
│  │  warmly and briefly (≤20 words)."   │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  Use Cases:                                 │
│  • General questions (weather, news)        │
│  • Document summarization                   │
│  • Reminder extraction (NLP)                │
│  • Conversation (casual chat)               │
│                                             │
│  Safety Features:                           │
│  • Content filtering (medical advice)       │
│  • Scam detection (suspicious requests)     │
│  • Empathy tuning (emotional support)       │
│                                             │
└─────────────────────────────────────────────┘
```

### Notification Service

```
┌─────────────────────────────────────────────┐
│       Multi-Channel Notification            │
├─────────────────────────────────────────────┤
│                                             │
│  Primary: Expo Push Notifications           │
│  ┌──────────────────────────────────────┐  │
│  │ • Real-time delivery                 │  │
│  │ • Interactive buttons                │  │
│  │ • Rich content (images, sounds)      │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  Backup: Twilio SMS                         │
│  ┌──────────────────────────────────────┐  │
│  │ • Guaranteed delivery                │  │
│  │ • Works without app installed        │  │
│  │ • Critical alerts only               │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  Optional: Email (SendGrid/Resend)          │
│  ┌──────────────────────────────────────┐  │
│  │ • Daily summaries                    │  │
│  │ • Weekly reports                     │  │
│  │ • Audit trail                        │  │
│  └──────────────────────────────────────┘  │
│                                             │
└─────────────────────────────────────────────┘
```

## Security and Privacy Model

### Data Privacy Principles
1. **Local-first processing** for sensitive data
2. **Transient audio** - not stored permanently
3. **Encrypted communications** - HTTPS/TLS everywhere
4. **Opt-in sharing** - family access requires consent
5. **Minimal data collection** - only what's necessary

### Security Layers

```
┌─────────────────────────────────────────────┐
│          Security Architecture              │
├─────────────────────────────────────────────┤
│                                             │
│  1. Device Level                            │
│     • iOS keychain for sensitive data       │
│     • Biometric authentication (Face ID)    │
│     • Encrypted local storage               │
│                                             │
│  2. Transport Level                         │
│     • TLS 1.3 encryption                    │
│     • Certificate pinning                   │
│     • API key rotation                      │
│                                             │
│  3. Backend Level                           │
│     • Row-level security (Supabase RLS)     │
│     • JWT authentication                    │
│     • Rate limiting                         │
│     • Audit logging                         │
│                                             │
│  4. Data Level                              │
│     • AES-256 encryption at rest            │
│     • Minimal PII collection                │
│     • GDPR compliance                       │
│     • Right to deletion                     │
│                                             │
└─────────────────────────────────────────────┘
```

### Privacy Guarantees

| Data Type | Storage | Retention | Sharing |
|-----------|---------|-----------|---------|
| Voice audio | Transient (not stored) | Deleted immediately | Never |
| Transcripts | Supabase | 90 days | Family only (opt-in) |
| Photos | Transient (not stored) | Deleted after OCR | Never |
| Extracted text | Supabase | 90 days | Family only (opt-in) |
| Motion data | Processed locally | Event log only | Family (emergencies) |
| Location | GPS coordinates | 24 hours | Family (emergencies) |
| Reminders | Supabase | Until completed | Family only (opt-in) |

## Scalability Path

### Phase 1: Single User (Current)
- 1 senior + 2-3 family members
- Local-first architecture
- Minimal backend load

### Phase 2: Family Network (100 users)
- Multiple seniors per family
- Supabase free/pro tier
- ~$200/month operational cost

### Phase 3: Community (1000 users)
- Horizontal scaling via Supabase
- CDN for static assets
- Edge function optimization
- ~$2000/month operational cost

### Phase 4: Enterprise (10,000+ users)
```
┌─────────────────────────────────────────────┐
│         Enterprise Architecture             │
├─────────────────────────────────────────────┤
│                                             │
│  Load Balancer (Cloudflare)                │
│         ↓                                   │
│  API Gateway (Kong/AWS)                     │
│         ↓                                   │
│  App Servers (Kubernetes)                   │
│    • Stateless design                       │
│    • Auto-scaling                           │
│    • Multi-region                           │
│         ↓                                   │
│  Database (Supabase + Read Replicas)        │
│    • Horizontal sharding                    │
│    • Geographic distribution                │
│    • Automated backups                      │
│         ↓                                   │
│  Monitoring (Datadog/Sentry)                │
│    • Real-time alerts                       │
│    • Performance tracking                   │
│    • Error reporting                        │
│                                             │
└─────────────────────────────────────────────┘
```

### Scalability Metrics

| Metric | Phase 1 | Phase 2 | Phase 3 | Phase 4 |
|--------|---------|---------|---------|---------|
| Users | 1-10 | 100 | 1,000 | 10,000+ |
| Daily requests | <100 | 5,000 | 50,000 | 500,000+ |
| Storage | <1 GB | 10 GB | 100 GB | 1 TB+ |
| Response time | <3s | <3s | <3s | <3s |
| Uptime | 95% | 99% | 99.9% | 99.99% |

## Integration Points

### Current Integrations
- OpenAI GPT-4o (AI reasoning)
- Google Vision API (OCR)
- Expo Push Notifications (alerts)
- Supabase (backend)

### Future Integrations
- **Wearables:** Apple Watch, Fitbit (enhanced fall detection)
- **Smart Home:** Alexa, Google Home (voice control)
- **Health APIs:** Apple Health, HealthKit (vitals tracking)
- **Telehealth:** Video call integration for emergencies
- **Insurance:** Direct integration with health insurers
- **Care Networks:** Senior living facilities, care coordinators

## API Specifications

### Backend API Endpoints

```
POST /api/ask
Body: { user_id, transcript, context }
Response: { response_text, intent, confidence }

POST /api/explain
Body: { user_id, image_data }
Response: { extracted_text, summary, keywords }

POST /api/reminder
Body: { user_id, natural_language }
Response: { reminder_id, scheduled_time, title }

POST /api/fall_alert
Body: { user_id, event_data, location, battery }
Response: { alert_id, family_notified, timestamp }

GET /api/dashboard/:user_id
Response: { recent_activity, reminders, events, insights }
```

---

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React Native/Expo | Cross-platform mobile app |
| **UI Framework** | SwiftUI (native iOS) | Native iOS experience (Phase 2) |
| **Voice Input** | iOS Speech Recognition | Speech-to-text |
| **Voice Output** | ElevenLabs / Apple TTS | Text-to-speech |
| **AI** | OpenAI GPT-4o | Natural language understanding |
| **OCR** | Google Vision API | Document text extraction |
| **Backend** | Supabase | Database, auth, functions |
| **Database** | PostgreSQL (via Supabase) | Structured data storage |
| **Notifications** | Expo Push + Twilio | Multi-channel alerts |
| **Sensors** | CoreMotion / expo-sensors | Fall detection |
| **Analytics** | Mixpanel / Amplitude | Usage tracking |
| **Monitoring** | Sentry | Error tracking |

---

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Voice response time | < 3s | TBD |
| OCR processing | < 5s | TBD |
| Fall detection latency | < 2 min | TBD |
| App startup time | < 2s | ✅ ~1s |
| Battery impact | < 5%/day | TBD |
| False positive rate | < 5% | TBD |
| Uptime | > 99.9% | ✅ 100% (no backend yet) |

---

**Tagline:**

> "Milo: A voice that listens, an AI that cares."

---

## Next Steps

1. **Phase 1 (Current):** Deploy simple check-in MVP
2. **Phase 2:** Migrate to Supabase backend
3. **Phase 3:** Add voice + AI capabilities
4. **Phase 4:** Add fall detection + OCR
5. **Phase 5:** Launch family dashboard

See `MIGRATION_PLAN.md` for detailed implementation roadmap.

