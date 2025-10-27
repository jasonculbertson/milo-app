import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  AccessibilityInfo,
} from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import * as Haptics from 'expo-haptics';
import {
  startRecording,
  stopRecording,
  isRecording,
  transcribeAudio,
  speakText,
  stopSpeaking,
  cleanup,
  formatDuration,
  getRecordingDuration,
} from '../services/voiceService';
import { askMilo, getTimeBasedGreeting } from '../services/aiService';
import { Toast } from '../components/Toast';
import {
  getCurrentUser,
  getMessages,
  addMessage,
  Message,
  getSettings,
} from '../config/storage';
import { getUserFriendlyError, handleAsyncError } from '../utils/errorHandling';

export function VoiceAssistantScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    initializeScreen();
    
    return () => {
      cleanup();
    };
  }, []);

  const initializeScreen = async () => {
    try {
      setIsLoading(true);
      
      // Load user data
      const user = await getCurrentUser();
      if (user) {
        setUserName(user.name);
        
        // Load message history
        const savedMessages = await getMessages(user.id);
        if (savedMessages.length > 0) {
          setMessages(savedMessages.map(m => ({
            ...m,
            timestamp: new Date(m.timestamp),
          })));
        } else {
          // Welcome message with personalization
          const welcomeMsg = `${getTimeBasedGreeting()}, ${user.name}! I'm Milo. Tap to talk.`;
          await addMiloMessageWithSave(welcomeMsg, user.id);
        }
      }
      
      // Load settings
      const settings = await getSettings();
      setHapticEnabled(settings.hapticFeedbackEnabled);
      
    } catch (error) {
      console.error('Error initializing voice assistant:', error);
      // Show generic welcome if user data fails
      addMiloMessageWithoutSave(`${getTimeBasedGreeting()}! I'm Milo. Tap to talk.`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (recording) {
      // Pulse animation while recording
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Update duration every 100ms
      const interval = setInterval(async () => {
        if (isRecording()) {
          const duration = await getRecordingDuration();
          setRecordingDuration(duration);
        }
      }, 100);

      return () => {
        clearInterval(interval);
        pulseAnim.setValue(1);
      };
    }
  }, [recording]);

  const addMiloMessageWithoutSave = (text: string) => {
    const newMessage = {
      id: Date.now().toString(),
      type: 'milo' as const,
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    scrollToBottom();
  };

  const addMiloMessageWithSave = async (text: string, userId: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      userId,
      type: 'milo',
      text,
      timestamp: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, {
      ...newMessage,
      timestamp: new Date(newMessage.timestamp),
    } as any]);
    
    try {
      await addMessage(newMessage);
    } catch (error) {
      console.error('Failed to save message:', error);
    }
    
    scrollToBottom();
  };

  const addUserMessageWithSave = async (text: string, userId: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      userId,
      type: 'user',
      text,
      timestamp: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, {
      ...newMessage,
      timestamp: new Date(newMessage.timestamp),
    } as any]);
    
    try {
      await addMessage(newMessage);
    } catch (error) {
      console.error('Failed to save message:', error);
    }
    
    scrollToBottom();
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleMicPress = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        setToastMessage('Please sign in first');
        setShowToast(true);
        return;
      }

      if (recording) {
        // Stop recording
        if (hapticEnabled) {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        setRecording(false);
        setRecordingDuration(0);
        setProcessing(true);

        try {
          const audioUri = await stopRecording();
          
          // Transcribe audio
          const transcription = await transcribeAudio(audioUri);
          await addUserMessageWithSave(transcription, user.id);

          // Get AI response with retry
          const response = await askMilo({
            text: transcription,
            context: { tone: 'warm', max_words: 20 },
            tts: true,
          });

          await addMiloMessageWithSave(response.response_text, user.id);
          
          // Speak response
          await speakText(response.response_text);
          
          if (hapticEnabled) {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        } catch (error) {
          console.error('Error processing audio:', error);
          const friendlyMessage = getUserFriendlyError(error as Error);
          setToastMessage(friendlyMessage);
          setShowToast(true);
        } finally {
          setProcessing(false);
        }
      } else {
        // Start recording
        if (hapticEnabled) {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        try {
          await startRecording();
          setRecording(true);
        } catch (error) {
          console.error('Error starting recording:', error);
          setToastMessage('Could not access microphone. Check permissions.');
          setShowToast(true);
        }
      }
    } catch (error) {
      console.error('Error in mic press handler:', error);
      setRecording(false);
      setProcessing(false);
      setToastMessage('Something went wrong. Please try again.');
      setShowToast(true);
      if (hapticEnabled) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  };

  const handleQuickAction = async (question: string) => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      if (hapticEnabled) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      await addUserMessageWithSave(question, user.id);
      setProcessing(true);

      const response = await askMilo({
        text: question,
        context: { tone: 'warm', max_words: 20 },
        tts: true,
      });

      await addMiloMessageWithSave(response.response_text, user.id);
      await speakText(response.response_text);
      
      setProcessing(false);
    } catch (error) {
      console.error('Error with quick action:', error);
      setProcessing(false);
      const friendlyMessage = getUserFriendlyError(error as Error);
      setToastMessage(friendlyMessage);
      setShowToast(true);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading Milo...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Milo</Text>
        <Text style={styles.headerSubtitle}>Your friendly AI assistant</Text>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {processing && (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.processingText}>Thinking...</Text>
          </View>
        )}
      </ScrollView>

      {/* Quick Actions */}
      {messages.length === 1 && !recording && !processing && (
        <View style={styles.quickActions}>
          <Text style={styles.quickActionsTitle}>Try asking:</Text>
          <View style={styles.quickActionButtons}>
            <QuickActionButton
              label="What time is it?"
              onPress={() => handleQuickAction('What time is it?')}
            />
            <QuickActionButton
              label="What's the weather?"
              onPress={() => handleQuickAction("What's the weather today?")}
            />
            <QuickActionButton
              label="What's today's date?"
              onPress={() => handleQuickAction("What's today's date?")}
            />
          </View>
        </View>
      )}

      {/* Microphone Button */}
      <View style={styles.micContainer}>
        {recording && (
          <Text style={styles.recordingDuration}>
            {formatDuration(recordingDuration)}
          </Text>
        )}
        
        <TouchableOpacity
          style={styles.micButton}
          onPress={handleMicPress}
          disabled={processing}
          activeOpacity={0.8}
          accessible={true}
          accessibilityLabel={recording ? 'Stop recording' : 'Start recording'}
          accessibilityHint={recording ? 'Double tap to stop recording your message' : 'Double tap to start talking to Milo'}
          accessibilityRole="button"
        >
          <Animated.View
            style={[
              styles.micButtonInner,
              {
                backgroundColor: recording ? colors.error : colors.primary,
                transform: [{ scale: recording ? pulseAnim : 1 }],
              },
            ]}
          >
            <Text style={styles.micIcon}>
              {processing ? '⏳' : recording ? '⏹' : '🎤'}
            </Text>
          </Animated.View>
        </TouchableOpacity>
        
        <Text style={styles.micLabel}>
          {recording ? 'Tap to stop' : processing ? 'Processing...' : 'Tap to talk'}
        </Text>
      </View>

      <Toast
        message={toastMessage}
        visible={showToast}
        type="error"
        onHide={() => setShowToast(false)}
      />
    </SafeAreaView>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isMilo = message.type === 'milo';
  
  return (
    <View
      style={[
        styles.messageBubble,
        isMilo ? styles.miloBubble : styles.userBubble,
      ]}
    >
      {isMilo && <Text style={styles.miloAvatar}>💙</Text>}
      <View
        style={[
          styles.messageContent,
          isMilo ? styles.miloContent : styles.userContent,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isMilo ? styles.miloText : styles.userText,
          ]}
        >
          {message.text}
        </Text>
      </View>
    </View>
  );
}

function QuickActionButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.quickActionButton} onPress={onPress}>
      <Text style={styles.quickActionButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },

  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },

  headerTitle: {
    ...typography.h1,
    marginBottom: spacing.xs,
  },

  headerSubtitle: {
    fontSize: 16,
    color: colors.gray600,
  },

  messagesContainer: {
    flex: 1,
  },

  messagesContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },

  messageBubble: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    alignItems: 'flex-end',
  },

  miloBubble: {
    justifyContent: 'flex-start',
  },

  userBubble: {
    justifyContent: 'flex-end',
  },

  miloAvatar: {
    fontSize: 32,
    marginRight: spacing.sm,
    marginBottom: spacing.xs,
  },

  messageContent: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },

  miloContent: {
    backgroundColor: colors.white,
    ...shadows.sm,
  },

  userContent: {
    backgroundColor: colors.primary,
  },

  messageText: {
    fontSize: 18,
    lineHeight: 28,
  },

  miloText: {
    color: colors.gray800,
  },

  userText: {
    color: colors.white,
  },

  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },

  processingText: {
    marginLeft: spacing.sm,
    fontSize: 16,
    color: colors.gray600,
    fontStyle: 'italic',
  },

  quickActions: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },

  quickActionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray600,
    marginBottom: spacing.sm,
  },

  quickActionButtons: {
    gap: spacing.sm,
  },

  quickActionButton: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray200,
    ...shadows.sm,
  },

  quickActionButtonText: {
    fontSize: 16,
    color: colors.gray800,
  },

  micContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingBottom: spacing.xxl,
  },

  recordingDuration: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.error,
    marginBottom: spacing.md,
  },

  micButton: {
    marginBottom: spacing.md,
  },

  micButtonInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },

  micIcon: {
    fontSize: 44,
  },

  micLabel: {
    fontSize: 16,
    fontWeight: '600',
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
});

