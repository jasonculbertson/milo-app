import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { PrimaryButton, SecondaryButton } from '../components/Button';
import { Input } from '../components/Input';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { saveCurrentUser, saveFamilyMembers } from '../config/storage';

type UserRole = 'senior' | 'family' | null;

export function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<UserRole>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setStep(1);
  };

  const handleComplete = async () => {
    // Save user data
    await saveCurrentUser({
      id: Date.now().toString(),
      name,
      phone,
      role: role || 'senior',
      createdAt: new Date().toISOString(),
    });

    onComplete();
  };

  if (step === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome to Milo</Text>
            <Text style={styles.subtitle}>
              Stay connected with your family through simple daily check-ins
            </Text>
          </View>

          <View style={styles.illustration}>
            <Text style={styles.illustrationEmoji}>💙</Text>
          </View>

          <Text style={styles.questionText}>How will you be using Milo?</Text>

          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => handleRoleSelect('senior')}
          >
            <View style={styles.roleIcon}>
              <Text style={styles.roleIconText}>👤</Text>
            </View>
            <View style={styles.roleInfo}>
              <Text style={styles.roleTitle}>I'm checking in</Text>
              <Text style={styles.roleDescription}>
                Let your family know you're doing okay each day
              </Text>
            </View>
            <Text style={styles.roleArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => handleRoleSelect('family')}
          >
            <View style={styles.roleIcon}>
              <Text style={styles.roleIconText}>👨‍👩‍👧‍👦</Text>
            </View>
            <View style={styles.roleInfo}>
              <Text style={styles.roleTitle}>I'm a family member</Text>
              <Text style={styles.roleDescription}>
                Stay connected with your loved ones' daily check-ins
              </Text>
            </View>
            <Text style={styles.roleArrow}>›</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (step === 1) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {role === 'senior' ? "Let's get you set up" : "Connect with family"}
            </Text>
            <Text style={styles.subtitle}>
              {role === 'senior'
                ? 'Just a few quick details and you\'ll be ready to go'
                : 'Enter your information to get started'}
            </Text>
          </View>

          <Input
            label="What's your name?"
            placeholder="Your name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoFocus
          />

          <Input
            label="Phone number (optional)"
            placeholder="(555) 123-4567"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <View style={styles.buttonGroup}>
            <PrimaryButton
              onPress={() => setStep(2)}
              disabled={!name.trim()}
            >
              Continue
            </PrimaryButton>

            <SecondaryButton onPress={() => setStep(0)}>
              Back
            </SecondaryButton>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (step === 2) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Enable notifications</Text>
            <Text style={styles.subtitle}>
              {role === 'senior'
                ? 'We\'ll send you a gentle reminder each morning to check in'
                : 'Get notified when your family members check in'}
            </Text>
          </View>

          <View style={styles.featureList}>
            <FeatureItem
              icon="🔔"
              title="Daily reminders"
              description={
                role === 'senior'
                  ? 'A friendly nudge each morning'
                  : 'Know when they\'ve checked in'
              }
            />
            
            <FeatureItem
              icon="🔒"
              title="Your privacy matters"
              description="We only collect what's needed. No tracking."
            />
            
            {role === 'senior' && (
              <FeatureItem
                icon="💙"
                title="Peace of mind"
                description="Let your family know you're okay"
              />
            )}
          </View>

          <View style={styles.buttonGroup}>
            <PrimaryButton onPress={handleComplete}>
              Enable Notifications
            </PrimaryButton>

            <SecondaryButton onPress={handleComplete}>
              Skip for now
            </SecondaryButton>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return null;
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  
  scrollView: {
    flex: 1,
  },
  
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  
  header: {
    marginBottom: spacing.xl,
  },
  
  title: {
    ...typography.h1,
    marginBottom: spacing.sm,
  },
  
  subtitle: {
    ...typography.bodyLarge,
  },
  
  illustration: {
    alignItems: 'center',
    marginVertical: spacing.xxl,
  },
  
  illustrationEmoji: {
    fontSize: 80,
  },
  
  questionText: {
    ...typography.h3,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.gray200,
    ...shadows.sm,
  },
  
  roleIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.gray50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  
  roleIconText: {
    fontSize: 28,
  },
  
  roleInfo: {
    flex: 1,
  },
  
  roleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray800,
    marginBottom: spacing.xs,
  },
  
  roleDescription: {
    fontSize: 14,
    color: colors.gray600,
  },
  
  roleArrow: {
    fontSize: 28,
    color: colors.gray300,
  },
  
  buttonGroup: {
    marginTop: spacing.xxl,
    gap: spacing.md,
  },
  
  featureList: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
  },
  
  featureIcon: {
    fontSize: 32,
    marginRight: spacing.md,
    marginTop: spacing.xs,
  },
  
  featureText: {
    flex: 1,
  },
  
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray800,
    marginBottom: spacing.xs,
  },
  
  featureDescription: {
    fontSize: 16,
    color: colors.gray600,
    lineHeight: 24,
  },
});

