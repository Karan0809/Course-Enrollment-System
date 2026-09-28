import { Course } from '../courses/course.model.js';
import { User } from '../users/user.model.js';
import type { AuthenticatedUser } from '../auth/auth.types.js';
import { createAppError } from '../../middlewares/errorHandler.js';
import { Enrollment } from './enrollment.model.js';
import type { EnrollmentDocument, EnrollmentStatus } from './enrollment.types.js';
import type { CourseLevel, CourseStatus } from '../courses/course.types.js';
import type { EnrollmentListFilters } from './enrollment.validation.js';
import { isValidEnrollmentId } from './enrollment.validation.js';

export type EnrollmentSummary = {
  id: string;
  studentId: string;
  courseId: string;
  status: EnrollmentStatus;
  enrolledAt: Date;
};

export type StudentEnrollmentDetails = EnrollmentSummary & {
  createdAt: Date;
  updatedAt: Date;
  course: {
    id: string;
    title: string;
    description: string;
    teacherId: string;
    price: number;
    isFree: boolean;
    duration: number;
    level: CourseLevel;
    status: CourseStatus;
    isActive: boolean;
  } | null;
};

export type TeacherCourseStudent = {
  enrollmentId: string;
  status: EnrollmentStatus;
  enrolledAt: Date;
  student: { id: string; name: string; email: string; role: 'student'; isActive: boolean };
};

export type AdminEnrollmentDetails = {
  id: string;
  status: EnrollmentStatus;
  enrolledAt: Date;
  student: { id: string; name: string; email: string; role: 'student'; isActive: boolean } | null;
  course: { id: string; title: string; teacher: { id: string; name: string; email: string } | null } | null;
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

export async function listStudentEnrollmentDetails(student: AuthenticatedUser): Promise<StudentEnrollmentDetails[]> {
  const enrollments = await Enrollment.find({ studentId: student.id }).sort({ enrolledAt: -1 });
  const courseIds = enrollments.map((enrollment) => enrollment.courseId);
  const courses = await Course.find({ _id: { $in: courseIds } }).select('title description teacherId price isFree duration level status isActive');
  const coursesById = new Map(courses.map((course) => [course._id.toString(), course]));

  return enrollments.map((enrollment) => {
    const course = coursesById.get(enrollment.courseId.toString());
    return {
      ...serializeEnrollment(enrollment),
      createdAt: enrollment.createdAt,
      updatedAt: enrollment.updatedAt,
      course: course ? {
        id: course._id.toString(),
        title: course.title,
        description: course.description,
        teacherId: course.teacherId.toString(),
        price: course.price,
        isFree: course.isFree,
        duration: course.duration,
        level: course.level,
        status: course.status,
        isActive: course.isActive,
      } : null,
    };
  });
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

export async function listTeacherCourseStudents(
  teacher: AuthenticatedUser,
  courseId: string,
): Promise<TeacherCourseStudent[]> {
  if (!isValidEnrollmentId(courseId)) throw createAppError('Invalid course id', 400);
  const course = await Course.findById(courseId);
  if (!course) throw createAppError('Course not found', 404);
  if (course.teacherId.toString() !== teacher.id) {
    throw createAppError('Forbidden: this course is not assigned to you', 403);
  }

  const enrollments = await Enrollment.find({ courseId }).sort({ enrolledAt: -1 });
  const students = await User.find({
    _id: { $in: enrollments.map((enrollment) => enrollment.studentId) },
    role: 'student',
  }).select('name email role isActive');
  const studentsById = new Map(students.map((student) => [student._id.toString(), student]));
  return enrollments.flatMap((enrollment) => {
    const student = studentsById.get(enrollment.studentId.toString());
    return student ? [{
      enrollmentId: enrollment._id.toString(),
      status: enrollment.status,
      enrolledAt: enrollment.enrolledAt,
      student: {
        id: student._id.toString(), name: student.name, email: student.email,
        role: 'student' as const, isActive: student.isActive,
      },
    }] : [];
  });
}

export async function listAdminEnrollmentDetails(
  filters: EnrollmentListFilters = {},
): Promise<AdminEnrollmentDetails[]> {
  const enrollments = await Enrollment.find(filters).sort({ enrolledAt: -1 });
  const [students, courses] = await Promise.all([
    User.find({ _id: { $in: enrollments.map((item) => item.studentId) }, role: 'student' }).select('name email role isActive'),
    Course.find({ _id: { $in: enrollments.map((item) => item.courseId) } }).select('title teacherId'),
  ]);
  const studentsById = new Map(students.map((item) => [item._id.toString(), item]));
  const coursesById = new Map(courses.map((item) => [item._id.toString(), item]));
  const teacherIds = courses.map((item) => item.teacherId);
  const teachers = await User.find({ _id: { $in: teacherIds }, role: 'teacher' }).select('name email role');
  const teachersById = new Map(teachers.map((item) => [item._id.toString(), item]));

  return enrollments.map((enrollment) => {
    const student = studentsById.get(enrollment.studentId.toString());
    const course = coursesById.get(enrollment.courseId.toString());
    const teacher = course ? teachersById.get(course.teacherId.toString()) : undefined;
    return {
      id: enrollment._id.toString(), status: enrollment.status, enrolledAt: enrollment.enrolledAt,
      student: student ? {
        id: student._id.toString(), name: student.name, email: student.email,
        role: 'student', isActive: student.isActive,
      } : null,
      course: course ? {
        id: course._id.toString(), title: course.title,
        teacher: teacher ? { id: teacher._id.toString(), name: teacher.name, email: teacher.email } : null,
      } : null,
    };
  });
}
