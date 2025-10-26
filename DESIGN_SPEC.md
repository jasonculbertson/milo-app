# 🎨 Figma-Ready UI Checklist — Milo v0.2

## 1. Brand & Visual Identity

| Element             | Specification                                          | Notes                                   |
| ------------------- | ------------------------------------------------------ | --------------------------------------- |
| **Primary Color**   | `#6B8AFF` (Calm Blue)                                  | Warm, trustworthy tone                  |
| **Accent Color**    | `#FFD67B` (Soft Gold)                                  | Used for confirmation, positivity       |
| **Neutral Palette** | Light Grey `#F6F6F6`, Medium `#D0D0D0`, Dark `#444444` | High contrast, WCAG AAA                 |
| **Error / Alert**   | `#FF6A6A`                                              | Gentle red for fall alert notifications |
| **Success**         | `#69C181`                                              | Used for "I'm OK" state                 |
| **Background**      | `#FFFFFF`                                              | Clean, non-clinical look                |

### Color Palette (Full Specification)

```css
/* Primary */
--primary-50:  #F0F4FF;
--primary-100: #E0E9FF;
--primary-500: #6B8AFF; /* Main brand color */
--primary-600: #5B7AEF;
--primary-700: #4B6ADF;

/* Accent */
--accent-50:  #FFF9E6;
--accent-100: #FFF3CC;
--accent-500: #FFD67B; /* Main accent */
--accent-600: #FFC75B;

/* Neutral */
--neutral-50:  #F6F6F6;
--neutral-100: #EEEEEE;
--neutral-300: #D0D0D0;
--neutral-500: #888888;
--neutral-700: #444444;
--neutral-900: #222222;

/* Semantic */
--success: #69C181;
--error:   #FF6A6A;
--warning: #FFB84D;
--info:    #6B8AFF;
```

---

## 2. Typography

| Text Element           | Font           | Size | Weight   | Line Height | Notes                          |
| ---------------------- | -------------- | ---- | -------- | ----------- | ------------------------------ |
| **Display / Greeting** | SF Pro Rounded | 36pt | Semibold | 1.2         | Friendly header ("Hi Mary 👋") |
| **Body Text**          | SF Pro Text    | 20pt | Regular  | 1.5         | High readability for seniors   |
| **Buttons**            | SF Pro Rounded | 24pt | Semibold | 1.2         | Large and legible              |
| **Labels / Hints**     | SF Pro Text    | 16pt | Regular  | 1.4         | Optional captions              |
| **Micro Copy**         | SF Pro Text    | 14pt | Regular  | 1.3         | Timestamps, metadata           |

### Typography Scale (iOS)

```swift
// SwiftUI Font Extensions
.largeTitle   // 36pt, Semibold (Greeting)
.title        // 28pt, Semibold (Section headers)
.title2       // 24pt, Semibold (Buttons)
.body         // 20pt, Regular (Main content)
.callout      // 16pt, Regular (Labels)
.caption      // 14pt, Regular (Metadata)
```

### Accessibility: Dynamic Type Support

All text must scale with Dynamic Type from **Small** to **XXXL**:

| Style       | Default | XXXL  |
|-------------|---------|-------|
| Display     | 36pt    | 53pt  |
| Body        | 20pt    | 32pt  |
| Button      | 24pt    | 36pt  |

---

## 3. Core Components

### 🔘 Primary Button (Tap-to-Talk)

**Specifications:**
- **Shape:** Full circle, 120px diameter (88pt on iOS)
- **Icon:** Microphone (SF Symbol `mic.fill`, white)
- **Color:** Primary Blue (`#6B8AFF`)
- **Shadow:** `0 4px 12px rgba(107, 138, 255, 0.3)`
- **Touch area:** 132px (with 6px padding)

**State Variants:**

