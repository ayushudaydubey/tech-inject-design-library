import { SourceFileLanguage } from "./types";

export const ALLOWED_EXTENSIONS = [
  "tsx",
  "ts",
  "jsx",
  "js",
  "css",
  "scss",
  "json",
  "md",
] as const;

export const MAIN_SOURCE_EXTENSIONS = ["tsx", "ts", "jsx", "js"];

export function getLanguageFromExtension(ext: string): SourceFileLanguage {
  const normalizedExt = ext.toLowerCase().replace(/^\./, "");
  switch (normalizedExt) {
    case "tsx":
      return "typescriptreact";
    case "ts":
      return "typescript";
    case "jsx":
      return "javascriptreact";
    case "js":
      return "javascript";
    case "css":
      return "css";
    case "scss":
      return "scss";
    case "json":
      return "json";
    case "md":
    case "markdown":
      return "markdown";
    default:
      return "plaintext";
  }
}

export function getMonacoLanguage(lang: SourceFileLanguage): string {
  switch (lang) {
    case "typescriptreact":
    case "typescript":
      return "typescript";
    case "javascriptreact":
    case "javascript":
      return "javascript";
    case "css":
      return "css";
    case "scss":
      return "scss";
    case "json":
      return "json";
    case "markdown":
      return "markdown";
    default:
      return "plaintext";
  }
}

export interface PathValidationResult {
  isValid: boolean;
  error?: string;
  normalizedPath: string;
  extension: string;
  language: SourceFileLanguage;
}

export function validateClientFilePath(rawPath: string): PathValidationResult {
  if (!rawPath || rawPath.trim() === "") {
    return {
      isValid: false,
      error: "File name cannot be empty.",
      normalizedPath: "",
      extension: "",
      language: "plaintext",
    };
  }

  const trimmed = rawPath.trim();

  // Check for absolute paths & drive letters
  if (/^[a-zA-Z]:/.test(trimmed) || trimmed.startsWith("/") || trimmed.startsWith("\\")) {
    return {
      isValid: false,
      error: "Absolute paths and drive letters are not allowed. Use a relative path.",
      normalizedPath: trimmed,
      extension: "",
      language: "plaintext",
    };
  }

  // Check forbidden characters
  if (/[<>:"|?*]/.test(trimmed)) {
    return {
      isValid: false,
      error: "File path contains forbidden characters (<> : \" | ? *).",
      normalizedPath: trimmed,
      extension: "",
      language: "plaintext",
    };
  }

  // Normalize slashes
  const normalized = trimmed.replace(/\\/g, "/");

  // Traversal & forbidden directory checks
  const segments = normalized.split("/");
  for (const seg of segments) {
    if (seg === ".." || seg === ".") {
      return {
        isValid: false,
        error: "Path traversal ('..' or '.') is forbidden.",
        normalizedPath: normalized,
        extension: "",
        language: "plaintext",
      };
    }
    if (seg === "node_modules" || seg === ".git" || seg === ".env") {
      return {
        isValid: false,
        error: `Directory "${seg}" is not allowed.`,
        normalizedPath: normalized,
        extension: "",
        language: "plaintext",
      };
    }
  }

  // Extension check
  const parts = normalized.split(".");
  if (parts.length < 2) {
    return {
      isValid: false,
      error: "File must have an extension (e.g. .tsx, .css, .ts).",
      normalizedPath: normalized,
      extension: "",
      language: "plaintext",
    };
  }

  const ext = parts[parts.length - 1].toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext as (typeof ALLOWED_EXTENSIONS)[number])) {
    return {
      isValid: false,
      error: `Extension ".${ext}" is not supported. Allowed: ${ALLOWED_EXTENSIONS.map((e) => `.${e}`).join(", ")}`,
      normalizedPath: normalized,
      extension: ext,
      language: "plaintext",
    };
  }

  const language = getLanguageFromExtension(ext);

  return {
    isValid: true,
    normalizedPath: normalized,
    extension: ext,
    language,
  };
}
