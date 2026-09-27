import { Schema, model } from 'mongoose';
import type { EnrollmentDocument, EnrollmentStatus } from './enrollment.types.js';

const enrollmentStatusValues: EnrollmentStatus[] = ['active', 'cancelled'];

const enrollmentSchema = new Schema<EnrollmentDocument>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    courseId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Course',
    },
    status: {
      type: String,
      required: true,
      enum: enrollmentStatusValues,
      default: 'active',
    },
    enrolledAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

export const Enrollment = model<EnrollmentDocument>('Enrollment', enrollmentSchema);
