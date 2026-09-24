import { User, SafeUser } from "../models/User";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
} from "../utils/jwt";
import { ApiError } from "../middleware/errorHandler";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResult {
  user: SafeUser;
  tokens: AuthTokens;
}

export class AuthService {
  static async login(email: string, password: string): Promise<LoginResult> {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, "Invalid email or password");
    }

    const accessToken = signAccessToken(user._id.toString());
    const refreshToken = signRefreshToken(user._id.toString());
    const tokenHash = hashToken(refreshToken);

    // Store hashed refresh token in database for revocation tracking
    user.refreshTokens.push({
      tokenHash,
      createdAt: new Date(),
    });

    // Keep only the most recent 10 sessions to prevent unbounded array growth
    if (user.refreshTokens.length > 10) {
      user.refreshTokens = user.refreshTokens.slice(-10);
    }

    await user.save();

    return {
      user: user.toSafeUser(),
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  static async refresh(rawRefreshToken: string): Promise<{ accessToken: string }> {
    let payload;
    try {
      payload = verifyRefreshToken(rawRefreshToken);
    } catch {
      throw new ApiError(401, "Invalid or expired refresh token");
    }

    const tokenHash = hashToken(rawRefreshToken);
    const user = await User.findOne({
      _id: payload.userId,
      "refreshTokens.tokenHash": tokenHash,
    });

    if (!user) {
      throw new ApiError(401, "Refresh token has been revoked or session is invalid");
    }

    // Issue fresh access token using current user identity
    const accessToken = signAccessToken(user._id.toString());

    return { accessToken };
  }

  static async logout(userId: string, rawRefreshToken?: string): Promise<void> {
    if (!userId) return;

    if (rawRefreshToken) {
      const tokenHash = hashToken(rawRefreshToken);
      await User.updateOne(
        { _id: userId },
        { $pull: { refreshTokens: { tokenHash } } }
      );
    } else {
      // Invalidate all sessions if no specific token provided
      await User.updateOne({ _id: userId }, { $set: { refreshTokens: [] } });
    }
  }

  static async getMe(userId: string): Promise<SafeUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User account not found");
    }
    return user.toSafeUser();
  }
}
