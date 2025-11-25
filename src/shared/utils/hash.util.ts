import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';

/**
 * Hash a plain text password
 * @param password - plain string password
 * @returns hashed password string
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;

  return await bcrypt.hash(password, saltRounds);
};

/**
 * Compare plain text password with hashed password
 * @param plain - plain password
 * @param hashed - hashed password
 * @returns true if passwords match
 */
export const comparePassword = async (plain: string, hashed: string): Promise<boolean> => {
  return await bcrypt.compare(plain, hashed);
};

/**
 * Hash arbitrary token/string (one-way) for safe storage
 */
export const hashToken = (token: string): string => {
  return createHash('sha256').update(token).digest('hex');
};
