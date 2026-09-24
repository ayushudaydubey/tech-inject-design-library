import multer from "multer";
import path from "path";
import { Request, Response, NextFunction } from "express";

const ALLOWED_EXTENSIONS = new Set([
  ".tsx",
  ".ts",
  ".jsx",
  ".js",
  ".css",
  ".json",
  ".md",
]);

// Memory storage to strictly prevent executing or persisting untrusted code on the filesystem
const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    cb(
      new Error(
        `Unsupported file type: ${ext}. Allowed formats: ${Array.from(
          ALLOWED_EXTENSIONS
        ).join(", ")}`
      )
    );
    return;
  }
  cb(null, true);
};

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB per file
    files: 20, // Max 20 files per bundle
  },
});

export const handleUploadError = (
  err: any,
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({
        success: false,
        message: "File exceeds maximum size limit of 5MB.",
      });
      return;
    }
    res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
    return;
  } else if (err) {
    res.status(400).json({
      success: false,
      message: err.message || "Invalid upload request",
    });
    return;
  }
  next();
};
