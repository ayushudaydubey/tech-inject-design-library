import { z } from "zod";

/**
 * Zod schema for individual component source, supporting, and theme files
 */
export const ComponentFileSchema = z.object({
  filename: z.string().min(1, "Filename cannot be empty"),
  content: z.string(),
  fileType: z.string().optional(),
});

export type ComponentFile = z.infer<typeof ComponentFileSchema>;

/**
 * Zod schema for component install instructions
 */
export const InstallInfoSchema = z.object({
  packageManagerCommand: z.string().optional(),
  notes: z.string().optional(),
});

export type InstallInfo = z.infer<typeof InstallInfoSchema>;

/**
 * Zod schema validating the backend download package API response
 */
export const ComponentDownloadResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    name: z.string().min(1, "Component name is missing"),
    slug: z.string().min(1, "Component slug is missing"),
    version: z.string().default("1.0.0"),
    accessType: z.enum(["free", "premium"]).default("free"),
    declaredDependencies: z.record(z.string()).default({}),
    sourceFiles: z
      .array(ComponentFileSchema)
      .min(1, "Component must have at least one source file"),
    supportingFiles: z.array(ComponentFileSchema).default([]),
    themeFiles: z.array(ComponentFileSchema).default([]),
    installInfo: InstallInfoSchema.optional(),
  }),
});

export type ComponentDownloadResponse = z.infer<
  typeof ComponentDownloadResponseSchema
>;

export type ComponentDownloadData = ComponentDownloadResponse["data"];

/**
 * Options for the `add` command
 */
export interface AddCommandOptions {
  force?: boolean;
  dir?: string;
  token?: string;
  apiUrl?: string;
  skipDeps?: boolean;
  verbose?: boolean;
}

/**
 * Supported package managers
 */
export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

/**
 * Result of the installation process
 */
export interface InstallResult {
  componentName: string;
  slug: string;
  version: string;
  createdFiles: string[];
  installedDependencies: string[];
  reusedDependencies?: string[];
  packageManager: PackageManager;
  usageSnippet?: string;
}
