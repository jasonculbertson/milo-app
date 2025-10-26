import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius, shadows, typography } from '../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

interface StatusCardProps {
  title: string;
  subtitle: string;
  badge?: {
    icon: string;
    text: string;
  };
  style?: ViewStyle;
}

interface AlertCardProps {
  title: string;
  message: string;
  severity?: 'warning' | 'error' | 'info';
  style?: ViewStyle;
}

export function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function StatusCard({ title, subtitle, badge, style }: StatusCardProps) {
  return (
    <Card style={style}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardBody}>{subtitle}</Text>
      
      {badge && (
        <View style={styles.streakBadge}>
          <Text style={styles.streakText}>
            {badge.icon} {badge.text}
          </Text>
        </View>
      )}
    </Card>
  );
}

export function AlertCard({
  title,
  message,
  severity = 'warning',
  style,
}: AlertCardProps) {
  const severityColor =
    severity === 'error'
      ? colors.error
      : severity === 'warning'
      ? colors.warning
      : colors.info;

  return (
    <View
      style={[
        styles.alertCard,
        { borderLeftColor: severityColor, backgroundColor: `${severityColor}10` },
        style,
      ]}
    >
      <Text style={[styles.alertTitle, { color: severityColor }]}>{title}</Text>
      <Text style={styles.alertBody}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginVertical: spacing.sm,
    ...shadows.sm,
  },
  
  cardTitle: {
    ...typography.h3,
    marginBottom: spacing.sm,
  },
  
  cardBody: {
    ...typography.body,
  },
  
  streakBadge: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.pill,
    alignSelf: 'flex-start',
  },
  
  streakText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray800,
  },
  
  alertCard: {
    backgroundColor: colors.offWhite,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderLeftWidth: 4,
    ...shadows.md,
    marginVertical: spacing.sm,
  },
  
  alertTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  
  alertBody: {
    ...typography.body,
    color: colors.gray800,
  },
});

