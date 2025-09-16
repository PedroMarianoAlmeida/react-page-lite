/**
 * Logging utilities for the build system
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

class Logger {
  private level: LogLevel = LogLevel.INFO;

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  error(message: string, ...args: any[]): void {
    if (this.level >= LogLevel.ERROR) {
      console.error(`❌ ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.level >= LogLevel.WARN) {
      console.warn(`⚠️  ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.level >= LogLevel.INFO) {
      console.log(`ℹ️  ${message}`, ...args);
    }
  }

  success(message: string, ...args: any[]): void {
    if (this.level >= LogLevel.INFO) {
      console.log(`✅ ${message}`, ...args);
    }
  }

  debug(message: string, ...args: any[]): void {
    if (this.level >= LogLevel.DEBUG) {
      console.log(`🔍 ${message}`, ...args);
    }
  }

  step(message: string, ...args: any[]): void {
    if (this.level >= LogLevel.INFO) {
      console.log(`🔄 ${message}`, ...args);
    }
  }
}

export const logger = new Logger();

/**
 * Performance timing utility
 */
export class Timer {
  private start: number;
  private label: string;

  constructor(label: string) {
    this.label = label;
    this.start = performance.now();
    logger.step(`Starting ${label}...`);
  }

  end(): void {
    const duration = performance.now() - this.start;
    logger.success(`${this.label} completed in ${duration.toFixed(2)}ms`);
  }
}