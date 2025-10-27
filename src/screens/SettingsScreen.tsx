import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme';
import {
  getPermissionsStatus,
  requestPermissionWithExplanation,
  showOpenSettingsAlert,
  PermissionsStatus,
  getPermissionName,
  getPermissionDescription,
} from '../services/permissionsService';
import { startFallDetection, stopFallDetection } from '../services/fallDetectionService';
import {
  getSettings,
  updateSettings,
  getCurrentUser,
  getEmergencyContacts,
} from '../config/storage';
import { Toast } from '../components/Toast';
import * as Haptics from 'expo-haptics';

export function SettingsScreen({ navigation }: any) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [fallDetectionEnabled, setFallDetectionEnabled] = useState(false);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [emergencyContactCount, setEmergencyContactCount] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [permissions, setPermissions] = useState<PermissionsStatus>({
    notifications: false,
    camera: false,
    photos: false,
    microphone: false,
    motion: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      
      // Load permissions
      const permStatus = await getPermissionsStatus();
      setPermissions(permStatus);

      // Load user info
      const user = await getCurrentUser();
      if (user) {
        setUserName(user.name);
      }

      // Load settings
      const settings = await getSettings();
      setNotificationsEnabled(settings.notificationsEnabled);
      setSoundEnabled(settings.soundEnabled);
      setFallDetectionEnabled(settings.fallDetectionEnabled);
      setHapticEnabled(settings.hapticFeedbackEnabled);
      setVoiceSpeed(settings.voiceSpeed);

      // Load emergency contacts count
      const contacts = await getEmergencyContacts();
      setEmergencyContactCount(contacts.length);
      
    } catch (error) {
      console.error('Error loading settings:', error);
      setToastMessage('Failed to load settings');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFallDetectionToggle = async (enabled: boolean) => {
    if (hapticEnabled) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (enabled) {
      const success = await startFallDetection();
      setFallDetectionEnabled(success);
      if (success) {
        await updateSettings({ fallDetectionEnabled: true });
        setToastMessage('Fall detection enabled');
      } else {
        setToastMessage('Could not enable fall detection');
      }
      setShowToast(true);
    } else {
      stopFallDetection();
      setFallDetectionEnabled(false);
      await updateSettings({ fallDetectionEnabled: false });
      setToastMessage('Fall detection disabled');
      setShowToast(true);
    }
  };

  const handleNotificationsToggle = async (enabled: boolean) => {
    if (hapticEnabled) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setNotificationsEnabled(enabled);
    await updateSettings({ notificationsEnabled: enabled });
  };

  const handleSoundToggle = async (enabled: boolean) => {
    if (hapticEnabled) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSoundEnabled(enabled);
    await updateSettings({ soundEnabled: enabled });
  };

  const handleHapticToggle = async (enabled: boolean) => {
    if (enabled) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setHapticEnabled(enabled);
    await updateSettings({ hapticFeedbackEnabled: enabled });
  };

  const handlePermissionRequest = async (
    permission: 'notifications' | 'camera' | 'photos' | 'microphone'
  ) => {
    const granted = await requestPermissionWithExplanation(permission);
    if (granted) {
      await loadSettings();
    }
  };

  const handleEmergencyContactsPress = () => {
    // Navigation to emergency contacts screen
    // In production, this would use navigation
    if (navigation) {
      navigation.navigate('EmergencyContacts');
    } else {
      setToastMessage('Emergency contacts feature available in full app');
      setShowToast(true);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <SettingRow
            label="Name"
            value={userName || 'Not set'}
            onPress={() => {
              setToastMessage('Edit profile coming soon');
              setShowToast(true);
            }}
            showArrow
          />
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <SettingToggle
            label="Enable notifications"
            value={notificationsEnabled}
            onValueChange={handleNotificationsToggle}
          />
          
          <SettingToggle
            label="Sound"
            value={soundEnabled}
            onValueChange={handleSoundToggle}
            disabled={!notificationsEnabled}
          />
        </View>

        {/* Safety & Emergency Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Safety & Emergency</Text>
          
          <SettingRow
            label="Emergency contacts"
            value={emergencyContactCount > 0 ? `${emergencyContactCount}` : 'None'}
            onPress={handleEmergencyContactsPress}
            showArrow
          />
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          
          <SettingToggle
            label="Fall detection"
            value={fallDetectionEnabled}
            onValueChange={handleFallDetectionToggle}
            disabled={!permissions.motion}
          />
          
          {!permissions.motion && (
            <Text style={styles.warningText}>
              Fall detection requires motion sensors permission
            </Text>
          )}

          <SettingToggle
            label="Haptic feedback"
            value={hapticEnabled}
            onValueChange={handleHapticToggle}
          />
        </View>

        {/* Permissions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Permissions</Text>
          
          <SettingRow
            label={getPermissionName('notifications')}
            value={permissions.notifications ? 'Enabled' : 'Disabled'}
            onPress={() => permissions.notifications ? showOpenSettingsAlert('notifications') : handlePermissionRequest('notifications')}
            showArrow
          />
          
          <SettingRow
            label={getPermissionName('microphone')}
            value={permissions.microphone ? 'Enabled' : 'Disabled'}
            onPress={() => permissions.microphone ? showOpenSettingsAlert('microphone') : handlePermissionRequest('microphone')}
            showArrow
          />
          
          <SettingRow
            label={getPermissionName('camera')}
            value={permissions.camera ? 'Enabled' : 'Disabled'}
            onPress={() => permissions.camera ? showOpenSettingsAlert('camera') : handlePermissionRequest('camera')}
            showArrow
          />
          
          <SettingRow
            label={getPermissionName('photos')}
            value={permissions.photos ? 'Enabled' : 'Disabled'}
            onPress={() => permissions.photos ? showOpenSettingsAlert('photos') : handlePermissionRequest('photos')}
            showArrow
          />
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Security</Text>
          
          <SettingRow
            label="Privacy policy"
            onPress={() => {}}
            showArrow
          />
          
          <SettingRow
            label="Terms of service"
            onPress={() => {}}
            showArrow
          />
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <SettingRow
            label="Version"
            value="1.0.0"
          />
          
          <SettingRow
            label="Help & support"
            onPress={() => {}}
            showArrow
          />
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={() => {
              setToastMessage('Sign out coming soon');
              setShowToast(true);
            }}
          >
            <Text style={styles.dangerButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Toast */}
      <Toast
        visible={showToast}
        message={toastMessage}
        onDismiss={() => setShowToast(false)}
      />
    </SafeAreaView>
  );
}

function SettingRow({
  label,
  value,
  onPress,
  showArrow = false,
  disabled = false,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  showArrow?: boolean;
  disabled?: boolean;
}) {
  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.settingRow, disabled && styles.settingRowDisabled]}
        onPress={onPress}
        disabled={disabled}
      >
        <Text style={[styles.settingLabel, disabled && styles.settingLabelDisabled]}>
          {label}
        </Text>
        <View style={styles.settingRight}>
          {value && (
            <Text style={[styles.settingValue, disabled && styles.settingValueDisabled]}>
              {value}
            </Text>
          )}
          {showArrow && <Text style={styles.settingArrow}>›</Text>}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.settingRow, disabled && styles.settingRowDisabled]}>
      <Text style={[styles.settingLabel, disabled && styles.settingLabelDisabled]}>
        {label}
      </Text>
      <View style={styles.settingRight}>
        {value && (
          <Text style={[styles.settingValue, disabled && styles.settingValueDisabled]}>
            {value}
          </Text>
        )}
        {showArrow && <Text style={styles.settingArrow}>›</Text>}
      </View>
    </View>
  );
}

function SettingToggle({
  label,
  value,
  onValueChange,
  disabled = false,
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <View style={[styles.settingRow, disabled && styles.settingRowDisabled]}>
      <Text style={[styles.settingLabel, disabled && styles.settingLabelDisabled]}>
        {label}
      </Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: colors.gray200, true: colors.primaryLight }}
        thumbColor={value ? colors.primary : colors.white}
        ios_backgroundColor={colors.gray200}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  
  scrollView: {
    flex: 1,
  },
  
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  
  title: {
    ...typography.h1,
  },
  
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.gray600,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: 1,
  },
  
  settingRowDisabled: {
    opacity: 0.5,
  },
  
  settingLabel: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.gray800,
  },
  
  settingLabelDisabled: {
    color: colors.gray300,
  },
  
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  
  settingValue: {
    fontSize: 16,
    color: colors.gray600,
  },
  
  settingValueDisabled: {
    color: colors.gray300,
  },
  
  settingArrow: {
    fontSize: 20,
    color: colors.gray300,
  },
  
  dangerButton: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.error,
  },
  
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },

  warningText: {
    fontSize: 14,
    color: colors.warning,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.gray600,
  },
});

