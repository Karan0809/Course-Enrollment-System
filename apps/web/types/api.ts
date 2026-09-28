import type {
  CourseLevel,
  CourseStatus,
  EnrollmentStatus,
  UserRole,
} from '@course-enrollment-system/contracts';
import type { AuthUser } from '../store/slices/authSlice';

export type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
};

export type ApiFailure = {
  success: false;
  message: string;
  data: Record<string, never>;
};

export type AuthResponseData = {
  token: string;
  user: AuthUser;
};

export type LoginResponse = ApiSuccess<AuthResponseData>;
export type RegisterResponse = ApiSuccess<AuthResponseData>;

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export type CurrentUserResponse = ApiSuccess<AuthUser>;

export type UserSummary = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminDashboardSummary = { teachers: number; students: number; courses: number; enrollments: number };
export type CreateAdminUserRequest = { name: string; email: string; password: string; role: UserRole };
export type UpdateAdminUserRequest = Partial<Pick<UserSummary, 'name' | 'email' | 'role' | 'isActive'>>;

export type CourseSummary = {
  _id: string;
  title: string;
  description: string;
  teacherId: string;
  price: number;
  isFree: boolean;
  duration: number;
  level: CourseLevel;
  status: CourseStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateCourseRequest = {
  title: string;
  description: string;
  teacherId: string;
  price: number;
  isFree: boolean;
  duration: number;
  level: CourseLevel;
  status: CourseStatus;
  isActive?: boolean;
};
export type UpdateCourseRequest = Partial<CreateCourseRequest>;
export type TeacherCourseUpdateRequest = Pick<UpdateCourseRequest, 'title' | 'description' | 'price' | 'isFree' | 'duration' | 'level'>;

export type EnrollmentSummary = {
  id: string;
  studentId: string;
  courseId: string;
  status: EnrollmentStatus;
  enrolledAt: string;
};

export type StudentEnrollment = EnrollmentSummary & {
  createdAt: string;
  updatedAt: string;
  course: (Omit<CourseSummary, '_id' | 'createdAt' | 'updatedAt'> & { id: string }) | null;
};
export type TeacherCourseStudent = {
  enrollmentId: string;
  status: EnrollmentStatus;
  enrolledAt: string;
  student: { id: string; name: string; email: string; role: 'student'; isActive: boolean };
};
export type AdminEnrollment = {
  id: string;
  status: EnrollmentStatus;
  enrolledAt: string;
  student: { id: string; name: string; email: string; role: 'student'; isActive: boolean } | null;
  course: { id: string; title: string; teacher: { id: string; name: string; email: string } | null } | null;
};
export type CreateEnrollmentResponse = { enrollment: EnrollmentSummary };
