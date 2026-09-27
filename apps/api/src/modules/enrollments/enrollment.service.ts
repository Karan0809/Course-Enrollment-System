import { Course } from '../courses/course.model.js';
import type { AuthenticatedUser } from '../auth/auth.types.js';
import { createAppError } from '../../middlewares/errorHandler.js';
import { Enrollment } from './enrollment.model.js';
import type { EnrollmentDocument, EnrollmentStatus } from './enrollment.types.js';
import type { EnrollmentListFilters } from './enrollment.validation.js';
import { isValidEnrollmentId } from './enrollment.validation.js';

export type EnrollmentSummary = {
  id: string;
  studentId: string;
  courseId: string;
  status: EnrollmentStatus;
  enrolledAt: Date;
};

function serializeEnrollment(enrollment: EnrollmentDocument): EnrollmentSummary {
  return {
    id: enrollment._id.toString(),
    studentId: enrollment.studentId.toString(),
    courseId: enrollment.courseId.toString(),
    status: enrollment.status,
    enrolledAt: enrollment.enrolledAt,
  };
}

function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 11000;
}

export async function createStudentEnrollment(
  student: AuthenticatedUser,
  courseId: string,
): Promise<EnrollmentSummary> {
  if (!isValidEnrollmentId(courseId)) {
    throw createAppError('Invalid course id', 400);
  }

  const course = await Course.findById(courseId);
  if (!course) {
    throw createAppError('Course not found', 404);
  }

  if (course.status !== 'published') {
    throw createAppError('Only published courses can be enrolled in', 400);
  }

  if (!course.isActive) {
    throw createAppError('Inactive courses cannot be enrolled in', 400);
  }

  const existingEnrollment = await Enrollment.findOne({ studentId: student._id, courseId });
  if (existingEnrollment) {
    throw createAppError('Student is already enrolled in this course', 409);
  }

  try {
    const enrollment = await Enrollment.create({
      studentId: student._id,
      courseId,
      status: 'active',
      enrolledAt: new Date(),
    });

    return serializeEnrollment(enrollment);
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw createAppError('Student is already enrolled in this course', 409);
    }

    throw error;
  }
}

export async function listStudentEnrollments(student: AuthenticatedUser): Promise<EnrollmentSummary[]> {
  const enrollments = await Enrollment.find({ studentId: student._id }).sort({ enrolledAt: -1 });
  return enrollments.map(serializeEnrollment);
}

export async function listAllEnrollments(filters: EnrollmentListFilters = {}): Promise<EnrollmentSummary[]> {
  const enrollments = await Enrollment.find(filters).sort({ enrolledAt: -1 });
  return enrollments.map(serializeEnrollment);
}

export async function listCourseEnrollments(
  teacher: AuthenticatedUser,
  courseId: string,
): Promise<EnrollmentSummary[]> {
  if (!isValidEnrollmentId(courseId)) {
    throw createAppError('Invalid course id', 400);
  }

  const course = await Course.findById(courseId);
  if (!course) {
    throw createAppError('Course not found', 404);
  }

  if (course.teacherId.toString() !== teacher._id) {
    throw createAppError('Forbidden: this course is not assigned to you', 403);
  }

  const enrollments = await Enrollment.find({ courseId }).sort({ enrolledAt: -1 });
  return enrollments.map(serializeEnrollment);
}