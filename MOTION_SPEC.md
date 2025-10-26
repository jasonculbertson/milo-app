# 🎞️ Motion & Microinteraction Specification — Milo v0.2

> This spec defines the timing, easing, and behavioral rules for animations and haptic feedback in Milo's iOS app. It complements the Figma UI checklist and provides front-end implementation details for SwiftUI or React Native.

---

## 1. Motion Principles

| Principle       | Description                                                      | Example                                           |
| --------------- | ---------------------------------------------------------------- | ------------------------------------------------- |
| **Warmth**      | Every animation should feel gentle and caring, never abrupt.     | Slow ease-in, subtle scaling.                     |
| **Reassurance** | Use small, predictable feedback to signal completion or success. | Haptic "soft tap" after reminders set.            |
| **Focus**       | Animation should guide the user's attention, not decorate.       | Highlight mic activation, fade inactive elements. |
| **Safety**      | Avoid fast flashes, high contrast motion, or sudden transitions. | Use 200–500ms durations only.                     |

### Design Philosophy

**Motion as Communication:**
- Animations tell the user "I heard you"
- They provide visual feedback for voice interactions
- They create a sense of care and attention

**Accessibility First:**
- All motion respects `Reduce Motion` setting
- Haptics provide non-visual feedback
- No motion is purely decorative

---

## 2. Global Motion Settings

| Parameter                             | Value                                                                                |
| ------------------------------------- | ------------------------------------------------------------------------------------ |
| **Default Duration**                  | 300ms                                                                                |
| **Long Duration (onboarding, alert)** | 600ms                                                                                |
| **Easing**                            | Cubic-bezier(0.25, 0.1, 0.25, 1) — iOS standard ease-in-out                          |
| **Stagger Delay**                     | 80ms between sequential elements                                                     |
| **Haptic Feedback Mapping**           | Success → `.success`; Reminder → `.light`; Error → `.error`; Fall Alert → `.warning` |

### SwiftUI Implementation

```swift
// Global animation constants
struct MotionTokens {
    static let fast = 0.15
    static let medium = 0.3
    static let slow = 0.6
    static let stagger = 0.08
    
    static let standardEasing = Animation.easeInOut(duration: medium)
    static let gentleEasing = Animation.timingCurve(0.33, 0, 0.67, 1, duration: medium)
    static let springEasing = Animation.spring(response: 0.3, dampingFraction: 0.7)
}
```

---

## 3. Microinteractions by Component

### 🎙️ Tap-to-Talk Button

The primary interaction in Milo - must feel responsive and reassuring.

| State               | Animation                                        | Duration  | Feedback            |
| ------------------- | ------------------------------------------------ | --------- | ------------------- |
| **Idle → Active**       | Scale up 1.05x + radial pulse gradient           | 400ms     | Light haptic (tap)  |
| **Active (Listening)**  | Continuous breathing pulse (opacity 0.7↔1.0)     | 1.2s loop | Subtle ambient glow |
| **Active → Processing** | Rotate mic icon 90° + fade to "thinking" state   | 250ms     | None                |
| **Processing → Reply**  | Mic fills with color, small bounce on completion | 350ms     | Success haptic      |

#### SwiftUI Implementation

```swift
struct TapToTalkButton: View {
    @State private var isListening = false
    @State private var isProcessing = false
    
    var body: some View {
        Button(action: startListening) {
            Image(systemName: "mic.fill")
                .font(.system(size: 48))
                .foregroundColor(.white)
        }
        .frame(width: 120, height: 120)
        .background(
            Circle()
                .fill(Color.blue)
                .shadow(color: .blue.opacity(0.3), radius: isListening ? 20 : 10)
        )
        .scaleEffect(isListening ? 1.05 : 1.0)
        .rotationEffect(.degrees(isProcessing ? 90 : 0))
        .opacity(isListening ? breathingOpacity : 1.0)
        .animation(.easeInOut(duration: 0.4), value: isListening)
        .animation(.easeInOut(duration: 0.25), value: isProcessing)
        .onChange(of: isListening) { newValue in
            if newValue {
                let generator = UIImpactFeedbackGenerator(style: .light)
                generator.impactOccurred()
            }
        }
    }
    
    // Breathing animation
    var breathingOpacity: Double {
        isListening ? 0.85 : 1.0
    }
}

// Continuous pulse animation
.onAppear {
    withAnimation(.easeInOut(duration: 1.2).repeatForever(autoreverses: true)) {
        breathingOpacity = 0.7
    }
}
```

