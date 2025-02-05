import type { Request, Response, NextFunction } from "express";

/**
 * Middleware to authorize users based on their roles.
 * @param allowedRoles - An array of roles that are permitted to access the route.
 */
export const authorizeRoles = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.roles) {
      return res.status(403).json({ message: "Access denied. User not authenticated." });
    }

    // Check if the user has at least one allowed role
    const hasAccess = req.user.roles.some((role: string) => allowedRoles.includes(role));
    if (!hasAccess) {
      return res.status(403).json({ message: "Forbidden: Insufficient permissions." });
    }

    next();
  };
};
