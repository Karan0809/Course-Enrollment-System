import { Router } from 'express';
import { loginController, meController, registerController } from './auth.controller.js';
import { requireAuth } from './auth.middleware.js';

const router = Router();

router.post('/register', registerController);
router.post('/login', loginController);
router.get('/me', requireAuth, meController);

export default router;
