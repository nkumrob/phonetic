/**
 * Production-safe logger utility
 * Only logs in development, silent in production
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerOptions {
  context?: string;
  metadata?: Record<string, any>;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isTest = process.env.NODE_ENV === 'test';

  private formatMessage(level: LogLevel, message: string, options?: LoggerOptions): string {
    const timestamp = new Date().toISOString();
    const context = options?.context ? `[${options.context}]` : '';
    return `${timestamp} [${level.toUpperCase()}]${context} ${message}`;
  }

  private shouldLog(level: LogLevel): boolean {
    // Never log in production
    if (!this.isDevelopment && !this.isTest) {
      return false;
    }

    // In test, only log errors
    if (this.isTest && level !== 'error') {
      return false;
    }

    return true;
  }

  debug(message: string, options?: LoggerOptions): void {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message, options), options?.metadata || '');
    }
  }

  info(message: string, options?: LoggerOptions): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, options), options?.metadata || '');
    }
  }

  warn(message: string, options?: LoggerOptions): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, options), options?.metadata || '');
    }
  }

  error(message: string, error?: Error | unknown, options?: LoggerOptions): void {
    if (this.shouldLog('error')) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      console.error(
        this.formatMessage('error', `${message} - ${errorMessage}`, options),
        {
          ...options?.metadata,
          stack: errorStack,
        }
      );
    }
  }

  /**
   * For critical errors that should be reported to monitoring services
   */
  fatal(message: string, error: Error, options?: LoggerOptions): void {
    // In production, this would send to error tracking service
    if (this.isDevelopment) {
      console.error(
        this.formatMessage('error', `FATAL: ${message}`, options),
        error
      );
    }
    
    // Here you would integrate with Sentry or similar
    // Example: Sentry.captureException(error, { extra: options?.metadata });
  }
}

// Export singleton instance
export const logger = new Logger();

// Export for testing
export { Logger };