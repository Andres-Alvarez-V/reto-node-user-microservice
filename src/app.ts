import cors from "cors";

import express, { Application } from "express";
import { config } from "./application/core/config";
import routes from "./infrastructure/routes";
import {
	errorHandler,
	logErrors,
} from "./infrastructure/middleware/Error.handler";

export class App {
	private app: Application;

	constructor() {
		this.app = express();
		this.app.use(cors());
		this.app.use(express.json());
		routes(this.app);
		this.app.use(logErrors);
		this.app.use(errorHandler);
	}

	public getInstance(): Application {
		return this.app;
	}

	public async run() {
		try {
			this.app.listen(config.APP_PORT, () => {
				console.log(
					`[APP] - Application is running on port ${config.APP_PORT}`
				);
			});
		} catch (error) {
			console.error(error);
		}
	}
}
