import pino, { Logger, LoggerOptions } from 'pino';

export function createLogger(options: LoggerOptions = {}): Logger {
  const defaultOptions: LoggerOptions = {
    level: process.env.LOG_LEVEL || 'info',
    transport:
      process.env.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
    formatters: {
      level: (label) => ({ level: label.toUpperCase() }),
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    ...options,
  };

  return pino(defaultOptions);
}

export const logger = createLogger();

export function createChildLogger(parent: Logger, bindings: Record<string, any>): Logger {
  return parent.child(bindings);
}