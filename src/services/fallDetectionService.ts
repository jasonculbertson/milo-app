import { Accelerometer, AccelerometerMeasurement } from 'expo-sensors';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import { addFallEvent, FallEvent as StoredFallEvent, getCurrentUser, getSettings } from '../config/storage';
import { logError, safeAsyncOperation } from '../utils/errorHandling';

// Fall detection parameters
const FALL_THRESHOLD_G = 2.5; // Acceleration threshold in G-forces
const MODERATE_FALL_THRESHOLD_G = 3.0; // Moderate confidence threshold
const HIGH_FALL_THRESHOLD_G = 3.5; // High confidence threshold
const INACTIVITY_TIMEOUT_MS = 60000; // 60 seconds of inactivity
const SAMPLING_INTERVAL_MS = 100; // Sample every 100ms
const MIN_FALL_DURATION_MS = 200; // Minimum duration to consider as fall

// State management
let isMonitoring = false;
let accelerometerSubscription: any = null;
let inactivityTimer: NodeJS.Timeout | null = null;
let lastActivityTime = Date.now();
let fallDetected = false;
let recentReadings: AccelerometerMeasurement[] = [];
let hapticEnabled = true;

/**
 * Event callback for fall detection events
 */
type FallEventCallback = (event: FallEvent) => void;
let eventCallback: FallEventCallback | null = null;

export interface FallEvent {
  type: 'fall_detected' | 'fall_confirmed' | 'user_ok';
  timestamp: string;
  acceleration_g?: number;
  inactive_duration_ms?: number;
  confidence?: 'low' | 'moderate' | 'high'; // Confidence score
  velocity_change?: number; // Delta-V (change in velocity)
}

/**
 * Start monitoring for falls
 */
export async function startFallDetection(callback?: FallEventCallback): Promise<boolean> {
  try {
    // Check if sensor is available
    const available = await Accelerometer.isAvailableAsync();
    if (!available) {
      console.warn('Accelerometer not available');
      return false;
    }

    // Load settings
    const settings = await safeAsyncOperation(
      () => getSettings(),
      { hapticFeedbackEnabled: true, notificationsEnabled: true, dailyReminderTime: '09:00', soundEnabled: true, fallDetectionEnabled: true, voiceSpeed: 1.0 },
      'LoadSettings'
    );
    hapticEnabled = settings.hapticFeedbackEnabled;

    // Save callback
    if (callback) {
      eventCallback = callback;
    }

    // Set sampling interval
    Accelerometer.setUpdateInterval(SAMPLING_INTERVAL_MS);

    // Start monitoring
    accelerometerSubscription = Accelerometer.addListener(handleAccelerometerData);
    isMonitoring = true;
    lastActivityTime = Date.now();
    recentReadings = [];

    console.log('Fall detection started');
    return true;
  } catch (error) {
    logError(error as Error, 'StartFallDetection');
    return false;
  }
}

/**
 * Stop monitoring for falls
 */
export function stopFallDetection(): void {
  if (accelerometerSubscription) {
    accelerometerSubscription.remove();
    accelerometerSubscription = null;
  }

  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }

  isMonitoring = false;
  fallDetected = false;
  console.log('Fall detection stopped');
}

/**
 * Check if fall detection is currently active
 */
export function isFallDetectionActive(): boolean {
  return isMonitoring;
}

/**
 * Handle accelerometer data
 */
function handleAccelerometerData(data: AccelerometerMeasurement): void {
  // Calculate total acceleration magnitude
  const { x, y, z } = data;
  const magnitude = Math.sqrt(x * x + y * y + z * z);

  // Keep rolling window of recent readings (last 2 seconds)
  recentReadings.push({ x, y, z, timestamp: Date.now() });
  if (recentReadings.length > 20) {
    recentReadings.shift();
  }

  // Update last activity time for any movement
  if (magnitude > 0.5) {
    lastActivityTime = Date.now();
    
    // Reset fall detection if user is moving
    if (fallDetected) {
      fallDetected = false;
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
        inactivityTimer = null;
      }
    }
  }

  // Check for sudden acceleration (potential fall)
  if (magnitude > FALL_THRESHOLD_G && !fallDetected) {
    handlePotentialFall(magnitude, data);
  }
}