#### Animation Timeline

```
0ms    → Tap detected
50ms   → Haptic fires
100ms  → Scale begins (1.0 → 1.05)
400ms  → Scale complete + pulse starts
1200ms → Pulse cycle 1 complete
...    → Continue until speech ends
```

---

### 💬 Response Card

Speech bubbles appear with personality - like someone is typing back to you.

| Event             | Animation                                    | Duration |
| ----------------- | -------------------------------------------- | -------- |
| **New reply appears** | Slide up + fade in from bottom (20px offset) | 300ms    |
| **Subsequent reply**  | Stack bounce (2px vertical offset)           | 150ms    |
| **Voice replay tap**  | Play icon pulse (scale 1.1x → 1.0x)          | 200ms    |

#### SwiftUI Implementation

```swift
struct ResponseCard: View {
    @State private var isVisible = false
    let response: String
    
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: "sparkles")
                .foregroundColor(.blue)
            
            VStack(alignment: .leading) {
                Text(response)
                    .font(.body)
                
                Button(action: replayVoice) {
                    HStack {
                        Image(systemName: "speaker.wave.2.fill")
                        Text("Replay")
                    }
                }
            }
        }
        .padding()
        .background(Color.blue.opacity(0.1))
        .cornerRadius(15)
        .offset(y: isVisible ? 0 : 20)
        .opacity(isVisible ? 1 : 0)
        .onAppear {
            withAnimation(.easeOut(duration: 0.3)) {
                isVisible = true
            }
        }
    }
}
```

#### Optional: Type-on Effect

```swift
struct TypingText: View {
    let fullText: String
    @State private var displayedText = ""
    
    var body: some View {
        Text(displayedText)
            .onAppear {
                typeText()
            }
    }
    
    func typeText() {
        for (index, character) in fullText.enumerated() {
            DispatchQueue.main.asyncAfter(deadline: .now() + Double(index) * 0.03) {
                displayedText.append(character)
            }
        }
    }
}
```

---

### ⏰ Reminder Tile

Reminders feel organized and satisfying to complete.

| State              | Animation                                    | Duration | Notes              |
| ------------------ | -------------------------------------------- | -------- | ------------------ |
| **New reminder**       | Slide-in from bottom + fade (opacity 0 → 1)  | 250ms    | Sequential stagger |
| **Reminder due**       | Banner drop from top (overshoot 5px, settle) | 400ms    | Warning haptic     |
| **Reminder completed** | Tile color fade → green; checkmark draw      | 300ms    | Success haptic     |

#### SwiftUI Implementation

```swift
struct ReminderTile: View {
    @State private var isCompleted = false
    let reminder: Reminder
    
    var body: some View {
        HStack {
            Image(systemName: "clock.fill")
                .foregroundColor(.blue)
            
            VStack(alignment: .leading) {
                Text(reminder.title)
                    .font(.body.weight(.medium))
                Text(reminder.time)
                    .font(.callout)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            Button("Done ✅") {
                withAnimation(.easeInOut(duration: 0.3)) {
                    isCompleted = true
                }
                
                let generator = UINotificationFeedbackGenerator()
                generator.notificationOccurred(.success)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
            .background(isCompleted ? Color.green : Color.blue)
            .foregroundColor(.white)
            .cornerRadius(8)
        }
        .padding()
        .background(isCompleted ? Color.green.opacity(0.1) : Color.white)
        .cornerRadius(12)
        .animation(.easeInOut(duration: 0.3), value: isCompleted)
    }
}

// Staggered list appearance
ForEach(Array(reminders.enumerated()), id: \.element.id) { index, reminder in
    ReminderTile(reminder: reminder)
        .transition(.move(edge: .bottom).combined(with: .opacity))
        .animation(.easeOut(duration: 0.25).delay(Double(index) * 0.08))
}
```

