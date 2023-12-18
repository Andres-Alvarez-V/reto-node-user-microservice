import { IUser as IUserDto } from "../../domain/dto/User.dto";
import { IUser as IUserModel } from "../../domain/repositories/models/User.model";

export class UserMapper {
	static toDomain(user: IUserModel): IUserDto {
		return {
			id: user.id,
			name: user.name,
			email: user.email,
			imageUrl: user.user_image,
		};
	}

	static toPersistence(user: IUserDto): IUserModel {
		const dataToReturn: IUserModel = {};
		for (const [key, value] of Object.entries(user)) {
			const keyMapped = UserMapper.mapKeyToPersistence(key);
			if (keyMapped) {
				dataToReturn[keyMapped as keyof IUserModel] = value;
			}
		}
		return dataToReturn;
	}

	private static mapKeyToPersistence(key: string): string | undefined {
		const keyMappings: Record<string, string> = {
			id: "id",
			name: "name",
			email: "email",
			password: "password",
			imageUrl: "user_image",
		};
		return keyMappings[key] || undefined;
	}
}
