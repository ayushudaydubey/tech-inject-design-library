# Tech Inject Design Library - Backend API

Production-ready backend API service for the Tech Inject Design Library, built with Express, TypeScript, MongoDB (Mongoose), JWT authentication, bcryptjs, Zod runtime validation, and Multer upload management.

---

## 1. Quick Start

### Prerequisites
- Node.js >= 18.0.0 (tested on v24.19.0)
- MongoDB instance (Atlas cluster or local MongoDB)

### Installation & Execution
```bash
# Navigate to backend directory
cd apps/backend

# Install dependencies
npm install

# Run TypeScript compilation check
npm run build
# or
npx tsc --noEmit

# Run automated tests
npm test

# Run development server with live watch
npm run dev
```

The server will run at `http://localhost:5000`.

---

## 2. Environment Variables

Create `.env` based on `.env.example`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/tech_inject_db

# JWT Configuration
JWT_ACCESS_SECRET=your_jwt_access_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Test Accounts (Auto-seeded on startup)
ADMIN_EMAIL=admin@techinject.io
ADMIN_PASSWORD=AdminPassword123!

FREE_CUSTOMER_EMAIL=customer@techinject.io
FREE_CUSTOMER_PASSWORD=CustomerPassword123!

PREMIUM_CUSTOMER_EMAIL=premium@techinject.io
PREMIUM_CUSTOMER_PASSWORD=PremiumPassword123!
```

---

## 3. Architecture & Project Layout

```
apps/backend/
├── src/
│   ├── config/          # Environment validation (env.ts) and DB connection (db.ts)
│   ├── controllers/     # HTTP request/response handlers (auth, component, admin)
│   ├── middleware/      # Auth (JWT & DB user check), upload (Multer memory), error handler
│   ├── models/          # Mongoose models: User and Component
│   ├── routes/          # Express route definitions (/api/auth, /api/components, /api/admin)
│   ├── services/        # Business logic: auth, access control, component, admin, seed
│   └── utils/           # JWT sign/verify, cookie parser, slugify helper
├── tests/
│   └── backend.test.ts  # Comprehensive 25-case automated test suite
├── .env.example
├── server.ts            # Entry point
├── package.json
└── tsconfig.json
```

---

## 4. API Endpoints

### Health
- `GET /api/health` - Server health status

### Authentication (`/api/auth`)
- `POST /api/auth/login` - Login with email & password (returns user, accessToken, refreshToken)
- `POST /api/auth/refresh` - Issue new access token using refresh token
- `POST /api/auth/logout` - Invalidate session & revoke refresh token
- `GET /api/auth/me` - Get fresh authenticated user profile from DB

### Public Component Catalogue (`/api/components`)
- `GET /api/components` - List published components (supports `?search=` and `?category=`)
- `GET /api/components/:slug` - Public component detail (locks source for premium items)
- `GET /api/components/:slug/preview` - Preview configuration and data
- `GET /api/components/:slug/source` - Copyable source code and supporting files
- `GET /api/components/:slug/install` - Verified package manager command & dependencies
- `GET /api/components/:slug/agent-prompt` - AI coding prompt for component integration
- `GET /api/components/:slug/download` - Packaged bundle payload

### Admin Component Operations (`/api/admin`)
- `GET /api/admin/components` - List all components including drafts
- `POST /api/admin/components` - Create new component draft
- `GET /api/admin/components/:id` - Full component detail
- `PATCH /api/admin/components/:id` - Update component metadata or source
- `POST /api/admin/components/:id/upload` - Upload source files via Multer (max 5MB/file)
- `POST /api/admin/components/:id/validate` - Validate draft readiness
- `POST /api/admin/components/:id/preview` - Preview draft component
- `POST /api/admin/components/:id/publish` - Publish component to public catalogue
- `POST /api/admin/components/:id/unpublish` - Move component back to draft

### Admin Customer Management (`/api/admin/customers`)
- `GET /api/admin/customers` - List all customer accounts
- `POST /api/admin/customers/:id/grant-premium` - Grant premium status to customer
- `POST /api/admin/customers/:id/revoke-premium` - Revoke premium status from customer

---

## 5. Security & Access Control Model

1. **Live Database Checks**: The `authenticate` middleware always verifies the user against MongoDB. Premium status changes take effect immediately on the user's very next request, preventing stale token access.
2. **Safe Uploads**: Files are received into memory (`multer.memoryStorage()`) and validated against permitted extensions (`.tsx`, `.ts`, `.jsx`, `.js`, `.css`, `.json`, `.md`). Code is never executed server-side.
3. **No Code Leakage**: Unauthenticated or free users calling premium `/source` or `/install` receive a `401` or `403` response with zero leaked code snippets.
4. **Draft Protection**: Drafts are completely excluded from public endpoints; queries for unpublished slugs return a 404 to avoid leaking draft existence.
