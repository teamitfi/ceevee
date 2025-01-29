import { Request, Response } from "express";
import prisma from "../db.js";

export const getPrivateData = async (req: Request, res: Response) => {
  try {
    const users = await prisma.users.findMany();
    console.log('Response', users)
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};