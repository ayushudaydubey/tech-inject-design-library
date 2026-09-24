import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import {
  ComponentDownloadData,
  ComponentDownloadResponseSchema,
} from "./types";

/**
 * Resolves the backend API base URL in order of precedence:
 * 1. CLI flag --api-url
 * 2. Environment variable TECH_INJECT_API_URL
 * 3. Environment variable NEXT_PUBLIC_API_URL
 * 4. Localhost fallback http://localhost:5000/api
 */
export function resolveApiUrl(cliOptionUrl?: string): string {
  const url =
    cliOptionUrl ||
    process.env.TECH_INJECT_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000/api";

  return url.replace(/\/+$/, "");
}

/**
 * Path to user configuration file in home directory
 */
function getConfigFilePath(): string {
  return path.join(os.homedir(), ".techinjectrc");
}

/**
 * Reads stored auth token from ~/.techinjectrc if it exists
 */
export function readStoredToken(): string | undefined {
  const configPath = getConfigFilePath();
  if (fs.existsSync(configPath)) {
    try {
      const content = fs.readFileSync(configPath, "utf-8");
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed.token === "string" && parsed.token.trim() !== "") {
        return parsed.token.trim();
      }
    } catch {
      // Ignore unparseable config
    }
  }
  return undefined;
}

/**
 * Writes auth token to ~/.techinjectrc
 */
export function writeStoredToken(token: string): void {
  const configPath = getConfigFilePath();
  try {
    fs.writeFileSync(
      configPath,
      JSON.stringify({ token: token.trim(), updatedAt: new Date().toISOString() }, null, 2),
      { mode: 0o600 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`Warning: Could not save credentials to ${configPath}: ${msg}`);
  }
}

/**
 * Resolves authentication token in order of precedence:
 * 1. CLI flag --token
 * 2. Environment variable TECH_INJECT_AUTH_TOKEN
 * 3. Environment variable TECH_INJECT_TOKEN
 * 4. Stored token in ~/.techinjectrc
 */
export function resolveAuthToken(cliOptionToken?: string): string | undefined {
  if (cliOptionToken && cliOptionToken.trim() !== "") {
    return cliOptionToken.trim();
  }

  const envToken =
    process.env.TECH_INJECT_AUTH_TOKEN || process.env.TECH_INJECT_TOKEN;
  if (envToken && envToken.trim() !== "") {
    return envToken.trim();
  }

  return readStoredToken();
}

/**
 * Fetches the component download package from the backend API.
 * Uses native fetch with AbortSignal timeout and validates the response schema.
 */
export async function fetchComponentDownload(
  slug: string,
  options: { apiUrl?: string; token?: string } = {}
): Promise<ComponentDownloadData> {
  const baseUrl = resolveApiUrl(options.apiUrl);
  const token = resolveAuthToken(options.token);

  const endpoint = `${baseUrl}/components/${encodeURIComponent(slug)}/download`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

  const headers: Record<string, string> = {
    Accept: "application/json",
    "User-Agent": "tech-inject-ui-cli/1.0.0",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "GET",
      headers,
      signal: controller.signal,
    });
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(
        `Connection timed out: The Tech Inject API at "${baseUrl}" did not respond within 15 seconds.`
      );
    }
    throw new Error(
      `Unable to connect to the Tech Inject API at "${baseUrl}". Please check your network connection or verify that the API server is accessible.`
    );
  } finally {
    clearTimeout(timeoutId);
  }

  // Handle HTTP error statuses
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(
        `Authentication is required to install this component.\n` +
          `Run: npx tech-inject-ui add ${slug} --token <your-token>\n` +
          `Or set the TECH_INJECT_AUTH_TOKEN environment variable.`
      );
    }

    if (response.status === 403) {
      throw new Error(
        `Access denied: "${slug}" is a premium component requiring an active premium subscription.\n` +
          `Your current account credentials do not have permission to download this component.`
      );
    }

    if (response.status === 404) {
      throw new Error(
        `Component "${slug}" not found or is currently an unpublished draft.`
      );
    }

    let errorDetail = "";
    try {
      const errJson = (await response.json()) as { message?: string };
      if (errJson?.message) {
        errorDetail = `: ${errJson.message}`;
      }
    } catch {
      // Ignore unparseable response
    }

    throw new Error(
      `Tech Inject API error (HTTP ${response.status})${errorDetail}`
    );
  }

  // Parse and validate response JSON
  let rawJson: unknown;
  try {
    rawJson = await response.json();
  } catch {
    throw new Error(
      "Malformed response received from Tech Inject API (invalid JSON)."
    );
  }

  const validation = ComponentDownloadResponseSchema.safeParse(rawJson);
  if (!validation.success) {
    const issues = validation.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(
      `API validation error: Component data returned by the backend is incomplete or malformed:\n${issues}`
    );
  }

  return validation.data.data;
}
