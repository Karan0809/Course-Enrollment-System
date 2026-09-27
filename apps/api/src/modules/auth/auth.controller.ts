import type { NextFunction, Request, Response } from 'express';
import { createAppError } from '../../middlewares/errorHandler.js';
import { getAuthenticatedUser, loginUser, registerUser } from './auth.service.js';

export async function registerController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await registerUser(req.body ?? {});
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result,
    });
  } catch (error) {
    next(error instanceof Error ? error : createAppError('Registration failed', 400));
  }
}

export async function loginController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await loginUser(req.body ?? {});
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    next(error instanceof Error ? error : createAppError('Login failed', 400));
  }
}

export async function meController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user?._id;

    if (!userId) {
      throw createAppError('Authentication required', 401);
    }

    const user = await getAuthenticatedUser(userId);
    res.status(200).json({
      success: true,
      message: 'Authenticated user profile',
      data: user,
    });
  } catch (error) {
    next(error instanceof Error ? error : createAppError('Unable to fetch profile', 400));
  }
}
