# Tech Inject UI — GitHub CLI Integration Guide

## Links

- GitHub Repository: https://github.com/ayushudaydubey/tech-inject-design-library
- GitHub Clone URL: https://github.com/ayushudaydubey/tech-inject-design-library.git
- GitHub CLI Release: https://github.com/ayushudaydubey/tech-inject-design-library/releases/tag/cli-v1.0.0
- GitHub Releases: https://github.com/ayushudaydubey/tech-inject-design-library/releases
- Public Catalogue: https://tech-inject-design-library.vercel.app
- Admin Dashboard: https://tech-inject-design-library-admin-jdf02i3dl.vercel.app
- Backend: https://tech-inject-design-library.onrender.com
- Production API: https://tech-inject-design-library.onrender.com/api
- Current GitHub main commit: https://github.com/ayushudaydubey/tech-inject-design-library/commit/abff58163cbcfabcd35930737cc2aa175d873842

## 1. Requirements

- Node.js 18+
- npm
- React + TypeScript consumer project
- Internet access

Create a clean test project:

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
```

## 2. Download CLI

Open:

https://github.com/ayushudaydubey/tech-inject-design-library/releases/tag/cli-v1.0.0

Download:

```text
tech-inject-ui-1.0.0.tgz
```

## 3. Install CLI Globally

Windows PowerShell:

```powershell
npm install -g "$env:USERPROFILE\Downloads\tech-inject-ui-1.0.0.tgz"
```

macOS/Linux:

```bash
npm install -g ~/Downloads/tech-inject-ui-1.0.0.tgz
```

Verify:

```bash
tech-inject-ui --help
tech-inject-ui --version
```

## 4. Production API

The default API is:

```text
https://tech-inject-design-library.onrender.com/api
```

Normal usage:

```bash
tech-inject-ui add button
```

API precedence:

```text
--api-url > TECH_INJECT_API_URL > production API
```

Optional local override:

```bash
tech-inject-ui add button --api-url http://localhost:5000/api
```

## 5. Authentication

Login:

```bash
tech-inject-ui login
```

Check account:

```bash
tech-inject-ui whoami
```

Logout:

```bash
tech-inject-ui logout
```

The session is stored locally. Passwords and tokens must never be committed to GitHub or embedded in prompts/commands.

## 6. Install Free Component

```bash
tech-inject-ui add button
```

Expected:

```text
✔ Component found: Button (v1.0.0) [free]
✔ Access verified
✔ Installing...
✔ Component installed successfully.
```

## 7. Install Premium Component

```bash
tech-inject-ui add advanced-filter-bar
```

Signed-out users and free customers are denied.

Premium customers receive:

```text
✔ Component found: Advanced Filter Bar (v1.0.0) [premium]
✔ Premium access verified
✔ Installing...
✔ Component installed successfully.
```

## 8. Access Matrix

| User | Free | Premium |
|---|---|---|
| Signed out | Allowed | Denied |
| Free customer | Allowed | Denied |
| Premium customer | Allowed | Allowed |

## 9. Installed Structure

```text
src/
└── components/
    ├── button/
    │   ├── index.ts
    │   ├── TechInjectButton.tsx
    │   ├── TechInjectButton.css
    │   └── types.ts
    ├── card/
    │   ├── index.ts
    │   ├── TechInjectCard.tsx
    │   ├── TechInjectCard.css
    │   └── types.ts
    └── input/
        ├── index.ts
        ├── TechInjectInput.tsx
        ├── TechInjectInput.css
        └── types.ts
```

Each component has its own directory so files such as `types.ts` do not collide.

## 10. Existing File Protection

The installer does not silently overwrite consumer files. If a target file already exists, installation stops and reports the conflict.

## 11. Dependencies

The CLI checks declared component dependencies against the consumer project using semantic-version compatibility. Compatible dependencies are reused; incompatible versions are reported instead of being silently replaced.

## 12. Clean Consumer Test

```bash
npm create vite@latest tech-inject-test -- --template react-ts
cd tech-inject-test
npm install
```

Then:

```bash
tech-inject-ui login
tech-inject-ui add button
tech-inject-ui add card
tech-inject-ui add input
npm run build
```

## 13. Premium Test

Signed out:

```bash
tech-inject-ui logout
tech-inject-ui add advanced-filter-bar
```

Expected: authentication required.

Free customer:

```bash
tech-inject-ui login
tech-inject-ui add advanced-filter-bar
```

Expected: premium access required.

Premium customer:

```bash
tech-inject-ui login
tech-inject-ui add advanced-filter-bar
```

Expected: premium access verified and installation allowed.

## 14. AI-Agent Integration

The public component page also provides an AI-agent prompt.

```text
Component Page
    ↓
Copy Prompt
    ↓
Cursor / Claude Code / Copilot
    ↓
Paste Prompt
    ↓
Agent adds component
    ↓
Checks dependencies and TypeScript
    ↓
Developer verifies result
```

The prompt does not contain credentials or premium tokens.

## 15. Complete Library Flow

```text
Admin Login
     ↓
Create Draft
     ↓
Add Metadata / Source / Styles / Preview Data
     ↓
Validate
     ↓
Preview
     ↓
Publish
     ↓
Public Catalogue
     ↓
Copy Source / CLI / AI Prompt
```

Premium:

```text
Publish as Premium
     ↓
Signed out / Free → Locked
     ↓
Admin grants premium
     ↓
Premium customer → Full access
     ↓
Admin revokes premium
     ↓
Future protected requests → Denied
```

## 16. Security

- Backend verifies current premium access.
- Premium source is protected.
- Credentials are not embedded in commands or prompts.
- Unsafe install paths are rejected.
- Existing files are not silently overwritten.
- Component-supplied shell commands are not executed.
- Dependency versions are checked.
- Unpublished components cannot be newly installed.
- Customer accounts cannot grant themselves premium/admin access.

## 17. Troubleshooting

If the CLI command is not found:

```bash
npm install -g "<path-to>/tech-inject-ui-1.0.0.tgz"
```

Then restart the terminal.

Authentication:

```bash
tech-inject-ui logout
tech-inject-ui login
tech-inject-ui whoami
```

API override:

```bash
tech-inject-ui add button --api-url http://localhost:5000/api
```

For reviewer testing, use the production API.

## 18. Important

npm publication is not required by the assignment. The CLI is distributed through the public GitHub Release package.

Do not commit:

- passwords
- JWT secrets
- access tokens
- production `.env` files
- real customer data
