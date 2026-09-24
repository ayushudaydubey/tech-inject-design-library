import { Request, Response, NextFunction } from "express";
import { User, IUserDocument } from "../models/User";
import { verifyAccessToken } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: IUserDocument;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Authentication required. Bearer access token missing.",
    });
    return;
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    res.status(401).json({
      success: false,
      message: "Access token is empty.",
    });
    return;
  }

  try {
    const payload = verifyAccessToken(token);

    // CRITICAL SECURITY RULE: Always load fresh user state from database
    const user = await User.findById(payload.userId);
    if (!user) {
      res.status(401).json({
        success: false,
        message: "User account no longer exists or session has expired.",
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired access token.",
    });
  }
};

export const optionalAuthenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return next();
  }

  try {
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.userId);
    if (user) {
      req.user = user;
    }
  } catch {
    // Silently ignore invalid optional tokens; request continues as guest
  }

  next();
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
    return;
  }

  if (req.user.role !== "admin") {
    res.status(403).json({
      success: false,
      message: "Forbidden. Admin privileges required.",
    });
    return;
  }

  next();
};