```swift
// Default
.background(Color(hex: "#6B8AFF"))
.shadow(color: Color(hex: "#6B8AFF").opacity(0.3), radius: 12, y: 4)

// Active (Listening)
.background(
    LinearGradient(
        colors: [Color(hex: "#6B8AFF"), Color(hex: "#5B7AEF")],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
)
.scaleEffect(1.05)
.animation(.easeInOut(duration: 1.2).repeatForever(autoreverses: true))

// Disabled
.background(Color(hex: "#D0D0D0"))
.opacity(0.6)
```

**Animation:** Pulse effect (1.2s ease-in-out, infinite)

---

### 🪧 Remind / Explain / Ask Buttons

**Layout:** 3 horizontally stacked cards, each 200×120px (150×90pt)

**Card Specifications:**
```swift
VStack(spacing: 12) {
    Image(systemName: icon)
        .font(.system(size: 32))
        .foregroundColor(.primary)
    
    Text(title)
        .font(.title3.weight(.semibold))
        .foregroundColor(.primary)
}
.frame(width: 150, height: 90)
.background(Color(hex: "#F6F6F6"))
.cornerRadius(16)
.shadow(color: .black.opacity(0.08), radius: 8, y: 2)
```

**Icons:**
- Remind: `clock.fill`
- Explain: `doc.text.fill`
- Ask: `bubble.left.fill`

**Interaction:**
- **Tap:** Scale to 0.95, then 1.05 (spring animation)
- **Hover (iPad):** Lift with shadow: `radius: 12, y: 4`

---

### 🧠 Response Card

**Specifications:**
- **Auto-expanding text bubble**
- **Max width:** 90% of screen width
- **Padding:** 20px (15pt)
- **Corner radius:** 20px (15pt)
- **Background:** `#E9F0FF` (Primary-50)
- **Text color:** `#222222`
- **Border:** 1px solid `#D0E4FF`

**Layout:**
```swift
HStack(alignment: .top, spacing: 12) {
    Image(systemName: "sparkles")
        .foregroundColor(Color(hex: "#6B8AFF"))
    
    VStack(alignment: .leading, spacing: 8) {
        Text(responseText)
            .font(.body)
            .foregroundColor(Color(hex: "#222222"))
        
        Button(action: replayVoice) {
            HStack {
                Image(systemName: "speaker.wave.2.fill")
                Text("Replay")
            }
            .font(.callout)
        }
    }
}
.padding(15)
.background(Color(hex: "#E9F0FF"))
.cornerRadius(15)
.overlay(
    RoundedRectangle(cornerRadius: 15)
        .stroke(Color(hex: "#D0E4FF"), lineWidth: 1)
)
```

**Animation:** Slide up + fade in (300ms cubic-bezier)

---

### 🧩 Reminder Tile

**Specifications:**
- **Layout:** Horizontal bar, 320×80px (240×60pt)
- **Corner radius:** 12px (9pt)
- **Background:** White with subtle shadow

**Structure:**
```swift
HStack(spacing: 16) {
    // Left: Icon
    Image(systemName: "clock.fill")
        .font(.title2)
        .foregroundColor(Color(hex: "#6B8AFF"))
        .frame(width: 44, height: 44)
        .background(Color(hex: "#F0F4FF"))
        .cornerRadius(8)
    
    // Center: Content
    VStack(alignment: .leading, spacing: 4) {
        Text(reminderTitle)
            .font(.body.weight(.medium))
        Text(timeDisplay)
            .font(.callout)
            .foregroundColor(.secondary)
    }
    
    Spacer()
    
    // Right: Done button
    Button("Done ✅") {
        completeReminder()
    }
    .font(.title3.weight(.semibold))
    .foregroundColor(.white)
    .padding(.horizontal, 16)
    .padding(.vertical, 8)
    .background(Color(hex: "#69C181"))
    .cornerRadius(8)
}
.padding(12)
.background(.white)
.cornerRadius(12)
.shadow(color: .black.opacity(0.08), radius: 8, y: 2)
```

**Overdue State:**
- Left border: 4px solid `#FF6A6A`
- Time text becomes red
- Subtle pulse animation

---

### 🆘 Fall Alert Banner