/**
 * Handle potential fall event with confidence scoring
 */
async function handlePotentialFall(
  accelerationG: number,
  currentData: AccelerometerMeasurement
): Promise<void> {
  // Calculate confidence score based on multiple factors
  const confidence = calculateFallConfidence(accelerationG, currentData);
  
  console.log(`Potential fall detected: ${accelerationG.toFixed(2)}g (confidence: ${confidence})`);
  
  fallDetected = true;
  
  // Calculate velocity change (approximation)
  const velocityChange = calculateVelocityChange();
  
  // Emit event with confidence
  const fallEvent: FallEvent = {
    type: 'fall_detected',
    timestamp: new Date().toISOString(),
    acceleration_g: accelerationG,
    confidence,
    velocity_change: velocityChange,
  };
  
  if (eventCallback) {
    eventCallback(fallEvent);
  }

  // Save fall event to storage
  await saveFallEvent(fallEvent);

  // Haptic feedback based on confidence
  if (hapticEnabled) {
    if (confidence === 'high') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }

  // Show immediate notification asking if user is OK
  await showFallCheckNotification(confidence);

  // Start inactivity timer (shorter for high confidence)
  const timeout = confidence === 'high' ? INACTIVITY_TIMEOUT_MS / 2 : INACTIVITY_TIMEOUT_MS;
  startInactivityTimer(timeout);
}

/**
 * Calculate fall confidence based on multiple factors
 */
function calculateFallConfidence(
  magnitude: number,
  currentData: AccelerometerMeasurement
): 'low' | 'moderate' | 'high' {
  let score = 0;

  // Factor 1: Magnitude of acceleration
  if (magnitude > HIGH_FALL_THRESHOLD_G) {
    score += 3;
  } else if (magnitude > MODERATE_FALL_THRESHOLD_G) {
    score += 2;
  } else {
    score += 1;
  }

  // Factor 2: Sudden change in direction (check recent history)
  if (recentReadings.length >= 5) {
    const prevReadings = recentReadings.slice(-5, -1);
    const avgPrev = {
      x: prevReadings.reduce((sum, r) => sum + r.x, 0) / prevReadings.length,
      y: prevReadings.reduce((sum, r) => sum + r.y, 0) / prevReadings.length,
      z: prevReadings.reduce((sum, r) => sum + r.z, 0) / prevReadings.length,
    };
    
    const deltaX = Math.abs(currentData.x - avgPrev.x);
    const deltaY = Math.abs(currentData.y - avgPrev.y);
    const deltaZ = Math.abs(currentData.z - avgPrev.z);
    const totalDelta = deltaX + deltaY + deltaZ;
    
    if (totalDelta > 3.0) {
      score += 2;
    } else if (totalDelta > 2.0) {
      score += 1;
    }
  }

  // Factor 3: Vertical component (falls usually have strong vertical component)
  if (Math.abs(currentData.z) > 2.0) {
    score += 1;
  }

  // Determine confidence level
  if (score >= 5) {
    return 'high';
  } else if (score >= 3) {
    return 'moderate';
  } else {
    return 'low';
  }
}

/**
 * Calculate approximate velocity change
 */
