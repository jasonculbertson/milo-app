# 🎨 Milo UI Style Guide — Airbnb-Inspired Design System

> Clean, accessible, senior-friendly interface with Airbnb's clarity and warmth

---

## Overview

Milo's UI follows Airbnb's design principles: **simple, clean, and trustworthy**. Large touch targets, clear visual hierarchy, and generous spacing make the interface accessible for seniors while maintaining modern aesthetics.

### Design Principles

1. **Clarity over cleverness** - Every element has a clear purpose
2. **Large & tappable** - Minimum 56px touch targets
3. **High contrast** - WCAG AAA compliant
4. **Generous spacing** - Plenty of breathing room
5. **Consistent shadows** - Clear visual depth
6. **Warm & welcoming** - Not clinical, not childish

---

## 🎨 Color Palette

### Primary Colors

```typescript
const colors = {
  // Brand
  primary: '#FF5A5F',        // Airbnb coral (Milo primary)
  primaryDark: '#E04449',    // Pressed state
  primaryLight: '#FF787C',   // Hover state
  
  // Neutrals
  gray50: '#F7F7F7',         // Backgrounds
  gray100: '#EBEBEB',        // Card backgrounds
  gray200: '#DDDDDD',        // Borders
  gray300: '#B0B0B0',        // Disabled text
  gray600: '#717171',        // Secondary text
  gray800: '#222222',        // Primary text
  
  // Semantic
  success: '#00A699',        // Check-in success
  warning: '#FC642D',        // Reminders
  error: '#C13515',          // Fall alerts
  info: '#008489',           // Info messages
  
  // Backgrounds
  white: '#FFFFFF',
  offWhite: '#F7F7F7',
};
```

### Usage Guidelines

| Color | Use Case | Example |
|-------|----------|---------|
| **Primary (Coral)** | Main actions, check-in buttons | "I'm OK", "Check In" |
| **Gray 800** | Headlines, body text | "Good morning!" |
| **Gray 600** | Secondary text, labels | "Last check-in: 2 hours ago" |
| **Success (Teal)** | Positive feedback | "Great! 5 days in a row" |
| **Warning (Orange)** | Pending reminders | "Take medication at 8 PM" |
| **Error (Red)** | Safety alerts | "Fall detected" |

---

## 📐 Layout & Spacing

### Spacing Scale (8pt Grid)

```typescript
const spacing = {
  xs: 4,    // Tight elements
  sm: 8,    // Related items
  md: 16,   // Card padding
  lg: 24,   // Section spacing
  xl: 32,   // Screen margins
  xxl: 48,  // Major sections
};
```

### Screen Margins

```typescript
// Standard screen padding
const SCREEN_PADDING = 24; // Left/right margins
const VERTICAL_SPACING = 32; // Between major sections
```

### Visual Example

```
┌─────────────────────────────────────┐
│ ←24px→                      ←24px→  │
│                                     │
│  ┌───────────────────────────┐     │ ↕ 32px
│  │  Card Content             │     │
│  │  padding: 16px            │     │
│  └───────────────────────────┘     │
│                                     │ ↕ 32px
│  ┌───────────────────────────┐     │
│  │  Next Card                │     │
│  └───────────────────────────┘     │
│                                     │
└─────────────────────────────────────┘
```

---

## 🔘 Buttons

### Primary Button (Large)

The main call-to-action button seniors will tap daily.

```typescript
// React Native / Expo
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

function PrimaryButton({ onPress, children, disabled }) {
  return (
    <TouchableOpacity
      style={[
        styles.primaryButton,
        disabled && styles.primaryButtonDisabled
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={styles.primaryButtonText}>{children}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  primaryButton: {
    backgroundColor: '#FF5A5F',
    paddingVertical: 20,        // Extra large tap target
    paddingHorizontal: 32,
    borderRadius: 12,
    
    // Airbnb-style shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4, // Android
    
    // Minimum size for accessibility
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,              // Large, readable
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  
  primaryButtonDisabled: {
    backgroundColor: '#DDDDDD',
    shadowOpacity: 0,
    elevation: 0,
  },
});
```

