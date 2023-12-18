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