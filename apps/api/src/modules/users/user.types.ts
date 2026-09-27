import type { Types } from 'mongoose';

export type UserRole = 'admin' | 'teacher' | 'student';

export type UserDocument = {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};
