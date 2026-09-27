import type { NextFunction, Request, Response } from 'express';

export type AppError = Error & {
  statusCode?: number;
};

export function createAppError(message: string, statusCode = 500): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  return error;
}

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction): void {
  next(createAppError('Resource not found', 404));
}

export function errorHandler(
  error: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const statusCode = error.statusCode ?? 500;

  res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal server error',
    data: {},
  });
}