**Specifications:**
- **Full width** (safe area padding)
- **Height:** Auto (min 120px / 90pt)
- **Background:** `#FF6A6A`
- **Text:** White, bold, 22pt
- **Shadow:** `0 4px 16px rgba(255, 106, 106, 0.4)`

**Layout:**
```swift
VStack(spacing: 16) {
    HStack {
        Image(systemName: "exclamationmark.triangle.fill")
            .font(.largeTitle)
        Text("Looks like a hard bump — are you okay?")
            .font(.title2.weight(.bold))
    }
    .foregroundColor(.white)
    
    HStack(spacing: 12) {
        Button("I'm OK") {
            dismissAlert()
        }
        .buttonStyle(FallAlertButtonStyle(style: .primary))
        
        Button("Need Help") {
            requestHelp()
        }
        .buttonStyle(FallAlertButtonStyle(style: .secondary))
    }
}
.padding(20)
.frame(maxWidth: .infinity)
.background(Color(hex: "#FF6A6A"))
.cornerRadius(20, corners: [.bottomLeft, .bottomRight])
.shadow(color: Color(hex: "#FF6A6A").opacity(0.4), radius: 16, y: 4)
```

**Animation:** 
- Gentle shake (1s loop) until user responds
- Vibration pattern: [200ms, 100ms, 200ms]

---

## 4. Layout Guidelines

### Home Screen Layout

```
┌──────────────────────────────────────┐
│  Safe Area                           │
│                                      │
│  ┌────────────────────────────────┐ │
│  │ Good morning, Mary ☀️          │ │ 36pt, Semibold
│  └────────────────────────────────┘ │
│                                      │
│           ┌──────────┐              │
│           │          │              │
│           │    🎤    │              │ 120px circle
│           │          │              │ Primary button
│           └──────────┘              │
│                                      │
│  ┌──────┐  ┌──────┐  ┌──────┐     │
│  │ 📖   │  │ ⏰   │  │ 💬   │     │ 200x120px
│  │Explain│  │Remind│  │ Ask │     │ Secondary actions
│  └──────┘  └──────┘  └──────┘     │
│                                      │
│  ┌────────────────────────────────┐ │
│  │ All reminders done 🎉          │ │ Status ribbon
│  └────────────────────────────────┘ │
│                                      │
│  Safe Area                           │
└──────────────────────────────────────┘
```

### Explain Mode Layout

```
┌──────────────────────────────────────┐
│  ← Back        Explain               │
│                                      │
│  ┌────────────────────────────────┐ │
│  │                                │ │
│  │     📸 Take Photo              │ │
│  │        or                      │ │
│  │     📁 Choose from Library     │ │
│  │                                │ │
│  └────────────────────────────────┘ │
│                                      │
│  Result:                             │
│  ┌────────────────────────────────┐ │
│  │ ✨ This bill says your         │ │
│  │    payment is due Nov 3.       │ │
│  │                                │ │
│  │    🔊 Replay                   │ │
│  └────────────────────────────────┘ │
│                                      │
└──────────────────────────────────────┘
```

### Reminder Mode Layout

```
┌──────────────────────────────────────┐
│  ← Back        Reminders             │
│                                      │
│  ┌────────────────────────────────┐ │
│  │ 🎤 "Remind me to..."           │ │
│  └────────────────────────────────┘ │
│                                      │
│  Today                               │
│  ┌────────────────────────────────┐ │
│  │ ⏰ Take pills      [Done ✅]   │ │
│  │    8:00 PM                     │ │
│  └────────────────────────────────┘ │
│                                      │
│  ┌────────────────────────────────┐ │
│  │ ⏰ Call Laura      [Done ✅]   │ │
│  │    2:00 PM                     │ │
│  └────────────────────────────────┘ │
│                                      │
│  Tomorrow                            │
│  ┌────────────────────────────────┐ │
│  │ ⏰ Doctor visit   [Remind]     │ │
│  │    10:00 AM                    │ │
│  └────────────────────────────────┘ │
│                                      │
└──────────────────────────────────────┘
```

