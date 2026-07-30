# Technical Decisions & Architecture

This document outlines the core architectural and business decisions made during the development of the ClinicShift Scheduler, along with current tradeoffs and considerations for future improvements.

## 1. Architecture Decisions

- **Next.js App Router (RSC)**:
  - _Decision_: Used the modern App Router over the legacy Pages Router.
  - _Reasoning_: React Server Components allow us to perform heavy database queries (like computing weekly shift availability) entirely on the server without shipping unnecessary JavaScript to the client. This results in an incredibly fast and lightweight premium UI.
- **Server Actions**:
  - _Decision_: Eliminated traditional REST API routes (`/api/...`) in favor of Next.js Server Actions.
  - _Reasoning_: Server Actions provide end-to-end type safety with TypeScript, natively integrate with HTML forms (and progressive enhancement), and significantly reduce boilerplate code for mutations such as claiming shifts.
- **Prisma ORM**:
  - _Decision_: Chosen as the primary database abstraction layer.
  - _Reasoning_: Generates fully typed clients based on a single schema file. It allowed us to rapidly iterate on relationships between Users, Shifts, Requirements, and Claims.

## 2. Business Rule Decisions

- **Shift Claims & Capacity**:
  - _Decision_: Shift capacities are mapped using a `ShiftRequirement` relation rather than hardcoded columns.
  - _Reasoning_: A clinic may require 2 Nurses and 1 Doctor for a single shift. When a user attempts to claim a shift, the server verifies their specific profession against the unmet capacity for that profession, preventing overstaffing.
- **Overlap Prevention**:
  - _Decision_: Staff cannot claim multiple shifts that overlap in time.
  - _Reasoning_: Prevents accidental double-booking. Enforced strictly at the database logic level inside the `claimShift` Server Action.
- **Handling Existing Claims on Shift Edits**:
  - _Decision_: When a manager edits a shift's time or reduces its required capacity, the system re-validates all existing claims sequentially based on claim time. If a user's claim now overlaps with another shift they have, or exceeds the newly reduced quota, their claim on the edited shift is immediately deleted.
  - _Reasoning_: This ensures the database always reflects a legal state without blocking the manager from updating critical schedule details. The oldest claims (first-come) are preserved over newer claims when reducing capacity.

## 3. CSV Ingestion Decisions

- **Modular Importer Service**:
  - _Decision_: Developed an independent Node.js module specifically for CSV parsing (`src/services/importer`).
  - _Reasoning_: Parsing staff and shift CSVs is complex. By isolating this logic, it can be executed both via the Next.js application (manager uploads) and via terminal scripts (e.g., `npm run seed`).
- **Fault-Tolerant Processing**:
  - _Decision_: The importer does _not_ crash upon encountering an invalid row.
  - _Reasoning_: Real-world legacy CSVs are messy. The system processes the entire file in memory, generating detailed telemetry (Accepted, Rejected, Merged) and storing an `ImportReport` in the database. Managers can view exactly which rows failed and why.
- **Overnight Shift Handling**:
  - _Decision_: Automatically detects overnight shifts.
  - _Reasoning_: If a CSV defines a shift starting at `22:00` and ending at `06:00` on the same date string, the system automatically rolls the end time over to the next calendar day.

## 4. Concurrency Decisions

- **Database Transactions**:
  - _Decision_: Shift claim operations use Prisma `$transaction` blocks where possible to check constraints (e.g., is the shift already full?) and insert the claim sequentially.
  - _Reasoning_: Prevents race conditions where two users attempt to claim the final available slot simultaneously.
  - _Tradeoff_: For ultra-high concurrency environments, we might eventually need database-level advisory locks or a `WHERE count < capacity` constraint on the SQL update. Currently, Prisma's standard transaction isolation handles basic scenarios.

## 5. Tradeoffs

- **Database Mocking for Tests**:
  - Using `vitest-mock-extended` allows integration tests to run instantly without tearing down a live database. However, this means we miss out on raw PostgreSQL constraint errors (like foreign key violations) during testing. We accept this tradeoff for faster developer velocity, relying on staging environments for final constraint checks.
- **Authentication**:
  - _Decision_: Adopted `better-auth` as our primary authentication system, backed by the Prisma schema (`User`, `Account`, `Session`).
  - _Reasoning_: Provides a secure, scalable, and fully typed authentication flow out of the box, fulfilling the requirement for distinct login credentials and protecting manager routes robustly.

## 6. Future Improvements

- **Real-time WebSockets**: Integrate Socket.io or Supabase Realtime to push live updates to the staff dashboard when shifts are added or claimed by others, preventing the need for manual refreshes.
- **Timezone Support**: Currently, shifts are assumed to be in a localized or UTC timezone. Implementing robust timezone handling via `date-fns-tz` will be critical if the platform expands to support clinics globally.
- **Advanced Manager Reporting**: Add graphical charts (e.g., using Recharts) to visualize staffing shortages over the month.

## 7. Deployment Instructions

To deploy ClinicShift to a production environment:

1. **Database Hosting**: Set up a PostgreSQL instance (e.g., Neon, Supabase, AWS RDS). Retrieve your connection string.
2. **Environment Configuration**: Set the `DATABASE_URL` environment variable on your hosting provider.
3. **Application Hosting (Vercel recommended)**:
   - Connect your GitHub repository to Vercel.
   - Vercel will automatically detect the Next.js framework.
   - **Important**: Modify the build command in Vercel to: `npx prisma generate && npx prisma db push && next build`. This ensures the database schema is synchronized before the app builds.
4. **Initial Data Seeding**: Once deployed, you can trigger a one-time seed via a secure API route or by connecting remotely and running `npm run seed` against the production database URL.
