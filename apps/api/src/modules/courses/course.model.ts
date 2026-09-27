import { Schema, model } from 'mongoose';
import type { CourseDocument, CourseLevel, CourseStatus } from './course.types.js';

const courseLevelValues: CourseLevel[] = ['beginner', 'intermediate', 'advanced'];
const courseStatusValues: CourseStatus[] = ['draft', 'published', 'archived'];

const courseSchema = new Schema<CourseDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    isFree: {
      type: Boolean,
      required: true,
      default: false,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    level: {
      type: String,
      required: true,
      enum: courseLevelValues,
    },
    status: {
      type: String,
      required: true,
      enum: courseStatusValues,
      default: 'draft',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Course = model<CourseDocument>('Course', courseSchema);
