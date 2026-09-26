# Tech Inject UI — GitHub CLI Integration Guide

This document explains how to install and use the Tech Inject UI component installer from the GitHub Release package.

The CLI is a source-based installer for React + TypeScript consumer projects. It downloads the published component source from the deployed Tech Inject backend and installs the required files into the consumer project.

> npm publishing is not required for this project. The assignment allows a publicly downloadable packaged CLI.

---

## 1. Requirements

Before using the CLI, make sure the consumer machine has:

- Node.js 18+
- npm
- A React + TypeScript project
- Internet access to the deployed Tech Inject API

Recommended consumer project:

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
```

---

## 2. GitHub Release

The CLI package is distributed as a `.tgz` package through a GitHub Release.

Release tag:

```text
cli-v1.0.0
```

Release package:

```text
tech-inject-ui-1.0.0.tgz
```

GitHub repository:

```text
https://github.com/ayushudaydubey/tech-inject-design-library
```

GitHub Release:

```text
https://github.com/ayushudaydubey/tech-inject-design-library/releases
```

Download the following file from the release:

```text
tech-inject-ui-1.0.0.tgz
```

---

## 3. Install CLI Globally

After downloading the `.tgz` file, install it globally.

### Windows PowerShell

If the file is in Downloads:

```powershell
npm install -g "$env:USERPROFILE\Downloads\tech-inject-ui-1.0.0.tgz"
```

### Windows CMD

```cmd
npm install -g "%USERPROFILE%\Downloads\tech-inject-ui-1.0.0.tgz"
```

### macOS/Linux

```bash
npm install -g ~/Downloads/tech-inject-ui-1.0.0.tgz
```

Verify installation:

```bash
tech-inject-ui --help
```

Expected commands:

```text
add
login
logout
whoami
```

Verify the installed CLI version:

```bash
tech-inject-ui --version
```

---

## 4. Production API

The CLI uses the deployed Tech Inject API by default.

Production API:

```text
https://tech-inject-design-library.onrender.com/api
```

Therefore, normal usage does not require `--api-url`.

Example:

```bash
tech-inject-ui add button
```

The CLI uses:

```text
--api-url > TECH_INJECT_API_URL > production API
```

This means:

1. Explicit `--api-url` has the highest priority.
2. `TECH_INJECT_API_URL` can override the default.
3. Otherwise the deployed production API is used.

---

## 5. Optional API Override

For local development or testing, use:

```bash
tech-inject-ui add button --api-url http://localhost:5000/api
```

You can also set:

```powershell
$env:TECH_INJECT_API_URL="http://localhost:5000/api"
```

Then:

```bash
tech-inject-ui add button
```

For reviewer testing, the production API should be used.

---

# 6. Authentication

The CLI supports customer authentication.

## Login

Run:

```bash
tech-inject-ui login
```

The CLI asks for:

```text
Email:
Password:
```

After successful authentication, the session is stored locally for subsequent CLI commands.

Example:

```text
Authenticating...
✔ Signed in as premium@techinject.io [Premium]
Session stored in ~/.techinjectrc
```

Do not put passwords or access tokens inside commands, prompts, source files or GitHub repositories.

---

## 7. Check Current Account

Use:

```bash
tech-inject-ui whoami
```

This displays the current authenticated account and access level.

Possible states include:

```text
Free
Premium
```

If the user is not logged in, the CLI reports that authentication is required.

---

## 8. Logout

To remove the stored CLI session:

```bash
tech-inject-ui logout
```

After logout, protected premium installation requests should require authentication again.

---

# 9. Install a Free Component

A free component can be installed without a premium account.

Example:

```bash
tech-inject-ui add button
```

Expected flow:

```text
Fetching component specifications...
✔ Component found: Button (v1.0.0) [free]
✔ Access verified
✔ Installing...
✔ Component installed successfully.
```

The CLI downloads the component source and supporting files from the deployed backend.

---

# 10. Install a Premium Component

Premium components require an authenticated premium customer.

Example:

```bash
tech-inject-ui add advanced-filter-bar
```

For a premium customer:

```text
✔ Component found: Advanced Filter Bar (v1.0.0) [premium]
✔ Premium access verified
✔ Installing...
✔ Component installed successfully.
```

---

# 11. Premium Access Rules

The backend is the source of truth for premium access.

| User | Free Component | Premium Component |
|---|---|---|
| Signed out | Allowed | Denied |
| Free customer | Allowed | Denied |
| Premium customer | Allowed | Allowed |

The CLI must not determine premium access only from frontend state.

Every protected installation request is checked by the backend.

---

# 12. Signed-Out Premium Request

If a user is not logged in and tries to install a premium component:

```bash
tech-inject-ui add advanced-filter-bar
```

The CLI should stop with an authentication message similar to:

```text
✖ Premium component
Authentication required.

