import type { UserRole } from '../users/user.types.js';

export type AuthenticatedUser = {
  id: string;
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type RegisterRequestBody = {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
};

export type LoginRequestBody = {
  email?: string;
  password?: string;
};

export type AuthResponse = {
  token: string;
  user: AuthenticatedUser;
};
