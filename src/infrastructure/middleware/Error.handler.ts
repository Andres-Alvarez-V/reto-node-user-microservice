import { NextFunction, Request, Response } from "express";
import { HTTP_STATUS_CODE } from "../../application/core/utils/Constants";
import { Error } from "sequelize";

export const logErrors = (
	err: Error,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	console.error(err.stack);
	next(err);
};

export const errorHandler = (
	err: Error,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	res
		.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR)
		.json({ message: err.message, error: err, body: null });
};
