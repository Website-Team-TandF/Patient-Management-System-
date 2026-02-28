import { User } from '../models/User';
import { hashPassword } from '../utils/passwordHash';
import { validatePassword, PasswordValidationResult } from '../utils/passwordValidator';
import { UserRole } from '../types';
import { Types } from 'mongoose';

export interface CreateUserData {
  fullName: string;
  email: string;
  password: string;
  userRoles: UserRole[];
  departments?: string[];
  specializations?: string[];
  consultationFee?: number;
  extraLine?: string;
}

export interface UpdateUserData {
  fullName?: string;
  email?: string;
  password?: string;
  userRoles?: UserRole[];
  departments?: string[];
  specializations?: string[];
  consultationFee?: number;
  extraLine?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Get all users with pagination
 */
export const getAllUsers = async (options: PaginationOptions): Promise<PaginatedResult<any>> => {
  const { page, limit } = options;
  const skip = (page - 1) * limit;

  const users = await User.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select('-passwordHash -__v');

  const total = await User.countDocuments();

  return {
    data: users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get user by ID
 */
export const getUserById = async (userId: string) => {
  const user = await User.findById(userId).select('-passwordHash -__v');
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

/**
 * Validate password (wrapper for utility function)
 */
export const validateUserPassword = (password: string): PasswordValidationResult => {
  return validatePassword(password);
};

/**
 * Check if email exists
 */
export const emailExists = async (email: string, excludeUserId?: string): Promise<boolean> => {
  const query: any = { email: email.toLowerCase().trim() };
  if (excludeUserId) {
    query._id = { $ne: new Types.ObjectId(excludeUserId) };
  }
  const user = await User.findOne(query);
  return !!user;
};

/**
 * Create a new user
 */
export const createUser = async (userData: CreateUserData) => {
  // Validate password
  const passwordValidation = validatePassword(userData.password);
  if (!passwordValidation.isValid) {
    throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
  }

  // Check if email already exists
  const emailAlreadyExists = await emailExists(userData.email);
  if (emailAlreadyExists) {
    throw new Error('Email already exists');
  }

  // Hash password
  const passwordHash = await hashPassword(userData.password);

  // Prepare user data
  const newUserData: any = {
    fullName: userData.fullName.trim(),
    email: userData.email.toLowerCase().trim(),
    passwordHash,
    userRoles: userData.userRoles,
  };

  // Add doctor-specific fields if user is a doctor
  if (userData.userRoles.includes('doctor')) {
    if (userData.departments) newUserData.departments = userData.departments;
    if (userData.specializations) newUserData.specializations = userData.specializations;
    if (userData.consultationFee !== undefined) newUserData.consultationFee = userData.consultationFee;
    if (userData.extraLine) newUserData.extraLine = userData.extraLine.trim();
  }

  const user = new User(newUserData);
  await user.save();

  const userResponse = user.toObject() as any;
  delete userResponse.passwordHash;
  delete userResponse.__v;

  return userResponse;
};

/**
 * Update user
 */
export const updateUser = async (userId: string, updateData: UpdateUserData) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const updateFields: any = {};

  if (updateData.fullName) updateFields.fullName = updateData.fullName.trim();
  if (updateData.email) {
    // Check if email is already taken by another user
    const emailAlreadyExists = await emailExists(updateData.email, userId);
    if (emailAlreadyExists) {
      throw new Error('Email already exists');
    }
    updateFields.email = updateData.email.toLowerCase().trim();
  }
  if (updateData.password) {
    // Validate password
    const passwordValidation = validatePassword(updateData.password);
    if (!passwordValidation.isValid) {
      throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
    }
    updateFields.passwordHash = await hashPassword(updateData.password);
  }
  if (updateData.userRoles !== undefined) updateFields.userRoles = updateData.userRoles;
  if (updateData.departments !== undefined) updateFields.departments = updateData.departments;
  if (updateData.specializations !== undefined) updateFields.specializations = updateData.specializations;
  if (updateData.consultationFee !== undefined) updateFields.consultationFee = updateData.consultationFee;
  if (updateData.extraLine !== undefined) updateFields.extraLine = updateData.extraLine?.trim();

  const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
    new: true,
    runValidators: true,
  }).select('-passwordHash -__v');

  return updatedUser;
};

/**
 * Change user password
 */
export const changeUserPassword = async (userId: string, newPassword: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Validate password
  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.isValid) {
    throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
  }

  // Hash new password
  const passwordHash = await hashPassword(newPassword);

  await User.findByIdAndUpdate(userId, { passwordHash }, { new: true });
};

/**
 * Find user by email (for login)
 */
export const findByEmail = async (email: string) => {
  return await User.findOne({ email: email.toLowerCase().trim() });
};
