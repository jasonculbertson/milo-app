import * as FileSystem from 'expo-file-system';
import { withRetry, withTimeout, NetworkError, handleAsyncError } from '../utils/errorHandling';

// Types
export interface AskRequest {
  text: string;
  context?: {
    tone?: string;
    max_words?: number;
  };
  tts?: boolean;
}

export interface AskResponse {
  message_id: string;
  response_text: string;
  tts_url?: string;
}

export interface ExplainRequest {
  image_uri: string;
  purpose?: string;
}

export interface ExplainResponse {
  doc_id: string;
  summary: string;
  confidence: number;
}

export interface ReminderRequest {
  text: string;
  when_iso?: string;
}

export interface ReminderResponse {
  reminder_id: string;
  when_iso: string;
  text: string;
}

// Configuration
const AI_CONFIG = {
  // For MVP, we'll use a mock API
  // In production, this would connect to your Supabase Edge Functions
  baseUrl: 'https://your-project.supabase.co/functions/v1',
  timeout: 10000,
};

/**
 * Ask Milo a question and get a friendly response
 */
export async function askMilo(request: AskRequest): Promise<AskResponse> {
  return withRetry(
    async () => {
      try {
        // For MVP, return mock responses with timeout
        // In production, this would call your Supabase Edge Function
        const response = await withTimeout(
          mockAskEndpoint(request),
          10000,
          'Milo is taking too long to respond'
        );
        return response;
      } catch (error) {
        console.error('Error asking Milo:', error);
        throw new NetworkError('Could not reach Milo. Please try again.');
      }
    },
    {
      maxAttempts: 2,
      delayMs: 1000,
      onRetry: (attempt) => console.log(`Retrying Milo request (attempt ${attempt})`)
    }
  );
}

/**
 * Explain a document or image using OCR + AI
 */
export async function explainDocument(request: ExplainRequest): Promise<ExplainResponse> {
  try {
    // Convert image to base64
    const base64 = await FileSystem.readAsStringAsync(request.image_uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // For MVP, return mock response
    // In production, this would call your Supabase Edge Function with OCR
    const response = await mockExplainEndpoint(base64, request.purpose);
    return response;
  } catch (error) {
    console.error('Error explaining document:', error);
    throw new Error('Failed to explain document');
  }
}

/**
 * Create a reminder with natural language parsing
 */
export async function createReminder(request: ReminderRequest): Promise<ReminderResponse> {
  try {
    // For MVP, return mock response
    // In production, this would call your Supabase Edge Function
    const response = await mockReminderEndpoint(request);
    return response;
  } catch (error) {
    console.error('Error creating reminder:', error);
    throw new Error('Failed to create reminder');
  }
}

// ============================================================================
// Mock Implementations (Replace with real API calls in production)
// ============================================================================

async function mockAskEndpoint(request: AskRequest): Promise<AskResponse> {
  // Simulate network delay
  await delay(800);

  // Generate contextual responses (ALL ≤20 words per PRD)
  const text = request.text.toLowerCase();
  let response_text = '';

  if (text.includes('weather')) {
    response_text = "It's sunny and 72 degrees. Perfect for a walk!"; // 10 words
  } else if (text.includes('time')) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    response_text = `It's ${timeStr}.`; // 3 words
  } else if (text.includes('date') || text.includes('day')) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    response_text = `Today is ${dateStr}.`; // 5 words max
  } else if (text.includes('hello') || text.includes('hi')) {
    response_text = "Hi there! What can I help with?"; // 7 words
  } else if (text.includes('how are you')) {
    response_text = "I'm great! How can I help you?"; // 7 words
  } else if (text.includes('thank')) {
    response_text = "You're welcome! Always here to help."; // 6 words
  } else if (text.includes('help')) {
    response_text = "I can answer questions, explain documents, or set reminders!"; // 9 words
  } else {
    response_text = "I'm here to help. Ask about weather, time, or documents!"; // 11 words
  }

  return {
    message_id: generateId(),
    response_text,
    tts_url: request.tts ? 'mock://tts-audio' : undefined,
  };
}

async function mockExplainEndpoint(
  base64Image: string,
  purpose?: string
): Promise<ExplainResponse> {
  // Simulate OCR processing delay
  await delay(2000);

  // Mock OCR results
  const mockSummaries = [
    "This letter says your appointment is moved to November 8th. No extra cost.",
    "Your bill is due on the 15th. Amount due is $45.20.",
    "This is a prescription reminder. Take twice daily with food.",
    "Your insurance claim was approved. You'll get a check in 7-10 days.",
  ];

  const summary = mockSummaries[Math.floor(Math.random() * mockSummaries.length)];

  return {
    doc_id: generateId(),
    summary,
    confidence: 0.92,
  };
}

async function mockReminderEndpoint(request: ReminderRequest): Promise<ReminderResponse> {
  await delay(500);

  // Parse natural language time if not provided
  let when_iso = request.when_iso;
  if (!when_iso) {
    when_iso = parseNaturalLanguageTime(request.text);
  }

  return {
    reminder_id: generateId(),
    when_iso,
    text: request.text,
  };
}

/**
 * Simple natural language time parser
 */
function parseNaturalLanguageTime(text: string): string {
  const now = new Date();
  const lower = text.toLowerCase();

  // "in X hours"
  const hoursMatch = lower.match(/in (\d+) hours?/);
  if (hoursMatch) {
    const hours = parseInt(hoursMatch[1]);
    now.setHours(now.getHours() + hours);
    return now.toISOString();
  }

  // "in X minutes"
  const minutesMatch = lower.match(/in (\d+) minutes?/);
  if (minutesMatch) {
    const minutes = parseInt(minutesMatch[1]);
    now.setMinutes(now.getMinutes() + minutes);
    return now.toISOString();
  }

  // "at X pm/am"
  const timeMatch = lower.match(/at (\d+):?(\d+)?\s*(am|pm)/);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1]);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
    const ampm = timeMatch[3];

    if (ampm === 'pm' && hours < 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;

    now.setHours(hours, minutes, 0, 0);

    // If time has passed today, set for tomorrow
    if (now < new Date()) {
      now.setDate(now.getDate() + 1);
    }

    return now.toISOString();
  }

  // "tomorrow"
  if (lower.includes('tomorrow')) {
    now.setDate(now.getDate() + 1);
    now.setHours(9, 0, 0, 0); // Default to 9 AM
    return now.toISOString();
  }

  // Default: 1 hour from now
  now.setHours(now.getHours() + 1);
  return now.toISOString();
}

// Utility functions
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get a friendly greeting based on time of day
 */
export function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Format AI response for better readability
 */
export function formatAIResponse(text: string): string {
  // Capitalize first letter
  let formatted = text.charAt(0).toUpperCase() + text.slice(1);
  
  // Ensure proper ending punctuation
  if (!/[.!?]$/.test(formatted)) {
    formatted += '.';
  }
  
  return formatted;
}

