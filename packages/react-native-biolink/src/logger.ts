import { logger, consoleTransport } from 'react-native-logs';

/**
 * Logger interface for Biolink modules
 */
export interface Logger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

const defaultConfig = {
  severity: __DEV__ ? 'debug' : 'error',
  transport: consoleTransport,
  transportOptions: {
    colors: {
      info: 'blueBright' as const,
      warn: 'yellowBright' as const,
      error: 'redBright' as const,
      debug: 'white' as const,
    },
  },
  async: true,
  dateFormat: 'time' as const,
  printLevel: true,
  printDate: true,
  enabled: true,
};

class DefaultLogger implements Logger {
  private log = logger.createLogger(defaultConfig);

  debug(message: string, ...args: unknown[]): void {
    this.log.debug(`[BiolinkCore] ${message}`, ...args);
  }

  info(message: string, ...args: unknown[]): void {
    this.log.info(`[BiolinkCore] ${message}`, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    this.log.warn(`[BiolinkCore] ${message}`, ...args);
  }

  error(message: string, ...args: unknown[]): void {
    this.log.error(`[BiolinkCore] ${message}`, ...args);
  }
}

let currentLogger: Logger = new DefaultLogger();

/**
 * Get the current logger instance
 */
export function getLogger(): Logger {
  return currentLogger;
}

/**
 * Set a custom logger implementation
 * @param logger - Custom logger implementation
 */
export function setLogger(logger: Logger): void {
  currentLogger = logger;
}

/**
 * Reset to the default logger
 */
export function resetLogger(): void {
  currentLogger = new DefaultLogger();
}
