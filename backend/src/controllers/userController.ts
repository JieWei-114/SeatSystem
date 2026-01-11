import { Request, Response, NextFunction } from 'express';
import { createUser, findUserByUsername, verifyUserCredentials, updateUserProfile } from '../db/dao/userDao';
import { UserEntity } from '../db/entities/User';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import User from '../db/models/Users';

export const registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { username, password, role } = req.body;

    // Validation
    if (!username || !password || !['super_admin', 'facility_manager', 'normal_user'].includes(role)) {
        res.status(400).json({
            status: 'fail',
            message: 'Invalid input: username, password, and valid role (super_admin, facility_manager, normal_user) required',
        });
        return;
    }

    try {
        // Check for existing user
        const existingUser = await findUserByUsername(username);
        if (existingUser) {
            res.status(400).json({
                status: 'fail',
                message: 'Username already taken',
            });
            return;
        }

        // Create new user
        const user = await createUser(username, password, role as UserEntity['role']);
        res.status(201).json({
            status: 'success',
            message: 'User registered successfully',
            data: {
                id: user.id,
                username: user.username,
                role: user.role,
            },
        });
        return;
    } catch (error) {
        console.error('Registration error:', error);
        if (!res.headersSent) {
            res.status(500).json({
                status: 'error',
                message: 'Server error during registration',
            });
        }
    }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      res.status(400).json({
        status: 'fail',
        message: 'Username and password are required',
      });
      return;
    }
  
    try {
      const user = await verifyUserCredentials(username, password);
      if (!user) {
        res.status(401).json({
          status: 'fail',
          message: 'Invalid username or password',
        });
        return;
      }
  
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET as string,
        { expiresIn: '1h' } // Token expires in 1 hour
      );
  
      res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            role: user.role,
          },
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          status: 'error',
          message: 'Server error during login',
        });
      }
    }
};

interface UserPayload {
  id: number;
  username: string;
  role: string;
}

export const updateUserProfileController = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ status: 'fail', message: 'No token provided' });
    return;
  }

  let decodedUser: UserPayload;
  try {
    decodedUser = jwt.verify(token, process.env.JWT_SECRET as string) as UserPayload;
  } catch (err) {
    res.status(403).json({ status: 'fail', message: 'Invalid token' });
    return;
  }

  const userId = decodedUser.id;

  if (!username) {
    res.status(400).json({ status: 'fail', message: 'Username is required' });
    return;
  }

  try {
    const existingUser = await findUserByUsername(username);
    if (existingUser && existingUser.id !== userId) {
      res.status(400).json({ status: 'fail', message: 'Username already taken' });
      return;
    }

    const updatedUser = await updateUserProfile(userId, username, password);
    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        id: updatedUser.id,
        username: updatedUser.username,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    if (!res.headersSent) {
      res.status(500).json({ status: 'error', message: 'Server error during profile update' });
    }
  }
};

export const searchUsers = async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const { query } = req.query;

  if (!token) {
    res.status(401).json({ status: 'fail', message: 'No token provided' });
    return;
  }

  let decodedUser: UserPayload;
  try {
    decodedUser = jwt.verify(token, process.env.JWT_SECRET as string) as UserPayload;
  } catch (err) {
    res.status(403).json({ status: 'fail', message: 'Invalid token' });
    return;
  }

  if (!['super_admin', 'facility_manager'].includes(decodedUser.role)) {
    res.status(403).json({ status: 'fail', message: 'Unauthorized: Admins/Managers only' });
    return;
  }
  
  try {
    if (query) {
      // Find one user with exact or close match
      const user = await User.findOne({
        where: {
          username: { [Op.iLike]: `${query}` }, // Exact match (case-insensitive)
        },
        attributes: ['id', 'username', 'role'],
      });
      if (user) {
        res.status(200).json({
          status: 'success',
          data: [user], // Return as array for consistency
        });
      } else {
        res.status(404).json({ status: 'fail', message: 'No user found with that name' });
      }
    } else {
      // Return all users if no query
      const users = await User.findAll({
        attributes: ['id', 'username', 'role'],
      });
      res.status(200).json({
        status: 'success',
        data: users,
      });
    }
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ status: 'error', message: 'Server error during search' });
  }
};

export const updateUserByAdmin = async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const { userId, username } = req.body;

  if (!token) {
    res.status(401).json({ status: 'fail', message: 'No token provided' });
    return;
  }

  let decodedUser: UserPayload;
  try {
    decodedUser = jwt.verify(token, process.env.JWT_SECRET as string) as UserPayload;
  } catch (err) {
    res.status(403).json({ status: 'fail', message: 'Invalid token' });
    return;
  }

  if (!['super_admin', 'facility_manager'].includes(decodedUser.role)) {
    res.status(403).json({ status: 'fail', message: 'Unauthorized: Admins/Managers only' });
    return;
  }

  if (!userId || !username) {
    res.status(400).json({ status: 'fail', message: 'User ID and username required' });
    return;
  }

  try {
    const targetUser = await User.findByPk(userId);
    if (!targetUser) {
      res.status(404).json({ status: 'fail', message: 'User not found' });
      return;
    }

    const existingUser = await findUserByUsername(username);
    if (existingUser && existingUser.id !== userId) {
      res.status(400).json({ status: 'fail', message: 'Username already taken' });
      return;
    }

    await targetUser.update({ username: username.toLowerCase() });
    res.status(200).json({
      status: 'success',
      message: 'User updated successfully',
      data: { id: targetUser.id, username: targetUser.username, role: targetUser.role },
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ status: 'error', message: 'Server error during update' });
  }
};

export const deleteUserByAdmin = async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const { userId } = req.body;

  if (!token) {
    res.status(401).json({ status: 'fail', message: 'No token provided' });
    return;
  }

  let decodedUser: UserPayload;
  try {
    decodedUser = jwt.verify(token, process.env.JWT_SECRET as string) as UserPayload;
  } catch (err) {
    res.status(403).json({ status: 'fail', message: 'Invalid token' });
    return;
  }

  if (!['super_admin', 'facility_manager'].includes(decodedUser.role)) {
    res.status(403).json({ status: 'fail', message: 'Unauthorized: Admins/Managers only' });
    return;
  }

  if (!userId) {
    res.status(400).json({ status: 'fail', message: 'User ID required' });
    return;
  }

  try {
    const targetUser = await User.findByPk(userId);
    if (!targetUser) {
      res.status(404).json({ status: 'fail', message: 'User not found' });
      return;
    }

    // Super admin can delete anyone; manager can only delete normal users
    if (decodedUser.role === 'facility_manager' && targetUser.role !== 'normal_user') {
      res.status(403).json({ status: 'fail', message: 'Managers can only delete normal users' });
      return;
    }

    await targetUser.destroy();
    res.status(200).json({ status: 'success', message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ status: 'error', message: 'Server error during deletion' });
  }
};