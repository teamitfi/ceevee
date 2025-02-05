import { Router } from "express";
import publicRoutes from "./public.js";
import privateRoutes from "./private.js";
const router = Router();
router.use("/public", publicRoutes);
router.use("/private", privateRoutes);
export default router;
