import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("5000"),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  JWT_ACCESS_SECRET: z.string().min(1, "JWT_ACCESS_SECRET is required"),
  JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET is required"),
  ACCESS_TOKEN_EXPIRES_IN: z.string().default("15m"),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default("7d"),
  ADMIN_EMAIL: z.string().email().default("admin@techinject.io"),
  ADMIN_PASSWORD: z.string().min(6).default("AdminPassword123!"),
  FREE_CUSTOMER_EMAIL: z.string().email().default("customer@techinject.io"),
  FREE_CUSTOMER_PASSWORD: z.string().min(6).default("CustomerPassword123!"),
  PREMIUM_CUSTOMER_EMAIL: z.string().email().default("premium@techinject.io"),
  PREMIUM_CUSTOMER_PASSWORD: z.string().min(6).default("PremiumPassword123!"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const parsed = envSchema.safeParse({
  PORT: process.env.PORT,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || (process.env.JWT_SECRET ? `${process.env.JWT_SECRET}_refresh` : undefined),
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  FREE_CUSTOMER_EMAIL: process.env.FREE_CUSTOMER_EMAIL,
  FREE_CUSTOMER_PASSWORD: process.env.FREE_CUSTOMER_PASSWORD,
  PREMIUM_CUSTOMER_EMAIL: process.env.PREMIUM_CUSTOMER_EMAIL,
  PREMIUM_CUSTOMER_PASSWORD: process.env.PREMIUM_CUSTOMER_PASSWORD,
  NODE_ENV: process.env.NODE_ENV,
});

if (!parsed.success) {
  console.error("Invalid environment configuration:", parsed.error.format());
  throw new Error("Missing or invalid environment variables");
}

export const env = parsed.data;
