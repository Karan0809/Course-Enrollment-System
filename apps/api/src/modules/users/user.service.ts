import { User } from './user.model.js';
import { createAppError } from '../../middlewares/errorHandler.js';
import { hashPassword } from '../auth/auth.utils.js';
import type { UserDocument, UserRole } from './user.types.js';
import { isValidEmail, isValidObjectId, isValidRole, normalizeEmail, parseBooleanFilter, validRoles } from './user.validation.js';

export type UserListQuery = {
  role?: string;
  isActive?: string;
  email?: string;
};

export type CreateUserInput = {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  isActive?: boolean;
};

export type UpdateUserInput = Partial<CreateUserInput>;

export type UserSummary = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

function serializeUser(user: UserDocument): UserSummary {
  return {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function listUsers(query: UserListQuery = {}): Promise<UserSummary[]> {
  const filter: Record<string, unknown> = {};

  if (query.role) {
    if (!isValidRole(query.role)) {
      throw createAppError('Invalid role value', 400);
    }
    filter.role = query.role;
  }

  if (query.isActive !== undefined) {
    const isActive = parseBooleanFilter(query.isActive);
    if (isActive === undefined) {
      throw createAppError('isActive must be either true or false', 400);
    }
    filter.isActive = isActive;
  }

  if (query.email) {
    const email = normalizeEmail(query.email);
    if (!isValidEmail(email)) {
      throw createAppError('Please provide a valid email address', 400);
    }
    filter.email = email;
  }

  const users = await User.find(filter).sort({ createdAt: -1 });
  return users.map(serializeUser);
}

export async function getUserById(userId: string): Promise<UserSummary> {
  if (!isValidObjectId(userId)) {
    throw createAppError('Invalid user id', 400);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw createAppError('User not found', 404);
  }

  return serializeUser(user);
}

export async function createUser(input: CreateUserInput): Promise<UserSummary> {
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  const email = typeof input.email === 'string' ? normalizeEmail(input.email) : '';
  const password = typeof input.password === 'string' ? input.password : '';
  const requestedRole = input.role ?? 'student';

  if (!name) {
    throw createAppError('Name is required', 400);
  }

  if (!email || !isValidEmail(email)) {
    throw createAppError('Please provide a valid email address', 400);
  }

  if (!password || password.length < 6) {
    throw createAppError('Password must be at least 6 characters long', 400);
  }

  if (!isValidRole(requestedRole)) {
    throw createAppError(`Role must be one of: ${validRoles.join(', ')}`, 400);
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw createAppError('A user with this email already exists', 409);
  }

  const user = await User.create({
    name,
    email,
    passwordHash: await hashPassword(password),
    role: requestedRole,
    isActive: input.isActive ?? true,
  });

  return serializeUser(user);
}

export async function updateUserById(userId: string, input: UpdateUserInput): Promise<UserSummary> {
  if (!isValidObjectId(userId)) {
    throw createAppError('Invalid user id', 400);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw createAppError('User not found', 404);
  }

  const nextName = typeof input.name === 'string' ? input.name.trim() : undefined;
  const nextEmail = typeof input.email === 'string' ? normalizeEmail(input.email) : undefined;
  const nextPassword = typeof input.password === 'string' ? input.password : undefined;
  const nextRole = input.role;

  if (nextName !== undefined && !nextName) {
    throw createAppError('Name cannot be empty', 400);
  }

  if (nextEmail !== undefined) {
    if (!isValidEmail(nextEmail)) {
      throw createAppError('Please provide a valid email address', 400);
    }

    const existingUser = await User.findOne({ email: nextEmail, _id: { $ne: user._id } });
    if (existingUser) {
      throw createAppError('A user with this email already exists', 409);
    }
  }

  if (nextPassword !== undefined && nextPassword.length < 6) {
    throw createAppError('Password must be at least 6 characters long', 400);
  }

  if (nextRole !== undefined && !isValidRole(nextRole)) {
    throw createAppError(`Role must be one of: ${validRoles.join(', ')}`, 400);
  }

  if (nextName !== undefined) user.name = nextName;
  if (nextEmail !== undefined) user.email = nextEmail;
  if (nextRole !== undefined) user.role = nextRole;
  if (nextPassword !== undefined) {
    user.passwordHash = await hashPassword(nextPassword);
  }
  if (input.isActive !== undefined) {
    if (typeof input.isActive !== 'boolean') {
      throw createAppError('isActive must be a boolean value', 400);
    }
    user.isActive = input.isActive;
  }

  await user.save();

  return serializeUser(user);
}

export async function updateUserStatus(userId: string, isActive: boolean): Promise<UserSummary> {
  if (!isValidObjectId(userId)) {
    throw createAppError('Invalid user id', 400);
  }

  if (typeof isActive !== 'boolean') {
    throw createAppError('isActive must be a boolean value', 400);
  }

  const user = await User.findByIdAndUpdate(userId, { isActive }, { new: true });
  if (!user) {
    throw createAppError('User not found', 404);
  }

  return serializeUser(user);
}