**Visual:**
```
┌─────────────────────────────────────┐
│                                     │
│            I'm OK Today             │  ← 56px min height
│                                     │
└─────────────────────────────────────┘
     ↑ 12px corner radius
     Shadow: 0 2px 8px rgba(0,0,0,0.15)
```

---

### Secondary Button (Outline)

For less prominent actions like "Skip" or "Remind me later".

```typescript
const styles = StyleSheet.create({
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#222222',
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  secondaryButtonText: {
    color: '#222222',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
```

**Visual:**
```
┌─────────────────────────────────────┐
│                                     │
│          Remind me later            │
│                                     │
└─────────────────────────────────────┘
  ↑ 1.5px border, no fill, no shadow
```

---

### Icon Button (For Quick Actions)

```typescript
const styles = StyleSheet.create({
  iconButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    
    // Subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});
```

---

## 🃏 Cards

### Standard Card

Airbnb-style cards with subtle shadows and rounded corners.

```typescript
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    
    // Airbnb card shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  
  cardTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#222222',
    marginBottom: 8,
  },
  
  cardBody: {
    fontSize: 16,
    color: '#717171',
    lineHeight: 24,
  },
});
```

**Example: Check-in Status Card**

```typescript
function CheckInCard({ lastCheckIn, streak }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Daily Check-In</Text>
      <Text style={styles.cardBody}>
        Last check-in: {lastCheckIn}
      </Text>
      
      {streak > 0 && (
        <View style={styles.streakBadge}>
          <Text style={styles.streakText}>🔥 {streak} days</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  streakBadge: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F7F7F7',
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  
  streakText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222222',
  },
});
```

**Visual:**
```
┌─────────────────────────────────────┐
│  Daily Check-In                     │ ← Bold title
│                                     │
│  Last check-in: 2 hours ago         │ ← Gray body text
│                                     │
│  ╭──────────────╮                   │
│  │ 🔥 5 days    │                   │ ← Pill badge
│  ╰──────────────╯                   │
│                                     │
└─────────────────────────────────────┘
  Shadow: 0 2px 12px rgba(0,0,0,0.08)
```

---

### Alert Card (Safety)

High-priority cards for fall detection or urgent reminders.

```typescript
const styles = StyleSheet.create({
  alertCard: {
    backgroundColor: '#FFF5F5',      // Light red tint
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#C13515',      // Red accent
    
    shadowColor: '#C13515',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  
  alertTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#C13515',
    marginBottom: 8,
  },
  
  alertBody: {
    fontSize: 16,
    color: '#222222',
    lineHeight: 24,
  },
});
```

---

## 📝 Typography

### Font System (SF Pro / System Default)

```typescript
const typography = {
  // Headlines
  h1: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    color: '#222222',
  },
  
  h2: {
    fontSize: 26,
    fontWeight: '600',
    lineHeight: 32,
    color: '#222222',
  },
  
  h3: {
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 28,
    color: '#222222',
  },
  
  // Body text
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: '#717171',
  },
  
  bodyLarge: {
    fontSize: 18,
    fontWeight: '400',
    lineHeight: 28,
    color: '#717171',
  },
  
  // UI elements
  button: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  
  caption: {
    fontSize: 14,
    fontWeight: '400',
    color: '#B0B0B0',
  },
};
```

### Accessibility

- **Minimum font size:** 16px (body text)
- **Line height:** 1.5× font size minimum
- **Letter spacing:** Slight positive tracking for readability
- **Dynamic Type support:** Scale with iOS accessibility settings

---

## 🔲 Form Elements

### Text Input (Large & Clear)

```typescript
const styles = StyleSheet.create({
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 18,
    color: '#222222',
    minHeight: 56,
    
    // Focus state shadow
    shadowColor: '#FF5A5F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  
  textInputFocused: {
    borderColor: '#FF5A5F',
    borderWidth: 2,
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
```

---

### Toggle Switch (iOS Native Style)

```typescript
import { Switch } from 'react-native';

function SettingToggle({ label, value, onValueChange }) {
  return (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#DDDDDD', true: '#FF787C' }}
        thumbColor={value ? '#FF5A5F' : '#FFFFFF'}
        ios_backgroundColor="#DDDDDD"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EBEBEB',
  },
  
  settingLabel: {
    fontSize: 18,
    fontWeight: '400',
    color: '#222222',
  },
});
```

