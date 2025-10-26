import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { StatusCard, AlertCard } from '../components/Card';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { getCheckIns } from '../config/storage';

interface SeniorStatus {
  id: string;
  name: string;
  lastCheckIn: string;
  status: 'ok' | 'missed' | 'alert';
  streak: number;
}

export function FamilyDashboardScreen() {
  const [seniors, setSeniors] = useState<SeniorStatus[]>([]);

  useEffect(() => {
    loadSeniorData();
  }, []);

  const loadSeniorData = async () => {
    // TODO: Load from actual family links
    // For now, mock data
    const mockSeniors: SeniorStatus[] = [
      {
        id: '1',
        name: 'Mom',
        lastCheckIn: '2 hours ago',
        status: 'ok',
        streak: 5,
      },
    ];
    
    setSeniors(mockSeniors);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Family Dashboard</Text>
          <Text style={styles.subtitle}>Everyone you're connected with</Text>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{seniors.length}</Text>
              <Text style={styles.summaryLabel}>Family Members</Text>
            </View>
            
            <View style={styles.summaryDivider} />
            
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: colors.success }]}>
                {seniors.filter(s => s.status === 'ok').length}
              </Text>
              <Text style={styles.summaryLabel}>Checked In Today</Text>
            </View>
          </View>
        </View>

        {/* Senior Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Family Members</Text>
          
          {seniors.map((senior) => (
            <SeniorCard key={senior.id} senior={senior} />
          ))}
        </View>

        {/* Add Family Member */}
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add Family Member</Text>
        </TouchableOpacity>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          
          <ActivityItem
            icon="✓"
            title="Mom checked in"
            time="2 hours ago"
            type="success"
          />
          
          <ActivityItem
            icon="💊"
            title="Medication reminder completed"
            time="Yesterday"
            type="info"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SeniorCard({ senior }: { senior: SeniorStatus }) {
  const statusColor =
    senior.status === 'ok'
      ? colors.success
      : senior.status === 'alert'
      ? colors.error
      : colors.warning;

  const statusText =
    senior.status === 'ok'
      ? 'All good'
      : senior.status === 'alert'
      ? 'Needs attention'
      : 'No check-in today';

  return (
    <TouchableOpacity style={styles.seniorCard}>
      <View style={styles.seniorCardHeader}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>{senior.name[0]}</Text>
        </View>
        
        <View style={styles.seniorInfo}>
          <Text style={styles.seniorName}>{senior.name}</Text>
          <Text style={styles.seniorCheckIn}>
            Last check-in: {senior.lastCheckIn}
          </Text>
        </View>
        
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
      </View>
      
      <View style={styles.seniorStats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>🔥 {senior.streak} days</Text>
          <Text style={styles.statLabel}>Streak</Text>
        </View>
        
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: statusColor }]}>
            {statusText}
          </Text>
          <Text style={styles.statLabel}>Status</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function ActivityItem({
  icon,
  title,
  time,
  type,
}: {
  icon: string;
  title: string;
  time: string;
  type: 'success' | 'info' | 'warning';
}) {
  const iconColor =
    type === 'success'
      ? colors.success
      : type === 'warning'
      ? colors.warning
      : colors.info;

  return (
    <View style={styles.activityItem}>
      <View style={[styles.activityIcon, { backgroundColor: `${iconColor}20` }]}>
        <Text style={styles.activityIconText}>{icon}</Text>
      </View>
      
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>{title}</Text>
        <Text style={styles.activityTime}>{time}</Text>
      </View>
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
  
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  
  header: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  
  title: {
    ...typography.h1,
    marginBottom: spacing.sm,
  },
  
  subtitle: {
    ...typography.bodyLarge,
  },
  
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    ...shadows.sm,
  },
  
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  
  summaryNumber: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.gray800,
    marginBottom: spacing.xs,
  },
  
  summaryLabel: {
    fontSize: 14,
    color: colors.gray600,
  },
  
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.gray200,
  },
  
  section: {
    marginBottom: spacing.xl,
  },
  
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  
  seniorCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  
  seniorCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
  },
  
  seniorInfo: {
    flex: 1,
  },
  
  seniorName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.gray800,
    marginBottom: spacing.xs,
  },
  
  seniorCheckIn: {
    fontSize: 14,
    color: colors.gray600,
  },
  
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  
  seniorStats: {
    flexDirection: 'row',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
  },
  
  stat: {
    flex: 1,
  },
  
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray800,
    marginBottom: spacing.xs,
  },
  
  statLabel: {
    fontSize: 14,
    color: colors.gray600,
  },
  
  addButton: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.gray200,
    borderStyle: 'dashed',
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray600,
  },
  
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  
  activityIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  
  activityIconText: {
    fontSize: 20,
  },
  
  activityContent: {
    flex: 1,
  },
  
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray800,
    marginBottom: spacing.xs,
  },
  
  activityTime: {
    fontSize: 14,
    color: colors.gray600,
  },
});

