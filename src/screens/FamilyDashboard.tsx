import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { User, CheckIn } from '../types';
import {
  getFamilyMembers,
  getTodayCheckIn,
  getCheckIns,
} from '../config/storage';

export default function FamilyDashboard() {
  const { user, signOut } = useAuth();
  const [familyMembers, setFamilyMembers] = useState<User[]>([]);
  const [checkIns, setCheckIns] = useState<{ [key: string]: CheckIn | null }>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFamilyData();
  }, []);

  const loadFamilyData = async () => {
    if (!user) return;

    try {
      // Get all family members (excluding self)
      const members = await getFamilyMembers();
      const otherMembers = members.filter(m => m.id !== user.id);
      setFamilyMembers(otherMembers);

      // Get today's check-ins for each family member
      const checkInData: { [key: string]: CheckIn | null } = {};

      for (const member of otherMembers) {
        const todayCheckIn = await getTodayCheckIn(member.id);
        checkInData[member.id] = todayCheckIn;
      }

      setCheckIns(checkInData);
    } catch (error) {
      console.error('Error loading family data:', error);
      Alert.alert('Error', 'Failed to load family data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadFamilyData();
  };

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const getStatusColor = (checkIn: CheckIn | null) => {
    if (!checkIn) return '#FF3B30'; // Red - hasn't checked in
    if (checkIn.status === 'need_help') return '#FF9500'; // Orange - needs help
    return '#34C759'; // Green - OK
  };

  const getStatusText = (checkIn: CheckIn | null) => {
    if (!checkIn) return '❌ Not checked in yet';
    if (checkIn.status === 'need_help') return '⚠️ Needs help!';
    return '✅ Doing well';
  };

  const getStatusTime = (checkIn: CheckIn | null) => {
    if (!checkIn) return '';
    const time = new Date(checkIn.timestamp);
    return `at ${time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Family Dashboard</Text>
        <TouchableOpacity onPress={signOut} style={styles.signOutButton}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {familyMembers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No Family Members Yet</Text>
            <Text style={styles.emptyText}>
              Family members need to sign up on their devices. Once they do, their accounts
              will sync and you'll see their check-in status here.
            </Text>
            <Text style={styles.emptyHint}>
              💡 Tip: Make sure everyone uses the same app and signs up with their phone number.
            </Text>
          </View>
        ) : (
          familyMembers.map((member) => {
            const checkIn = checkIns[member.id];
            const statusColor = getStatusColor(checkIn);

            return (
              <View key={member.id} style={styles.memberCard}>
                <View style={styles.memberHeader}>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.memberRole}>
                      {member.role === 'mom' ? '👵 Mom' : '👤 Family'}
                    </Text>
                  </View>
                  <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                </View>

                <View style={styles.statusContainer}>
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {getStatusText(checkIn)}
                  </Text>
                  {checkIn && (
                    <Text style={styles.statusTime}>{getStatusTime(checkIn)}</Text>
                  )}
                </View>

                {checkIn?.status === 'need_help' && (
                  <TouchableOpacity
                    style={styles.callButton}
                    onPress={() => handleCall(member.phone_number)}
                  >
                    <Text style={styles.callButtonText}>📞 Call Now</Text>
                  </TouchableOpacity>
                )}

                {!checkIn && (
                  <TouchableOpacity
                    style={styles.reminderButton}
                    onPress={() => handleCall(member.phone_number)}
                  >
                    <Text style={styles.reminderButtonText}>📞 Give them a call</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>📱 How It Works</Text>
          <Text style={styles.infoText}>
            • Family members will see each other automatically after signing up{'\n'}
            • Pull down to refresh and see latest check-ins{'\n'}
            • Get notified when someone checks in
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  signOutButton: {
    padding: 8,
  },
  signOutText: {
    color: '#007AFF',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    marginTop: 60,
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  emptyHint: {
    fontSize: 14,
    textAlign: 'center',
    color: '#007AFF',
    lineHeight: 20,
    backgroundColor: '#E3F2FF',
    padding: 12,
    borderRadius: 8,
  },
  memberCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  memberRole: {
    fontSize: 16,
    color: '#666',
  },
  statusDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  statusContainer: {
    marginBottom: 12,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusTime: {
    fontSize: 14,
    color: '#999',
  },
  callButton: {
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  callButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  reminderButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  reminderButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#FFF9E6',
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
});
