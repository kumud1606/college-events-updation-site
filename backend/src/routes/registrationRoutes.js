import { Router } from "express";
import {
  createRegistration,
  getEventRegistrationsForManager,
  getMyRegistrations
} from "../controllers/registrationController.js";
import { requireAuth, requireManager } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/mine", requireAuth, getMyRegistrations);
router.get("/event/:eventId", requireAuth, requireManager, getEventRegistrationsForManager);
router.post("/", requireAuth, createRegistration);

export default router;