function calculateVelocityChange(): number {
  if (recentReadings.length < 2) return 0;

  const recent = recentReadings.slice(-5);
  let totalDelta = 0;

  for (let i = 1; i < recent.length; i++) {
    const prev = recent[i - 1];
    const curr = recent[i];
    const dx = curr.x - prev.x;
    const dy = curr.y - prev.y;
    const dz = curr.z - prev.z;
    totalDelta += Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  return totalDelta;
}

/**
 * Save fall event to storage
 */
async function saveFallEvent(event: FallEvent): Promise<void> {
  try {
    const user = await getCurrentUser();
    if (!user) return;

    const storedEvent: StoredFallEvent = {
      id: `fall_${Date.now()}`,
      userId: user.id,
      type: event.type === 'fall_detected' 
        ? 'fall_detected' 
        : event.type === 'fall_confirmed' 
        ? 'fall_confirmed' 
        : 'user_ok',
      timestamp: event.timestamp,
      acceleration_g: event.acceleration_g,
      inactive_duration_ms: event.inactive_duration_ms,
    };

    await addFallEvent(storedEvent);
  } catch (error) {
    logError(error as Error, 'SaveFallEvent');
  }
}

/**
 * Show notification asking if user is OK
 */
async function showFallCheckNotification(confidence: 'low' | 'moderate' | 'high'): Promise<void> {
  const messages = {
    low: {
      title: 'Did you stumble? 🤔',
      body: 'I noticed a bump. Tap here if you need help.',
    },
    moderate: {
      title: 'Are you okay? 🤕',
      body: 'Looks like you took a hard bump. Tap to confirm you\'re alright.',
    },
    high: {
      title: '🚨 Are you hurt?',
      body: 'Detected a serious fall. Tap NOW if you\'re okay, or we\'ll alert your family.',
    },
  };

  const message = messages[confidence];

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: message.title,
        body: message.body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
        categoryIdentifier: 'fall-check',
        data: { confidence },
      },
      trigger: null, // Immediate
    });
  } catch (error) {
    logError(error as Error, 'ShowFallNotification');
  }
}

/**
 * Start timer to check for inactivity
 */
function startInactivityTimer(timeoutMs: number = INACTIVITY_TIMEOUT_MS): void {
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
  }

  inactivityTimer = setTimeout(() => {
    checkInactivity();
  }, timeoutMs);
}

/**
 * Check if user has been inactive after fall
 */
async function checkInactivity(): Promise<void> {
  const inactiveDuration = Date.now() - lastActivityTime;

  if (fallDetected && inactiveDuration >= 30000) { // At least 30 seconds
    // User hasn't moved - this is a confirmed fall with no response
    console.log('Fall confirmed - no user response');
    
    if (hapticEnabled) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    
    // Emit confirmed fall event
    const confirmedEvent: FallEvent = {
      type: 'fall_confirmed',
      timestamp: new Date().toISOString(),
      inactive_duration_ms: inactiveDuration,
      confidence: 'high',
    };
    
    if (eventCallback) {
      eventCallback(confirmedEvent);
    }

    // Save confirmed fall event
    await saveFallEvent(confirmedEvent);

    // Alert family members
    await alertFamilyMembers();
  }
}

/**
 * Alert family members about confirmed fall
 */
async function alertFamilyMembers(): Promise<void> {
  try {
    // Send urgent notification to family members
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🚨 URGENT: Fall Alert',
        body: 'A fall was detected with no response. Check on them immediately!',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
        data: { type: 'emergency_fall', urgent: true },
      },
      trigger: null, // Immediate
    });

    // TODO: In production, send push notifications to family members' devices
    // with emergency escalation through your backend
    console.log('Family members alerted about confirmed fall');
  } catch (error) {
    logError(error as Error, 'AlertFamilyMembers');
  }
}

/**
 * User confirmed they are OK
 */
export async function confirmUserOK(): Promise<void> {
  console.log('User confirmed OK');
  
  fallDetected = false;
  
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }

  // Emit event
  const okEvent: FallEvent = {
    type: 'user_ok',
    timestamp: new Date().toISOString(),
  };
  
  if (eventCallback) {
    eventCallback(okEvent);
  }

  // Save user OK event
  await saveFallEvent(okEvent);

  if (hapticEnabled) {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
}

/**
 * Get current fall detection status
 */
export function getFallDetectionStatus(): {
  isActive: boolean;
  fallDetected: boolean;
  lastActivityTime: Date;
} {
  return {
    isActive: isMonitoring,
    fallDetected,
    lastActivityTime: new Date(lastActivityTime),
  };
}

/**
 * Test fall detection (for debugging)
 */
export async function simulateFall(severity: 'low' | 'moderate' | 'high' = 'moderate'): Promise<void> {
  console.log(`Simulating ${severity} fall for testing...`);
  const magnitudes = {
    low: 2.7,
    moderate: 3.2,
    high: 4.0,
  };
  
  const mockData: AccelerometerMeasurement = {
    x: 0.5,
    y: 0.3,
    z: magnitudes[severity],
    timestamp: Date.now(),
  };
  
  await handlePotentialFall(magnitudes[severity], mockData);
}