---

### Pill Selector (Filter Style)

Like Airbnb's filter chips - used for selecting options.

```typescript
function PillButton({ label, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[
        styles.pill,
        selected && styles.pillSelected
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.pillText,
        selected && styles.pillTextSelected
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#DDDDDD',
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  
  pillSelected: {
    backgroundColor: '#222222',
    borderColor: '#222222',
  },
  
  pillText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#717171',
  },
  
  pillTextSelected: {
    color: '#FFFFFF',
  },
});
```

**Visual:**
```
╭──────────╮  ╭──────────╮  ╭──────────╮
│ Morning  │  │ Evening  │  │ Night    │  ← Unselected
╰──────────╯  ╰──────────╯  ╰──────────╯

╭──────────╮
│ Morning  │  ← Selected (filled black)
╰──────────╯
```

---

## 📱 Screen Templates

### Home Screen (Senior View)

```typescript
function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Good morning!</Text>
          <Text style={styles.subheading}>How are you feeling today?</Text>
        </View>
        
        {/* Big Check-In Button */}
        <View style={styles.heroSection}>
          <PrimaryButton onPress={handleCheckIn}>
            I'm OK Today
          </PrimaryButton>
        </View>
        
        {/* Status Card */}
        <CheckInCard lastCheckIn="2 hours ago" streak={5} />
        
        {/* Reminders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Reminders</Text>
          <ReminderCard
            title="Take medication"
            time="8:00 PM"
            icon="💊"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  
  header: {
    marginTop: 32,
    marginBottom: 24,
  },
  
  greeting: {
    fontSize: 32,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 8,
  },
  
  subheading: {
    fontSize: 18,
    color: '#717171',
  },
  
  heroSection: {
    marginBottom: 32,
  },
  
  section: {
    marginTop: 32,
  },
  
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#222222',
    marginBottom: 16,
  },
});
```

---

### Modal / Bottom Sheet

Full-screen modal with Airbnb-style close button.

```typescript
import { Modal } from 'react-native';

function FullScreenModal({ visible, onClose, children }) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        {/* Close button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
        >
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
        
        <ScrollView style={styles.modalContent}>
          {children}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F7F7F7',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  
  closeIcon: {
    fontSize: 20,
    color: '#222222',
  },
  
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80, // Room for close button
  },
});
```

---

## 🎭 States & Feedback

### Loading State

```typescript
import { ActivityIndicator } from 'react-native';

function LoadingButton({ loading, onPress, children }) {
  return (
    <TouchableOpacity
      style={[
        styles.primaryButton,
        loading && styles.primaryButtonLoading
      ]}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <Text style={styles.primaryButtonText}>{children}</Text>
      )}
    </TouchableOpacity>
  );
}
```

### Success Toast

```typescript
function SuccessToast({ message, visible }) {
  return (
    <Animated.View
      style={[
        styles.toast,
        styles.toastSuccess,
        { opacity: visible ? 1 : 0 }
      ]}
    >
      <Text style={styles.toastIcon}>✓</Text>
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 100,
    left: 24,
    right: 24,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  
  toastSuccess: {
    backgroundColor: '#00A699',
  },
  
  toastIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    marginRight: 12,
  },
  
  toastText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
```

---

## 🌓 Accessibility & Seniors

### High Contrast Mode

```typescript
// Automatically adjust for accessibility settings
import { AccessibilityInfo } from 'react-native';

const [highContrast, setHighContrast] = useState(false);

useEffect(() => {
  AccessibilityInfo.isHighContrastEnabled().then(setHighContrast);
}, []);

const dynamicStyles = {
  text: {
    color: highContrast ? '#000000' : '#222222',
  },
  border: {
    borderWidth: highContrast ? 2 : 1,
  },
};
```

### Large Text Support

```typescript
import { useWindowDimensions, PixelRatio } from 'react-native';

function useAccessibleFontSize(baseSize: number) {
  const fontScale = PixelRatio.getFontScale();
  return baseSize * Math.min(fontScale, 1.5); // Cap at 1.5×
}

// Usage
function MyText({ children }) {
  const fontSize = useAccessibleFontSize(18);
  return <Text style={{ fontSize }}>{children}</Text>;
}
```

