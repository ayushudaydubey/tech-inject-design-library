import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import semver from "semver";
import { PackageManager } from "./types";

/**
 * Strict regex for valid NPM package names.
 * Supports scoped packages (@scope/package) and standard names.
 */
const NPM_PACKAGE_NAME_REGEX =
  /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

/**
 * Strict regex for valid NPM version ranges.
 * Prohibits any shell metacharacters: ;, &, |, `, $, \, \n, <, >, (, ), {, }
 */
const NPM_VERSION_REGEX = /^[a-zA-Z0-9^~.>=<* -]+$/;

/**
 * Error class thrown when dependency version conflicts or peer dependency conflicts occur.
 */
export class DependencyInstallationError extends Error {
  public readonly isPeerConflict: boolean;
  public readonly packageName?: string;

  constructor(message: string, isPeerConflict: boolean = false, packageName?: string) {
    super(message);
    this.name = "DependencyInstallationError";
    this.isPeerConflict = isPeerConflict;
    this.packageName = packageName;
  }
}

/**
 * Validates package name and version against injection patterns.
 */
export function assertSafeDependency(
  pkgName: string,
  versionRange?: string
): void {
  if (!pkgName || typeof pkgName !== "string") {
    throw new Error("Invalid dependency: package name cannot be empty.");
  }

  const trimmedName = pkgName.trim();
  if (!NPM_PACKAGE_NAME_REGEX.test(trimmedName)) {
    throw new Error(
      `Security check failed: Package name "${pkgName}" contains invalid characters or shell metacharacters.`
    );
  }

  if (versionRange && typeof versionRange === "string") {
    const trimmedVer = versionRange.trim();
    if (trimmedVer !== "" && !NPM_VERSION_REGEX.test(trimmedVer)) {
      throw new Error(
        `Security check failed: Version range "${versionRange}" for package "${pkgName}" contains unsafe characters.`
      );
    }
  }
}

/**
 * Detects package manager in the consumer project root.
 */
export function detectPackageManager(projectRoot: string): PackageManager {
  if (
    fs.existsSync(path.resolve(projectRoot, "bun.lockb")) ||
    fs.existsSync(path.resolve(projectRoot, "bun.lock"))
  ) {
    return "bun";
  }

  if (fs.existsSync(path.resolve(projectRoot, "pnpm-lock.yaml"))) {
    return "pnpm";
  }

  if (fs.existsSync(path.resolve(projectRoot, "yarn.lock"))) {
    return "yarn";
  }

  if (fs.existsSync(path.resolve(projectRoot, "package-lock.json"))) {
    return "npm";
  }

  // Default fallback
  return "npm";
}

export interface ExistingDependenciesInfo {
  all: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  reactVersion?: string;
}

/**
 * Reads existing dependencies from consumer project's package.json.
 */
export function readConsumerDependencies(
  projectRoot: string
): ExistingDependenciesInfo {
  const packageJsonPath = path.resolve(projectRoot, "package.json");
  if (!fs.existsSync(packageJsonPath)) {
    return {
      all: {},
      dependencies: {},
      devDependencies: {},
    };
  }

  try {
    const raw = fs.readFileSync(packageJsonPath, "utf-8");
    const parsed = JSON.parse(raw);
    const deps = parsed.dependencies || {};
    const devDeps = parsed.devDependencies || {};
    const all = { ...devDeps, ...deps };

    return {
      all,
      dependencies: deps,
      devDependencies: devDeps,
      reactVersion: all["react"],
    };
  } catch {
    return {
      all: {},
      dependencies: {},
      devDependencies: {},
    };
  }
}

/**
 * Gets the actual installed version of a package from node_modules.
 */
export function getInstalledVersion(
  projectRoot: string,
  packageName: string
): string | null {
  try {
    const pkgJsonPath = path.resolve(
      projectRoot,
      "node_modules",
      packageName,
      "package.json"
    );
    if (fs.existsSync(pkgJsonPath)) {
      const content = fs.readFileSync(pkgJsonPath, "utf-8");
      const pkg = JSON.parse(content);
      if (pkg && typeof pkg.version === "string") {
        return pkg.version;
      }
    }
  } catch {
    // Ignore errors
  }
  return null;
}

export interface ReusedDependency {
  package: string;
  installedVersion: string;
  requiredRange: string;
  reason: string;
}

export interface ConflictingDependency {
  package: string;
  installedVersion: string;
  requiredRange: string;
  reason: string;
}

export interface DependencyPlan {
  toInstall: string[];
  reused: ReusedDependency[];
  conflicts: ConflictingDependency[];
}

/**
 * Checks whether an installed package version satisfies a required semver range.
 */
export function isVersionCompatible(
  installedVersion: string,
  requiredRange: string
): { compatible: boolean; reason: string } {
  if (!requiredRange || requiredRange.trim() === "" || requiredRange === "*") {
    return { compatible: true, reason: "Any version satisfied" };
  }

  const cleanInstalled = installedVersion.trim();
  const cleanRequired = requiredRange.trim();

  // Ensure cleanInstalled is a valid explicit version before checking satisfies
  const validInstalled = semver.valid(cleanInstalled);
  if (!validInstalled) {
    // If it's a range (e.g., from package.json fallback), try minimum version fallback
    const minInstalled = semver.minVersion(cleanInstalled);
    if (minInstalled) {
      if (semver.satisfies(minInstalled.version, cleanRequired)) {
        return {
          compatible: true,
          reason: `Declared version range "${cleanInstalled}" (min: ${minInstalled.version}) satisfies required range "${cleanRequired}"`,
        };
      }
      return {
        compatible: false,
        reason: `Declared version range "${cleanInstalled}" (min: ${minInstalled.version}) does not satisfy required range "${cleanRequired}"`,
      };
    }
    return {
      compatible: false,
      reason: `Unable to verify compatibility between "${cleanInstalled}" and "${cleanRequired}"`,
    };
  }

  if (semver.satisfies(validInstalled, cleanRequired)) {
    return {
      compatible: true,
      reason: `Installed version "${validInstalled}" satisfies required range "${cleanRequired}"`,
    };
  }

  return {
    compatible: false,
    reason: `Installed version "${validInstalled}" does not satisfy required range "${cleanRequired}"`,
  };
}

