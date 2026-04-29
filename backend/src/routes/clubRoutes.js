import { Router } from "express";
import { getClubBySlug, getClubs, updateClubDetails } from "../controllers/clubController.js";
import { requireAuth, requireManager } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", getClubs);
router.get("/:slug", requireAuth, getClubBySlug);
router.patch("/:clubId", requireAuth, requireManager, updateClubDetails);

export default router;