---

## 📦 Component Library Structure

```
src/components/
├── atoms/
│   ├── Button.tsx           // PrimaryButton, SecondaryButton
│   ├── IconButton.tsx
│   ├── Badge.tsx
│   └── Avatar.tsx
│
├── molecules/
│   ├── Card.tsx             // Standard, Alert, Reminder cards
│   ├── Input.tsx
│   ├── Toggle.tsx
│   ├── PillSelector.tsx
│   └── Toast.tsx
│
├── organisms/
│   ├── CheckInHero.tsx      // Big "I'm OK" section
│   ├── ReminderList.tsx
│   ├── StreakDisplay.tsx
│   └── FamilyStatusCard.tsx
│
└── templates/
    ├── HomeScreen.tsx
    ├── SettingsScreen.tsx
    └── FullScreenModal.tsx
```

---

## 🎨 Design Tokens (Full Reference)

```typescript
export const theme = {
  // Colors
  colors: {
    primary: '#FF5A5F',
    primaryDark: '#E04449',
    primaryLight: '#FF787C',
    
    gray50: '#F7F7F7',
    gray100: '#EBEBEB',
    gray200: '#DDDDDD',
    gray300: '#B0B0B0',
    gray600: '#717171',
    gray800: '#222222',
    
    success: '#00A699',
    warning: '#FC642D',
    error: '#C13515',
    info: '#008489',
    
    white: '#FFFFFF',
    black: '#000000',
  },
  
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Border radius
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    pill: 24,
    circle: 9999,
  },
  
  // Shadows
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 6,
    },
  },
  
  // Typography
  typography: {
    h1: { fontSize: 32, fontWeight: '700', lineHeight: 40 },
    h2: { fontSize: 26, fontWeight: '600', lineHeight: 32 },
    h3: { fontSize: 22, fontWeight: '600', lineHeight: 28 },
    body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
    bodyLarge: { fontSize: 18, fontWeight: '400', lineHeight: 28 },
    button: { fontSize: 18, fontWeight: '600', letterSpacing: 0.3 },
    caption: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  },
};
```

---

## ✅ Implementation Checklist

### Phase 1: Core Components
- [ ] Set up design tokens (`theme.ts`)
- [ ] Build `PrimaryButton` component
- [ ] Build `SecondaryButton` component
- [ ] Build `Card` component (3 variants)
- [ ] Build `Toast` component

### Phase 2: Form Elements
- [ ] Build `TextInput` component
- [ ] Build `Toggle` component
- [ ] Build `PillSelector` component
- [ ] Add accessibility support

### Phase 3: Screens
- [ ] Build `HomeScreen` template
- [ ] Build `SettingsScreen` template
- [ ] Build `FullScreenModal` template
- [ ] Test on multiple device sizes

### Phase 4: Polish
- [ ] Add loading states
- [ ] Add error states
- [ ] Test high contrast mode
- [ ] Test with large text
- [ ] Validate WCAG AAA compliance

---

## 🎯 Key Differences from Standard Airbnb

**Larger Everything:**
- Touch targets: 56px minimum (vs. 44px)
- Font sizes: +2px across the board
- Spacing: More generous padding

**Higher Contrast:**
- Text: #222222 instead of lighter grays
- Borders: 1.5px instead of 1px
- Shadows: Slightly more pronounced

**Simplified:**
- Fewer states and variations
- No hover states (mobile-only)
- Limited color palette

---

## 📚 Resources

- **Airbnb Design Language:** https://airbnb.design/
- **React Native Paper (reference):** https://callstack.github.io/react-native-paper/
- **iOS Human Interface Guidelines:** https://developer.apple.com/design/human-interface-guidelines/
- **WCAG AAA Compliance:** https://www.w3.org/WAI/WCAG2AAA-Conformance

---

**Related Docs:**
- `DESIGN_SPEC.md` - Full design system
- `MOTION_SPEC.md` - Animation guidelines
- `ONBOARDING_SPEC.md` - First-run experience

---

**Version:** 1.0  
**Last Updated:** October 26, 2025  
**Status:** ✅ Ready for implementation

