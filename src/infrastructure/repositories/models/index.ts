import { User, UserSchema } from './User.model';
import { Sequelize } from 'sequelize';

export const setUpModels = (sequelize: Sequelize) => {
	User.init(UserSchema, User.config(sequelize));
};