---

## 5. Copy & Tone Deck

### Voice & Personality Guidelines

**Milo's Character:**
- Warm but not overly emotional
- Clear and concise (≤20 words per response)
- Patient and never condescending
- Optimistic but realistic
- Uses simple, everyday language

### Example Copy by Context

| Situation   | Example Copy                                   | Tone Goal          |
| ----------- | ---------------------------------------------- | ------------------ |
| **Greeting**    | "Hi Mary 👋, how are you today?"               | Warm, simple       |
| **Fall Prompt** | "Looks like you took a bump. Are you okay?"    | Calm, non-alarming |
| **Success**     | "All set! I'll remind you at 8 PM."            | Encouraging        |
| **Confusion**   | "I'm not sure yet, but I can look that up."    | Honest, reassuring |
| **Error**       | "Hmm, something went wrong. Let's try again."  | Gentle recovery    |
| **Goodbye**     | "Talk soon! I'll be here when you need me."    | Friendly closure   |
| **Reminder**    | "Time for your pills! 💊"                      | Friendly nudge     |
| **Praise**      | "Great job! You're all caught up 🎉"           | Celebratory        |
| **Empathy**     | "I understand. Would you like to talk more?"   | Supportive         |

### Conversation Patterns

**Opening Conversations:**
```
Morning: "Good morning! ☀️"
Afternoon: "Good afternoon! 👋"
Evening: "Good evening! 🌙"
```

**Acknowledgments:**
```
Understanding: "I hear you."
Agreement: "That makes sense."
Encouragement: "You've got this!"
```

**Transitions:**
```
New topic: "What else can I help with?"
Clarification: "Just to make sure..."
Completion: "Anything else?"
```

---

## 6. Accessibility Requirements

### WCAG AAA Compliance

| Requirement | Target | Implementation |
|-------------|--------|----------------|
| **Color Contrast** | ≥ 7:1 (text/background) | All text passes AAA |
| **Touch Targets** | ≥ 44×44pt | All buttons meet standard |
| **Dynamic Type** | Support XXL scaling | All text scales properly |
| **VoiceOver** | Full navigation | All elements labeled |
| **Reduce Motion** | Respect system setting | Disable animations |
| **Haptic Feedback** | Key confirmations | Tap, Set, Alert |

### Dynamic Type Scaling

```swift
// Automatically scales with user preferences
Text("Hello")
    .font(.body)
    .lineLimit(nil) // Allow wrapping
    .minimumScaleFactor(0.8) // Max 20% reduction
```

### VoiceOver Labels

```swift
Button(action: startRecording) {
    Image(systemName: "mic.fill")
}
.accessibilityLabel("Start voice recording")
.accessibilityHint("Double tap to begin speaking to Milo")

// Reminder tile
VStack {
    Text(title)
    Text(time)
}
.accessibilityElement(children: .combine)
.accessibilityLabel("\(title) at \(time)")
.accessibilityHint("Swipe up to hear options")
```

### Reduce Motion Support

```swift
@Environment(\.accessibilityReduceMotion) var reduceMotion

var animation: Animation? {
    reduceMotion ? nil : .easeInOut(duration: 0.3)
}
```

### Haptic Feedback

```swift
import CoreHaptics

// Success haptic
let generator = UINotificationFeedbackGenerator()
generator.notificationOccurred(.success)

// Warning haptic (fall detected)
let generator = UINotificationFeedbackGenerator()
generator.notificationOccurred(.warning)

// Light tap confirmation
let generator = UIImpactFeedbackGenerator(style: .light)
generator.impactOccurred()
```

---

## 7. Component Library Structure (Figma)

### Figma File Organization

**Top-Level Pages:**

1. **🎨 Foundations**
   - Color Styles (Primary, Accent, Neutral, Semantic)
   - Text Styles (Display, Body, Button, Label)
   - Shadows (Elevation 1, 2, 3)
   - Spacing Scale (4, 8, 12, 16, 20, 24, 32, 40, 48)
   - Corner Radius (4, 8, 12, 16, 20, 24)

