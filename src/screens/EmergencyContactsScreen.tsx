import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Input } from '../components/Input';
import { PrimaryButton, SecondaryButton } from '../components/Button';
import { Toast } from '../components/Toast';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import {
  getEmergencyContacts,
  addEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
  EmergencyContact,
} from '../config/storage';
import * as Haptics from 'expo-haptics';
import { getUserFriendlyError } from '../utils/errorHandling';

export function EmergencyContactsScreen() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [fallAlerts, setFallAlerts] = useState(true);
  const [missedCheckIns, setMissedCheckIns] = useState(true);
  const [weeklyUpdate, setWeeklyUpdate] = useState(true);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setIsLoading(true);
      const stored = await getEmergencyContacts();
      setContacts(stored);
    } catch (error) {
      console.error('Error loading emergency contacts:', error);
      setToastMessage('Failed to load emergency contacts');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddContact = () => {
    resetForm();
    setEditingContact(null);
    setShowAddModal(true);
  };

  const handleEditContact = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setName(contact.name);
    setPhone(contact.phone);
    setEmail(contact.email || '');
    setRelationship(contact.relationship);
    setIsPrimary(contact.isPrimary);
    setFallAlerts(contact.notificationPreferences.fallAlerts);
    setMissedCheckIns(contact.notificationPreferences.missedCheckIns);
    setWeeklyUpdate(contact.notificationPreferences.weeklyUpdate);
    setShowAddModal(true);
  };

  const handleSaveContact = async () => {
    try {
      // Validation
      if (!name.trim()) {
        setToastMessage('Please enter a name');
        setShowToast(true);
        return;
      }

      if (!phone.trim()) {
        setToastMessage('Please enter a phone number');
        setShowToast(true);
        return;
      }

      if (!relationship.trim()) {
        setToastMessage('Please enter a relationship');
        setShowToast(true);
        return;
      }

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      if (editingContact) {
        // Update existing contact
        const updated: EmergencyContact = {
          ...editingContact,
          name,
          phone,
          email: email || undefined,
          relationship,
          isPrimary,
          notificationPreferences: {
            fallAlerts,
            missedCheckIns,
            weeklyUpdate,
          },
        };
        await updateEmergencyContact(updated);
        setToastMessage('Contact updated!');
      } else {
        // Add new contact
        const newContact: EmergencyContact = {
          id: `contact_${Date.now()}`,
          name,
          phone,
          email: email || undefined,
          relationship,
          isPrimary,
          notificationPreferences: {
            fallAlerts,
            missedCheckIns,
            weeklyUpdate,
          },
        };
        await addEmergencyContact(newContact);
        setToastMessage('Contact added!');
      }

      setShowToast(true);
      setShowAddModal(false);
      await loadContacts();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error saving contact:', error);
      const friendlyMessage = getUserFriendlyError(error as Error);
      setToastMessage(friendlyMessage);
      setShowToast(true);
    }
  };

  const handleDeleteContact = async (contact: EmergencyContact) => {
    Alert.alert(
      'Delete Contact',
      `Are you sure you want to remove ${contact.name} from your emergency contacts?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              await deleteEmergencyContact(contact.id);
              setToastMessage('Contact removed');
              setShowToast(true);
              await loadContacts();
            } catch (error) {
              console.error('Error deleting contact:', error);
              const friendlyMessage = getUserFriendlyError(error as Error);
              setToastMessage(friendlyMessage);
              setShowToast(true);
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setEmail('');
    setRelationship('');
    setIsPrimary(false);
    setFallAlerts(true);
    setMissedCheckIns(true);
    setWeeklyUpdate(true);
  };

  // Show loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading contacts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Emergency Contacts</Text>
          <Text style={styles.subtitle}>
            People who will be notified in case of emergency
          </Text>
        </View>

        {/* Contacts List */}
        {contacts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyTitle}>No contacts yet</Text>
            <Text style={styles.emptyText}>
              Add emergency contacts who should be notified if you need help
            </Text>
          </View>
        ) : (
          <View style={styles.contactsList}>
            {contacts.map((contact) => (
              <View key={contact.id} style={styles.contactCard}>
                <View style={styles.contactHeader}>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>
                      {contact.name}
                      {contact.isPrimary && (
                        <Text style={styles.primaryBadge}> PRIMARY</Text>
                      )}
                    </Text>
                    <Text style={styles.contactRelationship}>{contact.relationship}</Text>
                  </View>
                  <View style={styles.contactActions}>
                    <TouchableOpacity
                      onPress={() => handleEditContact(contact)}
                      style={styles.iconButton}
                      accessible={true}
                      accessibilityLabel={`Edit ${contact.name}`}
                      accessibilityRole="button"
                    >
                      <Text style={styles.iconButtonText}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteContact(contact)}
                      style={styles.iconButton}
                      accessible={true}
                      accessibilityLabel={`Delete ${contact.name}`}
                      accessibilityRole="button"
                    >
                      <Text style={styles.iconButtonText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.contactDetail}>📱 {contact.phone}</Text>
                {contact.email && (
                  <Text style={styles.contactDetail}>📧 {contact.email}</Text>
                )}
                <View style={styles.notificationPrefs}>
                  {contact.notificationPreferences.fallAlerts && (
                    <Text style={styles.prefBadge}>Fall Alerts</Text>
                  )}
                  {contact.notificationPreferences.missedCheckIns && (
                    <Text style={styles.prefBadge}>Missed Check-ins</Text>
                  )}
                  {contact.notificationPreferences.weeklyUpdate && (
                    <Text style={styles.prefBadge}>Weekly Updates</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Add Contact Button */}
        <PrimaryButton
          onPress={handleAddContact}
          style={styles.addButton}
          accessible={true}
          accessibilityLabel="Add new emergency contact"
          accessibilityRole="button"
        >
          + Add Emergency Contact
        </PrimaryButton>
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingContact ? 'Edit Contact' : 'Add Contact'}
            </Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Input
              label="Name *"
              value={name}
              onChangeText={setName}
              placeholder="John Doe"
              autoCapitalize="words"
            />

            <Input
              label="Phone Number *"
              value={phone}
              onChangeText={setPhone}
              placeholder="(555) 123-4567"
              keyboardType="phone-pad"
            />

            <Input
              label="Email (Optional)"
              value={email}
              onChangeText={setEmail}
              placeholder="john@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Relationship *"
              value={relationship}
              onChangeText={setRelationship}
              placeholder="Daughter, Son, Friend, etc."
              autoCapitalize="words"
            />

            {/* Primary Contact Toggle */}
            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => setIsPrimary(!isPrimary)}
              accessible={true}
              accessibilityLabel="Primary contact"
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isPrimary }}
            >
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleLabel}>Primary Contact</Text>
                <Text style={styles.toggleDescription}>
                  Will be contacted first in emergencies
                </Text>
              </View>
              <View style={[styles.checkbox, isPrimary && styles.checkboxActive]}>
                {isPrimary && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </TouchableOpacity>

            {/* Notification Preferences */}
            <Text style={styles.sectionTitle}>Notifications</Text>

            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => setFallAlerts(!fallAlerts)}
              accessible={true}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: fallAlerts }}
            >
              <Text style={styles.toggleLabel}>Fall Alerts</Text>
              <View style={[styles.checkbox, fallAlerts && styles.checkboxActive]}>
                {fallAlerts && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => setMissedCheckIns(!missedCheckIns)}
              accessible={true}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: missedCheckIns }}
            >
              <Text style={styles.toggleLabel}>Missed Check-ins</Text>
              <View style={[styles.checkbox, missedCheckIns && styles.checkboxActive]}>
                {missedCheckIns && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => setWeeklyUpdate(!weeklyUpdate)}
              accessible={true}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: weeklyUpdate }}
            >
              <Text style={styles.toggleLabel}>Weekly Updates</Text>
              <View style={[styles.checkbox, weeklyUpdate && styles.checkboxActive]}>
                {weeklyUpdate && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </TouchableOpacity>

            <PrimaryButton onPress={handleSaveContact} style={styles.saveButton}>
              {editingContact ? 'Update Contact' : 'Add Contact'}
            </PrimaryButton>

            <SecondaryButton onPress={() => setShowAddModal(false)}>
              Cancel
            </SecondaryButton>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Toast */}
      <Toast
        visible={showToast}
        message={toastMessage}
        onDismiss={() => setShowToast(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollView: {
    flex: 1,
  },

  content: {
    padding: spacing.lg,
  },

  header: {
    marginBottom: spacing.xl,
  },

  title: {
    ...typography.h1,
    color: colors.gray900,
    marginBottom: spacing.xs,
  },

  subtitle: {
    ...typography.body,
    color: colors.gray600,
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

  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },

  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },

  emptyTitle: {
    ...typography.h3,
    color: colors.gray900,
    marginBottom: spacing.sm,
  },

  emptyText: {
    ...typography.body,
    color: colors.gray600,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },

  contactsList: {
    marginBottom: spacing.lg,
  },

  contactCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.md,
  },

  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },

  contactInfo: {
    flex: 1,
  },

  contactName: {
    ...typography.h3,
    color: colors.gray900,
    marginBottom: spacing.xs,
  },

  primaryBadge: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },

  contactRelationship: {
    ...typography.body,
    color: colors.gray600,
  },

  contactActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  iconButton: {
    padding: spacing.xs,
  },

  iconButtonText: {
    fontSize: 20,
  },

  contactDetail: {
    ...typography.body,
    color: colors.gray700,
    marginBottom: spacing.xs,
  },

  notificationPrefs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },

  prefBadge: {
    ...typography.caption,
    color: colors.primary,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },

  addButton: {
    marginTop: spacing.md,
  },

  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },

  modalTitle: {
    ...typography.h2,
    color: colors.gray900,
  },

  closeButton: {
    ...typography.h2,
    color: colors.gray600,
  },

  modalContent: {
    flex: 1,
    padding: spacing.lg,
  },

  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },

  toggleInfo: {
    flex: 1,
    marginRight: spacing.md,
  },

  toggleLabel: {
    ...typography.body,
    color: colors.gray900,
    fontWeight: '600',
  },

  toggleDescription: {
    ...typography.caption,
    color: colors.gray600,
    marginTop: spacing.xs,
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.gray400,
    justifyContent: 'center',
    alignItems: 'center',
  },

  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  checkmark: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },

  sectionTitle: {
    ...typography.h3,
    color: colors.gray900,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },

  saveButton: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
});

