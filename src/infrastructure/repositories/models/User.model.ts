import { DataTypes, Model, Sequelize } from "sequelize";
import { TABLES_NAMES } from "../../../application/core/utils/Constants";
import { IUser } from "../../../domain/repositories/models/User.model";

export const UserSchema = {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	email: {
		type: DataTypes.STRING,
		unique: true,
		allowNull: false,
	},
	password: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	user_image: {
		type: DataTypes.STRING,
		allowNull: false,
	},
};

export class User extends Model<IUser, Omit<IUser, "id">> implements IUser {
	public id!: number;
	public name!: string;
	public email!: string;
	public password!: string;
	public user_image!: string;

	static config(sequelize: Sequelize) {
		return {
			sequelize,
			tableName: TABLES_NAMES.USERS,
			modelName: TABLES_NAMES.USERS,
			timestamps: false,
		};
	}
}
