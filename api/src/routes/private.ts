import { Router } from "express";
import { getProfile, getUsers } from "../controllers/privateController.js";
import { authenticateToken } from "../middlewares/authenticateToken";
import { syncUser } from "../middlewares/syncUsers";

const router = Router();

router.get('/profile', authenticateToken, syncUser, getProfile)
router.get("/users", authenticateToken, syncUser, getUsers);

export default router;