import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { authenticate, optionalAuthenticate } from "../middleware/auth";

const router = Router();

router.post("/login", AuthController.login);
router.post("/refresh", AuthController.refresh);
router.post("/logout", optionalAuthenticate, AuthController.logout);
router.get("/me", authenticate, AuthController.getMe);

export default router;
