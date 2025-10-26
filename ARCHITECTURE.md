# Architecture: Milo

## Overview

This app uses a **serverless, peer-to-peer architecture** with no backend infrastructure. All data is stored locally on devices, and notifications are sent device-to-device using Apple Push Notification Service (APNs) via Expo's push notification service.

## Why This Architecture?

### Advantages:
1. **Zero Monthly Costs** - No database or server hosting fees
2. **Maximum Privacy** - Data never leaves family devices
3. **Simple Maintenance** - No backend code to maintain
4. **Fast & Reliable** - No server downtime or API limits
5. **Offline-First** - Works without internet (except notifications)

### Trade-offs:
1. **No Centralized History** - Each device has its own data
2. **Requires Apple Developer Account** - $99/year for push notifications
3. **Limited Analytics** - No centralized logging
4. **Manual Sync** - Data doesn't automatically sync between devices

## System Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Mom's iPhone  │         │  Your iPhone    │         │ Sister's iPhone │
│                 │         │                 │         │                 │
│  ┌───────────┐  │         │  ┌───────────┐  │         │  ┌───────────┐  │
│  │ Check-In  │  │         │  │  Family   │  │         │  │  Family   │  │
│  │  Screen   │  │         │  │ Dashboard │  │         │  │ Dashboard │  │
│  └───────────┘  │         │  └───────────┘  │         │  └───────────┘  │
│        │        │         │        ▲        │         │        ▲        │
│        │        │         │        │        │         │        │        │
│  ┌─────▼─────┐  │         │  ┌─────┴─────┐  │         │  ┌─────┴─────┐  │
│  │AsyncStorage│  │         │  │AsyncStorage│  │         │  │AsyncStorage│  │
│  └───────────┘  │         │  └───────────┘  │         │  └───────────┘  │
│        │        │         │                 │         │                 │
└────────┼────────┘         └─────────────────┘         └─────────────────┘
         │                           ▲                           ▲
         │ Check-in Event            │                           │
         │                           │                           │
         └───────────────────────────┴───────────────────────────┘
                                     │
                              ┌──────▼──────┐
                              │    Expo     │
                              │Push Service │
                              │             │
                              │   (APNs)    │
                              └─────────────┘
```

## Data Flow

### 1. Sign Up Flow
```
User Opens App
    → Enters name, phone, role
    → Creates PIN
    → User object created
    → Saved to AsyncStorage
    → Added to family_members list
    → User data available to other devices through shared notifications
```

### 2. Check-In Flow
```
Mom Taps "I'm OK"
    → Check-in created with timestamp
    → Saved to local AsyncStorage
    → App reads family_members list
    → For each family member:
        → Gets their expo_push_token
        → Sends push notification via Expo API
    → Notification sent to Expo servers
    → Expo forwards to APNs
    → APNs delivers to family devices
    → Family sees notification
```

### 3. Notification Action Flow
```
Morning notification appears
    → Mom swipes down on notification
    → Sees "I'm OK" button
    → Taps button
    → App handles action in background
    → Creates check-in
    → Sends notifications to family
    → Confirms with local notification
```

## Data Storage

### AsyncStorage Keys

```typescript
@milo:current_user      // Current logged-in user
@milo:family_members    // List of all family members
@milo:checkins          // Array of check-in records
@milo:push_tokens       // Map of user IDs to push tokens
```

### Data Models

```typescript
User {
  id: string                    // Generated timestamp ID
  phone_number: string          // Unique identifier
  name: string                  // Display name
  role: 'mom' | 'family'       // User role
  expo_push_token: string?      // For receiving notifications
  notification_time: string     // "HH:MM:SS" format
  alert_time: string           // When to alert if no check-in
  created_at: string           // ISO timestamp
  updated_at: string           // ISO timestamp
}

