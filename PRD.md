# Milo Product Requirements Document

## 1. Overview

Milo is a voice-first, mobile AI assistant that helps non-tech-savvy adults—especially seniors—navigate digital life safely and independently.
It explains confusing documents, sets reminders, answers questions, and provides peace of mind through simple, empathetic interaction.

Milo now includes Fall Awareness, a feature that passively monitors motion via smartphone sensors and alerts family members if the user appears to have fallen and is unresponsive.

**Product Vision:** "Technology that feels like care."

## 2. Problem Statement

Older adults struggle with increasingly digital systems (insurance portals, online bills, medication schedules).
AI tools like ChatGPT are too complex; assistants like Siri lack warmth and comprehension.

Families want reassurance that their parents are safe and supported, without forcing them into complex devices or expensive monitoring systems.

**Opportunity:** Build a simple, friendly, always-available helper that feels human and protects independence.

## 3. Goals & Success Metrics

| Goal | Metric | Target |
|------|--------|--------|
| Ease of use | Complete any task in ≤ 2 taps | ≥ 90% |
| Daily engagement | Days active per week | ≥ 5 days |
| Retention | Subscribers retained at 3 months | ≥ 70% |
| Satisfaction | NPS (families + seniors) | ≥ 50 |
| Fall Awareness reliability | Confirmed fall alerts (true positives) | ≥ 90% accuracy |
| False positives | Incorrect fall alerts | ≤ 5% |

## 4. Target Users & Personas

### 👵 Primary User: Senior (65–85)
- Uses iPhone or iPad
- Limited comfort with apps or typing
- May live alone or semi-independently
- **Needs:** clarity, warmth, reassurance, safety

### 👩 Secondary User: Adult Child (35–60)
- Tech-savvy and time-constrained
- Pays for subscription
- Wants passive reassurance
- **Needs:** visibility, trust, low friction

## 5. Experience & User Journey

### Onboarding
1. Family member or senior installs app
2. Voice onboarding: "Hi, I'm Milo. Tap me when you want help."
3. Optional setup: family contact + fall alerts

### Core Experience

| Task | Example Interaction | Outcome |
|------|---------------------|---------|
| Ask | "What's the weather?" / "Who is the president?" | Milo speaks a short answer |
| Explain | "What does this letter mean?" + photo | Milo OCRs and explains simply |
| Remind | "Remind me to take pills at 8pm" | Push notification reminder |
| Safety Check (optional) | Passive monitoring | Alerts if unresponsive after a fall pattern |
| Conversation | "Good morning, Milo" | "Hi Mary, nice to see you 🌞." |

### Family Experience
- Receives weekly summary or alert if a fall occurs or reminders missed
- Optional web dashboard: recent interactions, mood tone (later phase)

## 6. Functional Requirements

### 6.1 Core Features

#### Tap-to-Talk Interface
- Single button to start/stop voice input
- Converts speech → text → GPT reasoning → voice output

#### Explain (OCR Summarization)
- User takes photo or screenshot
- OCR (Google Vision API) extracts text
- GPT summarizes: "This bill says your payment is due Nov 3."

#### Reminders
- Natural language recognition ("Remind me in 2 hours")
- Stored in Supabase
- Delivered via iOS local notification with large, clear button ("Done ✅")

#### Friendly Voice Output
- TTS (Apple or ElevenLabs)
- Warm, human-like tone; ≤ 20 words per response
- Phrases tuned for empathy and brevity

#### Family Dashboard (Phase 2)
- Shows reminders set, explanations requested, and safety events
- Adult child can add reminders or receive alerts

### 6.2 New Feature: Fall Awareness & Alert

**Goal:** Detect potential falls using smartphone sensors and alert family if no response.

#### Detection Logic
- Use accelerometer + gyroscope via iOS CoreMotion
- Fall event = rapid acceleration (>2.5 g) followed by inactivity (>60s)
- Optional: use microphone amplitude spike as secondary signal

#### Flow
1. **Event detected** → Local voice prompt:
   "Looks like you took a hard bump — are you okay?"
   
