import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { requireAdmin } from '../../middlewares/authorization.middleware.js';
import {
  createUserController,
  getUserController,
  getUsersController,
  updateUserController,
  updateUserStatusController,
  deactivateUserController,
} from './user.controller.js';

const router = Router();

router.use(requireAuth, requireAdmin);
router.post('/', createUserController);
router.get('/', getUsersController);
router.get('/:id', getUserController);
router.patch('/:id', updateUserController);
router.patch('/:id/status', updateUserStatusController);
router.delete('/:id', deactivateUserController);

export default router;
