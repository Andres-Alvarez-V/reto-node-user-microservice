import { IUser as IUserDto } from "../../domain/dto/User.dto";
import { IUserRepository } from "../../domain/repositories/User.repository";
import { IUserImagesRepository } from "../../domain/repositories/UserImages.repository";
import { IUser as IUserModel } from "../../domain/repositories/models/User.model";
import { config } from "../core/config";
import { AuthHelper } from "../core/utils/Auth.helper";
import { RESPONSE_MESSAGES, HTTP_STATUS_CODE } from '../core/utils/Constants';
import { CustomError } from "../core/utils/CustomError.helper";
import { UserMapper } from "../mappers/User.mapper";

export class UserUseCase {
	constructor(
		private readonly userRepository: IUserRepository,
		private readonly userImagesRepository: IUserImagesRepository
	) {}

	async createUser(user: IUserDto, image: any, imageExtension: string) {
		const userFound = await this.userRepository.getUserByEmail(
			user.email as string
		);
		if (userFound) {
			throw new CustomError(RESPONSE_MESSAGES.USER_ALREADY_EXISTS, HTTP_STATUS_CODE.CONFLICT);
		}

		if (image) {
			const key = `${user.email}.${imageExtension}`;
			await this.userImagesRepository.uploadImage(
				image,
				key
			);
			user.imageUrl = `${config.AWS_S3.BUCKET_URL}${key}`
		}

		const passwordEncrypted = await AuthHelper.encryptPassword(
			user.password as string
		);

		user.password = passwordEncrypted;
		const userModel: IUserModel = UserMapper.toPersistence(user);
		await this.userRepository.createUser(userModel);
	}

	async getUser(token: string): Promise<IUserDto> {
		const jwtDecoded = AuthHelper.decodeToken(token);
		const user = await this.userRepository.getUserById(jwtDecoded.id);
		if (!user) {
			throw new CustomError(RESPONSE_MESSAGES.USER_NOT_FOUND, HTTP_STATUS_CODE.NOT_FOUND);
		}
		return UserMapper.toDomain(user);
	}

	async updateUser(token: string, user: IUserDto): Promise<void> {
		const jwtDecoded = AuthHelper.decodeToken(token);
		const userModel = UserMapper.toPersistence(user);
		if (userModel.password) {
			throw new CustomError(RESPONSE_MESSAGES.PASSWORD_NOT_ALLOWED, HTTP_STATUS_CODE.BAD_REQUEST);
		}
		await this.userRepository.updateUser(jwtDecoded.id, user);
	}

	async deleteUser(token: string): Promise<void> {
		const jwtDecoded = AuthHelper.decodeToken(token);
		const user = await this.userRepository.getUserById(jwtDecoded.id);
		if (!user) {
			throw new CustomError(RESPONSE_MESSAGES.USER_NOT_FOUND, HTTP_STATUS_CODE.NOT_FOUND);
		}
		const key = user.user_image?.split(config.AWS_S3.BUCKET_URL)[1];
		if (key) {
			await this.userImagesRepository.deleteImage(key);
		}
		await this.userRepository.deleteUser(jwtDecoded.id);
	}

	async login(user: IUserDto): Promise<string> {
		const userFound = await this.userRepository.getUserByEmail(
			user.email as string
		);
		if (!userFound) {
			throw new CustomError(RESPONSE_MESSAGES.USER_NOT_FOUND, HTTP_STATUS_CODE.NOT_FOUND);
		}
		const passwordMatch = await AuthHelper.comparePassword(
			user.password as string,
			userFound.password as string
		);
		if (!passwordMatch) {
			throw new CustomError(RESPONSE_MESSAGES.PASSWORD_NOT_MATCH, HTTP_STATUS_CODE.UNAUTHORIZED);
		}
		return AuthHelper.generateToken(userFound.id as number);
	}
}
