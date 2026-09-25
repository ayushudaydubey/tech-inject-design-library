export interface UndeclaredDependency {
  pkgName: string;
  file: string;
  line: number;
}

export interface DetectedImport {
  pkgName: string;
  files: string[];
  lines: Array<{ file: string; line: number }>;
  suggestedVersion: string | null;
}

/**
 * Standard / known compatible library dependency versions
 * matching project seed data, CLI compatibility, and design system packages.
 */
export const KNOWN_LIBRARY_VERSIONS: Record<string, string> = {
  "lucide-react": "^0.475.0",
  "clsx": "^2.1.0",
  "tailwind-merge": "^3.0.0",
  "framer-motion": "^12.0.0",
  "date-fns": "^3.6.0",
  "@radix-ui/react-dialog": "^1.1.0",
  "@radix-ui/react-dropdown-menu": "^2.1.0",
  "@radix-ui/react-slot": "^1.1.0",
  "@radix-ui/react-tooltip": "^1.1.0",
  "@radix-ui/react-tabs": "^1.1.0",
  "@radix-ui/react-popover": "^1.1.0",
  "@radix-ui/react-accordion": "^1.2.0",
  "@radix-ui/react-select": "^2.1.0",
  "@radix-ui/react-checkbox": "^1.1.0",
  "@radix-ui/react-switch": "^1.1.0",
  "@radix-ui/react-slider": "^1.2.0",
  "@radix-ui/react-avatar": "^1.1.0",
  "@tanstack/react-table": "^8.20.0",
  "@tanstack/react-query": "^5.60.0",
  "recharts": "^2.12.0",
  "cmdk": "^1.0.0",
  "class-variance-authority": "^0.7.0",
  "embla-carousel-react": "^8.0.0",
  "sonner": "^1.4.0",
  "vaul": "^0.9.0",
};

export const COMMON_SUGGESTIONS = [
  { pkg: "lucide-react", ver: "^0.475.0" },
  { pkg: "clsx", ver: "^2.1.0" },
  { pkg: "tailwind-merge", ver: "^3.0.0" },
  { pkg: "framer-motion", ver: "^12.0.0" },
  { pkg: "date-fns", ver: "^3.6.0" },
];

const NPM_PACKAGE_NAME_REGEX =
  /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

const NPM_VERSION_REGEX = /^[a-zA-Z0-9^~.>=<* -]+$/;

const SEMVER_RANGE_REGEX =
  /^([~^<>=vV\s]*\d+(\.\d+)?(\.\d+)?(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?(\s*[-–]\s*[~^<>=vV\s]*\d+(\.\d+)?(\.\d+)?(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?)*(\s*\|\|\s*[~^<>=vV\s]*\d+(\.\d+)?(\.\d+)?(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?)*|\*|latest)$/;

export function isSafeNpmPackageName(pkgName: string): boolean {
  if (!pkgName || typeof pkgName !== "string") return false;
  const trimmed = pkgName.trim().toLowerCase();
  if (trimmed.length === 0 || trimmed.length > 214) return false;
  if (
    trimmed.includes("..") ||
    trimmed.includes("\\") ||
    trimmed.includes(" ") ||
    trimmed.includes(";") ||
    trimmed.includes("&") ||
    trimmed.includes("|") ||
    trimmed.includes("$") ||
    trimmed.includes("`") ||
    trimmed.includes(":")
  ) {
    return false;
  }
  return NPM_PACKAGE_NAME_REGEX.test(trimmed);
}

export function isSafeSemverVersion(ver: string): boolean {
  if (!ver || typeof ver !== "string") return false;
  const trimmed = ver.trim();
  if (trimmed === "") return false;
  if (!NPM_VERSION_REGEX.test(trimmed)) return false;
  return SEMVER_RANGE_REGEX.test(trimmed);
}

export function normalizePackageName(raw: string): string {
  return raw.trim().toLowerCase();
}

/**
 * Extracts normalized root package name from an import/require specifier.
 * Returns null for relative paths, aliases, and peer runtime (React, ReactDOM, node:*).
 */
export function extractRootPackage(specifier: string): string | null {
  const trimmed = specifier.trim();

  // Skip relative paths and aliases
  if (
    trimmed.startsWith(".") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("\\") ||
    trimmed.startsWith("@/") ||
    trimmed.startsWith("~/")
  ) {
    return null;
  }

  // Skip React peer runtime dependencies and node built-ins
  if (
    trimmed === "react" ||
    trimmed === "react-dom" ||
    trimmed.startsWith("react/") ||
    trimmed.startsWith("react-dom/") ||
    trimmed.startsWith("node:")
  ) {
    return null;
  }

  // Scoped packages like @radix-ui/react-dialog
  if (trimmed.startsWith("@")) {
    const parts = trimmed.split("/");
    if (parts.length >= 2) {
      return `${parts[0]}/${parts[1]}`.toLowerCase();
    }
    return trimmed.toLowerCase();
  }

  // Standard packages like lucide-react/dist/...
  return trimmed.split("/")[0].toLowerCase();
}

/**
 * Scans all editor files and extracts all external package imports.
 */
export function detectAllImportedPackages(
  files: Array<{ path?: string; filename?: string; content?: string }>
): DetectedImport[] {
  const map = new Map<
    string,
    {
      files: Set<string>;
      lines: Array<{ file: string; line: number }>;
    }
  >();

  const importRegex =
    /(?:import\s+(?:[\w*\s{},]*\s+from\s+)?|require\s*\(\s*)["']([^"']+)["']/g;

  for (const file of files) {
    const filename = file.path || file.filename || "file.tsx";
    const ext = filename.split(".").pop()?.toLowerCase();
    if (!["tsx", "ts", "jsx", "js"].includes(ext || "")) continue;

    const content = file.content || "";
    const lines = content.split("\n");

    lines.forEach((lineText, idx) => {
      let match: RegExpExecArray | null;
      while ((match = importRegex.exec(lineText)) !== null) {
        const rootPkg = extractRootPackage(match[1]);
        if (!rootPkg) continue;

        if (!map.has(rootPkg)) {
          map.set(rootPkg, {
            files: new Set(),
            lines: [],
          });
        }

        const entry = map.get(rootPkg)!;
        entry.files.add(filename);
        entry.lines.push({ file: filename, line: idx + 1 });
      }
    });
  }

  const results: DetectedImport[] = [];
  for (const [pkgName, data] of map.entries()) {
    results.push({
      pkgName,
      files: Array.from(data.files),
      lines: data.lines,
      suggestedVersion: KNOWN_LIBRARY_VERSIONS[pkgName] || null,
    });
  }

  return results;
}

/**
 * Returns undeclared dependencies that are imported in source files but missing in declaredDependencies.
 */
export function analyzeDependencies(
  files: Array<{ path?: string; filename?: string; content?: string }>,
  declaredDependencies: Record<string, string>
): UndeclaredDependency[] {
  const missing: UndeclaredDependency[] = [];
  const seen = new Set<string>();

  const detected = detectAllImportedPackages(files);
  const normalizedDeclared = new Set(
    Object.keys(declaredDependencies).map((k) => k.toLowerCase())
  );

  for (const item of detected) {
    if (!normalizedDeclared.has(item.pkgName)) {
      for (const loc of item.lines) {
        const key = `${loc.file}:${item.pkgName}:${loc.line}`;
        if (!seen.has(key)) {
          seen.add(key);
          missing.push({
            pkgName: item.pkgName,
            file: loc.file,
            line: loc.line,
          });
        }
      }
    }
  }

  return missing;
}
