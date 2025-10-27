/**
 * Comprehensive Error Handling Utilities
 * Provides retry logic, timeout handling, and user-friendly error messages
 */

// ============================================================================
// Error Classes
// ============================================================================

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

export class PermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PermissionError';
  }
}

// ============================================================================
// Retry Logic
// ============================================================================

export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoff?: 'linear' | 'exponential';
  onRetry?: (attempt: number, error: Error) => void;
}

const defaultRetryOptions: Required<RetryOptions> = {
  maxAttempts: 3,
  delayMs: 1000,
  backoff: 'exponential',
  onRetry: () => {},
};

/**
 * Retry a promise-returning function with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...defaultRetryOptions, ...options };
  let lastError: Error;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on certain errors
      if (
        error instanceof PermissionError ||
        error instanceof TypeError ||
        error instanceof ReferenceError
      ) {
        throw error;
      }

      // If this was the last attempt, throw
      if (attempt === opts.maxAttempts) {
        throw error;
      }

      // Call retry callback
      opts.onRetry(attempt, error as Error);

      // Calculate delay with backoff
      const delay =
        opts.backoff === 'exponential'
          ? opts.delayMs * Math.pow(2, attempt - 1)
          : opts.delayMs * attempt;

      // Wait before retrying
      await sleep(delay);
    }
  }

  throw lastError!;
}

/**
 * Add a timeout to a promise
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string = 'Operation timed out'
): Promise<T> {
  let timeoutId: NodeJS.Timeout;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new TimeoutError(errorMessage));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId!);
    return result;
  } catch (error) {
    clearTimeout(timeoutId!);
    throw error;
  }
}

/**
 * Sleep/delay utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// User-Friendly Error Messages
// ============================================================================

/**
 * Convert technical errors to user-friendly messages
 */
export function getUserFriendlyError(error: Error): string {
  // Network errors
  if (error instanceof NetworkError || error.message.includes('network')) {
    return 'Connection issue. Please check your internet.';
  }

  // Timeout errors
  if (error instanceof TimeoutError || error.message.includes('timeout')) {
    return 'Request took too long. Please try again.';
  }

  // Permission errors
  if (
    error instanceof PermissionError ||
    error.message.includes('permission') ||
    error.message.includes('denied')
  ) {
    return 'Permission needed. Please check settings.';
  }

  // Audio/microphone errors
  if (
    error.message.includes('microphone') ||
    error.message.includes('audio') ||
    error.message.includes('recording')
  ) {
    return 'Microphone access needed. Check permissions.';
  }

  // Camera/photo errors
  if (
    error.message.includes('camera') ||
    error.message.includes('photo') ||
    error.message.includes('image')
  ) {
    return 'Camera access needed. Check permissions.';
  }

  // Storage errors
  if (error.message.includes('storage') || error.message.includes('quota')) {
    return 'Storage full. Please free up space.';
  }

  // Default friendly message
  return 'Something went wrong. Please try again.';
}

/**
 * Log errors with context (for debugging)
 */
export function logError(
  error: Error,
  context: string,
  additionalInfo?: Record<string, any>
) {
  console.error(`[${context}]`, error.message, {
    name: error.name,
    stack: error.stack,
    ...additionalInfo,
  });
}

/**
 * Wrap async functions with error handling
 */
export function handleAsyncError<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context: string
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(error as Error, context);
      throw error;
    }
  }) as T;
}

// ============================================================================
// Error Boundary Helpers
// ============================================================================

/**
 * Check if an error is recoverable
 */
export function isRecoverableError(error: Error): boolean {
  // Network and timeout errors are recoverable
  if (error instanceof NetworkError || error instanceof TimeoutError) {
    return true;
  }

  // Permission errors require user action but are recoverable
  if (error instanceof PermissionError) {
    return true;
  }

  // Programming errors are not recoverable
  if (error instanceof TypeError || error instanceof ReferenceError) {
    return false;
  }

  // Default to recoverable for unknown errors
  return true;
}

/**
 * Safe JSON parse with error handling
 */
export function safeJSONParse<T>(
  json: string,
  fallback: T
): T {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    logError(error as Error, 'JSON Parse');
    return fallback;
  }
}

/**
 * Safe async storage operations
 */
export async function safeAsyncOperation<T>(
  operation: () => Promise<T>,
  fallback: T,
  context: string = 'AsyncOperation'
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    logError(error as Error, context);
    return fallback;
  }
}
