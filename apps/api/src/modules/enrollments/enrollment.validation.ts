import { Types } from 'mongoose';
import { createAppError } from '../../middlewares/errorHandler.js';
import type { EnrollmentStatus } from './enrollment.types.js';

export const enrollmentStatuses: EnrollmentStatus[] = ['active', 'cancelled'];

export type CreateEnrollmentInput = {
  courseId: string;
};

export type EnrollmentListFilters = {
  studentId?: string;
  courseId?: string;
  status?: EnrollmentStatus;
};

export function isValidEnrollmentId(value: string): boolean {
  return Types.ObjectId.isValid(value);
}

export function parseCreateEnrollmentInput(body: unknown): CreateEnrollmentInput {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw createAppError('Request body must be an object', 400);
  }

  const input = body as Record<string, unknown>;
  const unsupportedFields = Object.keys(input).filter((key) => key !== 'courseId');

  if (unsupportedFields.length > 0) {
    throw createAppError(`Unsupported enrollment field: ${unsupportedFields.join(', ')}`, 400);
  }

  if (typeof input.courseId !== 'string' || !isValidEnrollmentId(input.courseId)) {
    throw createAppError('Invalid course id', 400);
  }

  return { courseId: input.courseId };
}

function readOptionalString(value: unknown, fieldName: string): string | undefined {
  if (value === undefined) return undefined;

  if (typeof value !== 'string' || value.trim().length === 0) {
    throw createAppError(`${fieldName} must be a non-empty string`, 400);
  }

  return value.trim();
}

function validateOptionalId(value: string | undefined, fieldName: string): string | undefined {
  if (value !== undefined && !isValidEnrollmentId(value)) {
    throw createAppError(`Invalid ${fieldName}`, 400);
  }

  return value;
}

export function parseEnrollmentListFilters(query: Record<string, unknown>): EnrollmentListFilters {
  const studentId = validateOptionalId(readOptionalString(query.studentId, 'studentId'), 'studentId');
  const courseId = validateOptionalId(readOptionalString(query.courseId, 'courseId'), 'courseId');
  const statusValue = readOptionalString(query.status, 'status');

  if (statusValue !== undefined && !enrollmentStatuses.includes(statusValue as EnrollmentStatus)) {
    throw createAppError(`Status must be one of: ${enrollmentStatuses.join(', ')}`, 400);
  }

  return {
    ...(studentId ? { studentId } : {}),
    ...(courseId ? { courseId } : {}),
    ...(statusValue ? { status: statusValue as EnrollmentStatus } : {}),
  };
}

export function parseCourseIdParam(value: unknown): string {
  if (typeof value !== 'string' || !isValidEnrollmentId(value)) {
    throw createAppError('Invalid course id', 400);
  }

  return value;
}