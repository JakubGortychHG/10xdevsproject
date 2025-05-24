type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
}

export class LoggerService {
  private static instance: LoggerService;

  private constructor() {}

  static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  private formatLog(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };
  }

  private output(entry: LogEntry): void {
    const logMessage = JSON.stringify(entry);
    switch (entry.level) {
      case "error":
        console.error(logMessage);
        break;
      case "warn":
        console.warn(logMessage);
        break;
      case "debug":
        console.debug(logMessage);
        break;
      default:
        console.log(logMessage);
    }
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.output(this.formatLog("info", message, context));
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.output(this.formatLog("warn", message, context));
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.output(this.formatLog("error", message, context));
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.output(this.formatLog("debug", message, context));
  }
}
