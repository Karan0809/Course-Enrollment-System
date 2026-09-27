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

export type EnrollmentSummary = {
  id: string;
  studentId: string;
  courseId: string;
  status: EnrollmentStatus;
  enrolledAt: string;
};