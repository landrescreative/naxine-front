/**
 * Sistema de logging centralizado para el frontend
 * Solo loguea en desarrollo para evitar exposición de información en producción
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: unknown;
  timestamp: string;
  context?: string;
}

class Logger {
  private isDevelopment: boolean;
  private logLevel: LogLevel;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === "development";
    // En producción, solo mostrar errores y warnings
    this.logLevel = this.isDevelopment ? "debug" : "warn";
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.isDevelopment) {
      // En producción, solo loguear warnings y errores
      return level === "warn" || level === "error";
    }
    return true;
  }

  private formatMessage(level: LogLevel, message: string, context?: string): string {
    const prefix = context ? `[${context}]` : "";
    return `${prefix} ${message}`.trim();
  }

  private log(level: LogLevel, message: string, data?: unknown, context?: string): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const formattedMessage = this.formatMessage(level, message, context);
    const entry: LogEntry = {
      level,
      message: formattedMessage,
      data,
      timestamp: new Date().toISOString(),
      context,
    };

    switch (level) {
      case "debug":
        if (this.isDevelopment) {
          console.log(`[DEBUG] ${formattedMessage}`, data || "");
        }
        break;
      case "info":
        if (this.isDevelopment) {
          console.info(`[INFO] ${formattedMessage}`, data || "");
        }
        break;
      case "warn":
        console.warn(`[WARN] ${formattedMessage}`, data || "");
        break;
      case "error":
        console.error(`[ERROR] ${formattedMessage}`, data || "");
        // En producción, podrías enviar errores a un servicio de logging
        if (!this.isDevelopment) {
          // Aquí podrías integrar con un servicio como Sentry, LogRocket, etc.
          // this.sendToLoggingService(entry);
        }
        break;
    }
  }

  debug(message: string, data?: unknown, context?: string): void {
    this.log("debug", message, data, context);
  }

  info(message: string, data?: unknown, context?: string): void {
    this.log("info", message, data, context);
  }

  warn(message: string, data?: unknown, context?: string): void {
    this.log("warn", message, data, context);
  }

  error(message: string, data?: unknown, context?: string): void {
    this.log("error", message, data, context);
  }

  /**
   * Log de grupo - útil para agrupar logs relacionados
   */
  group(label: string, callback: () => void): void {
    if (this.isDevelopment) {
      console.group(label);
      callback();
      console.groupEnd();
    }
  }

  /**
   * Log de tabla - útil para arrays y objetos
   */
  table(data: unknown): void {
    if (this.isDevelopment) {
      console.table(data);
    }
  }
}

// Exportar instancia singleton
export const logger = new Logger();

// Exportar también la clase por si se necesita crear instancias personalizadas
export { Logger };

