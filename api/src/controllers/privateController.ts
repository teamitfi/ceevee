import type {Request, Response} from 'express';
import * as argon2 from 'argon2';
import prisma from '../db.js';
import { generateAuthTokens } from "../services/tokenService.js";

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: req.user?.id },
      select: { id: true, email: true, roles: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await prisma.users.findMany();
    res.json(users);
  } catch (_error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * @route POST /api/v1/private/register
 * @desc Registers a new user
 */
export const register = async (req: Request, res: Response) => {
  const { email, password, roles } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: 'invalid_request',
      error_description: 'Email and password are required'
    });
  }

  try {
    // Check if user exists
    const existingUser = await prisma.users.findUnique({where: {email}});
    if (existingUser) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'Email already registered'
      });
    }

    // Hash password and create user
    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536, // 64 MB
      timeCost: 3,
      parallelism: 4
    });
    
    const user = await prisma.users.create({
      data: {
        email,
        password: hashedPassword,
        roles: roles || ['user'],
      },
    });

    // Generate tokens
    await generateAuthTokens(user);

    res.status(201)
  } catch (error) {
    res.status(500).json({
      error: 'server_error',
      error_description: 'Failed to create user'
    });
  }
};