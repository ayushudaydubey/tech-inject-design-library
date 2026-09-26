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
 * Formats a raw component name and access type as a display string.
 */
function formatAccessLabel(accessType: string): string {
  if (accessType === "premium") {
    return `[${pc.yellow("premium")}]`;
  }
  return `[${pc.blue("free")}]`;
}

/**
 * Handler for the `tech-inject-ui add <component-slug>` command.
 *
 * Authentication flow:
 *   - Free components: installs without any authentication.
 *   - Premium, not logged in: backend returns 401, user is directed to login.
 *   - Premium, logged in but not premium: backend returns 403, user is shown upgrade message.
 *   - Premium, logged in with premium access: installs successfully.
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

    // Step 1: Fetch component from backend (backend enforces access control)
    process.stdout.write(pc.dim("  Fetching component specifications...\r"));
    const component = await fetchComponentDownload(slug, {
      apiUrl: options.apiUrl,
      token: options.token,
    });

    // Step 2: Display component info
    const isPremium = component.accessType === "premium";
    console.log(
      `${pc.green("✔")} Component found: ${pc.bold(component.name)} ` +
        pc.dim(`(v${component.version})`) +
        ` ${formatAccessLabel(component.accessType)}`
    );

    if (isPremium) {
      console.log(`${pc.green("✔")} Premium access verified`);
    } else {
      console.log(`${pc.green("✔")} Access verified`);
    }

    // Step 3: Validate and write files
    console.log(`${pc.green("✔")} Installing...`);

    const result = await installComponent(component, options);

    // Step 4: Report dependencies
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

    // Step 5: Success summary
    console.log();
    console.log(`${pc.green("✔")} ${pc.bold("Component installed successfully.")}`);
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

    const message = error instanceof Error ? error.message : String(error);

    // Handle structured error codes from the API module
    if (message.startsWith("PREMIUM_AUTH_REQUIRED:")) {
      const slug = message.split(":").slice(1).join(":");
      console.error(pc.red("✖") + " " + pc.bold("Premium component"));
      console.error(pc.dim("  Authentication required."));
      console.error();
      console.error("  Run:");
      console.error(`  ${pc.cyan("npx tech-inject-ui login")}`);
      console.error();
      console.error("  Then retry:");
      console.error(`  ${pc.cyan(`npx tech-inject-ui add ${slug}`)}`);
      console.error();
    } else if (message.startsWith("PREMIUM_ACCESS_DENIED:")) {
      console.error(pc.red("✖") + " " + pc.bold("Premium component"));
      console.error(pc.dim("  Premium access is required for this component."));
      console.error();
      console.error(
        `  Your account does not currently have Premium access.`
      );
      console.error(
        `  ${pc.dim("Upgrade your account at https://tech-inject-design-library.vercel.app")}`
      );
      console.error();
    } else if (error instanceof Error && error.name === "DependencyInstallationError") {
      console.error(pc.red(pc.bold("✖ Dependency installation failed")));
      console.error();
      console.error(error.message);
    } else {
      console.error(pc.red(`Error: ${message}`));
    }

    if (options.verbose && error instanceof Error && error.stack) {
      console.error();
      console.error(pc.dim(error.stack));
    }

    process.exitCode = 1;
  }
}
