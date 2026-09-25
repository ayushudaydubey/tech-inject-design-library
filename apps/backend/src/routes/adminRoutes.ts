import { Router } from "express";
import { AdminController } from "../controllers/adminController";
import { authenticate, requireAdmin } from "../middleware/auth";
import { uploadMiddleware, handleUploadError } from "../middleware/upload";

const router = Router();

// Protect ALL admin routes with server-side authentication and admin role enforcement
router.use(authenticate, requireAdmin);

// Component drafting & publishing lifecycle
router.get("/components", AdminController.listComponents);
router.post("/components", AdminController.createDraft);
router.post("/components/validate", AdminController.validateDraftPayload);
router.get("/components/:id", AdminController.getComponent);
router.patch("/components/:id", AdminController.updateComponent);
router.post(
  "/components/:id/upload",
  uploadMiddleware.array("files", 20),
  handleUploadError,
  AdminController.uploadFiles
);
router.post("/components/:id/validate", AdminController.validateDraft);
router.post("/components/:id/preview", AdminController.previewDraft);
router.post("/components/:id/publish", AdminController.publishComponent);
router.post("/components/:id/unpublish", AdminController.unpublishComponent);
router.delete("/components/:id", AdminController.deleteComponent);

// Customer premium management
router.get("/customers", AdminController.listCustomers);
router.post("/customers/:id/grant-premium", AdminController.grantPremium);
router.post("/customers/:id/revoke-premium", AdminController.revokePremium);

export default router;
