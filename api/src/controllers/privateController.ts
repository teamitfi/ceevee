import type { Request, Response } from 'express';
import prisma from '../db.js';

export const getProfile = (req: Request, res: Response) => {
  res.json({ user: req.user });
};

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await prisma.users.findMany();
    res.json(users);
  } catch (_error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
