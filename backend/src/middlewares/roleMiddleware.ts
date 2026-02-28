import { Response, NextFunction } from 'express';
import { UserRole } from '../types';
import { AuthRequest } from './authMiddleware';

/**
 * Authorization middleware to check if user has one of the required roles
 * This middleware should be used AFTER authMiddleware
 * @param allowedRoles - Array of UserRole enums that can access the route
 * @returns Middleware function
 */
export const requireRole = (allowedRoles: UserRole[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized: No user found' });
        return;
      }

      // Check if user has at least one of the required roles
      // req.user.roles is already populated by authMiddleware with UserRole[] type
      const hasRequiredRole = req.user.roles.some((role: UserRole) =>
        allowedRoles.includes(role)
      );

      if (!hasRequiredRole) {
        res.status(403).json({
          success: false,
          message: `Forbidden: Access requires one of these roles: ${allowedRoles.join(', ')}`,
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({ success: false, message: 'Internal server error', error });
    }
  };
};

