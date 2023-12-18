import { NextFunction, Request, Response } from "express";
import { UserUseCase } from "../../application/usecases/User.usecase";
import {
	HTTP_STATUS_CODE,
	RESPONSE_MESSAGES,
} from "../../application/core/utils/Constants";
import { IUser } from "../../domain/dto/User.dto";

export class UserController {
	constructor(private readonly userUsecase: UserUseCase) {}

	async createUser(req: Request, res: Response, next: NextFunction) {
		try {
			const data: IUser = JSON.parse(req.body.body);
			const image = req.file?.buffer;
      const imageExtension = req.file?.originalname.split(".")[1];
			await this.userUsecase.createUser(data, image, imageExtension as string);
			res.status(HTTP_STATUS_CODE.CREATED).json({
				message: RESPONSE_MESSAGES.USER_CREATED,
				error: null,
				body: null,
			});
		} catch (error) {
			next(error);
		}
	}

	async getUser(req: Request, res: Response, next: NextFunction) {
		try {
			const token = req.headers.authorization as string;
			if (!token) {
				res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({
					message: RESPONSE_MESSAGES.TOKEN_NOT_FOUND,
					error: null,
					body: null,
				});
			}
			const user = await this.userUsecase.getUser(token);
			res.status(HTTP_STATUS_CODE.OK).json({
				message: RESPONSE_MESSAGES.OPERATION_SUCCESS,
				error: null,
				body: user,
			});
		} catch (error) {
			next(error);
		}
	}

	async updateUser(req: Request, res: Response, next: NextFunction) {
		try {
			const token = req.headers.authorization as string;
			if (!token) {
				res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({
					message: RESPONSE_MESSAGES.TOKEN_NOT_FOUND,
					error: null,
					body: null,
				});
			}
			const data: IUser = req.body;
			await this.userUsecase.updateUser(token, data);
			res.status(HTTP_STATUS_CODE.OK).json({
				message: RESPONSE_MESSAGES.OPERATION_SUCCESS,
				error: null,
				body: null,
			});
		} catch (error) {
			next(error);
		}
	}

	async deleteUser(req: Request, res: Response, next: NextFunction) {
		try {
			const token = req.headers.authorization as string;
			if (!token) {
				res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({
					message: RESPONSE_MESSAGES.TOKEN_NOT_FOUND,
					error: null,
					body: null,
				});
			}
			await this.userUsecase.deleteUser(token);
			res.status(HTTP_STATUS_CODE.OK).json({
				message: RESPONSE_MESSAGES.OPERATION_SUCCESS,
				error: null,
				body: null,
			});
		} catch (error) {
			next(error);
		}
	}

	async login(req: Request, res: Response, next: NextFunction) {
		try {
			const data: IUser = req.body;
			const token = await this.userUsecase.login(data);
			res.status(HTTP_STATUS_CODE.OK).json({
				message: RESPONSE_MESSAGES.OPERATION_SUCCESS,
				error: null,
				body: { token: token },
			});
		} catch (error) {
			next(error);
		}
	}
}
