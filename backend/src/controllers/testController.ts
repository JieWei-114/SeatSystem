import { Request, Response, NextFunction } from 'express';

// Define the route handler with TypeScript types
export const routeTest = (req: Request, res: Response, next: NextFunction) => {
  res.json({
    status: 'success',
    message: 'Routes are working',
  });
};
