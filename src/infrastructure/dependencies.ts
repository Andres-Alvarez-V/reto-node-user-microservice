import { UserUseCase } from "../application/usecases/User.usecase";
import { UserController } from "./controllers/User.controller";
import { UserRepository } from "./repositories/User.repository";
import { UserImagesRepository } from "./repositories/UserImages.repository";

const userRepository = new UserRepository();
const userImagesRepository = new UserImagesRepository();
const userUsecase = new UserUseCase(userRepository, userImagesRepository);
export const userController = new UserController(userUsecase);

