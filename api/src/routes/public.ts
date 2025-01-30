import { Router } from "express";
import { login } from "../controllers/publicController";

const router = Router();

router.post("/login", login);

export default router;