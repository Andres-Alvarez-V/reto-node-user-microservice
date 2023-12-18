# Microservicio de usuarios con Node.js, Express y TypeScript. Integracion con S3 de AWS. Despliegue en EC2 de AWS.

#### Autor: Andres Camilo Alvarez Vasquez
## Introduccion
Este repositorio contiene el codigo fuente de un microservicio de usuarios desarrollado con Node.js, Express y TypeScript. Ademas se integra con S3 de AWS para guardar imagenes de perfil de usuario. Por ultimo se despliega en EC2 de AWS.

El codigo fuente se puede encontrar en el siguiente repositorio.
https://github.com/Andres-Alvarez-V/reto-node-user-microservice

## Tabla de contenidos

- [Inicializacion del proyecto](#inicializacion-del-proyecto)
- [Creacion del Dominio de la aplicacion](#dominio-de-la-aplicacion)
- [Creacion de la capa de aplicacion](#capa-de-aplicacion)
- [Creacion de la capa de infraestructura](#capa-de-infraestructura)
- [Integracion con S3](#integracion-con-s3)
- [Despliegue en EC2](#despliegue-en-ec2)

## Inicializacion del proyecto

### PASO 1: Crear el proyecto e instalar dependencias
#### 1. Inicializar un nuevo proyecto de Node.js:
```bash
mkdir user-microservice
cd user-microservice
npm init -y
git init
```
#### 2. Instalar las dependencias necesarias:
```bash
npm install --save-dev @types/bcrypt @types/cors @types/express @types/jsonwebtoken @types/multer @types/node @types/sequelize nodemon ts-node typescript
npm install --save @aws-sdk/client-s3 bcrypt cors dotenv express jsonwebtoken multer mysql2 sequelize
```

### Paso 2: Configurar TypeScript
#### Crear un archivo de configuración de TypeScript (tsconfig.json):
```bash
npx tsc --init
```
#### Modificar el archivo tsconfig.json:
```json
{
  "compilerOptions": {
    "target": "es2020",
    "strict": true,
    "preserveConstEnums": true,
    "noEmit": true,
    "sourceMap": false,
    "module": "Commonjs",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "typeRoots": ["node_modules/@types","./src/types"],
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "allowSyntheticDefaultImports": true,
  },
  "exclude": ["node_modules"],
}
```

### Paso 3: Agregar gitignore
#### Crear un archivo '.gitignore' y agregar el siguiente contenido:
```bash
node_modules/
dist/
.tmp
.idea
.env
coverage/
```


### Paso 4: Configurar scripts de ejecución en package.json: 
Agregar los siguientes scripts en el archivo package.json para facilitar la ejecución y desarrollo:
```json
"scripts": {
  "start": "node dist/index.js",
  "dev": "nodemon --watch 'src/**/*.ts' --exec 'ts-node' src/main.ts",
  "build": "tsc"
}
```
* start: Inicia la aplicación en modo de producción.
* dev: Inicia la aplicación en modo de desarrollo con nodemon.
* build: Compila el código TypeScript en JavaScript.

### Paso 5: Crear la estructura del proyecto
#### Crear directorios src y dist:
```bash
mkdir src
cd src
mkdir application domain infrastructure
cd ..
```
---
### Definicion de endpoints y tablas de la base de datos

#### Endpoints
Nuestro microservicio se encargara de manejar los siguientes endpoints:

1. Crear un perfil de usuario:
    * Método: POST
    * Ruta: /usuario
    * Función: Crear un nuevo perfil de usuario con datos planos y una imagen de perfil.

2. Obtener información de un perfil de usuario:
    * Método: GET
    * Ruta: /usuario
    * Función: Obtener los detalles de un perfil de usuario específico. Se logra haciendo uso del JWT (JSON Web Token) que se envía en el encabezado de la solicitud.

3. Actualizar un perfil de usuario:
    * Método: PUT
    * Ruta: /usuario 
    * Función: Actualizar la información de un perfil de usuario existente, incluyendo la posibilidad de cambiar la imagen de perfil. Se logra haciendo uso del JWT (JSON Web Token) que se envía en el encabezado de la solicitud.

4. Eliminar un perfil de usuario:
    * Método: DELETE
    * Ruta: /usuario
    * Función: Eliminar un perfil de usuario específico. Se logra haciendo uso del JWT (JSON Web Token) que se envía en el encabezado de la solicitud.

5. Iniciar sesión:
    * Método: POST
    * Ruta: /login
    * Función: Verificar las credenciales del usuario y generar un JWT.


#### Tablas de la base de datos
  * Tabla de Usuarios:
    * Campos:
      * id (clave primaria)
      * name
      * email
      * user_image (almacena la referencia o la URL de la imagen de perfil)
      * password (almacenada de forma segura, por ejemplo, mediante hash)

---

Con todo lo anterior ya tenemos las configuraciones basicas para iniciar el desarrollo de nuestro microservicio.  

## Dominio de la aplicacion
En esta seccion crearemos los archivos de entidades y contratos de los repositorios.

### Crear DTOs en el dominio de la aplicacion
Ahora procederemos a crear los DTOs en el dominio de la aplicacion.
#### Crear el archivo 'src/domain/dto/User.dto.ts' y agregar el siguiente contenido:
```typescript
export interface IUser {
  id?: number;
  name?: string;
  email?: string;
  password?: string;
  imageUrl?: string;
}
```

### Crear contrato de los repositorios y modelos en el dominio de la aplicacion
Ahora procederemos a crear los contratos de los repositorios y modelos de la base de datos en el dominio de la aplicacion.
#### Crear el archivo 'src/domain/repositories/models/User.model.ts' y agregar el siguiente contenido:
```typescript
export interface IUser {
  id?: number;
  name?: string;
  email?: string;
  password?: string;
  user_image?: string;  
}
```

#### Crear el archivo 'src/domain/repositories/User.repository.ts' y agregar el siguiente contenido:
```typescript
import { IUser } from "../repositories/models/User.model";

export interface IUserRepository {
  createUser(user: IUser): Promise<void>;
  getUserById(id: number): Promise<IUser | null>;
  getUserByEmail(email: string): Promise<IUser | null>;
  updateUser(id: number, user: IUser): Promise<void>;
  deleteUser(id: number): Promise<void>;
}
```

---

## Capa de aplicacion
En esta seccion crearemos todo lo relacionado con la aplicacion.

### Archivos transversales a la aplicacion
Primero iniciaremos creando los archivos de configuracion, helpers, autenticacion y constantes que seran transversales a la aplicacion.

### Crear archivo de constantes de la aplicacion
Ahora procederemos a crear un archivo que contendra todas las constantes de la aplicacion, esto con el fin de reducir el hardcoding y hacer de la aplicacion mas escalable.
#### Crear el archivo 'src/application/core/utils/Constants.ts' y agregar el siguiente contenido:
```typescript
export enum HTTP_STATUS_CODE {
  CONTINUE = 100,
  SWITCHING_PROTOCOLS = 101,
  PROCESSING = 102,
  EARLYHINTS = 103,
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NON_AUTHORITATIVE_INFORMATION = 203,
  NO_CONTENT = 204,
  RESET_CONTENT = 205,
  PARTIAL_CONTENT = 206,
  AMBIGUOUS = 300,
  MOVED_PERMANENTLY = 301,
  FOUND = 302,
  SEE_OTHER = 303,
  NOT_MODIFIED = 304,
  TEMPORARY_REDIRECT = 307,
  PERMANENT_REDIRECT = 308,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  PAYMENT_REQUIRED = 402,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  NOT_ACCEPTABLE = 406,
  PROXY_AUTHENTICATION_REQUIRED = 407,
  REQUEST_TIMEOUT = 408,
  CONFLICT = 409,
  GONE = 410,
  LENGTH_REQUIRED = 411,
  PRECONDITION_FAILED = 412,
  PAYLOAD_TOO_LARGE = 413,
  URI_TOO_LONG = 414,
  UNSUPPORTED_MEDIA_TYPE = 415,
  REQUESTED_RANGE_NOT_SATISFIABLE = 416,
  EXPECTATION_FAILED = 417,
  I_AM_A_TEAPOT = 418,
  MISDIRECTED = 421,
  UNPROCESSABLE_ENTITY = 422,
  FAILED_DEPENDENCY = 424,
  PRECONDITION_REQUIRED = 428,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
  HTTP_VERSION_NOT_SUPPORTED = 505,
}

export const enum RESPONSE_MESSAGES {
  REPOSITORY_ERROR = 'Internal server Error',
  BAD_REQUEST = 'Bad Request Error',
  USER_NOT_FOUND = 'User not found',
  PASSWORD_NOT_ALLOWED = 'Update password not allowed',
  PASSWORD_NOT_MATCH = 'Password not match',
  USER_CREATED = 'User created successfully',
  TOKEN_NOT_FOUND = 'Token not found',
  OPERATION_SUCCESS = 'Operation success',
  USER_ALREADY_EXISTS = 'User already exists',
  HELLO_WORLD = 'HOLA MI SERVIDOR EN EXPRESS',
}


export const enum DEFAULT_VALUES {
  EMPTY_STRING = '',
  FALSE_STRING = 'false',
  TRUE_STRING = 'true',
  ZERO_PORT = 0,
  NODE_ENV_LOCAL = 'LOCAL',
  NODE_ENV_DEV = 'DEV',
  NODE_ENV_PROD = 'PROD',
  APP_PORT = 3000,
}

export enum ALLOWED_HEADERS_VALUES {
  CONTENT_TYPE = 'application/json',
  ALLOWED_HEADERS = '*',
  ALLOW_ORIGIN = '*',
  ALLOWED_METHODS = 'POST,GET,PUT,DELETE,OPTIONS',
}

export const TABLES_NAMES = {
  USERS: 'users',
};

export const ENDPOINTS = {
  API: '/api/v1',
  USERS: {
    ROOT: '/usuario',
    CREATE: '/',
    LOGIN: '/login',
    GET: '/',
    UPDATE: '/',
    DELETE: '/',
  },
}
```
---

### Crear archivo de helpers de la aplicacion
Ahora procederemos a crear un archivo que contendra todas las funciones de ayuda de la aplicacion.
#### Crear el archivo 'src/application/core/utils/Auth.helper.ts' y agregar el siguiente contenido:
```typescript
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
```

### Crear archivo de configuracion de la aplicacion
Ahora procederemos a crear un archivo que contendra las configuraciones de la aplicacion.
#### Crear el archivo 'src/application/core/config/index.ts' y agregar el siguiente contenido:
```typescript
import dotenv from "dotenv";
import { DEFAULT_VALUES } from "../utils/Constants";

dotenv.config();

export const config = {
	NODE_ENVIRONMENT:
		process.env.NODE_ENVIRONMENT ?? DEFAULT_VALUES.NODE_ENV_LOCAL,
	DATABASE: {
		LOCAL: {
			host: process.env.MYSQL_HOST_LOCAL ?? DEFAULT_VALUES.EMPTY_STRING,
			username: process.env.MYSQL_USER_LOCAL ?? DEFAULT_VALUES.EMPTY_STRING,
			password: process.env.MYSQL_PASSWORD_LOCAL ?? DEFAULT_VALUES.EMPTY_STRING,
			database: process.env.MYSQL_DATABASE_LOCAL ?? DEFAULT_VALUES.EMPTY_STRING,
			port: Number(process.env.MYSQL_PORT_LOCAL) ?? DEFAULT_VALUES.ZERO_PORT,
			dialect: process.env.MYSQL_DIALECT_LOCAL ?? DEFAULT_VALUES.EMPTY_STRING,
			logging: process.env.MYSQL_LOGGING_LOCAL ?? DEFAULT_VALUES.FALSE_STRING,
		},
		DEV: {
			host: process.env.MYSQL_HOST_DEV ?? DEFAULT_VALUES.EMPTY_STRING,
			username: process.env.MYSQL_USER_DEV ?? DEFAULT_VALUES.EMPTY_STRING,
			password: process.env.MYSQL_PASSWORD_DEV ?? DEFAULT_VALUES.EMPTY_STRING,
			database: process.env.MYSQL_DATABASE_DEV ?? DEFAULT_VALUES.EMPTY_STRING,
			port: Number(process.env.MYSQL_PORT_DEV) ?? DEFAULT_VALUES.ZERO_PORT,
			dialect: process.env.MYSQL_DIALECT_DEV ?? DEFAULT_VALUES.EMPTY_STRING,
			logging: process.env.MYSQL_LOGGING_DEV ?? DEFAULT_VALUES.FALSE_STRING,
		},
		PROD: {
			host: process.env.MYSQL_HOST_PROD ?? DEFAULT_VALUES.EMPTY_STRING,
			username: process.env.MYSQL_USER_PROD ?? DEFAULT_VALUES.EMPTY_STRING,
			password: process.env.MYSQL_PASSWORD_PROD ?? DEFAULT_VALUES.EMPTY_STRING,
			database: process.env.MYSQL_DATABASE_PROD ?? DEFAULT_VALUES.EMPTY_STRING,
			port: Number(process.env.MYSQL_PORT_PROD) ?? DEFAULT_VALUES.ZERO_PORT,
			dialect: process.env.MYSQL_DIALECT_PROD ?? DEFAULT_VALUES.EMPTY_STRING,
			logging: process.env.MYSQL_LOGGING_PROD ?? DEFAULT_VALUES.FALSE_STRING,
		},
	},
	JWT_SECRET_KEY: process.env.JWT_SECRET_KEY ?? DEFAULT_VALUES.EMPTY_STRING,
	APP_PORT: Number(process.env.APP_PORT) ?? DEFAULT_VALUES.APP_PORT,
};

```

Ahora procederemos a crear un archivo que sera el encargado de mapear el dominio de negocio con los modelos de base de datos.

#### Crear el archivo 'src/application/mappers/User.mapper.ts' y agregar el siguiente contenido:
```typescript
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
```


### Crear casos de uso de la aplicacion
Ahora sigue crear los casos de uso de la aplicacion.
#### Crear el archivo 'src/application/usecases/User.usecase.ts' y agregar el siguiente contenido:
```typescript
import { IUser as IUserDto } from "../../domain/dto/User.dto";
import { IUserRepository } from "../../domain/repositories/User.repository";
import { IUser as IUserModel } from "../../domain/repositories/models/User.model";
import { AuthHelper } from "../core/utils/Auth.helper";
import { RESPONSE_MESSAGES } from "../core/utils/Constants";
import { UserMapper } from "../mappers/User.mapper";

export class UserUseCase {
	constructor(private readonly userRepository: IUserRepository) {}

	async createUser(user: IUserDto) {
		const userFound = await this.userRepository.getUserByEmail(
			user.email as string
		);
		if (userFound) {
			throw new Error(RESPONSE_MESSAGES.USER_ALREADY_EXISTS);
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
			throw new Error(RESPONSE_MESSAGES.USER_NOT_FOUND);
		}
		return UserMapper.toDomain(user);
	}

	async updateUser(token: string, user: IUserDto): Promise<void> {
		const jwtDecoded = AuthHelper.decodeToken(token);
		const userModel = UserMapper.toPersistence(user);
		if (userModel.password) {
			throw new Error(RESPONSE_MESSAGES.PASSWORD_NOT_ALLOWED);
		}
		await this.userRepository.updateUser(jwtDecoded.id, user);
	}

	async deleteUser(token: string): Promise<void> {
		const jwtDecoded = AuthHelper.decodeToken(token);
		await this.userRepository.deleteUser(jwtDecoded.id);
	}

	async login(user: IUserDto): Promise<string> {
		const userFound = await this.userRepository.getUserByEmail(
			user.email as string
		);
		if (!userFound) {
			throw new Error(RESPONSE_MESSAGES.USER_NOT_FOUND);
		}
		const passwordMatch = await AuthHelper.comparePassword(
			user.password as string,
			userFound.password as string
		);
		if (!passwordMatch) {
			throw new Error(RESPONSE_MESSAGES.PASSWORD_NOT_MATCH);
		}
		return AuthHelper.generateToken(userFound.id as number);
	}
}
```
---

## Capa de infraestructura
En esta capa crearemos los repositorios, alli estara todo lo relacionado con las bases de datos, apis y otros servicios externos. Tambien tendra nuestras rutas siendo asi el punto de entrada de la aplicacion y el punto de salida de la aplicacion. Por ultimo estan los controladores y middlewares

### Crear modelos y conexion con la base de datos
Ahora procederemos a crear los repositorios en la infraestructura de la aplicacion y a implementar los metodos del contrato de los repositorios con el ORM de sequelize. Pero antes que todo debemos definir los modelos y la instancia de conexion con la base de datos.
#### Crear el archivo 'src/infrastructure/repositories/models/User.model.ts' y agregar el siguiente contenido:
```typescript
import { DataTypes, Model, Sequelize } from "sequelize";
import { TABLES_NAMES } from "../../../application/core/utils/Constants";
import { IUser } from "../../../domain/repositories/models/User.model";

export const UserSchema = {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	email: {
		type: DataTypes.STRING,
		unique: true,
		allowNull: false,
	},
	password: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	user_image: {
		type: DataTypes.STRING,
		allowNull: false,
	},
};

export class User extends Model<IUser, Omit<IUser, "id">> implements IUser {
	public id!: number;
	public name!: string;
	public email!: string;
	public password!: string;
	public user_image!: string;

	static config(sequelize: Sequelize) {
		return {
			sequelize,
			tableName: TABLES_NAMES.USERS,
			modelName: TABLES_NAMES.USERS,
			timestamps: false,
		};
	}
}

```
Ademas crearemos un archivo principal que agrupara e inicializara los modelos de la aplicacion con sequelize.

#### Crear el archivo 'src/infrastructure/repositories/models/index.ts' y agregar el siguiente contenido:
```typescript
import { User, UserSchema } from './User.model';
import { Sequelize } from 'sequelize';

export const setUpModels = (sequelize: Sequelize) => {
	User.init(UserSchema, User.config(sequelize));
};
```

### Crear implementacion de repositorios en la infraestructura de la aplicacion
Aqui se creara la implementacion de los repositorios en la infraestructura de la aplicacion y un archivo que contendra la instancia de conexion con la base de datos haciendo uso del patron de diseño singleton.
#### Crear el archivo 'src/infrastructure/repositories/sequelizeMysqlConnection.ts' y agregar el siguiente contenido:
```typescript
import { Dialect, Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { setUpModels } from './models/index';
import { config } from '../../application/core/config';
import { DEFAULT_VALUES } from '../../application/core/utils/Constants';

dotenv.config();

export class SequelizeMysqlConnection {
	private static instance: Sequelize | null = null;

	static getInstance(): Sequelize {
		if (!SequelizeMysqlConnection.instance) {
			SequelizeMysqlConnection.instance = new Sequelize({
				...config.DATABASE[config.NODE_ENVIRONMENT as keyof typeof config.DATABASE],
				dialect: (config.DATABASE[config.NODE_ENVIRONMENT as keyof typeof config.DATABASE] ).dialect as Dialect,
				logging: (config.DATABASE[config.NODE_ENVIRONMENT as keyof typeof config.DATABASE] ).logging === DEFAULT_VALUES.TRUE_STRING,
			});
			setUpModels(SequelizeMysqlConnection.instance);
			if (this.instance) {
				this.instance.sync();
			}
		}

		return SequelizeMysqlConnection.instance;
	}
}
```

#### Crear el archivo 'src/infrastructure/repositories/User.repository.ts' y agregar el siguiente contenido:
```typescript
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
```

### Crear controladores de la aplicacion
Ahora procederemos a crear los controladores de la aplicacion. Estos seran los encargados de recibir las peticiones HTTP y enviar las respuestas HTTP. Son los orquestadores de la aplicacion.
#### Crear el archivo 'src/infrastructure/controllers/User.controller.ts' y agregar el siguiente contenido:
```typescript
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
			const data: IUser = req.body;
			await this.userUsecase.createUser(data);
			res
				.status(HTTP_STATUS_CODE.CREATED)
				.json({
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
				res
					.status(HTTP_STATUS_CODE.UNAUTHORIZED)
					.json({
						message: RESPONSE_MESSAGES.TOKEN_NOT_FOUND,
						error: null,
						body: null,
					});
			}
			const user = await this.userUsecase.getUser(token);
			res
				.status(HTTP_STATUS_CODE.OK)
				.json({
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
				res
					.status(HTTP_STATUS_CODE.UNAUTHORIZED)
					.json({
						message: RESPONSE_MESSAGES.TOKEN_NOT_FOUND,
						error: null,
						body: null,
					});
			}
			const data: IUser = req.body;
			await this.userUsecase.updateUser(token, data);
			res
				.status(HTTP_STATUS_CODE.OK)
				.json({
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
				res
					.status(HTTP_STATUS_CODE.UNAUTHORIZED)
					.json({
						message: RESPONSE_MESSAGES.TOKEN_NOT_FOUND,
						error: null,
						body: null,
					});
			}
			await this.userUsecase.deleteUser(token);
			res
				.status(HTTP_STATUS_CODE.OK)
				.json({
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
			res
				.status(HTTP_STATUS_CODE.OK)
				.json({
					message: RESPONSE_MESSAGES.OPERATION_SUCCESS,
					error: null,
					body: { token: token },
				});
		} catch (error) {
			next(error);
		}
	}
}
```

### Inyeccion de dependencias
Ahora procederemos a crear el archivo que contendra la inyeccion de dependencias de la aplicacion.
#### Crear el archivo 'src/infrastructure/dependencies.ts' y agregar el siguiente contenido:
```typescript 
import { UserUseCase } from "../application/usecases/User.usecase";
import { UserController } from "./controllers/User.controller";
import { UserRepository } from "./repositories/User.repository";

const userRepository = new UserRepository();
const userUsecase = new UserUseCase(userRepository);
export const userController = new UserController(userUsecase);
```

### Crear rutas de la aplicacion
Ahora procederemos a crear las rutas de la aplicacion. Estas seran las encargadas de recibir las peticiones HTTP y enviarlas a los controladores.
#### Crear el archivo 'src/infrastructure/routes/User.routes.ts' y agregar el siguiente contenido:
```typescript
import { Router } from "express";
import { ENDPOINTS } from "../../application/core/utils/Constants";
import { userController } from "../dependencies";

const router = Router();


router.post(
	ENDPOINTS.USERS.CREATE,
	userController.createUser.bind(userController)
);

router.get(ENDPOINTS.USERS.GET, userController.getUser.bind(userController));

router.put(
	ENDPOINTS.USERS.UPDATE,
	userController.updateUser.bind(userController)
);

router.delete(
	ENDPOINTS.USERS.DELETE,
	userController.deleteUser.bind(userController)
);

router.post(ENDPOINTS.USERS.LOGIN, userController.login.bind(userController));

export default router;
```

Ahora necesitamos un archivo que agrupe todas las rutas de la aplicacion.
#### Crear el archivo 'src/infrastructure/routes/index.ts' y agregar el siguiente contenido:
```typescript
import { Application, Router } from 'express';
import userRouter from './User.routes';
import { ENDPOINTS, RESPONSE_MESSAGES } from '../../application/core/utils/Constants';

const routes = (app: Application) => {
  const router = Router();
  
  app.use(ENDPOINTS.API, router);
  router.get('/', (req, res) => {
    res.send(RESPONSE_MESSAGES.HELLO_WORLD);
  });
  router.use(ENDPOINTS.USERS.ROOT, userRouter);
  
}

export default routes;
```

### Crear middlewares de la aplicacion
Dado que el foco de la aplicacion es mostrar como crear un microservicio y desplegarlo en ec2 haciendo uso de s3 para guardar imagenes, no se profundizara en los middlewares de autenticacion, seguridad y validacion de schemas. Pero se creara un middleware de manejo de errores y logs.
#### Crear el archivo 'src/infrastructure/middlewares/Error.handler.ts' y agregar el siguiente contenido:
```typescript
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

```

---

Con todo lo anterior ya tenemos todas nuestras capas de la aplicacion. Ahora procederemos a crear un archivo principal que inicializara la aplicacion.

### Crear archivo principal de la aplicacion
#### Crear el archivo 'src/app.ts' y agregar el siguiente contenido:
```typescript
import cors from "cors";

import express, { Application } from "express";
import { config } from "./application/core/config";
import routes from "./infrastructure/routes";
import {
	errorHandler,
	logErrors,
} from "./infrastructure/middleware/Error.handler";

export class App {
	private app: Application;

	constructor() {
		this.app = express();
		this.app.use(cors());
		this.app.use(express.json());
		routes(this.app);
		this.app.use(logErrors);
		this.app.use(errorHandler);
	}

	public getInstance(): Application {
		return this.app;
	}

	public async run() {
		try {
			this.app.listen(config.APP_PORT, () => {
				console.log(
					`[APP] - Application is running on port ${config.APP_PORT}`
				);
			});
		} catch (error) {
			console.error(error);
		}
	}
}
```

Ahora crearemos un archivo que sera el encargado de inicializar la aplicacion.
#### Crear el archivo 'src/main.ts' y agregar el siguiente contenido:
```typescript
import { App } from "./app";
import { config } from "./application/core/config";

console.log(config.APP_PORT)
const application = new App();
application.run();
```
---

Con todo lo anterior ya tenemos nuestra aplicacion funcionando en local. Lo puede probar ejecutando el comando ```npm run dev``` para probar. Tenga en cuenta que debe tener una base de datos mysql corriendo en local. Ademas del archivo .env para que se carguen las variables de entorno.
```bash
NODE_ENVIRONMENT=DEV
MYSQL_HOST_DEV=localhost
MYSQL_USER_DEV=root
MYSQL_PASSWORD_DEV=password
MYSQL_DATABASE_DEV=database_name
MYSQL_PORT_DEV=3306
MYSQL_DIALECT_DEV=mysql
MYSQL_LOGGING_DEV=true
APP_PORT=3000
JWT_SECRET_KEY=secret
```

Antes de continuar con la integracion con S3 seria recomendable generar un commit para ver los cambios que se hacen con la integracion.
---

## Integracion con S3. 
En esta seccion se explicara como integrar el microservicio con S3 para guardar imagenes de perfil de usuario.

Para no perderse tanto en el codigo lo ideal es que se vean el siguiente video donde explica como crear un bucket en S3 y como crear un usuario IAM con las politicas de acceso al bucket de S3. Entre otras cosas. Se toma el video como base para implementar las funcionalidades de S3 y integrarlas a la arquitectura de la aplicacion.

[![IMAGE ALT TEXT HERE](https://i.ytimg.com/vi/NZElg91l_ms/hqdefault.jpg?sqp=-oaymwEbCKgBEF5IVfKriqkDDggBFQAAiEIYAXABwAEG&rs=AOn4CLBVPhCosdQqR3cH70DMClcew3IKcw)](https://www.youtube.com/watch?v=NZElg91l_ms)


Una vez se tenga el bucket creado, los el access key y el secret access key del usuario IAM creado, se procede a instalar las dependencias necesarias para integrar el microservicio con S3.
Ademas vamos a modificar las politicas del bucket con el fin de poder acceder de manera publica a las imagenes que aparezcan alli, esto porque este bucket solo contendra imagenes de perfil de usuario y no es necesario que sean privadas. Sin embargo tener en cuenta que se debe ser precavido con la informacion que se almacena en S3 y las reglas de acceso que se definen porque pueden generar vulnerabilidades dentro de la aplicacion.

* En la seccion de permisos del bucket, en el apartado de politica del bucket agregaremos:
```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::assesment-profile-images/*"
        }
    ]
}
```

Con lo anterior ya tenemos todo para hacer las respectivas modificaciones en la aplicacion.

### Crear contracto de repositorio de imagenes en el dominio de la aplicacion
Ahora procederemos a crear el contrato de los repositorios de imagenes en el dominio de la aplicacion.
#### Crear el archivo 'src/domain/repositories/UserImages.repository.ts' y agregar el siguiente contenido:
```typescript
export interface IUserImagesRepository {
  uploadImage(image: any, key: string): Promise<any>;
  deleteImage(key: string): Promise<any>; 
}
```

### Modificar archivo de configuraciones de la aplicacion
Ahora procederemos a modificar el archivo de configuraciones de la aplicacion para agregar las variables de entorno de S3.
#### Modificar el archivo 'src/application/core/config/index.ts' y agregar el siguiente contenido:
```typescript
import dotenv from "dotenv";
import { DEFAULT_VALUES } from "../utils/Constants";

dotenv.config();

export const config = {
	NODE_ENVIRONMENT:
		process.env.NODE_ENVIRONMENT ?? DEFAULT_VALUES.NODE_ENV_LOCAL,
	DATABASE: {
		LOCAL: {
			host: process.env.MYSQL_HOST_LOCAL ?? DEFAULT_VALUES.EMPTY_STRING,
			username: process.env.MYSQL_USER_LOCAL ?? DEFAULT_VALUES.EMPTY_STRING,
			password: process.env.MYSQL_PASSWORD_LOCAL ?? DEFAULT_VALUES.EMPTY_STRING,
			database: process.env.MYSQL_DATABASE_LOCAL ?? DEFAULT_VALUES.EMPTY_STRING,
			port: Number(process.env.MYSQL_PORT_LOCAL) ?? DEFAULT_VALUES.ZERO_PORT,
			dialect: process.env.MYSQL_DIALECT_LOCAL ?? DEFAULT_VALUES.EMPTY_STRING,
			logging: process.env.MYSQL_LOGGING_LOCAL ?? DEFAULT_VALUES.FALSE_STRING,
		},
		DEV: {
			host: process.env.MYSQL_HOST_DEV ?? DEFAULT_VALUES.EMPTY_STRING,
			username: process.env.MYSQL_USER_DEV ?? DEFAULT_VALUES.EMPTY_STRING,
			password: process.env.MYSQL_PASSWORD_DEV ?? DEFAULT_VALUES.EMPTY_STRING,
			database: process.env.MYSQL_DATABASE_DEV ?? DEFAULT_VALUES.EMPTY_STRING,
			port: Number(process.env.MYSQL_PORT_DEV) ?? DEFAULT_VALUES.ZERO_PORT,
			dialect: process.env.MYSQL_DIALECT_DEV ?? DEFAULT_VALUES.EMPTY_STRING,
			logging: process.env.MYSQL_LOGGING_DEV ?? DEFAULT_VALUES.FALSE_STRING,
		},
		PROD: {
			host: process.env.MYSQL_HOST_PROD ?? DEFAULT_VALUES.EMPTY_STRING,
			username: process.env.MYSQL_USER_PROD ?? DEFAULT_VALUES.EMPTY_STRING,
			password: process.env.MYSQL_PASSWORD_PROD ?? DEFAULT_VALUES.EMPTY_STRING,
			database: process.env.MYSQL_DATABASE_PROD ?? DEFAULT_VALUES.EMPTY_STRING,
			port: Number(process.env.MYSQL_PORT_PROD) ?? DEFAULT_VALUES.ZERO_PORT,
			dialect: process.env.MYSQL_DIALECT_PROD ?? DEFAULT_VALUES.EMPTY_STRING,
			logging: process.env.MYSQL_LOGGING_PROD ?? DEFAULT_VALUES.FALSE_STRING,
		},
	},
	JWT_SECRET_KEY: process.env.JWT_SECRET_KEY ?? DEFAULT_VALUES.EMPTY_STRING,
	APP_PORT: Number(process.env.APP_PORT) ?? DEFAULT_VALUES.APP_PORT,
	AWS_S3: {
		BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME ?? DEFAULT_VALUES.EMPTY_STRING,
		REGION: process.env.AWS_S3_REGION ?? DEFAULT_VALUES.EMPTY_STRING,
		ACCESS_KEY_ID: process.env.AWS_S3_ACCESS_KEY_ID ?? DEFAULT_VALUES.EMPTY_STRING,
		SECRET_ACCESS_KEY: process.env.AWS_S3_SECRET_ACCESS_KEY ?? DEFAULT_VALUES.EMPTY_STRING,
		BUCKET_URL: process.env.AWS_S3_BUCKET_URL ?? DEFAULT_VALUES.EMPTY_STRING,
	}
};
```

### Modificar el archivo de los casos de uso de la aplicacion

#### Modificar el metodo createUser el archivo 'src/application/usecases/User.usecase.ts' y agregar el siguiente contenido:
```typescript
async createUser(user: IUserDto, image: any, imageExtension: string) {
		const userFound = await this.userRepository.getUserByEmail(
			user.email as string
		);
		if (userFound) {
			throw new Error(RESPONSE_MESSAGES.USER_ALREADY_EXISTS);
		}

		if (image) {
			const key = `${user.email}.${imageExtension}`;
			const imageUploaded = await this.userImagesRepository.uploadImage(
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
```
Este metodo valida si se envio una imagen en la peticion y la sube a S3. Ademas modifica el DTO de usuario para agregar la URL de la imagen de perfil.

#### Modificar el metodo deleteUser el archivo 'src/application/usecases/User.usecase.ts' y agregar el siguiente contenido:
```typescript
async deleteUser(token: string): Promise<void> {
		const jwtDecoded = AuthHelper.decodeToken(token);
		const user = await this.userRepository.getUserById(jwtDecoded.id);
		if (!user) {
			throw new Error(RESPONSE_MESSAGES.USER_NOT_FOUND);
		}
		const key = user.user_image?.split(config.AWS_S3.BUCKET_URL)[1];
		if (key) {
			await this.userImagesRepository.deleteImage(key);
		}
		await this.userRepository.deleteUser(jwtDecoded.id);
	}
```
Este metodo valida si el usuario tiene una imagen de perfil y la elimina de S3. Aqui se puede ver como se obtiene la key de la imagen de perfil para poder eliminarla de S3. 

#### Modifier el metodo updateUser el archivo 'src/application/usecases/User.usecase.ts' y agregar el siguiente contenido:

La modificacion de este metodo lo dejo a manera de practica para que lo haga el lector. Pero basicamente es seguir la misma idea de la implementacion de delete y create. A continuacion veremos la implementacion del repositorio.

### Crear implementacion de repositorio de imagenes en la infraestructura de la aplicacion
Aqui se creara la implementacion del repositorio de imagenes en la infraestructura de la aplicacion, que contendra a su vez la conexion con S3.
#### Crear el archivo 'src/infrastructure/repositories/UserImages.repository.ts' y agregar el siguiente contenido:
```typescript
import { DeleteObjectCommand, ObjectCannedACL, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { config } from "../../application/core/config";
import { IUserImagesRepository } from "../../domain/repositories/UserImages.repository";


export class UserImagesRepository implements IUserImagesRepository {

  private s3Client: S3Client;
  constructor() {
    this.s3Client = new S3Client({
      region: config.AWS_S3.REGION,
      credentials: {
        accessKeyId: config.AWS_S3.ACCESS_KEY_ID ,
        secretAccessKey: config.AWS_S3.SECRET_ACCESS_KEY
      }
    });
  }

  async uploadImage(image: any, key: string) {
    const params = {
      Bucket: config.AWS_S3.BUCKET_NAME,
      Key: key,
      Body: image,
    };
    await this.s3Client.send(new PutObjectCommand(params));
  }

  async deleteImage(key: string) {
    const params = {
      Bucket: config.AWS_S3.BUCKET_NAME,
      Key: key,
    };
    await this.s3Client.send(new DeleteObjectCommand(params));
  }
}
```

### Modificar el archivo de dependencias de la aplicacion
Ahora procederemos a modificar el archivo de dependencias de la aplicacion para agregar el repositorio de imagenes.
#### Modificar el archivo 'src/infrastructure/dependencies.ts' y agregar el siguiente contenido:
```typescript
import { UserUseCase } from "../application/usecases/User.usecase";
import { UserController } from "./controllers/User.controller";
import { UserRepository } from "./repositories/User.repository";
import { UserImagesRepository } from "./repositories/UserImages.repository";

const userRepository = new UserRepository();
const userImagesRepository = new UserImagesRepository();
const userUsecase = new UserUseCase(userRepository, userImagesRepository);
export const userController = new UserController(userUsecase);
```

### Modificar el archivo de rutas de la aplicacion
Ahora procederemos a modificar el archivo de rutas de la aplicacion para agregar las rutas de imagenes.
#### Modificar el archivo 'src/infrastructure/routes/User.routes.ts' y agregar el siguiente contenido:
```typescript
import multer from "multer";
import { Router } from "express";
import { ENDPOINTS } from "../../application/core/utils/Constants";
import { userController } from "../dependencies";

const router = Router();

const storage = multer.memoryStorage(); // Almacenamiento en memoria
const upload = multer({ storage });


router.post(
	ENDPOINTS.USERS.CREATE,
	upload.single("image"),	
	userController.createUser.bind(userController)
);

router.get(ENDPOINTS.USERS.GET, userController.getUser.bind(userController));

router.put(
	ENDPOINTS.USERS.UPDATE,
	userController.updateUser.bind(userController)
);

router.delete(
	ENDPOINTS.USERS.DELETE,
	userController.deleteUser.bind(userController)
);

router.post(ENDPOINTS.USERS.LOGIN, userController.login.bind(userController));

export default router;

```
Aqui se puede ver que se agrega el middleware de multer para poder recibir la imagen en la peticion. Este middleware se encarga de almacenar la imagen en memoria y luego se envia al controlador para que se suba a S3.

### Modificar el archivo de controladores de la aplicacion
Ahora procederemos a modificar el archivo de controladores de la aplicacion para agregar la logica de crear usuario. 
#### Modificar el archivo 'src/infrastructure/controllers/User.controller.ts' y agregar el siguiente contenido:
```typescript
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
```

Modificamos el metodo `createUser` de los controladores de `User` para que reciba la imagen en la peticion y la envie al caso de uso para que la suba a S3.

Con todo lo anterior podemos volver a ejecutar la aplicacion en local y probar que todo funcione correctamente. Para esto se debe tener en cuenta que se debe tener un archivo .env con las variables de entorno de S3.
```bash
NODE_ENVIRONMENT=DEV
MYSQL_HOST_DEV=localhost
MYSQL_USER_DEV=root
MYSQL_PASSWORD_DEV=password
MYSQL_DATABASE_DEV=database_name
MYSQL_PORT_DEV=3306
MYSQL_DIALECT_DEV=mysql
MYSQL_LOGGING_DEV=true
APP_PORT=3000
JWT_SECRET_KEY=secret


AWS_S3_BUCKET_NAME=bucket-profile-images
AWS_S3_REGION=us-east-1
AWS_S3_ACCESS_KEY_ID=XXXXX
AWS_S3_SECRET_ACCESS_KEY=XXXXXX
AWS_S3_BUCKET_URL=https://bucket-profile-images.s3.amazonaws.com/
```

---

## Despliegue en EC2

En esta seccion se explicara como desplegar el microservicio en EC2. Para tener acceso a la base de datos voy a crear otro servicio de EC2 que tenga corriendo una base de datos mysql para que el microservicio pueda acceder a ella, otra opcion valida es hacer uso del servicio de RDS de amazon para las bases de datos.

### Crear instancia de EC2 para la base de datos
Para crear la instancia de EC2 para la base de datos se debe seguir los siguientes pasos que especifica la documentacion de AWS. Tener en cuenta que para que no se generen costos en esta practica debe seleccionar las opciones de la capa gratuita.
* [Crear instancia de EC2 para la base de datos](https://aws.amazon.com/es/getting-started/hands-on/deploy-wordpress-with-amazon-rds/3/)
* Puedes selecionar la imagen de ubuntu server 22.04 LTS o la que prefieras.
* Tener en cuenta que para acceder de manera remota a la instancia via SSH debe generar las claves publicas y privadas.
* En las configuracion de la red puede elegir la VPC por defecto de aws o crear una nueva. En este caso se creo una nueva VPC con solo 1 subred publica y se le configuro el grupo de seguridad. Ese mismo grupo de seguridad lo selecciono para tener las reglas de entrada de mi instancia de EC2 para la base de datos. 
* Luego de crear la instancia de EC2 me dirijo a la seccion de Red y seguridad y selecciono la opcion de `Direcciones IP Elasticas`, alli creo una nueva IP publica y la asocio a la instancia de EC2 para la base de datos. Esto con el fin de que la IP publica de la instancia de EC2 para la base de datos no cambie cada vez que se reinicie la instancia.
* Luego de crear la direccion ip elastica se la asociamos a la instancia de ec2.
* Ahora ya nos podemos conectar a la instancia EC2 desde la interfaz de AWS o via SSH.

Ahora para instalar mysql debe hacer lo siguiente:
* Conectarse a la terminal de la instancia de EC2 via SSH o desde la vista de AWS.
* Ejutar los siguienes comandos:
```bash
sudo apt-get update
sudo apt-get install mysql-server
```
* Ahora en el archivo mysql.conf.d que esta ubicada en `/etc/mysql/mysql.conf.d` debe hacer lo que se hace en el siguiente video en el minuto 2:50. [Video](https://www.youtube.com/watch?v=AzNnHVQHY4M)
* Ahora `$mysql -u root -p` para entrar a la consola de mysql y ejecutar los siguientes comandos:
```bash
CREATE USER 'nombre_usuario'@'%' IDENTIFIED BY 'tu_contraseña';
GRANT ALL PRIVILEGES ON *.* TO 'nombre_usuario'@'%';
FLUSH PRIVILEGES;
```
Lo anterior es para crear un usuario con todos los permisos para acceder a la base de datos desde cualquier host. Tener en cuenta que esto no es recomendable para un ambiente de produccion. Pero para esta practica es valido.
* Creamos la base de datos a la que nos vamos a conectar `CREATE DATABASE assesment_db;`

* Ahora nos dirigimos a la instancia EC2 y obtenemos la direccion IP publica para conectarnos. Modifican las variables de entorno segun sea el caso y corran `npm run dev`. Si todo esta bien la aplicacion debe correr en local, conectandose a la base de datos que esta en el EC2.

### Crear instancia de EC2 para el microservicio

Ahora procederemos a crear la instancia de EC2 para el microservicio. Puede seguir el paso a paso de la seccion anterior para crear la instancia de EC2. Tener en cuenta que para este microservicio se deben permitir las conexiones HTTP desde cualquier host. Lo ideal es separar los grupos de seguridad dado que la base de datos no debe estar expuesta en produccion pero para el caso de esta practica se ignorara esto.

Para que el microservicio funcione debe habilitar el puerto en el que quieres que corra la aplicacion.

Para traer la aplicacion deberemos hacer un git clone de la aplicacion en la instancia de EC2 (para esto la debemos tener en algun provedor como github, gitlab entre otros). Para esto debemos tener instalado git en la instancia de EC2. Para instalar git debemos ejecutar los siguientes comandos:
```bash
sudo apt-get update
sudo apt-get install git
```

Luego de instalar git debemos clonar el repositorio de la aplicacion en la instancia de EC2. Para esto debemos ejecutar el siguiente comando:
```bash
git clone ${url_repositorio}
```
Ahora debemos instarlar node y npm en la instancia de EC2. Para esto debemos ejecutar los siguientes comandos:
```bash
sudo apt-get install nodejs
sudo apt-get install npm
```
Para evitar este tipo de configuracion se pueden crear contenedores con el fin de que se ejecuten de manera facil y sencilla en cualquier instancia. Pero para esta practica se hara de esta manera.

Ahora instalaremos las dependencia
```bash
cd reto-node-user-microservice # Nombre donde esta el repositorio
npm install
```
* Tener en cuenta que algunas librerias requieren una version de node mayor a la que se instala por defecto. Para esto se debe instalar nvm y cambiar la version de node. [Instalar nvm](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-20-04-es)
```bash
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
nvm install node
nvm use node
```
Lo anterior es para usar node en su ultima version.

Ahora creamos el archivo .env y agregamos todas las variables de entorno respectivas.
```bash 
nano .env
```


Ahora podemos correr la aplicacion en la instancia de EC2 con el siguiente comando:
```bash
npm run dev
```

Debemos poder ver en la consola como se inicia la aplicacion y luego haciendo uso de la ip publica nos podremos conectar a la aplicacion.