---

### 📄 Explain Mode (OCR Summary)

Document scanning feels instant and magical.

| Event          | Animation                             | Duration | Notes                 |
| -------------- | ------------------------------------- | -------- | --------------------- |
| **Photo captured** | Flash white overlay (opacity 0.2 → 0) | 200ms    | Camera shutter sound  |
| **Summary bubble** | Expand + fade (scale 0.95 → 1)        | 300ms    | Text type-on optional |

#### SwiftUI Implementation

```swift
struct ExplainView: View {
    @State private var showFlash = false
    @State private var showSummary = false
    @State private var summaryScale: CGFloat = 0.95
    
    var body: some View {
        ZStack {
            // Camera view
            CameraView()
            
            // Flash effect
            if showFlash {
                Color.white
                    .opacity(0.2)
                    .ignoresSafeArea()
                    .transition(.opacity)
            }
            
            // Summary result
            if showSummary {
                VStack {
                    Spacer()
                    
                    ResponseCard(response: summary)
                        .scaleEffect(summaryScale)
                        .padding()
                }
            }
        }
    }
    
    func capturePhoto() {
        // Flash effect
        withAnimation(.easeOut(duration: 0.2)) {
            showFlash = true
        }
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) {
            showFlash = false
        }
        
        // Process image...
        
        // Show summary
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            withAnimation(.easeOut(duration: 0.3)) {
                showSummary = true
                summaryScale = 1.0
            }
        }
    }
}
```

---

### 🚨 Fall Alert Banner

Critical but non-threatening - gets attention without panic.

| Event              | Animation                                 | Duration        | Notes                    |
| ------------------ | ----------------------------------------- | --------------- | ------------------------ |
| **Detected**           | Slide down from top + vibrate pattern     | 500ms           | `.warning` haptic        |
| **Awaiting response**  | Gentle shake (5° rotation, loop every 1s) | until dismissed | Non-threatening movement |
| **"I'm OK" tapped**    | Shake stops → fade to green "All clear"   | 400ms           | `.success` haptic        |
| **"Need Help" tapped** | Banner expands → sends alert              | 600ms           | `.error` haptic + tone   |

#### SwiftUI Implementation

```swift
struct FallAlertBanner: View {
    @State private var isShaking = false
    @State private var shakeDegrees: Double = 0
    @State private var isResolved = false
    
    var body: some View {
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
                    handleImOK()
                }
                .buttonStyle(FallAlertButtonStyle(style: .primary))
                
                Button("Need Help") {
                    handleNeedHelp()
                }
                .buttonStyle(FallAlertButtonStyle(style: .secondary))
            }
        }
        .padding(20)
        .frame(maxWidth: .infinity)
        .background(isResolved ? Color.green : Color.red)
        .cornerRadius(20, corners: [.bottomLeft, .bottomRight])
        .shadow(color: Color.red.opacity(0.4), radius: 16, y: 4)
        .rotationEffect(.degrees(shakeDegrees))
        .offset(y: isShaking ? 0 : -200)
        .animation(.easeOut(duration: 0.5), value: isShaking)
        .onAppear {
            isShaking = true
            
            // Trigger haptic
            let generator = UINotificationFeedbackGenerator()
            generator.notificationOccurred(.warning)
            
            // Start gentle shake
            startShaking()
        }
    }
    
    func startShaking() {
        withAnimation(.easeInOut(duration: 1.0).repeatForever(autoreverses: true)) {
            shakeDegrees = 2
        }
    }
    
    func handleImOK() {
        shakeDegrees = 0
        
        withAnimation(.easeInOut(duration: 0.4)) {
            isResolved = true
        }
        
        let generator = UINotificationFeedbackGenerator()
        generator.notificationOccurred(.success)
        
        // Dismiss after 2s
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            withAnimation {
                isShaking = false
            }
        }
    }
    
    func handleNeedHelp() {
        let generator = UINotificationFeedbackGenerator()
        generator.notificationOccurred(.error)
        
        // Send emergency alert...
    }
}
```