Run:
tech-inject-ui login
```

No premium source should be installed.

---

# 13. Free Account + Premium Component

If a free customer is logged in:

```bash
tech-inject-ui add advanced-filter-bar
```

The backend denies premium access.

The CLI should show that premium access is required.

The component must not be installed.

---

# 14. Premium Account + Premium Component

After logging in with a premium account:

```bash
tech-inject-ui login
```

Then:

```bash
tech-inject-ui add advanced-filter-bar
```

The backend verifies the current premium status and the CLI proceeds with installation.

---

# 15. Installed Component Structure

Components are installed into component-specific folders to avoid filename collisions.

Example:

```text
src/
└── components/
    ├── button/
    │   ├── index.ts
    │   ├── TechInjectButton.tsx
    │   ├── TechInjectButton.css
    │   └── types.ts
    │
    ├── card/
    │   ├── index.ts
    │   ├── TechInjectCard.tsx
    │   ├── TechInjectCard.css
    │   └── types.ts
    │
    └── input/
        ├── index.ts
        ├── TechInjectInput.tsx
        ├── TechInjectInput.css
        └── types.ts
```

This allows different components to have their own `types.ts` and CSS files without overwriting another component.

---

# 16. Existing File Protection

The CLI does not silently overwrite existing files.

If a target file already exists, installation stops instead of destroying the user's existing code.

Example:

```text
Error: Component installation aborted to prevent overwriting existing files:
  - src/components/button/TechInjectButton.tsx
```

This is intentional.

Do not use `--force` unless the project explicitly supports that operation and the user understands the overwrite risk.

---

# 17. Dependency Handling

Components can declare required dependencies.

Before installation, the CLI checks the consumer project's installed dependencies.

The installer:

1. Reads the component dependency requirements.
2. Reads installed consumer versions.
3. Checks semantic-version compatibility.
4. Reuses compatible dependencies.
5. Reports incompatible versions.
6. Avoids silently installing an incompatible dependency.

Example:

```text
✔ Reusing compatible dependencies:
  clsx@2.1.0
  lucide-react@0.475.0
```

If an incompatible dependency is already installed, the CLI stops and explains the conflict instead of silently replacing the consumer's dependency.

---

# 18. After Installation

Open the generated component in the consumer project.

Example:

```tsx
import TechInjectButton from "./components/button";
```

Use the component according to the usage information provided by the Tech Inject component catalogue.

Then run:

```bash
npm run build
```

For a Vite React + TypeScript project:

```bash
npm run dev
```

Verify that the component renders correctly.

---

# 19. Clean Consumer Project Test

For reviewer verification, use a clean React + TypeScript project.

Example:

```bash
npm create vite@latest tech-inject-test -- --template react-ts
cd tech-inject-test
npm install
```

Then install the CLI package and run:

```bash
tech-inject-ui login
```

Install a free component:

```bash
tech-inject-ui add button
```

Install another component:

```bash
tech-inject-ui add card
```

Then:

```bash
npm run build
```

This verifies that the components work independently from the Tech Inject catalogue repository.

---

# 20. Testing Premium Access in a Clean Project

### Test 1 — Signed out

```bash
tech-inject-ui logout
tech-inject-ui add advanced-filter-bar
```

Expected:

```text
Premium component
Authentication required
```

### Test 2 — Free customer

```bash
tech-inject-ui login
tech-inject-ui add advanced-filter-bar
```

Use the seeded free customer account.

Expected:

```text
Premium access is required
```

### Test 3 — Premium customer

```bash
tech-inject-ui login
tech-inject-ui add advanced-filter-bar
```

Use the seeded premium customer account.

Expected:

```text
✔ Premium access verified
✔ Component installed successfully.
```

---

# 21. AI-Agent Integration

The CLI is one integration method. The component catalogue also provides an AI-agent integration prompt.

Supported workflow:

```text
Tech Inject Component Page
        ↓
Copy Prompt
        ↓
Cursor / Claude Code / Copilot / another coding agent
        ↓
Paste prompt
        ↓
AI agent adds component
        ↓
Dependencies and files checked
        ↓
