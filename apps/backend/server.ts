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
const PORT = process.env.PORT
// Global middleware
app.use(
  cors({
    origin: true,
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