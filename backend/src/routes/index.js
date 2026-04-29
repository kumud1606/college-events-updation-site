import { Router } from "express";
import authRoutes from "./authRoutes.js";
import certificateRoutes from "./certificateRoutes.js";
import clubRoutes from "./clubRoutes.js";
import eventRoutes from "./eventRoutes.js";
import noticeRoutes from "./noticeRoutes.js";
import registrationRoutes from "./registrationRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/clubs", clubRoutes);
router.use("/events", eventRoutes);
router.use("/notices", noticeRoutes);
router.use("/registrations", registrationRoutes);
router.use("/certificates", certificateRoutes);

export default router;
