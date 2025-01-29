import { NextFunction, Request, Response, Router } from "express";
import { getPrivateData } from "../controllers/privateController.js";

const router = Router();
router.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`Incoming request: ${req.method} ${req.path}`);
  next();
});
router.get("/users", getPrivateData);
export default router;