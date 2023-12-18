import { UserUseCase } from "../application/usecases/User.usecase";
import { UserController } from "./controllers/User.controller";
import { UserRepository } from "./repositories/User.repository";

const userRepository = new UserRepository();
const userUsecase = new UserUseCase(userRepository);
export const userController = new UserController(userUsecase);

