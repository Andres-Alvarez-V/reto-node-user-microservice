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

