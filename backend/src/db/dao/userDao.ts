import User from '../models/Users';
import { UserEntity } from '../entities/User';
import bcrypt from 'bcrypt';

// Debugging utility
const debug = (message: string, data?: any) => {
  console.log(`[DAO] ${message}`, data || '');
};


export const createUser = async (
  username: string,
  password: string,
  role: UserEntity['role']
): Promise<UserEntity> => {
  try {
    const Username = username.toLowerCase();
    debug('Creating user', { username: Username, role });
    const hashedPassword = await bcrypt.hash(password, 10); // Hash password with bcrypt
    const user = await User.create({ username: Username, password: hashedPassword, role });
    debug('User created', { id: user.id, username: user.username });
    return user;
  } catch (error) {
    debug('Error creating user', error);
    throw error;
  }
};

export const findUserByUsername = async (username: string): Promise<UserEntity | null> => {
  try {
    const Username = username.toLowerCase();
    debug('Finding user by username', { username: Username });
    const user = await User.findOne({ where: { username: Username } });
    debug('User found', user ? { id: user.id, username: user.username } : 'Not found');
    return user;
  } catch (error) {
    debug('Error finding user', error);
    throw error;
  }
};

export const verifyUserCredentials = async (
  username: string,
  password: string
): Promise<UserEntity | null> => {
  try {
    const Username = username.toLowerCase();
    debug('Verifying credentials for', { username: Username });
    const user = await findUserByUsername(Username);
    if (!user) {
      debug('User not found', { username: Username });
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      debug('Invalid password for', { username: Username });
      return null;
    }

    debug('Credentials verified', { id: user.id, username: user.username });
    return user;
  } catch (error) {
    debug('Error verifying credentials', error);
    throw error;
  }
};

export const updateUserProfile = async (
  userId: number,
  username: string,
  password?: string
): Promise<UserEntity> => {
  try {
    const Username = username.toLowerCase();
    debug('Updating user profile', { userId, username: Username });

    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const updates: Partial<UserEntity> = { username: Username };
    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }

    await user.update(updates);
    debug('User profile updated', { id: user.id, username: user.username });
    return user;
  } catch (error) {
    debug('Error updating user profile', error);
    throw error;
  }
};