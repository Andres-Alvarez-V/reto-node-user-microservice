import { Dialect, Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { setUpModels } from './models/index';
import { config } from '../../application/core/config';
import { DEFAULT_VALUES } from '../../application/core/utils/Constants';

dotenv.config();

export class SequelizeMysqlConnection {
	private static instance: Sequelize | null = null;

	static getInstance(): Sequelize {
		if (!SequelizeMysqlConnection.instance) {
			SequelizeMysqlConnection.instance = new Sequelize({
				...config.DATABASE[config.NODE_ENVIRONMENT as keyof typeof config.DATABASE],
				dialect: (config.DATABASE[config.NODE_ENVIRONMENT as keyof typeof config.DATABASE] ).dialect as Dialect,
				logging: (config.DATABASE[config.NODE_ENVIRONMENT as keyof typeof config.DATABASE] ).logging === DEFAULT_VALUES.TRUE_STRING,
			});
			setUpModels(SequelizeMysqlConnection.instance);
			if (this.instance) {
				this.instance.sync();
			}
		}

		return SequelizeMysqlConnection.instance;
	}
}