CheckIn {
  id: string                    // Generated timestamp ID
  user_id: string              // Who checked in
  status: 'ok' | 'need_help'   // Check-in status
  message: string?             // Optional message
  timestamp: string            // When check-in occurred
  created_at: string           // ISO timestamp
}
```

## Push Notification Flow

### Registration
```
1. App launches
2. Requests notification permissions
3. Gets Expo push token from Expo SDK
4. Saves token to user object in AsyncStorage
5. Token available for other devices to use
```

### Sending
```
1. User checks in
2. App reads family_members from AsyncStorage
3. Collects expo_push_tokens
4. POSTs to https://exp.host/--/api/v2/push/send
5. Expo validates and forwards to APNs
6. APNs delivers to devices
```

### Interactive Notifications
```
1. Notification appears with category "CHECKIN"
2. iOS shows action buttons: "I'm OK" | "Need Help"
3. User taps button
4. App receives notification response event
5. Handles action (creates check-in)
6. Sends notifications to family
```

## Security Model

### Authentication
- **Simple PIN-based**: Last 4 digits of phone number
- **No server validation**: All local checks
- **Device-level security**: Relies on iOS device security

### Data Privacy
- **Local-first**: All data stored on device
- **No cloud sync**: Data never uploaded to servers
- **Peer-to-peer notifications**: Only metadata sent through Expo/APNs
- **Notification content**: Minimal PII (name only)

### Potential Improvements
- Replace PIN with biometric auth (Face ID/Touch ID)
- Encrypt AsyncStorage data
- Add end-to-end encryption for notifications
- Implement proper user identity verification

## Scalability

### Current Limitations
- **Users**: ~10-20 family members max
- **Check-ins**: 30 days stored locally
- **Notifications**: No rate limit (Expo has limits)
- **Storage**: ~1-5 MB per device

### Scaling Considerations
If this grows beyond a single family:
1. Add backend API for user management
2. Implement proper database (Supabase, Firebase)
3. Add real-time sync (WebSockets)
4. Implement proper authentication
5. Add analytics and monitoring

## Technology Stack

### Core
- **React Native**: Cross-platform mobile framework
- **Expo**: Development and build tooling
- **TypeScript**: Type safety

### Storage
- **AsyncStorage**: Key-value storage on device
- **Future**: iCloud/CloudKit for backup

### Notifications
- **Expo Notifications**: Notification API
- **Expo Push Service**: Message relay
- **APNs**: Apple's push notification service

### State Management
- **React Context**: Auth state
- **React Hooks**: Component state
- **No Redux**: Simple enough without it

## Development Workflow

### Local Development
```bash
npm start              # Start Expo dev server
npm run ios           # Run on iOS simulator
```

### Building
```bash
eas build --platform ios --profile development    # Dev build
eas build --platform ios --profile production     # Production build
```

### Deployment
```bash
eas submit --platform ios    # Submit to App Store
```

## Testing Strategy

### Manual Testing
1. **Sign-up flow**: Test account creation
2. **Check-in**: Verify local storage
3. **Notifications**: Test push delivery
4. **Interactive actions**: Test notification buttons
5. **Family dashboard**: Verify status updates

### Device Testing
- Must use physical iPhones
- Test on different iOS versions
- Test with poor network conditions

### Future: Automated Testing
- Unit tests for storage functions
- Integration tests for notification flow
- E2E tests with Detox

## Performance

### App Size
- Base: ~15-20 MB
- With assets: ~25-30 MB

### Memory Usage
- Idle: ~50-80 MB
- Active: ~100-150 MB

### Battery Impact
- Minimal (notifications only)
- No background tasks
- No location tracking

### Network Usage
- Sign-up: ~1 KB
- Check-in: ~2-5 KB
- Notifications: ~1-2 KB each

## Monitoring

### Current
- Expo crash reports (free)
- Device logs via Xcode
- Manual user feedback

### Future Additions
- Sentry for error tracking
- Analytics (optional)
- Usage metrics

## Deployment Checklist

- [ ] Update version in app.json
- [ ] Test on physical devices
- [ ] Verify notification permissions
- [ ] Test interactive notifications
- [ ] Build with EAS
- [ ] Submit to TestFlight
- [ ] Family testing
- [ ] Submit to App Store
- [ ] Monitor reviews

## Maintenance

### Regular Tasks
- Update Expo SDK (quarterly)
- Update dependencies (monthly)
- Monitor crash reports
- Respond to user feedback

### Zero-Maintenance Aspects
- No server to maintain
- No database migrations
- No API versioning
- No scaling concerns

## Future Enhancements

### Phase 2: iCloud Sync
- Sync check-in history across devices
- Backup user data to iCloud
- CloudKit integration

### Phase 3: Advanced Features
- SMS backup notifications
- Medication reminders
- Location sharing (emergency)
- Apple Health integration
- Widget for quick check-in

### Phase 4: Multi-Family Support
- Support multiple family groups
- Add backend API
- Proper user authentication
- Admin dashboard

