import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to protect routes from unauthenticated users.
 * Ensures the user has a valid active session.
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  // Check if session exists and contains valid user data
  if (req.session && req.session.user) {
    return next(); // User is authenticated, proceed to the route handler
  }

  // If no session exists, block the request
  return res.status(401).json({
    message: 'Access denied. Please log in to continue.'
  });
};
