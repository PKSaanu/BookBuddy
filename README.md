# BookBuddy — Technical Reference & Architecture

BookBuddy is a full-stack multilingual reading and study companion web application built for researching books and academic papers. It features AI-powered translation, vocabulary management, PDF reading, text-to-speech, and export capabilities, with a focus on Tamil and Sinhala language learners.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Package Reference](#package-reference)
4. [Project Structure](#project-structure)
5. [Authentication & Security](#authentication--security)
6. [Database](#database)
7. [Email System](#email-system)
8. [PDF Processing Pipeline](#pdf-processing-pipeline)
9. [AI Integration](#ai-integration)
10. [Export System](#export-system)
11. [Rate Limiting & Abuse Prevention](#rate-limiting--abuse-prevention)
12. [Environment Variables](#environment-variables)
13. [Running Locally](#running-locally)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Next.js 16 App Router                       │
│                                                                 │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────────┐ │
│  │  React 19    │  │ Server Actions│  │  API Routes          │ │
│  │  Client UI   │  │ (auth, books, │  │ (/api/translate,     │ │
│  │  Components  │  │  papers, AI)  │  │  /api/webhooks, ...) │ │
│  └──────────────┘  └───────────────┘  └──────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
          │                   │                     │
          ▼                   ▼                     ▼
   ┌────────────┐    ┌─────────────────┐   ┌──────────────────┐
   │ Vercel Blob│    │  Neon Postgres  │   │  Upstash Redis   │
   │ (PDF files)│    │  via Drizzle   │   │ (Rate Limiting)  │
   └────────────┘    └─────────────────┘   └──────────────────┘
                              │
                    ┌─────────────────┐
                    │  Resend (Email) │
                    │  + Webhooks     │
                    └─────────────────┘
```

**Rendering Strategy:**
- All pages are **Server Components** by default (Next.js 16 App Router)
- Client Components are explicitly marked `'use client'` and used only where interactivity is needed
- Data mutations go through **Server Actions** (`'use server'`), never through direct client-to-DB calls

---

## Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js | 16.2.2 |
| UI Runtime | React | 19.2.4 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS | ^4 |
| Database | PostgreSQL (Neon serverless) | — |
| ORM | Drizzle ORM | ^0.45.2 |
| File Storage | Vercel Blob | ^2.3.3 |
| Email | Resend | ^6.10.0 |
| Rate Limiting | Upstash Redis + Ratelimit | ^1.37.0 / ^2.0.8 |
| Auth Tokens | jose (JWT) | ^6.2.2 |
| Password Hashing | bcryptjs | ^3.0.3 |
| AI | Google Gemini (generative-ai) | ^0.24.1 |
| Animation | Framer Motion | ^12.38.0 |
| PDF Rendering | pdfjs-dist / react-pdf | ^5.6.205 / ^10.4.1 |
| PDF Parsing | pdf-parse | ^2.4.5 |
| PDF Generation | jsPDF + jspdf-autotable | ^4.2.1 / ^5.0.7 |
| PDF Manipulation | pdf-lib | ^1.17.1 |
| OCR | Tesseract.js | ^5.1.1 |
| Excel Export | xlsx | ^0.18.5 |
| Word Export | docx | ^9.6.1 |
| Webhook Security | svix | ^1.90.0 |

---

## Package Reference

### Core Framework

#### `next@16.2.2`
The foundation of the application. Uses the **App Router** with file-based routing, Server Components, Server Actions, and built-in middleware. Chosen for:
- Zero-config deployment on Vercel
- Server Actions eliminate the need for a separate API layer for mutations
- Streaming and Suspense support
- Built-in image optimisation and font loading

#### `react@19.2.4` + `react-dom@19.2.4`
The latest stable React with concurrent features. React 19 introduces `useActionState` (used in all auth forms) which replaces the older `useFormState` pattern and provides direct integration with Server Actions.

#### `typescript@^5`
Strict typing across the entire codebase. All DB schema types, Server Action return types, and component props are fully typed.

---

### Database & ORM

#### `drizzle-orm@^0.45.2`
**Why Drizzle over Prisma:** Drizzle is SQL-first and generates raw, predictable SQL queries. There is no hidden query engine process — it compiles to direct SQL at build time. This is critical for **Vercel's serverless edge environment**, where a persistent Prisma query engine binary cannot be loaded without significant cold-start penalties.

Key usage patterns:
```typescript
// Type-safe query with full TypeScript inference
const [user] = await db.select().from(users).where(eq(users.email, email));
```

#### `@neondatabase/serverless@^1.0.2`
Neon provides a **serverless PostgreSQL** database that connects over WebSockets and HTTP. The `@neondatabase/serverless` driver is used specifically because standard PostgreSQL drivers use persistent TCP connections, which are incompatible with Vercel's serverless function model (each invocation gets a fresh execution context). Neon's HTTP-based driver handles connection pooling at the infrastructure level.

#### `drizzle-kit@^0.31.10` (dev)
CLI tool for Drizzle. Used for:
- `npx drizzle-kit generate` — diffs the schema and generates SQL migration files
- `npx drizzle-kit migrate` — applies pending migrations to the Neon DB

---

### Authentication

#### `jose@^6.2.2`
**Why jose over jsonwebtoken:** `jsonwebtoken` uses Node.js crypto APIs (`crypto.sign`, `crypto.verify`) which are not available in the **Next.js Edge Runtime** (used for middleware). `jose` is built on the **Web Crypto API** (available in all runtimes including Edge), making it compatible with `src/middleware.ts`. Used to sign and verify JWT session tokens stored in HTTP-only cookies.

#### `bcryptjs@^3.0.3`
Password and token hashing. Uses the bcrypt algorithm with a cost factor of 10 (default). Hashes are one-way, meaning passwords are never stored in plain text. Also used to hash:
- Password reset tokens (stored in DB, compared to plaintext token in email link)
- Email verification tokens (same pattern)

**Why bcryptjs (not `bcrypt`):** The native `bcrypt` package requires native Node.js bindings that must be compiled per platform. `bcryptjs` is a pure JavaScript implementation that works in any environment without compilation, which is critical for Vercel's serverless deployment.

---

### Styling & UI

#### `tailwindcss@^4`
Utility-first CSS framework. Version 4 introduces a new CSS-based configuration via `@import "tailwindcss"` in `globals.css`, eliminating the need for a `tailwind.config.js` file. All design tokens are co-located with their usage in component class names.

#### `framer-motion@^12.38.0`
Production-grade animation library. Used specifically for:
- **Auth layout panel slide** (`src/components/auth/auth-layout.tsx`): Spring-physics-based split-screen transition between login/signup modes
- **Language toggle switcher** in signup form: `layoutId` animation for the animated background pill
- **AnimatePresence** for exit animations

The spring transition (`type: 'spring', stiffness: 80, damping: 20`) was chosen over CSS transitions because spring physics produce a more natural, weighted feel than linear or cubic-bezier easing.

#### `@tabler/icons-react@^3.41.1`
Consistent icon set used throughout the UI. SVG-based, tree-shaken at build time. Used for password visibility toggles (`IconEye`, `IconEyeOff`), navigation icons, and UI affordances across all pages.

#### `clsx@^2.1.1` + `tailwind-merge@^3.5.0`
`clsx` handles conditional class name composition. `tailwind-merge` intelligently merges conflicting Tailwind classes (e.g., `px-4 px-6` → `px-6`). Used together in a `cn()` utility:
```typescript
export const cn = (...args) => twMerge(clsx(...args));
```

---

### Email

#### `resend@^6.10.0`
Transactional email provider. Used for:
- **Email verification** on signup (HTML template with a one-time token link, 24-hour expiry)
- **Password reset emails** (HTML template with a token link, 1-hour expiry)

Integration is in `src/lib/email.ts`. Resend was chosen for its developer-friendly API, generous free tier (3,000 emails/month), and first-class Next.js documentation.

#### `svix@^1.90.0`
Svix is a webhook security library used internally by Resend to sign webhook payloads. When Resend fires a `email.bounced` event to `/api/webhooks/resend`, the payload is signed with an HMAC signature using the `RESEND_WEBHOOK_SECRET`. The `svix` SDK's `Webhook.verify()` method validates this signature to ensure the request is genuinely from Resend and not a spoofed POST.

```typescript
const wh = new Webhook(RESEND_WEBHOOK_SECRET);
payload = wh.verify(body, { 'svix-id', 'svix-timestamp', 'svix-signature' });
```

---

### Rate Limiting

#### `@upstash/redis@^1.37.0`
A **serverless-compatible Redis client** that connects over HTTP REST instead of raw TCP sockets. Standard Redis clients (like `ioredis`) maintain persistent TCP connections, which cannot be reused across serverless function invocations. Upstash's HTTP client re-connects each time, matching the stateless serverless model exactly.

#### `@upstash/ratelimit@^2.0.8`
Built on top of `@upstash/redis`. Implements a **Sliding Window** rate limiting algorithm. Unlike fixed windows (which can be exploited at window boundaries), sliding windows continuously track request counts over the past N seconds, providing smoother protection.

Limits in place:

| Action | Algorithm | Limit |
|---|---|---|
| Login | Sliding Window | 5 requests / 60 seconds / IP |
| Signup / Register | Sliding Window | 3 requests / 10 minutes / IP |
| Password Reset | Sliding Window | 3 requests / 5 minutes / IP |

IP extraction uses `x-forwarded-for` (set by Vercel's edge network) with fallback to `x-real-ip`.

---

### PDF Pipeline

#### `pdfjs-dist@^5.6.205` + `react-pdf@^10.4.1`
Mozilla's PDF.js rendering engine. `react-pdf` is a React wrapper around `pdfjs-dist`. Used to render PDF pages as `<canvas>` elements in the split-screen reader. The PDF worker runs in a separate browser thread (Web Worker) to avoid blocking the main UI thread during heavy rendering.

#### `pdf-parse@^2.4.5`
Server-side text extraction from PDF files. Used in the API routes to extract raw text from uploaded PDFs for translation and search. Runs only in Node.js (not Edge).

#### `pdf-lib@^1.17.1`
Client-side PDF manipulation (reading, merging, adding metadata). Used in export flows where PDF structure needs to be modified programmatically without re-rendering.

#### `jspdf@^4.2.1` + `jspdf-autotable@^5.0.7`
Client-side PDF generation. Used to export translations and notes as formatted PDF documents. `jspdf-autotable` provides table layout support for structured translation exports.

#### `html2canvas@^1.4.1`
Captures HTML DOM nodes as canvas images. Used as a fallback for PDF exports where complex scripts (Tamil, Sinhala) would not render correctly through jsPDF's built-in text renderer (which lacks complex script shaping). Renders the HTML directly using the browser's own text engine, then embeds the result as an image in the PDF.

#### `tesseract.js@^5.1.1`
Client-side OCR engine compiled to WebAssembly. Used to extract text from scanned/image-based PDF pages when `pdf-parse` returns no text content. Runs entirely in the browser — no server call or API key needed.

---

### AI

#### `@google/generative-ai@^0.24.1`
Official Google Gemini SDK. Used for:
- Word-by-word and paragraph translation (Tamil ↔ English, Sinhala ↔ English)
- AI-powered pronunciation guidance
- "Ask about this paper" chat feature in the research paper reader

Requests are made from **API routes** (`/api/translate`) rather than directly from the client, keeping the API key server-side only.

---

### Export Utilities

#### `xlsx@^0.18.5`
Generates `.xlsx` Excel files for vocabulary (Word Pool) exports. Supports cell formatting, multiple sheets, and proper UTF-8 encoding for Tamil/Sinhala characters.

#### `docx@^9.6.1`
Generates `.docx` Word documents. Used for exporting annotated translations in a format compatible with standard word processors, preserving paragraph structure.

#### `file-saver@^2.0.5`
Browser-compatible file download trigger. Abstracts the `Blob` → `<a download>` pattern across different browsers. Used as the final step in all client-side export flows.

---

### Data Fetching

#### `@tanstack/react-query@^5.96.2`
Server-state management for client-side data fetching. Used for data that needs to be fetched and kept fresh on the client (e.g., lazy-loaded book notes, word pool entries). Provides caching, background refetching, and stale-while-revalidate patterns without manual `useEffect` state management.

---

### Security Utilities

#### `dompurify@^3.3.3`
XSS sanitisation for any HTML content rendered from user-generated or AI-generated data. Applied before using `dangerouslySetInnerHTML`. Strips `<script>` tags, event handlers, and malicious attributes while preserving safe markup.

#### Node.js built-in `dns/promises`
Used in `src/lib/dns.ts` for **MX record validation** at signup. Checks whether the submitted email's domain has active Mail Exchange records before creating the user account or sending any verification email. Catches fake domains (`@notadomain123.xyz`) and typos (`@gmial.com`). No third-party package required — DNS resolution is built into Node.js.

---

## Project Structure

```
src/
├── actions/
│   └── auth.ts              # All auth Server Actions (register, login, logout,
│                            # requestPasswordReset, resetPassword, verifyEmail)
├── app/
│   ├── (auth)/              # Auth route group — login/signup layout
│   │   ├── forgot-password/
│   │   ├── reset-password/
│   │   └── verify-email/
│   │       ├── page.tsx     # Token verification handler
│   │       └── pending/     # "Check your email" confirmation page
│   ├── api/
│   │   ├── translate/       # Gemini AI translation endpoint
│   │   ├── books/search/    # Google Books catalog search
│   │   ├── upload/          # Vercel Blob PDF upload handler
│   │   └── webhooks/
│   │       └── resend/      # Resend bounce event webhook receiver
│   ├── books/[id]/          # Individual book reader (split-screen PDF + translation)
│   ├── dashboard/           # Home dashboard — recent activity, stats
│   ├── library/             # Book & papers list with filters
│   ├── papers/[id]/         # Academic paper reader
│   ├── settings/            # User profile, voice, language settings
│   ├── word-pool/           # Saved vocabulary browser
│   ├── terms/               # Terms of Service static page
│   └── privacy/             # Privacy Policy static page
├── components/
│   ├── auth/                # Auth UI components (layout, forms, brand section)
│   ├── close-tab-button.tsx # Smart back button for terms/privacy pages
│   ├── submit-button.tsx    # Server Action submit button with pending state
│   └── ...                  # Feature-specific components
├── db/
│   ├── db.ts                # Drizzle + Neon database client
│   └── schema.ts            # Full table definitions (users, books, papers,
│                            # translations, paperTranslations, bookCatalog)
├── lib/
│   ├── auth.ts              # JWT token creation/verification, cookie management
│   ├── dns.ts               # MX record validation utility
│   ├── email.ts             # Resend email templates and send functions
│   └── ratelimit.ts         # Upstash rate limiter instances
├── middleware.ts             # Route protection — redirects unauthenticated users,
│                            # blocks authenticated users from auth pages
└── providers/               # React context providers (QueryClient, etc.)
```

---

## Authentication & Security

### Session Model
Sessions use **JWT tokens** stored in a **HTTP-only, Secure, SameSite=Lax cookie** named `bookbuddy-token`. The token payload contains `id`, `name`, `email`, `preferredLanguage`, and `gender`. There is no server-side session store — the JWT is self-contained and verified on every request in middleware.

### Protected Routes
`src/middleware.ts` intercepts all requests and enforces:

| Condition | Behaviour |
|---|---|
| Unauthenticated → protected route | Redirect to `/login` |
| Authenticated → `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/verify-email/*` | Redirect to `/dashboard` |
| Anyone → `/terms`, `/privacy` | Always accessible |

### Email Verification Flow
1. User registers → account created with `emailVerified: false`
2. A 32-byte random token is generated, **bcrypt-hashed**, and stored in DB with 24h expiry
3. The raw token is emailed as a link: `/verify-email?token=<raw>`
4. On link click, token is compared against all non-expired DB hashes using `bcrypt.compare()`
5. If matched: `emailVerified = true`, token cleared, user auto-logged in

### Password Reset Flow
Identical pattern to email verification but tokens expire in **1 hour** instead of 24.

---

## Database

### Schema Summary

| Table | Purpose |
|---|---|
| `users` | Core user accounts, auth tokens, preferences, email status |
| `books` | User's personal book library with PDF links and reading progress |
| `papers` | Academic papers library (same structure as books) |
| `translations` | Saved translations per book page |
| `paper_translations` | Saved translations per paper page |
| `book_catalog` | Read-only curated catalog (seeded from Google Books API) |

### Key Fields on `users`

| Column | Type | Purpose |
|---|---|---|
| `emailVerified` | `boolean` | Blocks login until verified |
| `emailBounced` | `boolean` | Set by Resend webhook on hard bounce — blocks re-registration |
| `verificationToken` | `text` | bcrypt hash of verification token |
| `resetToken` | `text` | bcrypt hash of reset token |
| `preferredLanguage` | `varchar` | `'Tamil'` or `'Sinhala'` — drives translation direction |
| `voiceName` | `varchar` | Specific Web Speech API voice for TTS |

---

## Email System

All email is handled through **Resend** in `src/lib/email.ts`. Templates are HTML strings with inline CSS (for maximum email client compatibility).

### Bounce Protection
When Resend detects a **hard bounce** (email address does not exist at the destination mail server), it fires an `email.bounced` webhook event to `/api/webhooks/resend`. The handler:
1. Verifies the payload signature using `svix`
2. Checks `data.bounce.type === 'hard'` (ignores soft bounces which are temporary)
3. Sets `emailBounced = true` on the user record

On the next registration attempt with that email, the `register` action checks this flag and shows an error **before** creating a new user or sending any new email.

---

## Rate Limiting & Abuse Prevention

### Layered Defence Model

```
Request arrives
      │
      ▼
[1] Upstash Rate Limit (per IP, sliding window)
      │ blocked? → return 429-style error message
      ▼
[2] MX Record Check (DNS lookup for email domain)
      │ no MX records? → return error
      ▼
[3] Bounce Flag Check (DB lookup)
      │ previously bounced? → return error
      ▼
[4] Duplicate Email Check (DB lookup)
      │ already registered? → return error
      ▼
[5] Create account + send verification email
```

| Attack | Protection |
|---|---|
| Brute force login | Blocked after 5 attempts / min per IP |
| Spam signups | Blocked after 3 attempts / 10 min per IP |
| Password reset spam | Blocked after 3 attempts / 5 min per IP |
| Fake email domains | MX check blocks at signup |
| Previously bounced emails | DB bounce flag blocks re-registration |

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://...neon.tech/...

# Authentication
JWT_SECRET=your-256-bit-secret

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com
RESEND_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx

# File Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN=vercel_blob_xxxxxxxxxxxx

# AI (Google Gemini)
GEMINI_API_KEY=AIzaxxxxxxxxxxxxxxxx

# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL=https://xxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXxxxxxxxxxxxx

# App
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## Running Locally

```bash
# 1. Clone and install
git clone https://github.com/PKSaanu/BookBuddy.git
cd BookBuddy
npm install

# 2. Configure environment
cp .env.example .env.local
# Fill in all values from the Environment Variables section above

# 3. Apply database migrations
npx drizzle-kit generate
npx drizzle-kit migrate

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Note:** The `RESEND_WEBHOOK_SECRET` only works in production (Resend cannot call localhost). For local development, leave it as a placeholder — email sending and bounce handling are bypassed unless you use a tunnel like `ngrok`.
