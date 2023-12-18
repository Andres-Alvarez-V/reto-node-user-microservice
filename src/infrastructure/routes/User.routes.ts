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

