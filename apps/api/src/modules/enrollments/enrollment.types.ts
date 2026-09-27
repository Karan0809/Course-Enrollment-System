import type { Types } from 'mongoose';

export type EnrollmentStatus = 'active' | 'cancelled';

export type EnrollmentDocument = {
  _id: Types.ObjectId;
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  status: EnrollmentStatus;
  enrolledAt: Date;
  createdAt: Date;
  updatedAt: Date;
};