---

## 4. Navigation Transitions

Smooth, predictable transitions between screens.

| Screen               | Transition Type      | Duration | Notes                            |
| -------------------- | -------------------- | -------- | -------------------------------- |
| **Home → Explain**       | Fade cross-dissolve  | 350ms    | Maintain calm tone               |
| **Home → Reminder List** | Slide up             | 300ms    | Feels intuitive (timeline stack) |
| **Settings → Family**    | Slide right          | 300ms    | Consistent with iOS patterns     |
| **Alert → Home**         | Fade out, scale down | 400ms    | Indicates closure and safety     |

### SwiftUI NavigationStack Implementation

```swift
NavigationStack {
    HomeView()
        .navigationDestination(for: Destination.self) { destination in
            switch destination {
            case .explain:
                ExplainView()
                    .transition(.opacity)
                    .animation(.easeInOut(duration: 0.35), value: destination)
                
            case .reminders:
                RemindersView()
                    .transition(.move(edge: .bottom))
                    .animation(.easeInOut(duration: 0.3), value: destination)
                
            case .settings:
                SettingsView()
                    .transition(.move(edge: .trailing))
                    .animation(.easeInOut(duration: 0.3), value: destination)
            }
        }
}
```

---

## 5. Audio & Haptic Layer

Sound and touch work together to create a multi-sensory experience.

| Event                | Sound                    | Haptic     | Notes |
| -------------------- | ------------------------ | ---------- | ----- |
| **Voice reply complete** | Soft "ding"              | `.success` | Warm, positive |
| **Reminder triggered**   | Gentle bell              | `.light`   | Non-intrusive |
| **Fall detected**        | Low-frequency pulse (1s) | `.warning` | Attention-getting but calm |
| **System error**         | Muted tone               | `.error`   | Indicates issue without alarm |
| **Onboarding greet**     | Warm chime (C major)     | None       | Welcoming |

### Implementation Notes

Audio cues should be:
- **Optional** - User can disable in settings
- **Volume-adjustable** - Respect system volume
- **High quality** - 48kHz, uncompressed
- **Short** - Under 500ms duration

### SwiftUI Audio Implementation

```swift
import AVFoundation

class SoundManager {
    static let shared = SoundManager()
    
    private var audioPlayers: [String: AVAudioPlayer] = [:]
    
    func play(_ sound: SoundType) {
        guard let url = Bundle.main.url(forResource: sound.filename, withExtension: "wav") else {
            return
        }
        
        do {
            let player = try AVAudioPlayer(contentsOf: url)
            player.volume = UserDefaults.standard.float(forKey: "soundVolume")
            player.play()
            audioPlayers[sound.filename] = player
        } catch {
            print("Error playing sound: \(error)")
        }
    }
}

enum SoundType {
    case success
    case reminder
    case fallAlert
    case error
    case greeting
    
    var filename: String {
        switch self {
        case .success: return "success-ding"
        case .reminder: return "gentle-bell"
        case .fallAlert: return "alert-pulse"
        case .error: return "error-tone"
        case .greeting: return "warm-chime"
        }
    }
}
```

### Haptic Feedback Implementation

