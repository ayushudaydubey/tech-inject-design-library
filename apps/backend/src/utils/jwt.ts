import jwt, { SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../config/env";

export interface AccessTokenPayload {
  userId: string;
}

export interface RefreshTokenPayload {
  userId: string;
}

export const signAccessToken = (userId: string): string => {
  const options: SignOptions = {
    expiresIn: env.ACCESS_TOKEN_EXPIRES_IN as any,
  };
  return jwt.sign({ userId }, env.JWT_ACCESS_SECRET, options);
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
  if (typeof decoded === "object" && decoded !== null && "userId" in decoded) {
    return { userId: (decoded as { userId: string }).userId };
  }
  throw new Error("Invalid access token payload");
};

export const signRefreshToken = (userId: string): string => {
  const options: SignOptions = {
    expiresIn: env.REFRESH_TOKEN_EXPIRES_IN as any,
  };
  return jwt.sign({ userId }, env.JWT_REFRESH_SECRET, options);
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
  if (typeof decoded === "object" && decoded !== null && "userId" in decoded) {
    return { userId: (decoded as { userId: string }).userId };
  }
  throw new Error("Invalid refresh token payload");
};

export const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};
