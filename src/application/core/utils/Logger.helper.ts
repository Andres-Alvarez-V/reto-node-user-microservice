import pino from "pino";
import { config } from "../config";

class Logger {
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

  
  info(message: string, ...args: any[]) {
    this.logger.info(message, ...args);
  }

  error(message: string, ...args: any[]) {
    this.logger.error({
      error: args
    }, message);
  }
}


export const logger = new Logger();
