# ClinicSync — Shift Scheduling for Modern Clinics

ClinicSync is a modern, premium scheduling web application designed for clinic administrators and healthcare professionals. It provides a robust platform for generating and managing staff shifts, enabling seamless ingestion of legacy CSV schedules, and allowing professionals to claim available shifts in a beautifully designed interface.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, Server Actions)
- **Language:** TypeScript
- **Database:** PostgreSQL with [Prisma ORM](https://www.prisma.io/)
- **Authentication:** [Better Auth](https://www.better-auth.com/) (email/password)
- **Styling:** Tailwind CSS v4, [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives)
- **Testing:** Vitest, Testing Library
- **Icons:** Lucide React

## Architecture

- **App Router:** Utilizes React Server Components (RSC) to render complex UI elements on the server, resulting in faster load times and better SEO.
- **Server Actions:** All data mutations (e.g., claiming a shift, unclaiming, importing CSVs) are handled securely via Next.js Server Actions, bypassing the need for manual API routes.
- **Middleware:** Route protection via `src/middleware.ts` — unauthenticated users are redirected from protected routes; authenticated users are redirected away from the login page.
- **Component-Driven UI:** A premium, dynamic user interface built with reusable, accessible components featuring smooth micro-animations, loading skeletons, and responsive designs.

---

## Deployment (Vercel)

### 1. Database Setup

Provision a managed PostgreSQL database. Recommended providers:

| Provider                             | Notes                                                                     |
| ------------------------------------ | ------------------------------------------------------------------------- |
| **[Neon](https://neon.tech)**        | Recommended — first-party Vercel integration, built-in connection pooling |
| **[Supabase](https://supabase.com)** | Generous free tier, connection pooling via Supavisor                      |
| **[Railway](https://railway.app)**   | Simple setup, good for small projects                                     |

After provisioning, obtain your **pooled connection string** (`DATABASE_URL`) and **direct connection string** (`DIRECT_URL`).

### 2. Deploy to Vercel

1. Push your code to a GitHub/GitLab/Bitbucket repository.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Add the required environment variables (see below).
4. Deploy — Vercel will automatically run `npm run build`, which includes `prisma generate && next build`.

### 3. Environment Variables

Add these in the Vercel dashboard under **Settings → Environment Variables**:

| Variable              | Required | Description                                                              |
| --------------------- | -------- | ------------------------------------------------------------------------ |
| `DATABASE_URL`        | ✅       | Pooled PostgreSQL connection string (used at runtime)                    |
| `DIRECT_URL`          | ✅       | Direct PostgreSQL connection string (used for migrations)                |
| `BETTER_AUTH_SECRET`  | ✅       | Secret key for session signing — generate with `openssl rand -base64 32` |
| `BETTER_AUTH_URL`     | ❌       | Override for auth base URL (auto-detected on Vercel)                     |
| `NEXT_PUBLIC_APP_URL` | ❌       | Public-facing URL (auto-detected from `VERCEL_URL` if not set)           |

A template is provided in [`.env.example`](.env.example).

### 4. Database Migration

After the first deploy, run migrations via the Vercel CLI or your local machine connected to the production database:

```bash
# Option 1: Push schema directly (simpler for initial setup)
npx prisma db push

# Option 2: Run migrations (recommended for production)
npx prisma migrate deploy
```

### 5. Database Seeding (Optional)

To populate the database with sample data:

```bash
npm run seed
```

This creates:

- A default Manager account (`manager@clinic.com` / `manager123`)
- Sample staff accounts (doctors, nurses, receptionists)
- Imports `staff.csv` and `shifts.csv` with full import reports

---

## Local Development

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Docker](https://www.docker.com/) (for local PostgreSQL)
- [Git](https://git-scm.com/)

### Setup

1. **Install dependencies:**

```bash
npm install
```

2. **Start the database:**

```bash
docker compose up -d
```

Or manually:

```bash
docker run --name clinicshift-db -e POSTGRES_PASSWORD=password -e POSTGRES_USER=user -e POSTGRES_DB=clinic_scheduler -p 5432:5432 -d postgres:15
```

3. **Configure environment:**

Copy the example and fill in your local values:

```bash
cp .env.example .env
```

Example `.env` for local development:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/clinic_scheduler?schema=public"
DIRECT_URL="postgresql://user:password@localhost:5432/clinic_scheduler?schema=public"
BETTER_AUTH_SECRET="local-dev-secret-change-in-production"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. **Push database schema:**

```bash
npx prisma db push
```

5. **Seed the database:**

```bash
npm run seed
```

6. **Start the dev server:**

```bash
npm run dev
```

Open your browser to the URL shown in the terminal output.

### Default Credentials

After seeding:

| Role        | Email                              | Password     |
| ----------- | ---------------------------------- | ------------ |
| Manager     | `manager@clinic.com`               | `manager123` |
| Doctor      | `doctor1@clinic.com`               | `doctor123`  |
| Nurse       | `nurse1@clinic.com`                | `nurse123`   |
| Staff (CSV) | `marcus.whitfield@clinicmail.test` | `staff123`   |

---

## Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch
```

Tests use Prisma mocking and execute without a live database.

---

## Scripts Reference

| Script               | Description                                   |
| -------------------- | --------------------------------------------- |
| `npm run dev`        | Start development server                      |
| `npm run build`      | Generate Prisma Client + build for production |
| `npm start`          | Start production server                       |
| `npm run seed`       | Seed database with sample data                |
| `npm run lint`       | Run ESLint                                    |
| `npm test`           | Run test suite                                |
| `npm run db:migrate` | Run Prisma migrations (production)            |
| `npm run db:push`    | Push Prisma schema to database                |