2. **🧩 Components**
   - Buttons (Primary, Secondary, Tertiary, Text)
   - Cards (Response, Reminder, Action)
   - Alerts (Fall, Reminder, Info)
   - Modals (Confirmation, Settings)
   - Input Fields (Voice, Text)

3. **📱 Patterns**
   - Home Screen
   - Explain Mode
   - Reminder List
   - Fall Alert State
   - Settings / Family

4. **🎬 Prototype Flows**
   - Onboarding Journey
   - Voice Interaction Flow
   - Reminder Creation Flow
   - Fall Event Flow
   - Family Setup Flow

5. **📤 Export / Handoff**
   - Dev-ready specs
   - Redlines with measurements
   - Asset export (1x, 2x, 3x)
   - Design tokens JSON

---

## 8. Prototyping Interactions (Figma Specs)

### Interaction Specifications

| Interaction    | Trigger         | Animation              | Duration | Easing         | Target          |
| -------------- | --------------- | ---------------------- | -------- | -------------- | --------------- |
| Tap-to-Talk    | Tap mic         | Scale 1.0 → 1.05 + pulse | 1200ms | ease-in-out | Listening state |
| Speak response | After GPT reply | Fade-in + slide up     | 300ms  | cubic-bezier | Response card   |
| Reminder due   | Local time      | Slide from top         | 400ms  | ease-out | Reminder Tile   |
| Fall detected  | Sensor event    | Shake + vibrate        | 1000ms | ease-in-out | Alert Banner    |
| Button press   | Touch down      | Scale 1.0 → 0.95       | 100ms  | ease-out | Button         |
| Card hover (iPad) | Mouse enter  | Lift (translateY -4px) | 200ms  | ease-out | Card           |

### Animation Curves

```css
/* Ease Out Expo - Smooth deceleration */
cubic-bezier(0.16, 1, 0.3, 1)

/* Ease In Out - Balanced */
cubic-bezier(0.45, 0, 0.55, 1)

/* Spring - Bouncy feel */
cubic-bezier(0.68, -0.55, 0.265, 1.55)
```

### Prototype Connection Map

```
Onboarding → Home
Home → Tap Mic → Listening → Processing → Response
Home → Explain → Camera → OCR → Summary
Home → Remind → Voice Input → Confirmation → Reminder List
Fall Detected → Alert Banner → [I'm OK] → Dismissed
                             → [Need Help] → Emergency Call
```

---

## 9. Assets & Icons

### Icon System: SF Symbols (iOS) / Lucide (Web)

| Icon             | SF Symbol Name       | Lucide Name      | Usage               |
| ---------------- | -------------------- | ---------------- | ------------------- |
| **Microphone**   | `mic.fill`           | `mic`            | Primary talk button |
| **Document**     | `doc.text.fill`      | `file-text`      | Explain mode        |
| **Clock**        | `clock.fill`         | `clock`          | Reminders           |
| **Bell**         | `bell.fill`          | `bell`           | Notifications       |
| **Alert**        | `exclamationmark.triangle.fill` | `alert-triangle` | Fall alerts |
| **Heart**        | `heart.fill`         | `heart`          | Health/care         |
| **User**         | `person.fill`        | `user`           | Profile             |
| **Contact**      | `person.2.fill`      | `users`          | Family contacts     |
| **Check**        | `checkmark.circle.fill` | `check-circle` | Success/Done     |
| **Speaker**      | `speaker.wave.2.fill` | `volume-2`      | Voice replay        |
| **Camera**       | `camera.fill`        | `camera`         | Photo capture       |
| **Message**      | `bubble.left.fill`   | `message-circle` | Ask/Chat           |

### Icon Sizing Guidelines

```swift
// Icon sizes
.smallIcon:  16pt (SF Symbol font size)
.mediumIcon: 24pt
.largeIcon:  32pt
.heroIcon:   48pt

// With backgrounds (buttons)
.iconButton: 44×44pt (minimum touch target)
.iconLarge:  60×60pt
```

