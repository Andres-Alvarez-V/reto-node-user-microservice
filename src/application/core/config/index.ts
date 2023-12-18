import dotenv from "dotenv";
import { DEFAULT_VALUES } from "../utils/Constants";

dotenv.config();

export const config = {
	NODE_ENVIRONMENT:
		process.env.NODE_ENVIRONMENT ?? DEFAULT_VALUES.NODE_ENV_LOCAL,
	DATABASE: {
		LOCAL: {
			host: process.env.MYSQL_HOST_LOCAL ?? DEFAULT_VALUES.EMPTY_STRING,
			username: process.env.MYSQL_USER_LOCAL ?? DEFAULT_VALUES.EMPTY_STRING,
			password: process.env.MYSQL_PASSWORD_LOCAL ?? DEFAULT_VALUES.EMPTY_STRING,
			database: process.env.MYSQL_DATABASE_LOCAL ?? DEFAULT_VALUES.EMPTY_STRING,
			port: Number(process.env.MYSQL_PORT_LOCAL) ?? DEFAULT_VALUES.ZERO_PORT,
			dialect: process.env.MYSQL_DIALECT_LOCAL ?? DEFAULT_VALUES.EMPTY_STRING,
			logging: process.env.MYSQL_LOGGING_LOCAL ?? DEFAULT_VALUES.FALSE_STRING,
		},
		DEV: {
			host: process.env.MYSQL_HOST_DEV ?? DEFAULT_VALUES.EMPTY_STRING,
			username: process.env.MYSQL_USER_DEV ?? DEFAULT_VALUES.EMPTY_STRING,
			password: process.env.MYSQL_PASSWORD_DEV ?? DEFAULT_VALUES.EMPTY_STRING,
			database: process.env.MYSQL_DATABASE_DEV ?? DEFAULT_VALUES.EMPTY_STRING,
			port: Number(process.env.MYSQL_PORT_DEV) ?? DEFAULT_VALUES.ZERO_PORT,
			dialect: process.env.MYSQL_DIALECT_DEV ?? DEFAULT_VALUES.EMPTY_STRING,
			logging: process.env.MYSQL_LOGGING_DEV ?? DEFAULT_VALUES.FALSE_STRING,
		},
		PROD: {
			host: process.env.MYSQL_HOST_PROD ?? DEFAULT_VALUES.EMPTY_STRING,
			username: process.env.MYSQL_USER_PROD ?? DEFAULT_VALUES.EMPTY_STRING,
			password: process.env.MYSQL_PASSWORD_PROD ?? DEFAULT_VALUES.EMPTY_STRING,
			database: process.env.MYSQL_DATABASE_PROD ?? DEFAULT_VALUES.EMPTY_STRING,
			port: Number(process.env.MYSQL_PORT_PROD) ?? DEFAULT_VALUES.ZERO_PORT,
			dialect: process.env.MYSQL_DIALECT_PROD ?? DEFAULT_VALUES.EMPTY_STRING,
			logging: process.env.MYSQL_LOGGING_PROD ?? DEFAULT_VALUES.FALSE_STRING,
		},
	},
	JWT_SECRET_KEY: process.env.JWT_SECRET_KEY ?? DEFAULT_VALUES.EMPTY_STRING,
	APP_PORT: Number(process.env.APP_PORT) ?? DEFAULT_VALUES.APP_PORT,
};
