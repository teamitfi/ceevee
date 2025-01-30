import { Request, Response } from "express";
import { generateToken } from "../config/cognito";

export const login = (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

  // Mock authentication (Replace with AWS Cognito integration)
  const mockUser = { id: "123", email, role: "user" };
  const token = generateToken(mockUser);

  res.json({ token });
};