TypeScript/build verification
```

The prompt does not contain customer credentials or premium tokens.

Premium access remains controlled by the backend and authenticated integration path.

---

# 22. CLI + AI Prompt Are Separate Options

The component page provides three integration options:

```text
1. Copy Source
2. Install with CLI
3. AI-Agent Prompt
```

### Copy Source

The developer manually copies the component source and required supporting files.

### CLI

The developer runs:

```bash
tech-inject-ui add <slug>
```

### AI Agent

The developer copies the component-specific prompt into their coding agent.

All three options are based on the same published component content.

---

# 23. Backend and Deployment

Production services:

### Public Catalogue

```text
https://tech-inject-design-library.vercel.app
```

### Admin Dashboard

```text
https://tech-inject-design-library-admin-jdf02i3dl.vercel.app
```

### Backend API

```text
https://tech-inject-design-library.onrender.com
```

CLI API:

```text
https://tech-inject-design-library.onrender.com/api
```

The CLI does not depend on the candidate's local backend when using the default production configuration.

---

# 24. Component Publishing Flow

The complete library flow is:

```text
Admin Login
     ↓
Create Component Draft
     ↓
Add Metadata
     ↓
Add Source Files
     ↓
Add Supporting Files / Styles
     ↓
Add Preview / Example Data
     ↓
Declare Dependencies
     ↓
Validate
     ↓
Preview
     ↓
Publish
     ↓
Public Catalogue
     ↓
Copy / CLI / AI Prompt
```

A newly published component is loaded dynamically from backend data and does not require manually adding a frontend import or redeploying the catalogue.

---

# 25. Premium Publishing Flow

```text
Admin creates component
        ↓
Set access = Premium
        ↓
Publish
        ↓
Signed-out user
        ↓
Locked

Free customer
        ↓
Locked

Admin grants premium
        ↓
Premium customer
        ↓
Preview / Source / CLI / AI Prompt available

Admin revokes premium
        ↓
Future protected requests denied
```

Revocation cannot remove code that was already copied or installed.

---

# 26. Security Model

The CLI and backend follow these principles:

- Backend verifies current access.
- Premium source is not publicly exposed.
- Credentials are not embedded in commands.
- Credentials are not stored in the repository.
- Installer writes remain inside the consumer project.
- Unsafe paths are rejected.
- Existing files are not silently overwritten.
- Component-supplied shell commands are not executed.
- Dependency versions are checked.
- Unpublished components are not available for new installation.
- Premium access is separate from admin access.
- Customer accounts cannot grant themselves premium access.

---

# 27. Troubleshooting

## `tech-inject-ui` command not found

Check global installation:

```bash
npm install -g "<path-to>/tech-inject-ui-1.0.0.tgz"
```

Then restart the terminal and run:

```bash
tech-inject-ui --help
```

---

## Authentication failed

Run:

```bash
tech-inject-ui logout
tech-inject-ui login
```

Then:

```bash
tech-inject-ui whoami
```

---

## Premium access denied

Check:

```bash
tech-inject-ui whoami
```

If the account is free, premium installation is intentionally blocked.

---

## API connection issue

Check the production API:

```text
https://tech-inject-design-library.onrender.com
```

For local development:

```bash
tech-inject-ui add button --api-url http://localhost:5000/api
```

---

## Existing file error

Do not silently overwrite the file.

Check the existing component folder:

```text
src/components/<component-slug>/
```

The CLI intentionally protects existing consumer files.

---

## Dependency conflict

The CLI reports the installed dependency version and the component's required version.

Resolve the dependency conflict in the consumer project and retry.

---

# 28. Reviewer Quick Test

A reviewer can verify the complete integration with:

```bash
tech-inject-ui --help
```

```bash
tech-inject-ui login
```

```bash
tech-inject-ui whoami
```

```bash
tech-inject-ui add button
```

Then:

```bash
npm run build
```

For premium testing:

```bash
tech-inject-ui add advanced-filter-bar
```

Test the same component with:

1. Signed-out account
2. Free customer account
3. Premium customer account

Finally test the AI-agent prompt from the public component page in the same clean React + TypeScript project.

---

## 29. Important Notes

- npm publication is not required for this assignment.
- The GitHub Release `.tgz` package is the public CLI distribution method.
- The CLI uses the deployed backend by default.
- Premium credentials must never be included in README, GitHub, prompts, commands or frontend code.
- The public repository must not contain real customer passwords or production secrets.
- The backend remains the source of truth for premium access.
- Revoking premium access blocks future protected requests but cannot undo code already copied by a customer.