/**
 * Evaluates declared component dependencies against the consumer's project.
 * Determines:
 * - which dependencies can be safely reused without reinstallation
 * - which dependencies are missing and must be installed
 * - which dependencies conflict with existing consumer packages
 */
export function evaluateDependencyPlan(
  projectRoot: string,
  declared: Record<string, string>
): DependencyPlan {
  const existingInfo = readConsumerDependencies(projectRoot);
  const plan: DependencyPlan = {
    toInstall: [],
    reused: [],
    conflicts: [],
  };

  for (const [pkg, rawVer] of Object.entries(declared)) {
    assertSafeDependency(pkg, rawVer);
    const requiredVer = rawVer ? rawVer.trim() : "";

    const declaredVer = existingInfo.all[pkg];
    const actualInstalledVer = getInstalledVersion(projectRoot, pkg);

    // Prioritize actual installed version from node_modules, fallback to declared in package.json
    const versionToCheck = actualInstalledVer || declaredVer;

    if (versionToCheck) {
      const check = isVersionCompatible(versionToCheck, requiredVer);
      if (check.compatible) {
        plan.reused.push({
          package: pkg,
          installedVersion: versionToCheck,
          requiredRange: requiredVer,
          reason: check.reason,
        });
      } else {
        plan.conflicts.push({
          package: pkg,
          installedVersion: versionToCheck,
          requiredRange: requiredVer,
          reason: check.reason,
        });
      }
    } else {
      // Package not currently in consumer package.json or node_modules -> must install
      const specifier = requiredVer ? `${pkg}@${requiredVer}` : pkg;
      plan.toInstall.push(specifier);
    }
  }

  return plan;
}

/**
 * Checks which dependencies from `declared` are missing in consumer package.json.
 * Backward-compatible helper for installer.
 */
export function filterMissingDependencies(
  projectRoot: string,
  declared: Record<string, string>
): string[] {
  const plan = evaluateDependencyPlan(projectRoot, declared);

  if (plan.conflicts.length > 0) {
    const formatted = plan.conflicts
      .map(
        (c) =>
          `  - ${c.package}: installed is "${c.installedVersion}", but component requires "${c.requiredRange}" (${c.reason})`
      )
      .join("\n");

    throw new DependencyInstallationError(
      `Conflicting dependency versions detected in consumer project:\n${formatted}\n\nThe CLI will not silently overwrite or force install incompatible package versions.\nPlease update your project dependency or choose a compatible component version.`
    );
  }

  return plan.toInstall;
}

/**
 * Safely installs dependencies using argument arrays without shell: true.
 * On Windows, runs cmd.exe with ["/d", "/s", "/c", pm, ...args] without DEP0190.
 * On Unix, spawns the package manager directly.
 */
export async function installPackages(
  projectRoot: string,
  packageSpecifiers: string[],
  pm: PackageManager = "npm"
): Promise<void> {
  if (packageSpecifiers.length === 0) return;

  // Build command and argument list safely
  let execName: string;
  let execArgs: string[];

  const pmArgs = pm === "npm" ? ["install", ...packageSpecifiers] : ["add", ...packageSpecifiers];

  if (process.platform === "win32") {
    // Windows: Use cmd.exe without shell: true to avoid [DEP0190]
    execName = process.env.ComSpec || "cmd.exe";
    execArgs = ["/d", "/s", "/c", pm, ...pmArgs];
  } else {
    // Unix: Directly invoke binary with argument array
    execName = pm;
    execArgs = pmArgs;
  }

  return new Promise<void>((resolve, reject) => {
    const child = spawn(execName, execArgs, {
      cwd: projectRoot,
      stdio: "pipe",
      windowsHide: true,
    });

    let stderrOutput = "";
    let stdoutOutput = "";

    child.stdout?.on("data", (chunk: Buffer) => {
      stdoutOutput += chunk.toString();
    });

    child.stderr?.on("data", (chunk: Buffer) => {
      stderrOutput += chunk.toString();
    });

    child.on("error", (err) => {
      reject(
        new DependencyInstallationError(
          `Failed to execute package manager "${pm}": ${err.message}`
        )
      );
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        const fullOutput = `${stdoutOutput}\n${stderrOutput}`;

        // Detect peer dependency resolution conflicts (e.g. npm ERESOLVE)
        if (
          fullOutput.includes("ERESOLVE") ||
          fullOutput.includes("Conflicting peer dependency") ||
          fullOutput.includes("Could not resolve dependency")
        ) {
          reject(
            new DependencyInstallationError(
              `Dependency installation failed due to an incompatible peer dependency with the current consumer project.\n\n` +
                `Package: ${packageSpecifiers.join(", ")}\n` +
                `Reason: The package's peer dependency requirements conflict with dependencies currently installed in your project.\n\n` +
                `The CLI did not modify your existing React dependencies.\n` +
                `Use a compatible component/dependency version or update the dependency metadata.`,
              true,
              packageSpecifiers.join(", ")
            )
          );
        } else {
          reject(
            new DependencyInstallationError(
              `Package installation failed with exit code ${code}.\n${stderrOutput.trim()}`
            )
          );
        }
      }
    });
  });
}
