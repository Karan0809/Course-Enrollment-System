import { User } from '../users/user.model.js';
import type { UserRole } from '../users/user.types.js';
import { createAppError } from '../../middlewares/errorHandler.js';
import type { AuthResponse, AuthenticatedUser, LoginRequestBody, RegisterRequestBody } from './auth.types.js';
import { comparePassword, hashPassword, signToken } from './auth.utils.js';

export function serializeUser(user: {
  _id: { toString(): string } | string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): AuthenticatedUser {
  const id = typeof user._id === 'string' ? user._id : user._id.toString();

  return {
    id,
    _id: id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function registerUser(input: RegisterRequestBody): Promise<AuthResponse> {
  const name = input.name?.trim();
  const email = input.email?.trim().toLowerCase();
  const password = input.password ?? '';

  if (!name || !email || !password) {
    throw createAppError('Name, email, and password are required', 400);
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    throw createAppError('Please provide a valid email address', 400);
  }

  if (password.length < 6) {
    throw createAppError('Password must be at least 6 characters long', 400);
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw createAppError('A user with this email already exists', 409);
  }

  const user = await User.create({
    name,
    email,
    passwordHash: await hashPassword(password),
    role: 'student' as const,
    isActive: true,
  });

  const token = signToken({ _id: user._id.toString(), email: user.email, role: user.role });

  return {
    token,
    user: serializeUser(user),
  };
}

export async function loginUser(input: LoginRequestBody): Promise<AuthResponse> {
  const email = input.email?.trim().toLowerCase();
  const password = input.password ?? '';

  if (!email || !password) {
    throw createAppError('Email and password are required', 400);
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    throw createAppError('Please provide a valid email address', 400);
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw createAppError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw createAppError('User account is inactive', 401);
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash);
  if (!isPasswordValid) {
    throw createAppError('Invalid email or password', 401);
  }

  const token = signToken({ _id: user._id.toString(), email: user.email, role: user.role });

  return {
    token,
    user: serializeUser(user),
  };
}

export async function getAuthenticatedUser(userId: string): Promise<AuthenticatedUser> {
  const user = await User.findById(userId);

  if (!user) {
    throw createAppError('User not found', 404);
  }

  return serializeUser(user);
}
