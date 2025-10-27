import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { PrimaryButton, SecondaryButton } from '../components/Button';
import { Toast } from '../components/Toast';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { explainDocument } from '../services/aiService';
import { speakText } from '../services/voiceService';

interface ExplainedDocument {
  imageUri: string;
  summary: string;
  confidence: number;
}

export function ExplainDocumentScreen() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExplainedDocument | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    const mediaStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    return status === 'granted' && mediaStatus.status === 'granted';
  };

  const handleTakePhoto = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        setToastMessage('Camera permission is needed to take photos');
        setShowToast(true);
        return;
      }

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      setToastMessage('Failed to take photo');
      setShowToast(true);
    }
  };

  const handleChoosePhoto = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        setToastMessage('Photo library permission is needed');
        setShowToast(true);
        return;
      }

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error choosing photo:', error);
      setToastMessage('Failed to select photo');
      setShowToast(true);
    }
  };

  const processImage = async (imageUri: string) => {
    try {
      setLoading(true);
      setResult(null);

      // Call AI service to explain document
      const response = await explainDocument({
        image_uri: imageUri,
        purpose: 'general',
      });

      const explainedDoc: ExplainedDocument = {
        imageUri,
        summary: response.summary,
        confidence: response.confidence,
      };

      setResult(explainedDoc);

      // Speak the summary
      await speakText(response.summary);

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error processing image:', error);
      setToastMessage('Failed to explain document. Please try again.');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
  };

  const handleReadAgain = async () => {
    if (result) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await speakText(result.summary);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Explain Document</Text>
          <Text style={styles.subtitle}>
            Take a photo of any letter, bill, or document and I'll explain it to you
          </Text>
        </View>

        {/* Result */}
        {result && (
          <View style={styles.resultContainer}>
            <Image
              source={{ uri: result.imageUri }}
              style={styles.documentImage}
              resizeMode="cover"
            />

            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Text style={styles.summaryIcon}>💬</Text>
                <Text style={styles.summaryTitle}>Here's what it says:</Text>
              </View>

              <Text style={styles.summaryText}>{result.summary}</Text>

              {result.confidence < 0.8 && (
                <View style={styles.confidenceWarning}>
                  <Text style={styles.confidenceWarningText}>
                    I'm not completely sure about this. You might want to check with someone.
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.resultActions}>
              <SecondaryButton onPress={handleReadAgain}>
                Read Again 🔊
              </SecondaryButton>

              <SecondaryButton onPress={handleReset}>
                Try Another Document
              </SecondaryButton>
            </View>
          </View>
        )}

        {/* Loading */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Reading your document...</Text>
            <Text style={styles.loadingSubtext}>This may take a moment</Text>
          </View>
        )}

        {/* Initial State */}
        {!result && !loading && (
          <>
            <View style={styles.illustrationContainer}>
              <Text style={styles.illustrationEmoji}>📄</Text>
              <Text style={styles.illustrationText}>
                I can help explain bills, letters, prescriptions, and more
              </Text>
            </View>

            <View style={styles.buttonGroup}>
              <PrimaryButton onPress={handleTakePhoto}>
                Take a Photo
              </PrimaryButton>

              <SecondaryButton onPress={handleChoosePhoto}>
                Choose from Library
              </SecondaryButton>
            </View>

            {/* Example Use Cases */}
            <View style={styles.examplesContainer}>
              <Text style={styles.examplesTitle}>I can help with:</Text>
              
              <ExampleItem
                icon="💊"
                text="Prescription labels and medication instructions"
              />
              <ExampleItem
                icon="📨"
                text="Letters from your doctor or insurance"
              />
              <ExampleItem
                icon="💳"
                text="Bills and payment notices"
              />
              <ExampleItem
                icon="📋"
                text="Forms and official documents"
              />
            </View>
          </>
        )}
      </ScrollView>

      <Toast
        message={toastMessage}
        visible={showToast}
        type="error"
        onHide={() => setShowToast(false)}
      />
    </SafeAreaView>
  );
}

function ExampleItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.exampleItem}>
      <Text style={styles.exampleIcon}>{icon}</Text>
      <Text style={styles.exampleText}>{text}</Text>
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
    marginBottom: spacing.xl,
  },

  title: {
    ...typography.h1,
    marginBottom: spacing.sm,
  },

  subtitle: {
    ...typography.bodyLarge,
  },

  illustrationContainer: {
    alignItems: 'center',
    marginVertical: spacing.xxl,
  },

  illustrationEmoji: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },

  illustrationText: {
    fontSize: 18,
    color: colors.gray600,
    textAlign: 'center',
    lineHeight: 26,
  },

  buttonGroup: {
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },

  examplesContainer: {
    marginTop: spacing.lg,
  },

  examplesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray800,
    marginBottom: spacing.md,
  },

  exampleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },

  exampleIcon: {
    fontSize: 28,
    marginRight: spacing.md,
  },

  exampleText: {
    flex: 1,
    fontSize: 16,
    color: colors.gray800,
    lineHeight: 24,
  },

  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
  },

  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray800,
    marginTop: spacing.lg,
  },

  loadingSubtext: {
    fontSize: 16,
    color: colors.gray600,
    marginTop: spacing.sm,
  },

  resultContainer: {
    marginTop: spacing.lg,
  },

  documentImage: {
    width: '100%',
    height: 250,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.gray200,
  },

  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.md,
  },

  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },

  summaryIcon: {
    fontSize: 28,
    marginRight: spacing.sm,
  },

  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray800,
  },

  summaryText: {
    fontSize: 20,
    lineHeight: 32,
    color: colors.gray800,
  },

  confidenceWarning: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.warningLight,
    borderRadius: borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
  },

  confidenceWarningText: {
    fontSize: 14,
    color: colors.gray800,
    lineHeight: 20,
  },

  resultActions: {
    gap: spacing.md,
  },
});