```swift
class HapticManager {
    static let shared = HapticManager()
    
    func trigger(_ type: HapticType) {
        switch type {
        case .success:
            let generator = UINotificationFeedbackGenerator()
            generator.notificationOccurred(.success)
            
        case .warning:
            let generator = UINotificationFeedbackGenerator()
            generator.notificationOccurred(.warning)
            
        case .error:
            let generator = UINotificationFeedbackGenerator()
            generator.notificationOccurred(.error)
            
        case .light:
            let generator = UIImpactFeedbackGenerator(style: .light)
            generator.impactOccurred()
            
        case .medium:
            let generator = UIImpactFeedbackGenerator(style: .medium)
            generator.impactOccurred()
            
        case .heavy:
            let generator = UIImpactFeedbackGenerator(style: .heavy)
            generator.impactOccurred()
        }
    }
}

enum HapticType {
    case success, warning, error, light, medium, heavy
}
```

---

## 6. Testing & QA

### Automated Tests

```swift
func testMicButtonAnimation() {
    let button = TapToTalkButton()
    
    // Verify scale effect
    XCTAssertEqual(button.scaleEffect, 1.0, "Initial scale should be 1.0")
    
    button.startListening()
    
    // After animation
    DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
        XCTAssertEqual(button.scaleEffect, 1.05, "Listening scale should be 1.05")
    }
}
```

### Manual QA Checklist

| Test          | Expected Behavior                 | Pass/Fail | Notes |
| ------------- | --------------------------------- | --------- | ----- |
| **Tap mic**       | Button grows + pulse              | ✅        | Feedback visible within 0.4s |
| **Fall alert**    | Banner drops + vibrates           | ✅        | <1s after detection          |
| **Reminder done** | Color fade green + success haptic | ✅        | <0.5s delay                  |
| **OCR summary**   | Expand + fade                     | ✅        | Smooth, no jitter             |
| **Navigation**    | Smooth transitions                | ✅        | No visual glitches            |
| **Reduce Motion** | Respects accessibility setting    | ✅        | Crossfade only               |

### Performance Benchmarks

| Metric | Target | Measurement |
|--------|--------|-------------|
| Animation frame rate | 60fps | Use Instruments |
| Button response time | <100ms | Tap to visual feedback |
| Audio playback latency | <50ms | Audio start to play |
| Haptic trigger latency | <20ms | Touch to vibration |

---

## 7. Motion Accessibility Modes

### Reduce Motion Support

When `UIAccessibility.isReduceMotionEnabled` is true:

**Changes:**
- Disable: Shaking, pulsing, parallax
- Replace with: Crossfade, simple opacity changes
- Keep: Haptic feedback, color changes
- Simplify: Use direct state changes instead of animated transitions

#### Implementation

```swift
@Environment(\.accessibilityReduceMotion) var reduceMotion

var animation: Animation? {
    reduceMotion ? nil : .easeInOut(duration: 0.3)
}

// Use in views
.scaleEffect(isActive ? 1.05 : 1.0)
.animation(animation, value: isActive)
```

### Reduce Transparency

```swift
@Environment(\.accessibilityReduceTransparency) var reduceTransparency

var backgroundColor: Color {
    reduceTransparency ? .white : .white.opacity(0.95)
}
```

### Differentiate Without Color

For color-blind users, add icons/shapes:

```swift
@Environment(\.accessibilityDifferentiateWithoutColor) var differentiateWithoutColor

HStack {
    if differentiateWithoutColor {
        Image(systemName: "checkmark.circle.fill")
    }
    Text("Success")
        .foregroundColor(.green)
}
```

---

## 8. Animation Tokens (for Design & Dev)

Design tokens ensure consistency across the app.

| Token             | Description                        | Default                     | Usage |
| ----------------- | ---------------------------------- | --------------------------- | ----- |
| `motion.fast`     | Quick UI feedback                  | 150ms                       | Button press, toggle |
| `motion.medium`   | Default transitions                | 300ms                       | Most animations |
| `motion.slow`     | Large modals, alerts               | 600ms                       | Critical UI changes |
| `easing.standard` | cubic-bezier(0.25, 0.1, 0.25, 1)   | iOS default                 | General purpose |
| `easing.gentle`   | cubic-bezier(0.33, 0.0, 0.67, 1.0) | Softer feel                 | Subtle transitions |
| `easing.spring`   | Spring animation                   | response: 0.3, damping: 0.7 | Bouncy feedback |
| `shadow.depth1`   | Subtle UI lift                     | 0 2px 8px rgba(0,0,0,0.15)  | Cards |
| `shadow.depth2`   | Alert emphasis                     | 0 4px 16px rgba(0,0,0,0.25) | Modals, alerts |

