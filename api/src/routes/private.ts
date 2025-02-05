import { Router } from "express";
import { getProfile, getUsers } from "../controllers/privateController.js";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

const router = Router();

router.get('/profile', authenticateToken, authorizeRoles(['admin', 'user']), getProfile);
router.get("/users", authenticateToken, authorizeRoles(['user']), getUsers);

export default router;