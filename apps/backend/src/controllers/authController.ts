import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { AuthService } from "../services/authService";
import { parseCookies } from "../utils/cookies";
import { ApiError } from "../middleware/errorHandler";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const refreshSchema = z.object({
  refreshToken: z.string().optional(),
});

export class AuthController {
  static async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const result = await AuthService.login(email, password);

      // Set secure HttpOnly cookie for refresh token
      res.cookie("refreshToken", result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.tokens.accessToken,
          refreshToken: result.tokens.refreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async refresh(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const cookies = parseCookies(req.headers.cookie);
      const body = refreshSchema.parse(req.body || {});
      const rawToken = cookies.refreshToken || body.refreshToken;

      if (!rawToken) {
        throw new ApiError(401, "Refresh token missing from request");
      }

      const result = await AuthService.refresh(rawToken);

      res.status(200).json({
        success: true,
        data: {
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const cookies = parseCookies(req.headers.cookie);
      const rawToken = cookies.refreshToken || req.body?.refreshToken;
      const userId = req.user?._id?.toString() || "";

      await AuthService.logout(userId, rawToken);

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMe(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication required");
      }

      const safeUser = await AuthService.getMe(req.user._id.toString());

      res.status(200).json({
        success: true,
        data: {
          user: safeUser,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