### Custom Illustrations

**Needed for:**
- Empty states ("No reminders yet")
- Error states ("Connection lost")
- Success celebrations ("All done!")
- Onboarding screens

**Style Guide:**
- Line art, 2-3 colors max
- Rounded corners (8px)
- Friendly, non-medical aesthetic
- Consistent with brand colors

---

## 10. Deliverables

### Phase 1: Foundation
- ✅ Figma component library (5 pages)
- ✅ Color palette + text styles
- ✅ Design tokens (JSON export)

### Phase 2: Screens
- ✅ All main screens (Home, Explain, Remind, Settings)
- ✅ Modal overlays (Alerts, Confirmations)
- ✅ Empty/loading states

### Phase 3: Prototype
- ✅ Interactive prototype with animations
- ✅ User flow documentation
- ✅ Accessibility annotations

### Phase 4: Handoff
- ✅ Dev-ready specs with redlines
- ✅ Asset export (1x, 2x, 3x for iOS)
- ✅ Voice & copy deck for AI training
- ✅ Accessibility audit checklist

### Design Tokens (JSON Export)

```json
{
  "colors": {
    "primary": {
      "50": "#F0F4FF",
      "500": "#6B8AFF",
      "700": "#4B6ADF"
    },
    "accent": {
      "500": "#FFD67B"
    },
    "semantic": {
      "success": "#69C181",
      "error": "#FF6A6A"
    }
  },
  "typography": {
    "display": {
      "fontSize": "36pt",
      "fontWeight": "600",
      "lineHeight": "1.2"
    },
    "body": {
      "fontSize": "20pt",
      "fontWeight": "400",
      "lineHeight": "1.5"
    }
  },
  "spacing": {
    "xs": "4px",
    "sm": "8px",
    "md": "12px",
    "lg": "16px",
    "xl": "20px",
    "2xl": "24px"
  }
}
```

---

## 11. Motion & Animation Principles

### Animation Philosophy
- **Purposeful:** Every animation has a reason
- **Quick:** Under 400ms for most interactions
- **Natural:** Follow physics (ease-out for entering, ease-in for exiting)
- **Respectful:** Honor "Reduce Motion" accessibility setting

### Animation Guidelines

| Type | Duration | Easing | Use Case |
|------|----------|--------|----------|
| **Micro** | 100-200ms | ease-out | Button press, toggle |
| **Small** | 200-300ms | ease-in-out | Card appear, tooltip |
| **Medium** | 300-400ms | cubic-bezier | Modal open, panel slide |
| **Large** | 400-600ms | ease-out-expo | Page transition |
| **Ambient** | 1000-2000ms | ease-in-out (loop) | Pulse, breathing |

---

## Summary

> **Milo's design system combines Apple-grade simplicity with emotional warmth.**  
> **Every screen should feel like a conversation, not an interface.**

### Design Principles

1. **Clarity Over Cleverness** - Simple, obvious UI beats fancy but confusing
2. **Touch-First** - Designed for fingers, not mice
3. **Voice-Centered** - Voice is primary, taps are secondary
4. **Accessible by Default** - WCAG AAA from day one
5. **Warm, Not Clinical** - Healthcare tool that feels like care

### Key Differentiators

- **120px talk button** (largest in category)
- **20pt body text** (2× larger than most apps)
- **Minimal UI** (3-4 main actions max per screen)
- **Voice-first interactions** (tap once, speak, done)
- **Empathetic copy** (feels human, not robotic)

---

**Next Steps:**
1. Review and approve design spec
2. Set up Figma file with component library
3. Create hi-fi mockups for all screens
4. Build interactive prototype
5. Conduct usability testing with seniors (5-10 users)
6. Handoff to development team

**Questions?** Refer to:
- `PRD.md` for product requirements
- `TECHNICAL_SPEC.md` for API specifications
- `SYSTEM_ARCHITECTURE.md` for system design

