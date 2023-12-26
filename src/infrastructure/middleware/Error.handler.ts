import { NextFunction, Request, Response } from "express";
import { HTTP_STATUS_CODE } from "../../application/core/utils/Constants";
import { Error } from "sequelize";
import { CustomError } from "../../application/core/utils/CustomError.helper";
import { logger } from "../../application/core/utils/Logger.helper";

export const errorHandler = (
	err: Error,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	if (err instanceof CustomError) {
		return res
			.status(err.statusCode)
			.json({ message: err.message, body: null });
	}
	logger.error(err.message, err.stack);
	res
		.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR)
		.json({ message: err.message, body: null });
};
