# Migration Plan: Simple Check-in → Full Milo AI Assistant

## Current State vs. PRD

### ✅ What We Have Now (MVP Check-in App)
- Daily check-in notifications
- Interactive push notifications ("I'm OK" button)
- Family dashboard (basic status)
- Local storage (AsyncStorage)
- Peer-to-peer architecture
- Simple authentication

### 🎯 What PRD Requires (Full AI Assistant)
- Voice-first interface with speech-to-text
- GPT-4o AI integration for Q&A
- OCR document explanation
- Natural language reminders
- Fall detection via accelerometer
- Text-to-speech responses
- Supabase backend (not local storage)
- Family dashboard with insights
- SMS alerts

## Gap Analysis

### Architecture Changes Needed

| Current | Required | Effort |
|---------|----------|--------|
| Local AsyncStorage | Supabase database | Medium |
| No AI | GPT-4o integration | High |
| Simple buttons | Voice interface | High |
| No speech | TTS + STT | Medium |
| No sensors | Fall detection (CoreMotion) | Medium |
| Basic notifications | Smart reminders | Medium |
| No OCR | Document scanning | Medium |
| Simple dashboard | Insights dashboard | High |

### Technology Stack Changes

| Component | Current | Needed | Action |
|-----------|---------|--------|--------|
| Database | AsyncStorage | Supabase | **Migrate** |
| AI | None | OpenAI GPT-4o | **Add** |
| Voice Input | None | iOS Speech Recognition | **Add** |
| Voice Output | None | ElevenLabs/Apple TTS | **Add** |
| OCR | None | Google Vision API | **Add** |
| Sensors | None | CoreMotion | **Add** |
| Backend | Peer-to-peer | Supabase Functions | **Migrate** |
| Notifications | Expo Push | Expo + Twilio SMS | **Extend** |

## Migration Strategy

### Option 1: Evolutionary (Recommended)
Build on existing foundation, add features incrementally.

**Pros:**
- Keep working check-in feature
- Lower risk
- Testable at each stage

**Cons:**
- Takes longer
- Some refactoring needed

### Option 2: Revolutionary
Rebuild from scratch following PRD exactly.

**Pros:**
- Clean architecture
- Optimized for new features
- No technical debt

**Cons:**
- Higher risk
- Lose working features temporarily
- More upfront work

## Recommended Approach: Evolutionary in 4 Phases

### Phase 1: Backend Migration (Week 1-2)
**Goal:** Move from local storage to Supabase

**Tasks:**
1. Set up Supabase project (reuse ChargeWise credentials or create new)
2. Create database schema (users, messages, reminders, events)
3. Migrate AsyncStorage → Supabase
4. Keep existing UI working
5. Add Supabase authentication

**Files to modify:**
- `src/config/storage.ts` → `src/config/supabase.ts`
- `src/contexts/AuthContext.tsx` (add Supabase auth)
- Database schema SQL

**Test:** Existing check-in flow still works

---

### Phase 2: Voice Interface (Week 3-4)
**Goal:** Add tap-to-talk with AI responses

**Tasks:**
1. Add iOS Speech Recognition
2. Integrate OpenAI GPT-4o API
3. Create voice UI (big tap button)
4. Add TTS (Apple Neural Voice first, ElevenLabs later)
5. Implement AI prompt engineering for "Milo" personality

**New files:**
- `src/services/speechService.ts`
- `src/services/aiService.ts`
- `src/services/ttsService.ts`
- `src/screens/VoiceScreen.tsx`

**API Keys needed:**
- OpenAI API key
- (Optional) ElevenLabs API key

**Test:** Ask "What's the weather?" → Get voice response

---

### Phase 3: Fall Detection + Smart Reminders (Week 5-6)
**Goal:** Add safety features

**Tasks:**
1. Implement CoreMotion fall detection
2. Add fall alert flow (local prompt + family notification)
3. Add natural language reminder parsing
4. Implement reminder notification system
5. Add reminder management UI

**New files:**
- `src/services/fallDetectionService.ts`
- `src/services/reminderService.ts`
- `src/screens/RemindersScreen.tsx`
- `src/screens/FallAlertScreen.tsx`

**Permissions needed:**
- Motion & Fitness
- Background app refresh

**Test:** 
- Simulate fall → Get alert
- "Remind me to take pills at 8pm" → Notification appears

---

### Phase 4: OCR + Enhanced Dashboard (Week 7-8)
**Goal:** Add document explanation and family insights

**Tasks:**
1. Integrate Google Vision API for OCR
2. Add camera/photo picker
3. Build document explanation flow
4. Enhance family dashboard with:
   - Recent interactions
   - Reminder history
   - Fall events
   - Activity insights
5. Add SMS alert fallback (Twilio)

**New files:**
- `src/services/ocrService.ts`
- `src/screens/DocumentScanScreen.tsx`
- Web dashboard (Next.js or React web app)

**API Keys needed:**
- Google Cloud Vision API key
- Twilio credentials (optional)

**Test:**
- Take photo of bill → Get explanation
- Family sees activity summary

---

## Implementation Plan

### Week 1-2: Backend Foundation

