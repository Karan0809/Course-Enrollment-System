import { Schema, model } from 'mongoose';
import type { UserDocument, UserRole } from './user.types.js';

const userRoleValues: UserRole[] = ['admin', 'teacher', 'student'];

const userSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      set: (value: string) => value.trim().toLowerCase(),
    },
    passwordHash: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      enum: userRoleValues,
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

export const User = model<UserDocument>('User', userSchema);
