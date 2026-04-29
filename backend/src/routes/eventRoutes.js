import { Router } from "express";
import {
  createEvent,
  deleteEvent,
  getEventById,
  getEvents,
  updateEvent
} from "../controllers/eventController.js";
import { uploadSingleMedia } from "../middleware/uploadMiddleware.js";
import { requireAuth, requireManager } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", getEvents);
router.get("/:eventId", getEventById);
router.post("/", requireAuth, requireManager, uploadSingleMedia, createEvent);
router.patch("/:eventId", requireAuth, requireManager, uploadSingleMedia, updateEvent);
router.delete("/:eventId", requireAuth, requireManager, deleteEvent);

export default router;
