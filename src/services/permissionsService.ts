import * as Notifications from 'expo-notifications';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { Accelerometer } from 'expo-sensors';
import { Alert, Linking } from 'react-native';

export interface PermissionsStatus {
  notifications: boolean;
  camera: boolean;
  photos: boolean;
  microphone: boolean;
  motion: boolean;
}

/**
 * Request all necessary permissions for the app
 */
export async function requestAllPermissions(): Promise<PermissionsStatus> {
  const notifications = await requestNotificationPermission();
  const camera = await requestCameraPermission();
  const photos = await requestPhotoLibraryPermission();
  const microphone = await requestMicrophonePermission();
  const motion = await checkMotionAvailability();

  return {
    notifications,
    camera,
    photos,
    microphone,
    motion,
  };
}

/**
 * Get current permissions status
 */
export async function getPermissionsStatus(): Promise<PermissionsStatus> {
  const notificationStatus = await Notifications.getPermissionsAsync();
  const cameraStatus = await ImagePicker.getCameraPermissionsAsync();
  const photosStatus = await ImagePicker.getMediaLibraryPermissionsAsync();
  const audioStatus = await Audio.getPermissionsAsync();
  const motionAvailable = await Accelerometer.isAvailableAsync();

  return {
    notifications: notificationStatus.granted,
    camera: cameraStatus.granted,
    photos: photosStatus.granted,
    microphone: audioStatus.granted,
    motion: motionAvailable,
  };
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    
    if (existingStatus === 'granted') {
      return true;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

/**
 * Request camera permission
 */
export async function requestCameraPermission(): Promise<boolean> {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting camera permission:', error);
    return false;
  }
}

/**
 * Request photo library permission
 */
export async function requestPhotoLibraryPermission(): Promise<boolean> {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting photo library permission:', error);
    return false;
  }
}

/**
 * Request microphone permission
 */
export async function requestMicrophonePermission(): Promise<boolean> {
  try {
    const { status } = await Audio.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting microphone permission:', error);
    return false;
  }
}

/**
 * Check if motion sensors are available
 */
export async function checkMotionAvailability(): Promise<boolean> {
  try {
    const available = await Accelerometer.isAvailableAsync();
    return available;
  } catch (error) {
    console.error('Error checking motion availability:', error);
    return false;
  }
}

/**
 * Show permission explanation alert
 */
export function showPermissionExplanation(
  permission: 'notifications' | 'camera' | 'photos' | 'microphone' | 'motion',
  onConfirm?: () => void
): void {
  const explanations = {
    notifications: {
      title: 'Enable Notifications',
      message:
        'Milo uses notifications to:\n\n• Remind you about tasks\n• Alert you about check-ins\n• Notify family about your wellbeing\n\nWould you like to enable notifications?',
    },
    camera: {
      title: 'Camera Access',
      message:
        'Milo needs camera access to:\n\n• Take photos of documents\n• Explain letters and bills\n\nWould you like to allow camera access?',
    },
    photos: {
      title: 'Photo Library Access',
      message:
        'Milo needs photo library access to:\n\n• Select documents to explain\n• Share images with family\n\nWould you like to allow photo access?',
    },
    microphone: {
      title: 'Microphone Access',
      message:
        'Milo uses your microphone to:\n\n• Understand your questions\n• Provide voice assistance\n• Make communication easier\n\nWould you like to enable microphone access?',
    },
    motion: {
      title: 'Motion & Fitness',
      message:
        'Milo uses motion sensors to:\n\n• Detect potential falls\n• Alert family if you need help\n• Keep you safe\n\nWould you like to enable fall detection?',
    },
  };

  const { title, message } = explanations[permission];

  Alert.alert(title, message, [
    {
      text: 'Not Now',
      style: 'cancel',
    },
    {
      text: 'Enable',
      onPress: onConfirm || (() => {}),
    },
  ]);
}

/**
 * Show alert to open app settings
 */
export function showOpenSettingsAlert(permission: string): void {
  Alert.alert(
    'Permission Required',
    `Milo needs ${permission} permission to work properly. Would you like to open settings to enable it?`,
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Open Settings',
        onPress: () => Linking.openSettings(),
      },
    ]
  );
}

/**
 * Check if all critical permissions are granted
 */
export async function hasAllCriticalPermissions(): Promise<boolean> {
  const status = await getPermissionsStatus();
  
  // Critical permissions for basic functionality
  return status.notifications && status.microphone;
}

/**
 * Get friendly permission names
 */
export function getPermissionName(key: keyof PermissionsStatus): string {
  const names: Record<keyof PermissionsStatus, string> = {
    notifications: 'Notifications',
    camera: 'Camera',
    photos: 'Photo Library',
    microphone: 'Microphone',
    motion: 'Motion & Fitness',
  };
  
  return names[key];
}

/**
 * Get permission description for settings screen
 */
export function getPermissionDescription(key: keyof PermissionsStatus): string {
  const descriptions: Record<keyof PermissionsStatus, string> = {
    notifications: 'Receive reminders and alerts',
    camera: 'Take photos of documents',
    photos: 'Choose photos from your library',
    microphone: 'Voice conversations with Milo',
    motion: 'Fall detection and safety alerts',
  };
  
  return descriptions[key];
}

/**
 * Request permission with explanation
 */
export async function requestPermissionWithExplanation(
  permission: 'notifications' | 'camera' | 'photos' | 'microphone'
): Promise<boolean> {
  return new Promise((resolve) => {
    showPermissionExplanation(permission, async () => {
      let granted = false;
      
      switch (permission) {
        case 'notifications':
          granted = await requestNotificationPermission();
          break;
        case 'camera':
          granted = await requestCameraPermission();
          break;
        case 'photos':
          granted = await requestPhotoLibraryPermission();
          break;
        case 'microphone':
          granted = await requestMicrophonePermission();
          break;
      }
      
      if (!granted) {
        showOpenSettingsAlert(permission);
      }
      
      resolve(granted);
    });
  });
}

