import pino from "pino";
import { config } from "../config";

export class Logger {
  private static instance: Logger;
  private logger: pino.Logger;

  constructor() {
    this.logger = pino({  
      level: config.PINO_LOG_LEVEL,
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          ignore: "pid,hostname",
          translateTime: "SYS:standard",
        },
      },
    });
  }

  private static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }

    return Logger.instance;
  }

  static info(message: string, ...args: any[]) {
    Logger.getInstance().logger.info(message, ...args);
  }

  static error(message: string, ...args: any[]) {
    Logger.getInstance().logger.error({
      error: args
    }, message);
  }
}