```bash
# 1. Set up Supabase
npm install @supabase/supabase-js

# 2. Create schema
# Run SQL in Supabase dashboard

# 3. Migrate storage layer
# Update all storage calls to use Supabase
```

**Deliverable:** App still works, now with Supabase backend

### Week 3-4: Voice + AI

```bash
# 1. Add AI services
npm install openai
npm install @react-native-voice/voice
npm install react-native-tts

# 2. Build voice UI
# Large circular "Tap to Talk" button

# 3. Wire up AI
# Speech → OpenAI → TTS
```

**Deliverable:** Working voice assistant (basic)

### Week 5-6: Safety Features

```bash
# 1. Add motion tracking
# Use expo-sensors or native CoreMotion

# 2. Build fall detection logic
# Accelerometer threshold + inactivity

# 3. Add reminder parsing
# Use OpenAI to extract time/action from text
```

**Deliverable:** Fall detection + smart reminders working

### Week 7-8: Polish + Launch

```bash
# 1. Add OCR
npm install react-native-vision-camera
# Google Cloud Vision API

# 2. Build family dashboard
# Next.js web app or React Native web

# 3. Add Twilio SMS
npm install twilio
```

**Deliverable:** Full PRD feature set complete

---

## Cost Analysis

### API Costs (Monthly estimates for 100 users)

| Service | Usage | Est. Cost |
|---------|-------|-----------|
| OpenAI GPT-4o | ~5k requests/mo | $50-100 |
| ElevenLabs TTS | ~10k chars/mo | $30-50 |
| Google Vision OCR | ~500 requests/mo | $10-20 |
| Twilio SMS | ~100 alerts/mo | $5-10 |
| Supabase | Database + Auth | $25 (Pro plan) |
| **Total** | | **$120-205/mo** |

### Revenue Model
- $9.99/user/month
- Break-even: ~12-20 paying users
- Target: 100 users = ~$1000/mo revenue

---

## Database Schema (Supabase)

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number TEXT UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('senior', 'family')),
  family_contact_id UUID REFERENCES users(id),
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Messages (voice interactions)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  transcript TEXT NOT NULL,
  response TEXT,
  intent TEXT, -- 'ask', 'explain', 'remind', 'chat'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Reminders
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  remind_at TIMESTAMP NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Events (falls, check-ins, alerts)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  event_type TEXT NOT NULL, -- 'fall', 'checkin', 'alert'
  severity TEXT, -- 'info', 'warning', 'critical'
  metadata JSONB,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Documents (OCR scans)
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  extracted_text TEXT,
  summary TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Risk Mitigation

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| API costs too high | Medium | High | Implement caching, rate limiting |
| Fall detection inaccurate | High | High | Extensive testing, adjustable sensitivity |
| Voice recognition poor | Medium | Medium | Fallback to typing, noise cancellation |
| Battery drain | Medium | High | Optimize sensor polling, background limits |
| Supabase migration bugs | Low | Medium | Thorough testing, gradual rollout |

### Product Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Too complex for seniors | High | High | Extensive user testing, simplify UI |
| Privacy concerns | Medium | High | Clear permissions, local processing first |
| Subscription resistance | Medium | High | Free trial, clear value prop |
| False fall alerts | High | Medium | Confirmation flow, adjustable settings |

---

## Testing Strategy

### Phase 1 Testing (Backend)
- [ ] All existing features work with Supabase
- [ ] Data syncs across devices
- [ ] Authentication works
- [ ] No data loss

### Phase 2 Testing (Voice)
- [ ] Speech recognition accuracy > 90%
- [ ] Response time < 3s
- [ ] Voice output clear and natural
- [ ] Works in noisy environments

### Phase 3 Testing (Safety)
- [ ] Fall detection accuracy > 90%
- [ ] False positives < 5%
- [ ] Reminders fire on time
- [ ] Alert system reliable

### Phase 4 Testing (OCR)
- [ ] OCR accuracy > 95%
- [ ] Explanation quality validated
- [ ] Dashboard shows accurate data
- [ ] SMS alerts delivered

---

## Success Criteria

### MVP Success (8 weeks)
- [ ] Voice assistant works reliably
- [ ] Fall detection functional
- [ ] Reminders working
- [ ] 10 beta users satisfied (NPS > 40)
- [ ] < 5% false fall alerts
- [ ] App doesn't drain battery (< 5%/day)

### Launch Success (12 weeks)
- [ ] 50+ paying subscribers
- [ ] NPS > 50
- [ ] 5+ days/week engagement
- [ ] < 3 critical bugs per week
- [ ] 70% retention at 3 months

---

## Next Steps

1. **Decision:** Approve migration plan
2. **Setup:** Create Supabase project, get API keys
3. **Start:** Begin Phase 1 (Backend Migration)
4. **Testing:** Set up TestFlight with 5-10 beta users
5. **Iterate:** Weekly reviews and adjustments

**Estimated Timeline:** 8-12 weeks to full PRD implementation

**Estimated Cost:** $500-1000 in API/service costs during development

**Recommended:** Start with Phase 1 this week, validate architecture before proceeding.

