#!/usr/bin/env node

import { Command } from "commander";
import pc from "picocolors";
import { addCommand } from "./commands/add";
import { resolveApiUrl, writeStoredToken, resolveAuthToken } from "./api";

const program = new Command();

program
  .name("tech-inject-ui")
  .description("Official CLI installer for Tech Inject Design Library components")
  .version("1.0.0");

program
  .command("add")
  .description("Download and install a component into your local project")
  .argument("<slug>", "Unique slug of the component (e.g. sales-metric-card)")
  .option("-f, --force", "Overwrite existing component files if they already exist")
  .option("-d, --dir <directory>", "Target directory for component files (default: src/components)")
  .option("-t, --token <token>", "Authentication token for premium components")
  .option("--api-url <url>", "Tech Inject API base URL (overrides environment variable)")
  .option("--skip-deps", "Skip automatic installation of declared NPM dependencies")
  .option("--verbose", "Display verbose debug output and stack traces")
  .action(addCommand);

program
  .command("login")
  .description("Authenticate with Tech Inject API and store credentials for premium components")
  .option("--api-url <url>", "Tech Inject API base URL")
  .action(async (options) => {
    const readline = await import("node:readline/promises");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log();
    console.log(pc.bold(pc.cyan("Tech Inject Account Login")));
    console.log();

    try {
      const email = await rl.question("Email address: ");
      const password = await rl.question("Password: ");
      rl.close();

      const apiUrl = resolveApiUrl(options.apiUrl);
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = (await res.json()) as {
        success?: boolean;
        message?: string;
        data?: { accessToken?: string; user?: { email: string; isPremium: boolean } };
      };

      if (!res.ok || !data.success || !data.data?.accessToken) {
        throw new Error(data.message || "Invalid credentials provided.");
      }

      writeStoredToken(data.data.accessToken);

      console.log();
      console.log(
        pc.green("✔") +
          ` Successfully authenticated as ${pc.bold(data.data.user?.email || email)} ` +
          (data.data.user?.isPremium
            ? pc.yellow("[Premium Member]")
            : pc.dim("[Free Tier]"))
      );
      console.log(pc.dim("Credentials stored in ~/.techinjectrc for future CLI installations."));
      console.log();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(pc.red(`\nLogin failed: ${msg}\n`));
      process.exitCode = 1;
    }
  });

program
  .command("whoami")
  .description("Display the currently active authentication state and token")
  .option("--api-url <url>", "Tech Inject API base URL")
  .action(async (options) => {
    const token = resolveAuthToken();
    if (!token) {
      console.log(pc.dim("\nNot currently authenticated. Operating in anonymous guest mode (free components only).\n"));
      return;
    }

    try {
      const apiUrl = resolveApiUrl(options.apiUrl);
      const res = await fetch(`${apiUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.log(pc.yellow("\nStored token is invalid or has expired. Please run `tech-inject-ui login`.\n"));
        return;
      }

      const data = (await res.json()) as {
        data?: { email: string; role: string; isPremium: boolean };
      };

      console.log();
      console.log(
        pc.green("✔") +
          ` Signed in as: ${pc.bold(data.data?.email || "Unknown")} ` +
          (data.data?.isPremium
            ? pc.yellow("[Premium Customer]")
            : pc.dim("[Free Customer]"))
      );
      console.log();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(pc.red(`Error checking session: ${msg}`));
    }
  });

program.parse(process.argv);
