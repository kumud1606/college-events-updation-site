import { Router } from "express";
import {
  getCertificates,
  issueCertificate,
  markCertificateDownloaded
} from "../controllers/certificateController.js";
import { requireAuth, requireManager } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", requireAuth, getCertificates);
router.post("/issue", requireAuth, requireManager, issueCertificate);
router.patch("/:certificateId/download", requireAuth, markCertificateDownloaded);

export default router;
