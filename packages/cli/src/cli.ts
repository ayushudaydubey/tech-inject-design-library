#!/usr/bin/env node

import { Command } from "commander";
import pc from "picocolors";
import { addCommand } from "./commands/add";
import { resolveApiUrl, writeStoredToken, clearStoredToken, resolveAuthToken } from "./api";

const program = new Command();

program
  .name("tech-inject-ui")
  .description("Official CLI installer for Tech Inject Design Library components")
  .version("1.0.0");

// ─────────────────────────────────────────────────────────────────────────────
// add <slug>  —  the primary user-facing command
// ─────────────────────────────────────────────────────────────────────────────
program
  .command("add")
  .description("Download and install a component into your local project")
  .argument("<slug>", "Unique slug of the component (e.g. sales-metric-card)")
  .option("-f, --force", "Overwrite existing component files if they already exist")
  .option("-d, --dir <directory>", "Target directory for component files (default: src/components)")
  .option("--skip-deps", "Skip automatic installation of declared NPM dependencies")
  .option("--verbose", "Display verbose debug output and stack traces")
  // Developer/testing override — not shown in primary documentation
  .option("--api-url <url>", "Tech Inject API base URL (advanced: overrides default production URL)")
  // Hidden token option for advanced users; login command is the primary flow
  .option("-t, --token <token>", "Authentication token (advanced: use `login` command instead)")
  .action(addCommand);

// ─────────────────────────────────────────────────────────────────────────────
// login  —  authenticate and store a session token
// ─────────────────────────────────────────────────────────────────────────────
program
  .command("login")
  .description("Authenticate with your Tech Inject account to access premium components")
  .option("--api-url <url>", "Tech Inject API base URL (advanced override)")
  .action(async (options) => {
    const readline = await import("node:readline/promises");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log();
    console.log(pc.bold(pc.cyan("Tech Inject Account Login")));
    console.log(pc.dim("Enter your Tech Inject account credentials."));
    console.log();

    try {
      const email = await rl.question("Email address: ");
      const password = await rl.question("Password: ");
      rl.close();

      const apiUrl = resolveApiUrl(options.apiUrl as string | undefined);

      process.stdout.write(pc.dim("  Authenticating...\r"));

      const res = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = (await res.json()) as {
        success?: boolean;
        message?: string;
        data?: {
          accessToken?: string;
          user?: { name?: string; email: string; isPremium: boolean; role?: string };
        };
      };

      if (!res.ok || !data.success || !data.data?.accessToken) {
        throw new Error(data.message || "Invalid credentials provided.");
      }

      writeStoredToken(data.data.accessToken);

      const user = data.data.user;
      const isPremium = user?.isPremium === true;

      console.log();
      console.log(
        pc.green("✔") +
          ` Signed in as ${pc.bold(user?.email || email.trim())} ` +
          (isPremium ? pc.yellow("[Premium]") : pc.dim("[Free]"))
      );
      console.log(pc.dim("  Session stored in ~/.techinjectrc"));
      console.log();

      if (!isPremium) {
        console.log(
          pc.dim(
            "  Upgrade to Premium to access all components at " +
              "https://tech-inject-design-library.vercel.app"
          )
        );
        console.log();
      }
    } catch (err: unknown) {
      rl.close();
      const msg = err instanceof Error ? err.message : String(err);
      console.error(pc.red(`\n✖ Login failed: ${msg}\n`));
      process.exitCode = 1;
    }
  });

// ─────────────────────────────────────────────────────────────────────────────
// logout  —  remove stored session token
// ─────────────────────────────────────────────────────────────────────────────
program
  .command("logout")
  .description("Remove your stored CLI authentication session")
  .action(() => {
    const existingToken = resolveAuthToken();
    if (!existingToken) {
      console.log(pc.dim("\nNot currently logged in.\n"));
      return;
    }

    clearStoredToken();

    console.log();
    console.log(pc.green("✔") + " Logged out successfully.");
    console.log(pc.dim("  Local session removed. Premium components will require login."));
    console.log();
  });

// ─────────────────────────────────────────────────────────────────────────────
// whoami  —  display current authentication state
// ─────────────────────────────────────────────────────────────────────────────
program
  .command("whoami")
  .description("Display current authentication state and account information")
  .option("--api-url <url>", "Tech Inject API base URL (advanced override)")
  .action(async (options) => {
    const token = resolveAuthToken();
    if (!token) {
      console.log();
      console.log(pc.dim("Not logged in."));
      console.log(pc.dim("  Free components are available without login."));
      console.log(pc.dim("  Run `npx tech-inject-ui login` to access premium components."));
      console.log();
      return;
    }

    try {
      const apiUrl = resolveApiUrl(options.apiUrl as string | undefined);
      const res = await fetch(`${apiUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        console.log();
        console.log(pc.yellow("✖ Session expired or invalid."));
        console.log(pc.dim("  Run `npx tech-inject-ui login` to re-authenticate."));
        console.log();
        return;
      }

      if (!res.ok) {
        console.log(pc.yellow("\nUnable to verify session. Please run `npx tech-inject-ui login`.\n"));
        return;
      }

      const data = (await res.json()) as {
        success?: boolean;
        data?: {
          user?: { name?: string; email: string; role: string; isPremium: boolean };
        };
      };

      const user = data.data?.user;
      if (!user) {
        console.log(pc.yellow("\nSession verified but could not retrieve account details.\n"));
        return;
      }

      console.log();
      console.log(pc.bold("Logged in as:"));
      console.log(`  ${pc.cyan(user.email)}`);
      console.log();
      console.log(pc.bold("Access:"));
      console.log(
        `  ${user.isPremium ? pc.yellow("Premium") : pc.dim("Free")}`
      );
      console.log();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(pc.red(`Error checking session: ${msg}`));
    }
  });

program.parse(process.argv);
