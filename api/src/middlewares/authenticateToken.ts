import { Request, Response, NextFunction } from "express";
import { verifyToken, DecodedUser } from "../config/cognito";

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "Access denied" });

  const token = authHeader.split(" ")[1]; // Extract token from "Bearer <token>"
  if (!token) return res.status(403).json({ message: "Invalid token format" });

  const decoded: DecodedUser | null = verifyToken(token);
  if (!decoded) return res.status(403).json({ message: "Invalid token" });

  req.user = decoded;
  next();
};
