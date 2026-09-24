# Tech Inject Admin Dashboard

Administrative Next.js App Router application for component drafting, file uploading, validation, publishing, and customer premium access management.

---

## 1. Quick Start

### Installation & Execution
```bash
# Navigate to admin app
cd apps/admin

# Install dependencies
npm install

# TypeScript check
npx tsc --noEmit

# Run ESLint
npm run lint

# Run development server
npm run dev
```

The admin dashboard runs at `http://localhost:3000`.

---

## 2. TanStack Query Architecture

- **Provider**: [`src/components/providers/QueryProvider.tsx`](file:///src/components/providers/QueryProvider.tsx)
  - Instantiates `QueryClient` strictly on the client side using `useState(() => getQueryClient())`.
  - Configures `staleTime: 30s`, `gcTime: 5m`, and disables automatic refetching on window focus (`refetchOnWindowFocus: false`).
  - Suppresses unneeded retries on `401 Unauthorized`, `403 Forbidden`, and `404 Not Found`.
- **Layout**: [`src/app/layout.tsx`](file:///src/app/layout.tsx)
  - `RootLayout` remains a Server Component; only `QueryProvider` has `"use client"`.

---

## 3. Query Keys Structure

```typescript
// Component Keys
export const adminComponentKeys = {
  all: ["admin", "components"] as const,
  list: () => ["admin", "components", "list"] as const,
  detail: (id: string) => ["admin", "components", "detail", id] as const,
  preview: (id: string) => ["admin", "components", "preview", id] as const,
  validate: (id: string) => ["admin", "components", "validate", id] as const,
};

// Customer Keys
export const adminCustomerKeys = {
  all: ["admin", "customers"] as const,
  list: () => ["admin", "customers", "list"] as const,
  detail: (id: string) => ["admin", "customers", "detail", id] as const,
};

// Admin Auth Keys
export const adminAuthKeys = {
  all: ["admin", "auth"] as const,
  me: ["admin", "auth", "me"] as const,
};
```

---

## 4. Reusable Hooks & Mutations

### Authentication ([`src/hooks/useAdminAuth.ts`](file:///src/hooks/useAdminAuth.ts))
- `useAdminSession()`: Queries `/api/auth/me`, verifies `role === "admin"`, purges token on 401/403.
- `useAdminLogin()`: Mutation for admin login; verifies admin privileges and updates query cache.
- `useAdminLogout()`: Mutation for logout; clears tokens and purges all admin cache via `queryClient.clear()`.

### Components ([`src/hooks/useComponents.ts`](file:///src/hooks/useComponents.ts))
- `useAdminComponents()`: Lists all components including drafts (`GET /api/admin/components`).
- `useAdminComponent(id)`: Fetches single component details (`GET /api/admin/components/:id`).
- `useCreateDraft()`: Mutation to create draft (`POST /api/admin/components`), invalidates list.
- `useUpdateDraft()`: Mutation to update component (`PATCH /api/admin/components/:id`), invalidates detail and list.
- `useUploadComponentFiles()`: Mutation for multipart file upload (`POST /api/admin/components/:id/upload`).
- `useValidateDraft()`: Mutation to validate draft (`POST /api/admin/components/:id/validate`).
- `usePreviewDraft()`: Mutation to preview draft (`POST /api/admin/components/:id/preview`).
- `usePublishComponent()`: Mutation to publish (`POST /api/admin/components/:id/publish`), invalidates detail and list.
- `useUnpublishComponent()`: Mutation to unpublish (`POST /api/admin/components/:id/unpublish`), invalidates detail and list.

### Customers ([`src/hooks/useCustomers.ts`](file:///src/hooks/useCustomers.ts))
- `useAdminCustomers()`: Lists all customers (`GET /api/admin/customers`).
- `useGrantPremium()`: Mutation to grant premium (`POST /api/admin/customers/:id/grant-premium`), invalidates customer list and detail.
- `useRevokePremium()`: Mutation to revoke premium (`POST /api/admin/customers/:id/revoke-premium`), invalidates customer list and detail.

---

## 5. Security & Server Authority
- **Server-Side Enforcement**: Admin authorization is verified by the backend on every request. Frontend checks never grant access.
- **Cache Purge on Logout**: `useAdminLogout` calls `queryClient.clear()` to erase all sensitive admin component drafts and customer lists from browser memory.
- **Zero Secrets in Code**: No JWT secrets or admin credentials are embedded in client bundles.