### Export as JSON (for design tools)

```json
{
  "motion": {
    "fast": "150ms",
    "medium": "300ms",
    "slow": "600ms"
  },
  "easing": {
    "standard": "cubic-bezier(0.25, 0.1, 0.25, 1)",
    "gentle": "cubic-bezier(0.33, 0.0, 0.67, 1.0)"
  },
  "shadow": {
    "depth1": {
      "x": 0,
      "y": 2,
      "blur": 8,
      "color": "rgba(0, 0, 0, 0.15)"
    },
    "depth2": {
      "x": 0,
      "y": 4,
      "blur": 16,
      "color": "rgba(0, 0, 0, 0.25)"
    }
  }
}
```

---

## 9. Advanced: Custom Animations

### Breathing Animation (Continuous Pulse)

```swift
struct BreathingModifier: ViewModifier {
    @State private var isBreathing = false
    let duration: Double
    let minOpacity: Double
    let maxOpacity: Double
    
    func body(content: Content) -> some View {
        content
            .opacity(isBreathing ? maxOpacity : minOpacity)
            .onAppear {
                withAnimation(.easeInOut(duration: duration).repeatForever(autoreverses: true)) {
                    isBreathing = true
                }
            }
    }
}

extension View {
    func breathing(duration: Double = 1.2, minOpacity: Double = 0.7, maxOpacity: Double = 1.0) -> some View {
        self.modifier(BreathingModifier(duration: duration, minOpacity: minOpacity, maxOpacity: maxOpacity))
    }
}

// Usage
Circle()
    .breathing()
```

### Shake Animation

```swift
struct ShakeModifier: ViewModifier {
    let distance: CGFloat
    @State private var shake = false
    
    func body(content: Content) -> some View {
        content
            .rotationEffect(.degrees(shake ? distance : -distance))
            .animation(.easeInOut(duration: 0.1).repeatForever(autoreverses: true), value: shake)
            .onAppear {
                shake = true
            }
    }
}

extension View {
    func shake(distance: CGFloat = 2) -> some View {
        self.modifier(ShakeModifier(distance: distance))
    }
}
```

---

## 10. Motion Design Checklist

Before shipping any animation:

- [ ] Duration is between 150ms - 600ms
- [ ] Easing curve feels natural (not linear)
- [ ] Respects "Reduce Motion" accessibility setting
- [ ] Includes appropriate haptic feedback
- [ ] Tested on multiple device sizes
- [ ] Runs at 60fps (use Instruments to verify)
- [ ] Purpose is clear (not decorative)
- [ ] Complements voice interactions
- [ ] Feels warm and reassuring
- [ ] Documented in this spec

---

**Summary:**

> **Milo's motion design mirrors its purpose: gentle, intuitive, and reassuring.**  
> **Every animation exists to comfort the user, confirm safety, or celebrate success.**

### Key Takeaways

1. **Warmth over speed** - Slower, gentler animations feel more caring
2. **Feedback over flair** - Every animation confirms an action
3. **Accessibility first** - Motion should enhance, not require
4. **Consistency matters** - Same durations and easings throughout
5. **Test on device** - Animations feel different on real hardware

---

**Next Steps:**
1. Review motion spec with design team
2. Implement core animations in prototype
3. User test with seniors (watch for confusion)
4. Refine based on feedback
5. Document any new patterns discovered

**Related Docs:**
- `DESIGN_SPEC.md` - Visual design system
- `TECHNICAL_SPEC.md` - API and backend specs
- `PRD.md` - Product requirements

