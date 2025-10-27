import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Speech from 'expo-speech';

// Recording state
let recording: Audio.Recording | null = null;
let sound: Audio.Sound | null = null;

/**
 * Request microphone permissions
 */
export async function requestMicrophonePermissions(): Promise<boolean> {
  try {
    const permission = await Audio.requestPermissionsAsync();
    return permission.granted;
  } catch (error) {
    console.error('Failed to get microphone permission:', error);
    return false;
  }
}

/**
 * Start recording audio
 */
export async function startRecording(): Promise<void> {
  try {
    // Request permission if needed
    const hasPermission = await requestMicrophonePermissions();
    if (!hasPermission) {
      throw new Error('Microphone permission not granted');
    }

    // Configure audio mode
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    // Create and start recording
    const { recording: newRecording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );

    recording = newRecording;
    console.log('Recording started');
  } catch (error) {
    console.error('Failed to start recording:', error);
    throw error;
  }
}

/**
 * Stop recording and return the audio file URI
 */
export async function stopRecording(): Promise<string> {
  try {
    if (!recording) {
      throw new Error('No active recording');
    }

    console.log('Stopping recording...');
    await recording.stopAndUnloadAsync();
    
    const uri = recording.getURI();
    recording = null;

    if (!uri) {
      throw new Error('Failed to get recording URI');
    }

    console.log('Recording stopped, URI:', uri);
    return uri;
  } catch (error) {
    console.error('Failed to stop recording:', error);
    throw error;
  }
}

/**
 * Get recording duration in milliseconds
 */
export async function getRecordingDuration(): Promise<number> {
  if (!recording) {
    return 0;
  }

  const status = await recording.getStatusAsync();
  return status.durationMillis || 0;
}

/**
 * Check if currently recording
 */
export function isRecording(): boolean {
  return recording !== null;
}

/**
 * Play audio from URI
 */
export async function playAudio(uri: string): Promise<void> {
  try {
    console.log('Playing audio from:', uri);

    // Unload any existing sound
    if (sound) {
      await sound.unloadAsync();
    }

    // Create and play new sound
    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true }
    );

    sound = newSound;

    // Auto-cleanup when finished
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound?.unloadAsync();
        sound = null;
      }
    });
  } catch (error) {
    console.error('Failed to play audio:', error);
    throw error;
  }
}

/**
 * Stop playing audio
 */
export async function stopAudio(): Promise<void> {
  try {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      sound = null;
    }
  } catch (error) {
    console.error('Failed to stop audio:', error);
  }
}

/**
 * Convert audio file to base64
 */
export async function audioToBase64(uri: string): Promise<string> {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  } catch (error) {
    console.error('Failed to convert audio to base64:', error);
    throw error;
  }
}

/**
 * Transcribe audio using speech-to-text
 * For MVP, this returns mock transcriptions
 * In production, integrate with a service like OpenAI Whisper or Google Speech-to-Text
 */
export async function transcribeAudio(audioUri: string): Promise<string> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Mock transcription based on duration
  const duration = await getAudioDuration(audioUri);
  
  if (duration < 2000) {
    return 'What time is it?';
  } else if (duration < 4000) {
    return 'Can you explain this letter to me?';
  } else if (duration < 6000) {
    return 'Remind me to take my medication at 8 PM.';
  } else {
    return 'How is the weather today?';
  }
}

/**
 * Get duration of an audio file
 */
async function getAudioDuration(uri: string): Promise<number> {
  try {
    const { sound: tempSound } = await Audio.Sound.createAsync({ uri });
    const status = await tempSound.getStatusAsync();
    await tempSound.unloadAsync();
    
    if (status.isLoaded) {
      return status.durationMillis || 0;
    }
    return 0;
  } catch (error) {
    console.error('Failed to get audio duration:', error);
    return 0;
  }
}

/**
 * Text-to-speech: Convert text to spoken audio
 * Uses iOS native speech synthesis (warm, friendly voice)
 */
export async function speakText(text: string): Promise<void> {
  try {
    console.log('Speaking:', text);
    
    // Use iOS native TTS with friendly voice settings
    await Speech.speak(text, {
      language: 'en-US',
      pitch: 1.0,
      rate: 0.85, // Slightly slower for clarity
      voice: 'com.apple.ttsbundle.Samantha-compact', // Warm, friendly voice
    });
  } catch (error) {
    console.error('Failed to speak text:', error);
    throw error;
  }
}

/**
 * Stop speaking
 */
export async function stopSpeaking(): Promise<void> {
  try {
    await Speech.stop();
  } catch (error) {
    console.error('Failed to stop speaking:', error);
  }
}

/**
 * Cleanup all audio resources
 */
export async function cleanup(): Promise<void> {
  try {
    if (recording) {
      await recording.stopAndUnloadAsync();
      recording = null;
    }
    if (sound) {
      await sound.unloadAsync();
      sound = null;
    }
  } catch (error) {
    console.error('Failed to cleanup audio resources:', error);
  }
}

/**
 * Format duration in seconds to MM:SS
 */
export function formatDuration(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

