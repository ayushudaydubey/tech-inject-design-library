# `tech-inject-ui` CLI

Official command-line installer for the Tech Inject Design Library. Allows developers to add published, high-quality React components directly into their codebase without copying and pasting manually.

---

## Quick Start

Run the installer directly using `npx`:

```bash
npx tech-inject-ui add <component-slug>
```

### Example

```bash
npx tech-inject-ui add sales-metric-card
```

---

## Features

- **Generic & Dynamic**: Works with any component published to the Tech Inject Design Library without requiring CLI updates.
- **Path Traversal Protection**: Rejects all path traversal (`../`) and absolute path patterns to guarantee consumer project security.
- **Overwrite Protection**: Detects existing files and halts installation to avoid accidental data loss (override with `--force`).
- **Automatic Package Manager Detection**: Automatically identifies `npm`, `pnpm`, `yarn`, or `bun` from consumer lockfiles.
- **Safe Dependency Installation**: Strictly validates package names and versions to prevent shell injection vulnerabilities.
- **Tailwind & CSS Theme Tokens**: Preserves class names, TypeScript interfaces, and theme files.

---

## Free vs. Premium Components

### Free Components
Free components require no account or API keys. Anyone can download and install them immediately:
```bash
npx tech-inject-ui add sales-metric-card
```

### Premium Components
Premium components require an active premium membership verified by the backend.

You can supply credentials using one of the following methods:

1. **Interactive Login:**
   ```bash
   npx tech-inject-ui login
   ```
   Saves your session token to `~/.techinjectrc` for automatic reuse.

2. **Command Flag:**
   ```bash
   npx tech-inject-ui add pipeline-kanban-board --token <your-access-token>
   ```

3. **Environment Variable:**
   ```bash
   export TECH_INJECT_AUTH_TOKEN="your-token"
   npx tech-inject-ui add pipeline-kanban-board
   ```

---

## Command Options

| Option | Flag | Description |
|---|---|---|
| `--dir <path>` | `-d` | Target folder for components (default: `src/components`) |
| `--force` | `-f` | Overwrite existing files if they already exist |
| `--token <token>` | `-t` | Bearer token for premium component access |
| `--api-url <url>` | | Override Tech Inject API endpoint URL |
| `--skip-deps` | | Skip automatic `npm`/`pnpm`/`yarn`/`bun` dependency installation |
| `--verbose` | | Display detailed debug logs and error stack traces |

---

## Supported Project Types

- **Next.js** (App Router & Pages Router)
- **Vite + React**
- **Create React App**
- **Custom React 18+ setups with Tailwind CSS or CSS Modules**

Components are saved to `src/components/` (if `src/` exists) or `components/`.

---

## Troubleshooting

### "File already exists"
The CLI protects you against accidental overwrites. If you intentionally want to replace an existing component file, pass the `--force` flag:
```bash
npx tech-inject-ui add sales-metric-card --force
```

### "Component not found or is currently an unpublished draft"
Only published components can be downloaded. If the component was recently created by an administrator, ensure it has been validated and published in the Admin Console.

### "Authentication is required to install this component"
The requested component is marked as Premium. Log in with `npx tech-inject-ui login` or pass `--token <token>`.
