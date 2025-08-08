/**
 * Simple logger utility for the nm-zwds-server application
 * 
 * Provides structured logging with timestamp and level information.
 * Following strict TypeScript guidelines with no 'any' types.
 */

/**
 * Available log levels
 */
type LogLevel = "info" | "warn" | "error" | "debug";

/**
 * Log entry structure
 */
interface LogEntry {
  readonly timestamp: string;
  readonly level: LogLevel;
  readonly message: string;
  readonly data?: unknown;
}

/**
 * Logger class for structured logging
 */
class Logger {
  /**
   * Format timestamp in ISO format
   * @returns {string} Formatted timestamp
   */
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Create a formatted log entry
   * @param {LogLevel} level - The log level
   * @param {string} message - The log message
   * @param {unknown} data - Optional additional data
   * @returns {LogEntry} Formatted log entry
   */
  private createLogEntry(level: LogLevel, message: string, data?: unknown): LogEntry {
    return {
      timestamp: this.getTimestamp(),
      level,
      message,
      ...(data && { data }),
    };
  }

  /**
   * Output log entry to console
   * @param {LogEntry} entry - The log entry to output
   */
  private output(entry: LogEntry): void {
    const logString = `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`;
    
    switch (entry.level) {
      case "error":
        console.error(logString, entry.data || "");
        break;
      case "warn":
        console.warn(logString, entry.data || "");
        break;
      case "debug":
        console.debug(logString, entry.data || "");
        break;
      default:
        console.log(logString, entry.data || "");
    }
  }

  /**
   * Log an info message
   * @param {string} message - The message to log
   * @param {unknown} data - Optional additional data
   */
  public info(message: string, data?: unknown): void {
    this.output(this.createLogEntry("info", message, data));
  }

  /**
   * Log a warning message
   * @param {string} message - The message to log
   * @param {unknown} data - Optional additional data
   */
  public warn(message: string, data?: unknown): void {
    this.output(this.createLogEntry("warn", message, data));
  }

  /**
   * Log an error message
   * @param {string} message - The message to log
   * @param {unknown} data - Optional additional data
   */
  public error(message: string, data?: unknown): void {
    this.output(this.createLogEntry("error", message, data));
  }

  /**
   * Log a debug message
   * @param {string} message - The message to log
   * @param {unknown} data - Optional additional data
   */
  public debug(message: string, data?: unknown): void {
    this.output(this.createLogEntry("debug", message, data));
  }
}

/**
 * Singleton logger instance
 */
export const logger = new Logger();