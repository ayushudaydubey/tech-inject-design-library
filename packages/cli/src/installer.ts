import fs from "node:fs/promises";
import path from "node:path";
import {
  AddCommandOptions,
  ComponentDownloadData,
  ComponentFile,
  InstallResult,
} from "./types";
import {
  assertSafePath,
  findConflictingFiles,
  resolveComponentsDirectory,
} from "./paths";
import {
  detectPackageManager,
  evaluateDependencyPlan,
  installPackages,
} from "./dependencies";

export interface PlannedFile {
  filename: string;
  content: string;
  fileType?: string;
  absolutePath: string;
  relativePath: string;
}

/**
 * Plans destination file mappings for all component files (source, supporting, themes).
 */
export function planComponentFiles(
  projectRoot: string,
  targetDir: string,
  component: ComponentDownloadData
): PlannedFile[] {
  const allFiles: ComponentFile[] = [
    ...component.sourceFiles,
    ...component.supportingFiles,
    ...component.themeFiles,
  ];

  const planned: PlannedFile[] = [];

  for (const file of allFiles) {
    // Prevent malicious filenames returned by an API
    if (file.filename.includes("..") || path.isAbsolute(file.filename)) {
      throw new Error(
        `Security check failed: Malicious filename "${file.filename}" detected in API payload.`
      );
    }

    const relativeToTarget = file.filename;
    const absolutePath = assertSafePath(targetDir, relativeToTarget);
    const relativeToProject = path.relative(projectRoot, absolutePath);

    planned.push({
      filename: file.filename,
      content: file.content,
      fileType: file.fileType,
      absolutePath,
      relativePath: relativeToProject,
    });
  }

  return planned;
}

/**
 * Executes the component installation in the consumer project.
 */
export async function installComponent(
  component: ComponentDownloadData,
  options: AddCommandOptions = {},
  projectRoot: string = process.cwd()
): Promise<InstallResult> {
  const targetDir = resolveComponentsDirectory(projectRoot, options.dir);

  // 1. Plan and validate all file paths before writing anything
  const plannedFiles = planComponentFiles(projectRoot, targetDir, component);

  // 2. Check for file conflicts (Overwrite Protection)
  if (!options.force) {
    const conflicts = findConflictingFiles(
      plannedFiles.map((f) => ({ destinationPath: f.absolutePath }))
    );

    if (conflicts.length > 0) {
      const formatted = conflicts
        .map((p) => `  - ${path.relative(projectRoot, p)}`)
        .join("\n");
      throw new Error(
        `Component installation aborted to prevent overwriting existing files:\n${formatted}\n\nUse --force to overwrite existing files.`
      );
    }
  }

  // 3. Pre-flight dependency validation before modifying project files
  const pm = detectPackageManager(projectRoot);
  const depPlan = evaluateDependencyPlan(
    projectRoot,
    component.declaredDependencies || {}
  );

  if (depPlan.conflicts.length > 0) {
    const formatted = depPlan.conflicts
      .map(
        (c) =>
          `  - ${c.package}: installed is "${c.installedVersion}", but component requires "${c.requiredRange}" (${c.reason})`
      )
      .join("\n");

    throw new Error(
      `Conflicting dependency versions detected in consumer project:\n${formatted}\n\nThe CLI will not silently overwrite or force install incompatible package versions.\nPlease update your project dependency or choose a compatible component version.`
    );
  }

  // 4. Write component files to disk
  const createdFiles: string[] = [];
  for (const file of plannedFiles) {
    const parentDir = path.dirname(file.absolutePath);
    await fs.mkdir(parentDir, { recursive: true });
    await fs.writeFile(file.absolutePath, file.content, "utf-8");
    createdFiles.push(file.relativePath.replace(/\\/g, "/"));
  }

  // 5. Install missing dependencies if needed
  let installedDependencies: string[] = [];
  if (depPlan.toInstall.length > 0 && !options.skipDeps) {
    await installPackages(projectRoot, depPlan.toInstall, pm);
    installedDependencies = depPlan.toInstall;
  }

  const reusedDependencies = depPlan.reused.map(
    (r) => `${r.package}@${r.installedVersion}`
  );

  // 6. Generate sample import statement
  const primarySource = component.sourceFiles[0];
  const componentSymbol = component.name.replace(/\s+/g, "");
  let usageSnippet = `import { ${componentSymbol} } from "./components/${path.basename(
    primarySource.filename,
    path.extname(primarySource.filename)
  )}";`;

  if (createdFiles.length > 0) {
    const importPath = createdFiles[0]
      .replace(/\\/g, "/")
      .replace(/\.(tsx|ts|jsx|js)$/, "");
    usageSnippet = `import { ${componentSymbol} } from "@/${importPath.replace(/^src\//, "")}";`;
  }

  return {
    componentName: component.name,
    slug: component.slug,
    version: component.version,
    createdFiles,
    installedDependencies,
    reusedDependencies,
    packageManager: pm,
    usageSnippet,
  };
}
