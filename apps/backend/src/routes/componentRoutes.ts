import { Router } from "express";
import { ComponentController } from "../controllers/componentController";
import { optionalAuthenticate } from "../middleware/auth";

const router = Router();

// Public catalogue listings and details (with optional auth for unlocked state)
router.get("/", optionalAuthenticate, ComponentController.getComponents);
router.get("/:slug", optionalAuthenticate, ComponentController.getComponentBySlug);

// Protected sub-resources (free components open to all; premium checks current DB user)
router.get("/:slug/preview", optionalAuthenticate, ComponentController.getPreview);
router.get("/:slug/source", optionalAuthenticate, ComponentController.getSource);
router.get("/:slug/install", optionalAuthenticate, ComponentController.getInstall);
router.get("/:slug/agent-prompt", optionalAuthenticate, ComponentController.getAgentPrompt);
router.get("/:slug/download", optionalAuthenticate, ComponentController.getDownload);

export default router;
