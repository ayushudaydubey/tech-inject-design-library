import path from "node:path";
import fs from "node:fs";

/**
 * Validates that a target file path does not attempt path traversal
 * and stays strictly within the specified base directory.
 *
 * Rejects:
 * - `..` traversal patterns
 * - Absolute paths (e.g., /etc/passwd or C:\Windows)
 * - UNC / drive escape paths
 * - Paths that resolve outside baseDir
 */
export function assertSafePath(baseDir: string, relativePath: string): string {
  // Reject empty path
  if (!relativePath || typeof relativePath !== "string") {
    throw new Error("Invalid file path: path cannot be empty.");
  }

  // Reject paths containing explicit parent traversal sequences
  const normalizedInput = relativePath.replace(/\\/g, "/");
  if (
    normalizedInput.includes("../") ||
    normalizedInput.includes("/..") ||
    normalizedInput === ".." ||
    normalizedInput.startsWith("../")
  ) {
    throw new Error(
      `Security check failed: Path traversal detected in "${relativePath}". Paths escaping project boundaries are rejected.`
    );
  }

  // Reject absolute paths
  if (path.isAbsolute(relativePath) || /^[a-zA-Z]:[/\\]/.test(relativePath)) {
    throw new Error(
      `Security check failed: Absolute filesystem paths are prohibited: "${relativePath}". Only paths relative to consumer project root are allowed.`
    );
  }

  // Resolve absolute path and verify boundary containment
  const resolvedBase = path.resolve(baseDir);
  const resolvedTarget = path.resolve(resolvedBase, relativePath);

  const relativeFromBase = path.relative(resolvedBase, resolvedTarget);

  if (
    relativeFromBase.startsWith("..") ||
    path.isAbsolute(relativeFromBase) ||
    !resolvedTarget.startsWith(resolvedBase)
  ) {
    throw new Error(
      `Security check failed: File target "${relativePath}" escapes root directory "${baseDir}".`
    );
  }

  return resolvedTarget;
}

/**
 * Automatically detects whether the consumer project uses `src/components/` or `components/`.
 * Respects custom directory if specified by the user.
 */
export function resolveComponentsDirectory(
  projectRoot: string,
  customDir?: string
): string {
  if (customDir && customDir.trim() !== "") {
    return assertSafePath(projectRoot, customDir.trim());
  }

  const srcDir = path.resolve(projectRoot, "src");
  const hasSrc = fs.existsSync(srcDir) && fs.statSync(srcDir).isDirectory();

  if (hasSrc) {
    return path.resolve(projectRoot, "src", "components");
  }

  const componentsDir = path.resolve(projectRoot, "components");
  const hasComponents =
    fs.existsSync(componentsDir) && fs.statSync(componentsDir).isDirectory();

  if (hasComponents) {
    return componentsDir;
  }

  // Default to src/components if standard React/Next structure
  return path.resolve(projectRoot, "src", "components");
}

/**
 * Checks if any planned destination files already exist on disk.
 * Returns array of conflicting file paths.
 */
export function findConflictingFiles(
  fileDestinations: { destinationPath: string }[]
): string[] {
  const conflicts: string[] = [];
  for (const item of fileDestinations) {
    if (fs.existsSync(item.destinationPath)) {
      conflicts.push(item.destinationPath);
    }
  }
  return conflicts;
}
