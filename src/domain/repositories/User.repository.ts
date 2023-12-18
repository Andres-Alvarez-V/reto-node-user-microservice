import { IUser } from "../repositories/models/User.model";

export interface IUserRepository {
  createUser(user: IUser): Promise<void>;
  getUserById(id: number): Promise<IUser | null>;
  getUserByEmail(email: string): Promise<IUser | null>;
  updateUser(id: number, user: IUser): Promise<void>;
  deleteUser(id: number): Promise<void>;
}