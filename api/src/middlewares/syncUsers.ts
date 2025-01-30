import { Request, Response, NextFunction } from "express";
import prisma from "../db";

export const syncUser = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  const { id, email, role } = req.user;

  let user = await prisma.users.findUnique({ where: { cognitoId: id } });

  if (!user) {
    user = await prisma.users.create({
      data: {
        cognitoId: id,
        email,
        role,
      },
    });
  }

  req.user = user;
  next();
};