import express from "express";
import cors from "cors";
import { env } from "./src/config/env";
import { connectDatabase } from "./src/config/db";
import { seedDatabase } from "./src/services/seedService";
import authRoutes from "./src/routes/authRoutes";
import componentRoutes from "./src/routes/componentRoutes";
import adminRoutes from "./src/routes/adminRoutes";
import { errorHandler, notFoundHandler } from "./src/middleware/errorHandler";

export const app = express();
const PORT = process.env.PORT ||5000;

// Global middleware
const normalizeUrl = (url?: string): string | null => {
  if (!url) return null;
  return url.trim().replace(/\/+$/, "");
};

// Read allowed origins directly from environment variables (.env)
const envOrigins = [
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : []),
]
  .map(normalizeUrl)
  .filter((url): url is string => Boolean(url));

const allowedOrigins = Array.from(new Set(envOrigins));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Root welcome & health endpoints
app.get("/", (_req, res) => {
  res.json({
    message: "Tech Inject API is running",
    documentation: "/api/health",
  });
});

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "API is healthy",
  });
});

// Mount modular API routers
app.use("/api/auth", authRoutes);
app.use("/api/components", componentRoutes);
app.use("/api/admin", adminRoutes);

// 404 and centralized error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server if executed directly
app.listen(PORT, () => {
  connectDatabase()
  console.log(`Server running on port ${PORT}`);
});