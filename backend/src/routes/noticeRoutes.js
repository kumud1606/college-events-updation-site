import { Router } from "express";
import { createNotice, deleteNotice, getNotices } from "../controllers/noticeController.js";
import { requireAdmin, requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", requireAuth, getNotices);
router.post("/", requireAuth, requireAdmin, createNotice);
router.delete("/:noticeId", requireAuth, requireAdmin, deleteNotice);

export default router;
