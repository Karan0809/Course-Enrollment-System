import type { Types } from 'mongoose';

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type CourseStatus = 'draft' | 'published' | 'archived';

export type CourseDocument = {
  _id: Types.ObjectId;
  title: string;
  description: string;
  teacherId: Types.ObjectId;
  price: number;
  isFree: boolean;
  duration: number;
  level: CourseLevel;
  status: CourseStatus;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};
