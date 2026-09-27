import type { NextFunction, Request, Response } from 'express';
import { User } from '../users/user.model.js';
import { createAppError } from '../../middlewares/errorHandler.js';
import { serializeUser } from './auth.service.js';
import { verifyToken } from './auth.utils.js';

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createAppError('Authentication token is required', 401);
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const payload = verifyToken(token);
    const user = await User.findById(payload.sub);

    if (!user) {
      throw createAppError('User not found', 401);
    }

    if (!user.isActive) {
      throw createAppError('User account is inactive', 401);
    }

    req.user = serializeUser(user);
    next();
  } catch (error) {
    next(error instanceof Error ? error : createAppError('Authentication failed', 401));
  }
}