2. **Buttons:** [I'm OK] [Need Help]

3. **No response after 60s** → escalates:
   - Sends notification/SMS to family contact:
   - "Milo detected a possible fall at 3:42 PM and hasn't received a response."
   - Includes timestamp, optional location, battery level

#### System Behavior
- Runs in background (requires motion permission)
- Only sends event metadata (no audio, video, or continuous GPS)
- User can disable or adjust sensitivity

#### Acceptance Criteria

| Criteria | Success Definition |
|----------|-------------------|
| False positives | < 5% (validated via pilot) |
| Latency | Family notified < 2 min after unconfirmed fall |
| User recovery | "I'm OK" cancels alert and logs event |

## 7. Technical Architecture

### Frontend (iOS)
- SwiftUI interface (large-touch layout, 44pt+ targets)
- AVFoundation (voice record/playback)
- CoreMotion (fall detection)
- NotificationKit (local reminders)
- Accessibility: dynamic text scaling, voiceover support

### Backend (Supabase)

| Table | Description |
|-------|-------------|
| users | user profile, family contact, preferences |
| messages | voice transcripts and summaries |
| reminders | reminders with timestamps |
| events | fall alerts, activity logs |

**Authentication:** magic link or family-managed pairing

**Functions:**
- `/ask` (voice → GPT → voice)
- `/explain` (OCR → GPT summary)
- `/reminder` (create/update)
- `/fall_alert` (trigger notification)

### AI Layer
- GPT-4o for natural language reasoning
- Prompt template:
  ```
  "You are Milo, a kind, calm AI who helps older adults. 
   Always respond warmly and briefly."
  ```
- Safety guardrails to detect scam/spam explanations

### Voice Layer
- ElevenLabs TTS or Apple Neural Voice
- Voice persona: calm, mid-speed, gender-neutral

### Notifications
- iOS push for reminders and AI messages
- Optional Twilio fallback (SMS to family for alerts)

## 8. Non-Functional Requirements

| Attribute | Target |
|-----------|--------|
| Accessibility | WCAG AAA |
| Performance | < 3s response time |
| Privacy | No permanent storage of audio or images |
| Battery | < 5% per day impact including motion tracking |
| Security | AES-256 data encryption, HTTPS |
| Reliability | 99% uptime for backend + reminders |
| Localization | US English v1; future: Spanish v2 |

## 9. Launch Plan

### Phase 1 — Prototype (0–6 weeks)
- Implement Ask / Explain / Remind
- Add Fall Awareness passive listener (test internally)
- TestFlight with 10 seniors and 5 families

### Phase 2 — Beta (6–12 weeks)
- Add Family Dashboard MVP
- Add SMS alert fallback
- Refine UI based on feedback (contrast, phrasing)

### Phase 3 — Public Launch (Q2 2026)
- Launch on iOS App Store
- Family subscription ($9.99/mo)
- Partnerships: senior housing groups, insurers

### Phase 4 — Expansion (Q3 2026)
- Android support
- Multi-language support (EN/ES)
- B2B white-label licensing

## 10. Risks & Mitigations

| Risk | Type | Mitigation |
|------|------|------------|
| Seniors find setup confusing | UX | One-tap onboarding; family-assisted setup |
| AI misunderstanding sensitive letters | Product | Prompt tuning + safe summarization |
| False fall alerts | Tech | Two-signal logic + human confirmation |
| Battery drain | Tech | Background sampling intervals (every few seconds) |
| Privacy concerns | Legal | Transparent permissions + on-device processing |
| Medical compliance | Regulatory | Avoid "medical device" claims; position as "awareness tool" |

## 11. Appendices

### Future Ideas
- "Mood & Memory" tracking ("You sounded tired today, want a break reminder?")
- "Friend Mode" for social connection prompts
- Home IoT tie-in (light control, security integration)
- Integration with health APIs (Apple Health / Fitbit)
- Caregiver ChatGPT plugin (summarizes parent interactions)

---

**Summary Tagline:** *Milo: Tap and talk — a kind AI that helps, explains, and looks out for you.*

