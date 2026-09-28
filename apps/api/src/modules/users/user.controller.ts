import type { NextFunction, Request, Response } from 'express';
import { createAppError } from '../../middlewares/errorHandler.js';
import {
  createUser,
  getUserById,
  listUsers,
  updateUserById,
  updateUserStatus,
  getAdminDashboardSummary,
} from './user.service.js';

export async function deactivateUserController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await updateUserStatus(getUserIdParam(req), false);
    res.status(200).json({ success: true, message: 'User deactivated successfully', data: user });
  } catch (error) {
    next(error instanceof Error ? error : createAppError('Unable to deactivate user', 400));
  }
}

export async function adminDashboardSummaryController(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const summary = await getAdminDashboardSummary();
    res.status(200).json({ success: true, message: 'Dashboard summary retrieved successfully', data: summary });
  } catch (error) {
    next(error instanceof Error ? error : createAppError('Unable to fetch dashboard summary', 500));
  }
}

function getUserIdParam(req: Request): string {
  const userId = req.params.id;

  if (typeof userId !== 'string' || userId.trim().length === 0) {
    throw createAppError('Invalid user id', 400);
  }

  return userId;
}

export async function getUsersController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const users = await listUsers(req.query as Record<string, string>);
    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: users,
    });
  } catch (error) {
    next(error instanceof Error ? error : createAppError('Unable to fetch users', 400));
  }
}

export async function getUserController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = getUserIdParam(req);
    const user = await getUserById(userId);
    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: user,
    });
  } catch (error) {
    next(error instanceof Error ? error : createAppError('Unable to fetch user', 400));
  }
}

export async function createUserController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = await createUser(req.body ?? {});
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user,
    });
  } catch (error) {
    next(error instanceof Error ? error : createAppError('Unable to create user', 400));
  }
}

export async function updateUserController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = getUserIdParam(req);
    const user = await updateUserById(userId, req.body ?? {});
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    next(error instanceof Error ? error : createAppError('Unable to update user', 400));
  }
}

export async function updateUserStatusController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = getUserIdParam(req);
    const { isActive } = req.body ?? {};
    if (typeof isActive !== 'boolean') {
      throw createAppError('isActive must be a boolean value', 400);
    }

    const user = await updateUserStatus(userId, isActive);
    res.status(200).json({
      success: true,
      message: 'User status updated successfully',
      data: user,
    });
  } catch (error) {
    next(error instanceof Error ? error : createAppError('Unable to update user status', 400));
  }
}
