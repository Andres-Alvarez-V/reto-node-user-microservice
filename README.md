# Microservicio de usuarios con Node.js, Express y TypeScript. Integracion con S3 de AWS. Despliegue en EC2 de AWS.

#### Autor: Andres Camilo Alvarez Vasquez
## Introduccion
Este repositorio contiene el codigo fuente de un microservicio de usuarios desarrollado con Node.js, Express y TypeScript, utiliza MySQL como base de datos, sin embargo esta puede ser cambiada facilmente dado al uso de un ORM dentro del proyecto. Ademas se integra con S3 de AWS para guardar imagenes de perfil de usuario. Por ultimo se despliega en EC2 de AWS.

El codigo fuente se puede encontrar en el siguiente repositorio.
https://github.com/Andres-Alvarez-V/reto-node-user-microservice

## Tabla de contenidos
- [Arquitectura de la aplicacion](#arquitectura-de-la-aplicacion)
- [Inicializacion del proyecto](#inicializacion-del-proyecto)
- [Overview de la arquitectura de la aplicacion](#overview-de-la-arquitectura-de-la-aplicacion)
- [Codigo fuente de la aplicacion](#codigo-fuente-de-la-aplicacion)
	- [Dominio de la aplicacion](#dominio-de-la-aplicacion)
	- [Capa de aplicacion](#capa-de-aplicacion)
	- [Capa de infraestructura](#capa-de-infraestructura)
- [Integracion con S3](#integracion-con-s3)
  - [Explicacion de la integracion con S3 con el repositorio de imagenes de perfil de usuario](#explicacion-de-la-integracion-con-s3-con-el-repositorio-de-imagenes-de-perfil-de-usuario)
  - [Explicacion de la integracion con S3 en los casos de uso de la aplicacion](#explicacion-de-la-integracion-con-s3-en-los-casos-de-uso-de-la-aplicacion)
  - [Uso de multer para recibir imagenes en las peticiones](#uso-de-multer-para-recibir-imagenes-en-las-peticiones)
  - [Explicacion de la integracion con S3 en los controladores de la aplicacion](#explicacion-de-la-integracion-con-s3-en-los-controladores-de-la-aplicacion)
- [Despliegue en EC2](#despliegue-en-ec2)
  - [Crear instancia de EC2 para la base de datos](#crear-instancia-de-ec2-para-la-base-de-datos)
  - [Crear instancia de EC2 para el microservicio](#crear-instancia-de-ec2-para-el-microservicio)

## Arquitectura de la aplicacion

### Endpoints
Nuestro microservicio se encargara de manejar los siguientes endpoints:

1. Crear un perfil de usuario:
    * Método: POST
    * Ruta: /api/v1/usuario
    * Función: Crear un nuevo perfil de usuario con datos planos y una imagen de perfil.

2. Obtener información de un perfil de usuario:
    * Método: GET
    * Ruta: /api/v1/usuario
    * Función: Obtener los detalles de un perfil de usuario específico. Se logra haciendo uso del JWT (JSON Web Token) que se envía en el encabezado de la solicitud.

3. Actualizar un perfil de usuario:
    * Método: PUT
    * Ruta: /api/v1/usuario 
    * Función: Actualizar la información de un perfil de usuario existente, incluyendo la posibilidad de cambiar la imagen de perfil. Se logra haciendo uso del JWT (JSON Web Token) que se envía en el encabezado de la solicitud.

4. Eliminar un perfil de usuario:
    * Método: DELETE
    * Ruta: /api/v1/usuario
    * Función: Eliminar un perfil de usuario específico. Se logra haciendo uso del JWT (JSON Web Token) que se envía en el encabezado de la solicitud.

5. Iniciar sesión:
    * Método: POST
    * Ruta: /api/v1/usuario/login
    * Función: Verificar las credenciales del usuario y generar un JWT.


### Tablas de la base de datos
  * Tabla de Usuarios:
    * Campos:
      * id (clave primaria)
      * name
      * email
      * user_image (almacena la referencia o la URL de la imagen de perfil)
      * password (almacenada de forma segura, por ejemplo, mediante hash)

---

## Inicializacion del proyecto

### Clonar el proyecto e instalar dependencias
#### 1. Clonar el proyecto:
```bash
git clone https://github.com/Andres-Alvarez-V/reto-node-user-microservice.git
```
#### 2. Instalar las dependencias necesarias:
```bash
npm install
```

## Overview de la arquitectura de la aplicacion
La arquitectura de la aplicacion se basa en el patron de diseño hexagonal. Este patron de diseño nos permite separar las responsabilidades de la aplicacion en capas. Cada capa tiene una responsabilidad especifica y se comunica con las demas capas a traves de contratos. Esto nos permite que si se requiere cambiar una capa de la aplicacion, las demas capas no se vean afectadas. Ademas nos permite que si se requiere cambiar una tecnologia, por ejemplo cambiar la base de datos de MySQL a PostgreSQL, solo se debe cambiar la capa de infraestructura de la aplicacion y las demas capas no se veran afectadas.

|\
| src\
|--- domain\
|--- application\
|--- infrastructure\
|--- app.ts\
|--- main.ts\
| .env\
| package.json\
| tsconfig.json\
| README.md\
| .gitignore\
|


## Codigo fuente de la aplicacion

* `app.ts`: Contiene la configuracion de la aplicacion. Aqui se configura el puerto en el que correra la aplicacion, los middlewares de la aplicacion, las rutas de la aplicacion y los middlewares de error de la aplicacion.

* `main.ts`: Contiene la inicializacion de la aplicacion. Aqui se inicializa la aplicacion y se corre.
* `.env`: Contiene las variables de entorno de la aplicacion. Aqui se configuran las variables de entorno de la aplicacion. Tener en cuenta que este archivo no se debe subir al repositorio. Por eso se agrega al .gitignore.
Ejemplo de variables de entorno:
```bash
NODE_ENVIRONMENT=DEV
APP_PORT=3000
JWT_SECRET_KEY=secret

# VARIABLES REQUERIDAS POR EL ORM PARA LA CONEXION CON LA BASE DE DATOS. ESTOS DATOS SE PUEDEN OBTENER EN EL APARTADO DE INSTANCIAS DE EC2 DE AWS.
MYSQL_HOST_DEV=localhost
MYSQL_USER_DEV=root
MYSQL_PASSWORD_DEV=password
MYSQL_DATABASE_DEV=database_name
MYSQL_PORT_DEV=3306
MYSQL_DIALECT_DEV=mysql
MYSQL_LOGGING_DEV=true

# SE VERA EN LA SECCION DE INTEGRACION CON S3
AWS_S3_BUCKET_NAME=bucket-profile-images
AWS_S3_REGION=us-east-1
AWS_S3_ACCESS_KEY_ID=XXXXX
AWS_S3_SECRET_ACCESS_KEY=XXXXXX
AWS_S3_BUCKET_URL=https://bucket-profile-images.s3.amazonaws.com/
```

### Dominio de la aplicacion
En esta seccion crearemos los archivos de entidades y contratos de los repositorios sin preocuparnos por su implementacion. Esto con el fin de que las demas capas de la aplicacion se comuniquen con el dominio de la aplicacion a traves de contratos y no con la implementacion de los repositorios. Ademas crearemos los DTOs que seran los encargados de transportar la informacion entre las capas de la aplicacion.


* `dto/User.dto.ts`: Contiene la interfaz que define la estructura de los datos que se envian desde el cliente al servidor y viceversa.

* `repositories/UserImages.repository.ts`: Contiene la interfaz que define los metodos que se deben implementar en la capa de infraestructura de la aplicacion para manejar las imagenes de perfil de usuario.
* `repositories/User.repository.ts`: Contiene la interfaz que define los metodos que se deben implementar en la capa de infraestructura de la aplicacion para trabajar con la informacion del usuario.
* `repositories/models/User.model.ts`: Contiene la interfaz que define la estructura de los datos en la base de datos.

---

### Capa de aplicacion

En esta seccion crearemos todo lo relacionado con la aplicacion. Aqui se crearan los casos de uso, los mappers, los helpers y los controladores. Ademas se crearan los archivos de configuracion de la aplicacion.	

* `usecases/User.usecase.ts`: Contiene la implementacion de los casos de uso de la aplicacion. Los casos de uso son los encargados de orquestar la logica de la aplicacion. Se comunican con los repositorios a traves de los contratos y se comunican con los controladores a traves de los DTOs.

* `mappers/User.mapper.ts`: Contiene la implementacion de los mappers de la aplicacion que nos ayudaran a mapear los datos de la base de datos con los datos del dominio de la aplicacion. Usualmente se hace uso de los mappers para mapear los datos de la base de datos con los DTOs.
#### Core: Archivos transversales a la aplicacion. 
Dentro de esta carpeta se crearan los archivos que seran transversales a la aplicacion. Estos archivos seran los encargados de contener las constantes, los helpers y configuraciones de la aplicacion.

* `utils/Constants.ts`: Contiene las constantes de la aplicacion. Esto con el fin de reducir el hardcoding y hacer de la aplicacion mas escalable y mantenible.
* `utils/Auth.helper.ts`: Contiene las funciones de ayuda para la autenticacion de usuarios.
* `config/index.ts`: Contiene las configuraciones de las variables de entorno de la aplicacion.

---

### Capa de infraestructura
En esta capa crearemos los repositorios, aqui estara todo lo relacionado con las bases de datos, apis y otros servicios externos. Tambien tendra nuestras rutas siendo asi el punto de entrada de la aplicacion y el punto de salida de la aplicacion. Por ultimo estan los controladores encargados de orquestar las peticiones HTTP y las respuestas HTTP y por ultimo los middlewares que se encargan de manejar los errores y los logs de la aplicacion.

* `repositories/User.repository.ts`: Contiene la implementacion del repositorio de usuarios en la infraestructura de la aplicacion. Aqui se implementan los metodos definidos en el contrato de los repositorios de usuarios.
* `repositories/UserImages.repository.ts`: Contiene la implementacion del repositorio de imagenes de perfil de usuario en la infraestructura de la aplicacion. Aqui se implementan los metodos definidos en el contrato de los repositorios de imagenes de perfil de usuario.
* `repositories/models/User.model.ts`:  Contiene el schema de la tabla de usuarios en la base de datos con el fin de que el ORM de sequelize pueda mapear los datos de la base de datos con los modelos de la aplicacion.
* `repositories/models/index.ts`: Contiene una funcion que inicializa los modelos de la aplicacion con el ORM de sequelize.
* `repositories/sequelizeMysqlConnection.ts`: Contiene la implementacion de la conexion con la base de datos haciendo uso del patron de diseño singleton devolviendo una unica instancia de la conexion con la base de datos.
* `controllers/User.controller.ts`: Contiene la implementacion de los controladores de la aplicacion. Los controladores son los encargados de orquestar las peticiones HTTP y las respuestas HTTP. Se comunican con los casos de uso a traves de los DTOs.
* `middlewares/Error.handler.ts`: Contiene la implementacion de los middlewares de error que sera el encargado de manejar los errores de la aplicacion y los logs de los mismos dentro de la aplicacion.
* `routes/User.routes.ts`: Contiene las rutas asociadas al usuario las cuales seran manejadas por los controladores de la aplicacion. 
* `routes/index.ts`: Contiene las rutas de la aplicacion. Aqui se agrupan todas las rutas de la aplicacion y se define un middleware que se encarga de manejar las rutas de la aplicacion.
* `dependencies.ts`: Contiene la inyeccion de dependencias de la aplicacion. Aqui se crean las instancias de los casos de uso, los controladores y los repositorios.

---

## Integracion con S3. 

En esta seccion se explicara como se integro el microservicio con S3 para guardar las imagenes de perfil del usuario

Para no perderse tanto en el codigo lo ideal es que se vean el siguiente video donde explica como crear un bucket en S3 y como crear un usuario IAM con las politicas de acceso al bucket de S3. Entre otras cosas. Se toma el video como base para implementar las funcionalidades de S3 y integrarlas a la arquitectura de la aplicacion.

[![IMAGE ALT TEXT HERE](https://i.ytimg.com/vi/NZElg91l_ms/hqdefault.jpg?sqp=-oaymwEbCKgBEF5IVfKriqkDDggBFQAAiEIYAXABwAEG&rs=AOn4CLBVPhCosdQqR3cH70DMClcew3IKcw)](https://www.youtube.com/watch?v=NZElg91l_ms)


Una vez se tenga el bucket creado se debe obtener el nombre del mismo, el access key y el secret key del usuario IAM creado y se deben agregar los siguientes secretos que se obtuvieron en las variables de entorno de la aplicacion.

Ejemplo de variables de entorno:
```bash
AWS_S3_BUCKET_NAME=profile-images
AWS_S3_REGION=us-east-1
AWS_S3_ACCESS_KEY_ID=XXXXXX
AWS_S3_SECRET_ACCESS_KEY=XXXXXX
AWS_S3_BUCKET_URL=https://profile-images.s3.amazonaws.com/
```

Estas variables de entorno son especificas para el servicio de S3, pero la aplicacion tiene variables de entorno adicionales que se deben configurar para que la aplicacion funcione correctamente. Estas variables de entorno se pueden ver en el archivo .env.example.

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
#### Explicacion de la integracion con S3 con el repositorio de imagenes de perfil de usuario
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
En este repositorio se hace uso del paquete de aws-sdk para nodejs. Este paquete nos permite conectarnos a los servicios de AWS desde nodejs. En este caso se hace uso del paquete de S3 para conectarnos a S3 desde nodejs. En el constructor creamos una instancia al cliente de S3 con las credenciales de acceso al bucket de S3. Luego se implementan los metodos definidos en el contrato de los repositorios de imagenes de perfil de usuario. En estos metodos se hace uso del cliente de S3 para subir y eliminar imagenes de S3.

#### Explicacion de la integracion con S3 en los casos de uso de la aplicacion 
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
Este metodo valida si se envio una imagen en la peticion y la sube a S3 haciendo uso del repositorio. Ademas modifica el DTO de usuario para agregar la URL de la imagen de perfil.


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


#### Uso de multer para recibir imagenes en las peticiones
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
```

Aqui se puede ver que se agrega el middleware de multer para poder recibir la imagen en la peticion. Este middleware se encarga de almacenar la imagen en memoria y luego se envia al controlador para que se suba a S3. Ademas el middleware se encarga de agregar la imagen al objeto request de la peticion para ser facil de extraer en el controlador.

#### Explicacion de la integracion con S3 en los controladores de la aplicacion
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

El metodo `createUser` de los controladores de `User` se modifico para que reciba la imagen en la peticion y la envie al caso de uso para que la suba a S3. Ademas se agrego la extension de la imagen para poder crear la key de la imagen de perfil para que sea consistente con la extension de la imagen.

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

* Ahora nos dirigimos a la instancia EC2 y obtenemos la direccion IP publica para conectarnos. 

De los pasos anteriores debemos obtener las siguientes variables de entorno:
```bash
MYSQL_HOST_DEV=ip_publica_instancia_ec2
MYSQL_USER_DEV=nombre_usuario # Nombre del usuario que se creo en mysql
MYSQL_PASSWORD_DEV=contraseña # Contraseña del usuario que se creo en mysql
MYSQL_DATABASE_DEV=assesment_db # Nombre de la base de datos que se creo en mysql
MYSQL_PORT_DEV=3306 # Puerto por defecto de mysql
MYSQL_DIALECT_DEV=mysql # Dialecto de la base de datos
MYSQL_LOGGING_DEV=true # Para que el orm muestren los logs de las consultas a la base de datos
```
Modifican las variables de entorno segun sea el caso y corran `npm run dev`. Si todo esta bien la aplicacion debe correr en local, conectandose a la base de datos que esta en el EC2.

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


### Utilizacion de PM2

PM2 es un administrador de procesos para aplicaciones Node.js que simplifica la gestión y el mantenimiento de aplicaciones en entornos de producción. PM2 proporciona un conjunto de características que ayudan a administrar y mantener las aplicaciones en producción. Estas características incluyen:
* Inicio de la aplicación en el arranque del sistema.
* Reinicio de la aplicación en caso de error.
* Monitoreo de la aplicación y el sistema.
* Registro de salida de la aplicación en un archivo.
* Administración y visualización de la aplicación en un panel de control.

Entre muchas otras caracteristicas. Para instalar PM2 en la instancia de EC2 debemos ejecutar los siguientes comandos:
```bash
sudo npm install pm2@latest -g
``` 
Esto nos instalara PM2 de manera global en la instancia de EC2. Ahora debemos ejecutar el siguiente comando para que compilar la aplicacion y luego ejecutarla con PM2.
```bash
npm run build
pm2 start dist/main.js
```

Ahora puedes guiarte de la documentacion para hacer uso de PM2. [Documentacion PM2](https://pm2.keymetrics.io/docs/usage/pm2-doc-single-page/)  