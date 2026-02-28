import { comparePassword } from '../utils/passwordHash';
import { generateToken } from '../utils/jwt';
import { findByEmail } from './userService';

export interface LoginData {
  email: string;
  password: string;
}

/**
 * Authenticate user and generate token
 */
export const login = async (loginData: LoginData) => {
  const { email, password } = loginData;

  // Find user by email
  const user = await findByEmail(email);
  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // Generate JWT token with userId, name, email, and roles
  const token = generateToken({
    userId: user._id.toString(),
    name: user.fullName,
    email: user.email,
    roles: user.userRoles,
  });

  // Return user object with roles
  return {
    user: {
      name: user.fullName,
      email: user.email,
      roles: user.userRoles,
    },
    token,
  };
};
