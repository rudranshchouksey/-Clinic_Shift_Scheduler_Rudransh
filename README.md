# ClinicShift Scheduler

ClinicShift is a modern, premium scheduling web application designed for clinic administrators and healthcare professionals. It provides a robust platform for generating and managing staff shifts, enabling seamless ingestion of legacy CSV schedules, and allowing professionals to claim available shifts in a beautifully designed interface.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, Server Actions)
- **Language:** TypeScript
- **Database:** PostgreSQL with [Prisma ORM](https://www.prisma.io/)
- **Styling:** Tailwind CSS, [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives)
- **Testing:** Vitest, Testing Library
- **Authentication:** Custom session/cookie-based (Mocked/Simplified for demo purposes)
- **Icons:** Lucide React

## Architecture

- **App Router:** Utilizes the new React Server Components (RSC) to render complex UI elements on the server, resulting in faster load times and better SEO.
- **Server Actions:** All data mutations (e.g., claiming a shift, unclaiming, importing CSVs) are handled securely via Next.js Server Actions, bypassing the need for manual API routes.
- **Component-Driven UI:** A premium, dynamic user interface built with reusable, accessible components featuring smooth micro-animations, loading skeletons, and responsive designs for both desktop and mobile views.

## Setup & Local Development

### 1. Prerequisites

Ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (v18+)
- [Docker](https://www.docker.com/) (for running the local database)
- [Git](https://git-scm.com/)

### 2. Install Dependencies

Clone the repository and install the NPM packages:

```bash
npm install
```

### 3. Docker & Database Setup

We use Docker to quickly spin up a local PostgreSQL instance.

Start the database using Docker Compose (if a `docker-compose.yml` is present) or via a manual run command:

```bash
docker run --name clinicshift-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=clinicshift -p 5432:5432 -d postgres
```

Next, configure your environment variables. Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/clinicshift?schema=public"
```

Push the database schema:

```bash
npx prisma db push
```

### 4. Database Seeding & Automatic Import

The application features an automated seed script that not only creates the necessary users but also automatically imports legacy schedule data.

Run the seed command:

```bash
npm run seed
```

**What this does:**

1. Seeds a default Manager account.
2. Imports and processes `staff.csv`, seeding staff user accounts.
3. Imports and processes `shifts.csv`, mapping requirements and times.
4. Generates an Import Report inside the database for managers to review.

### 5. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Credentials

After running the seed script, you can log in with the following default accounts:

**Manager Dashboard:**

- Email: `manager@clinic.com`
- Password: `password123`

**Staff Dashboard (Example generated from staff.csv):**

- Email: `john@example.com` (or any other email in the staff CSV)
- Password: `password123`

## Testing

The project features a comprehensive test suite covering business logic, CSV parsing rules, and integration flows using Vitest. Our tests utilize Prisma mocking to execute instantaneously without a live database.

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## Deployment

Deploying ClinicShift is highly optimized for modern hosting providers like Vercel.

1. **Vercel**: Simply connect your GitHub repository to Vercel. Vercel automatically detects Next.js and configures the build settings (`npm run build`).
2. **Database**: Provision a managed PostgreSQL database (e.g., Supabase, Neon, or Railway) and set the `DATABASE_URL` environment variable in your Vercel project settings.
3. **Build Command**: Ensure your deployment runs `npx prisma generate` and `npx prisma db push` (or `migrate deploy`) during the build process to keep the schema in sync.
