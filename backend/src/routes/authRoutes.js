import { Router } from "express";
import {
  getCurrentUser,
  login,
  register,
  updateMyClubs
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", requireAuth, getCurrentUser);
router.patch("/me/clubs", requireAuth, updateMyClubs);

export default router;
