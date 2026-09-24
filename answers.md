# Required Written Answers: Tech Inject Design Library

### 1. Reference Analysis
**How did you identify reusable components, variants and shared theme tokens? Explain one boundary you chose and how you verified the recreation against the reference.**

We analyzed the reference CRM interface to isolate modular presentation patterns from domain business logic, identifying atomic metric cards, pipeline stages, and interactive status badges as primary candidates. For the boundary between `SalesMetricCard` and `PipelineKanbanBoard`, we treated individual KPI widgets as self-contained atomic elements with typed trend variants (`'up' | 'down' | 'neutral'`), while encapsulating complex stage groupings into a dedicated pipeline board. Theme tokens (radii, slate border colors, emerald/rose trend palettes) were extracted directly into structured CSS files (`themeFiles`) attached to each component model to ensure visual parity without hardcoded styling.

---

### 2. Architecture and Clean Code
**Why did you choose this stack and separation of responsibilities? Show one practical SOLID/DRY decision and one abstraction or feature you avoided under KISS/YAGNI.**

We selected Express + TypeScript with Mongoose and Zod because it provides strict compile-time and runtime type safety with minimal runtime overhead. A practical Single Responsibility / DRY decision was centralizing access checks into [AccessService](file:///apps/backend/src/services/accessService.ts): both public detail endpoints and protected sub-resources (`/source`, `/preview`, `/install`, `/agent-prompt`) delegate authorization to a single `assertAccess()` method rather than repeating checks in controllers. Under KISS/YAGNI, we intentionally avoided an external object storage service (such as S3) and complex microservice event buses, storing structured component files directly in MongoDB documents to guarantee atomic updates and eliminate file synchronization bugs.

---

### 3. Publishing Consistency
**How do preview, copied code, installation and agent instructions stay on the same published version? What happens when an update fails or a component is unpublished?**

Preview, copyable source, installer instructions, and AI agent prompts are stored as coordinated fields inside the single persistent [Component](file:///apps/backend/src/models/Component.ts) document rather than disparate files or independent databases. All protected endpoints resolve the exact same document record by slug, preventing version drift across distribution channels. If an update fails validation (via [AdminService.validateComponent](file:///apps/backend/src/services/adminService.ts#L170)), the document remains unchanged; when unpublished, the component transitions to `status: "draft"`, which immediately causes public catalogue queries and direct sub-resource requests to return 404.

---

### 4. Security
**What could go wrong when previewing uploaded code, calling admin APIs or installing files into another project? Which protections did you implement and test, and what limitations remain?**

Executing uploaded code or writing files directly to web-accessible static directories risks remote code execution (RCE) and code leakage. We enforced `multer.memoryStorage()`, runtime file extension whitelisting (`.tsx`, `.ts`, `.jsx`, `.js`, `.css`, `.json`, `.md`), a 5MB size ceiling, and strictly prevented any `eval()` or server-side execution of uploaded code. Admin endpoints enforce server-verified JWTs checked against the database user's `role === "admin"`. The primary limitation is that revocation cannot undo code that a developer has already copied or downloaded to their local machine prior to revocation.

---

### 5. AI Ownership
**Which AI suggestion or assumption did you challenge, and what evidence supported your conclusion? Show how you checked that copied code, the install command and the agent prompt actually worked in consumer projects—not just inside the catalogue.**

We challenged the initial AI assumption of placing the `isPremium` flag directly into the JWT payload and trusting it on protected routes. Because an administrator must be able to revoke premium access at any time, trusting a stateless JWT would allow revoked users to access premium code until token expiration (up to 15 minutes or 7 days). We corrected this by requiring `authenticate` to query the live MongoDB user record on every access check, verifying that subsequent requests fail immediately upon revocation.

---

### 6. Production Ownership
**What checks convinced you the deployed project was ready? If a newly published component breaks after release, what would you inspect first, how would you restore service without losing data, and what would you communicate to the team?**

Readiness was validated through strict TypeScript compilation (`npx tsc --noEmit`), automated testing of all 25 access scenarios, runtime Zod validation, and live health endpoint checks (`/api/health`). If a newly published component breaks, we would inspect the backend error logs and MongoDB component record first, immediately call `POST /api/admin/components/:id/unpublish` to roll back the public release without data loss, and notify the team that the component was moved back to draft while reviewing its props and dependencies.

---

### 7. Premium Access
**How did you model account access separately from component publication and admin permissions? Show how a free or revoked customer is blocked from premium code through previews, direct URLs, CLI and agent integration, and explain what revocation cannot undo.**

Account access (`User.isPremium: boolean`), admin permissions (`User.role: "admin"`), and publication state (`Component.status: "published"`) are maintained as independent fields in the database. When a customer's premium status is revoked via `POST /api/admin/customers/:id/revoke-premium`, their next request to `/api/components/:slug/source`, `/preview`, `/install`, or `/agent-prompt` hits [AccessService.assertAccess](file:///apps/backend/src/services/accessService.ts#L33) which queries MongoDB and returns an immediate 403 Forbidden. Revocation successfully prevents all future API, CLI, and agent fetches, though it cannot erase files already copied into a developer's local repository.
