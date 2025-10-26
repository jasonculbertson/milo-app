import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme';

export function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

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
            value="Mom"
            onPress={() => {}}
            showArrow
          />
          
          <SettingRow
            label="Phone"
            value="+1 (555) 123-4567"
            onPress={() => {}}
            showArrow
          />
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <SettingToggle
            label="Enable notifications"
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
          
          <SettingToggle
            label="Daily reminder"
            value={dailyReminder}
            onValueChange={setDailyReminder}
            disabled={!notificationsEnabled}
          />
          
          <SettingRow
            label="Reminder time"
            value="9:00 AM"
            onPress={() => {}}
            showArrow
            disabled={!notificationsEnabled || !dailyReminder}
          />
          
          <SettingToggle
            label="Sound"
            value={soundEnabled}
            onValueChange={setSoundEnabled}
            disabled={!notificationsEnabled}
          />
        </View>

        {/* Family Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Family</Text>
          
          <SettingRow
            label="Connected family members"
            value="2"
            onPress={() => {}}
            showArrow
          />
          
          <SettingRow
            label="Invite family member"
            onPress={() => {}}
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
          <TouchableOpacity style={styles.dangerButton}>
            <Text style={styles.dangerButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
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
    </Component>
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
});

