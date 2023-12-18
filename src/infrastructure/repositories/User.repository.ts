import { Sequelize } from "sequelize";
import { IUserRepository } from "../../domain/repositories/User.repository";
import { SequelizeMysqlConnection } from "./sequelizeMysqlConnection";
import { User } from "./models/User.model";
import { IUser } from "../../domain/repositories/models/User.model";

export class UserRepository implements IUserRepository {

  private sequelize: Sequelize;

  constructor() {
    this.sequelize =  SequelizeMysqlConnection.getInstance();
  }

  async createUser(user: IUser): Promise<void> {
    await User.create(user);
  }

  async getUserById(id: number): Promise<IUser | null> {
    const user = await User.findByPk(id);
    if (!user) {
      return null;
    }
    return user.toJSON<IUser>();
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return null;
    }
    return user.toJSON<IUser>();
  }

  async updateUser(id: number, user: IUser): Promise<void> {
    await User.update(user, { where: { id } });
  }

  async deleteUser(id: number): Promise<void> {
    await User.destroy({ where: { id } });
  }

}