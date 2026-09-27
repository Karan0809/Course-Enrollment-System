import type { NextFunction, Request, Response } from 'express';
import type { UserRole } from '../modules/users/user.types.js';
import { createAppError } from './errorHandler.js';

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      next(createAppError('Authentication required', 401));
      return;
    }

    if (allowedRoles.length === 0) {
      next(createAppError('No roles configured for this route', 403));
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      next(createAppError('Forbidden: insufficient permissions', 403));
      return;
    }

    next();
  };
}

export const requireAdmin = requireRole('admin');
export const requireTeacher = requireRole('teacher');
export const requireStudent = requireRole('student');
