import { Types } from 'mongoose';
import type { UserRole } from './user.types.js';

export const validRoles: UserRole[] = ['admin', 'teacher', 'student'];

export function isValidRole(value: unknown): value is UserRole {
  return typeof value === 'string' && validRoles.includes(value as UserRole);
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isValidObjectId(value: string): boolean {
  return Types.ObjectId.isValid(value);
}

export function parseBooleanFilter(value: unknown): boolean | undefined {
  if (typeof value === 'string') {
    if (value === 'true') return true;
    if (value === 'false') return false;
  }

  return undefined;
}
