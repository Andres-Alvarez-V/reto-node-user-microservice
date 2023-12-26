import cors from "cors";

import express, { Application } from "express";
import { config } from "./application/core/config";
import routes from "./infrastructure/routes";
import { errorHandler } from "./infrastructure/middleware/Error.handler";
import { logger } from "./application/core/utils/Logger.helper";
import { RESPONSE_MESSAGES } from "./application/core/utils/Constants";

export class App {
	private app: Application;

	constructor() {
		this.app = express();
		this.app.use(cors());
		this.app.use(express.json());
		routes(this.app);
		this.app.use(errorHandler);
	}

	public getInstance(): Application {
		return this.app;
	}

	public async run() {
		try {
			this.app.listen(config.APP_PORT, () => {
				logger.info(
					`[APP] - Application is running on port ${config.APP_PORT}`
				);
			});
		} catch (error) {
			logger.error(RESPONSE_MESSAGES.INTERNAL_ERROR, error);
		}
	}
}
