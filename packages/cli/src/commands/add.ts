import pc from "picocolors";
import { fetchComponentDownload } from "../api";
import { installComponent } from "../installer";
import { AddCommandOptions } from "../types";

/**
 * Validates that the requested component slug is syntactically safe.
 * Rejects path-like strings or shell metacharacters.
 */
export function validateSlug(slug: string): string {
  if (!slug || typeof slug !== "string") {
    throw new Error("Missing required argument: <component-slug>.");
  }

  const trimmed = slug.trim();
  if (trimmed === "") {
    throw new Error("Component slug cannot be blank.");
  }

  // Alphanumeric with hyphens
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(trimmed)) {
    throw new Error(
      `Invalid component slug "${slug}". Slugs must consist of letters, numbers, and single hyphens (e.g. "sales-metric-card").`
    );
  }

  return trimmed.toLowerCase();
}

/**
 * Handler for the `tech-inject-ui add <component-slug>` command.
 */
export async function addCommand(
  rawSlug: string,
  options: AddCommandOptions
): Promise<void> {
  console.log();
  console.log(pc.bold(pc.cyan("Tech Inject UI")));
  console.log();

  try {
    const slug = validateSlug(rawSlug);

    // Step 1: Fetch component from backend
    process.stdout.write(pc.dim("  Fetching component specifications...\r"));
    const component = await fetchComponentDownload(slug, {
      apiUrl: options.apiUrl,
      token: options.token,
    });
    console.log(
      `${pc.green("✔")} Component found: ${pc.bold(component.name)} ` +
        pc.dim(`(v${component.version})`) +
        (component.accessType === "premium"
          ? ` [${pc.yellow("premium")}]`
          : ` [${pc.blue("free")}]`)
    );

    // Step 2: Validate and write files
    console.log(`${pc.green("✔")} Validating file security and project paths...`);

    const result = await installComponent(component, options);
    console.log(`${pc.green("✔")} Created component files.`);

    // Step 3: Report dependencies
    if (result.reusedDependencies && result.reusedDependencies.length > 0) {
      console.log(
        `${pc.green("✔")} Reusing compatible dependencies: ` +
          pc.dim(result.reusedDependencies.join(", "))
      );
    }

    if (result.installedDependencies.length > 0) {
      console.log(
        `${pc.green("✔")} Installed dependencies with ${result.packageManager}: ` +
          pc.cyan(result.installedDependencies.join(", "))
      );
    } else if (!result.reusedDependencies || result.reusedDependencies.length === 0) {
      console.log(`${pc.green("✔")} Dependencies up to date.`);
    }

    // Step 4: Summary output
    console.log();
    console.log(pc.green(pc.bold("Component installed successfully.")));
    console.log();
    console.log(pc.bold("Created:"));
    for (const file of result.createdFiles) {
      console.log(`  ${pc.cyan(file)}`);
    }

    console.log();
    console.log(pc.bold("Use:"));
    console.log();
    console.log(`  ${pc.dim(result.usageSnippet || "")}`);
    console.log();
  } catch (error: unknown) {
    console.log();
    if (error instanceof Error && error.name === "DependencyInstallationError") {
      console.error(pc.red(pc.bold("✖ Dependency installation failed")));
      console.error();
      console.error(error.message);
    } else {
      const message = error instanceof Error ? error.message : String(error);
      console.error(pc.red(`Error: ${message}`));
    }

    if (options.verbose && error instanceof Error && error.stack) {
      console.error();
      console.error(pc.dim(error.stack));
    }

    process.exitCode = 1;
  }
}
