import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Define JWT payload
interface UserPayload {
  id: number;
  username: string;
  role: string;
}

// Express request include user
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ status: 'fail', message: 'No token provided' });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
    if (err) {
      res.status(403).json({ status: 'fail', message: 'Invalid token' });
      return;
    }
    // Type assertion for req.user
    req.user = user as UserPayload;
    next();
  });
};