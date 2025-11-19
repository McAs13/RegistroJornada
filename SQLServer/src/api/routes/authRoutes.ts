import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import container from '../serverContainer';

const router = Router();
const controller = new AuthController(container.authService);

router.post('/login', controller.login);

export default router;
