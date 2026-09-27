import { Types } from 'mongoose';
import type { CourseLevel, CourseStatus } from './course.types.js';

export const validCourseLevels: CourseLevel[] = ['beginner', 'intermediate', 'advanced'];
export const validCourseStatuses: CourseStatus[] = ['draft', 'published', 'archived'];

export function isValidCourseId(value: string): boolean {
  return Types.ObjectId.isValid(value);
}

export function isValidCourseLevel(value: unknown): value is CourseLevel {
  return typeof value === 'string' && validCourseLevels.includes(value as CourseLevel);
}

export function isValidCourseStatus(value: unknown): value is CourseStatus {
  return typeof value === 'string' && validCourseStatuses.includes(value as CourseStatus);
}

export function parseBooleanFilter(value: unknown): boolean | undefined {
  if (typeof value === 'string') {
    if (value === 'true') return true;
    if (value === 'false') return false;
  }

  return undefined;
}

export function normalizeCourseText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}
