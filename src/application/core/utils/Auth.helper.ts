import jwt from "jsonwebtoken";
import { config } from "../config/index";
import bcrypt from "bcrypt";

interface DecodedToken {
  id: number;
}

export class AuthHelper {
	static decodeToken(token: string) {
		const decoded = jwt.verify(token, config.JWT_SECRET_KEY) as DecodedToken;
		return decoded;
	}

	static generateToken(id: number) {
		const token = jwt.sign({ id }, config.JWT_SECRET_KEY, {
			expiresIn: "1h",
		});

		return token;
	}

	static async encryptPassword(password: string) {
		const salt = bcrypt.genSaltSync(10);
		const passwordEncrypted = await bcrypt.hash(password, salt);
		return passwordEncrypted;
	}

	static async comparePassword(password: string, receivedPassword: string) {
		const isPasswordValid = await bcrypt.compare(password, receivedPassword);
		return isPasswordValid;
	}
}
