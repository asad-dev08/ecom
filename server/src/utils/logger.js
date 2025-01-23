import winston from "winston";
import Transport from "winston-transport";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Custom transport class for database logging
class PrismaTransport extends Transport {
  constructor(opts) {
    super(opts);
    this.name = "PrismaTransport";
  }

  async log(info, callback) {
    setImmediate(() => {
      this.emit("logged", info);
    });

    try {
      await prisma.applicationLog.create({
        data: {
          level: info.level,
          message: info.message,
          meta: info.context ? JSON.stringify(info.context) : null,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      console.error("Failed to write log to database:", error);
    }

    callback();
  }
}

// Create logger instance
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      dirname: "logs",
      maxsize: 10000000, // 10MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
      dirname: "logs",
      maxsize: 10000000, // 10MB
      maxFiles: 5,
    }),
    new PrismaTransport(),
  ],
});

// Add console transport in development
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

// Helper functions for structured logging
export const logError = (message, error, context = {}) => {
  logger.error(message, {
    error: error.message,
    stack: error.stack,
    ...context,
  });
};

export const logInfo = (message, context = {}) => {
  logger.info(message, context);
};

export const logWarn = (message, context = {}) => {
  logger.warn(message, context);
};

export const logDebug = (message, context = {}) => {
  logger.debug(message, context);
};

export default logger;
