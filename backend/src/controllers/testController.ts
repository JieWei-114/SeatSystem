import { Request, Response, NextFunction } from 'express';

// Define route handler
export const routeTest = (req: Request, res: Response, next: NextFunction) => {
  res.json({
    status: 'success',
    message: 'Routes are working',
  });
};
