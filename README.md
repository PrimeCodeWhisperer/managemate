# ManageMate

> ManageMate is a workforce scheduling and operations dashboard built on Next.js&nbsp;14, Supabase, and shadcn/ui. It helps operations teams turn employee availability into coverage, track outstanding shifts, and close the loop on timesheets and leave requests.

## Table of Contents
- [Feature Highlights](#feature-highlights)
- [Architecture at a Glance](#architecture-at-a-glance)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Install & Run](#install--run)
- [Supabase Schema & Migrations](#supabase-schema--migrations)
- [Core Workflows](#core-workflows)
- [Project Layout](#project-layout)
- [Tooling & Scripts](#tooling--scripts)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Feature Highlights
- Auto-scheduler uses employee availability, configurable time spans, and linear programming (via `javascript-lp-solver`) to generate balanced weekly coverage and surface open shifts or gaps in real time.
- Manual scheduling controls let admins add, edit, or delete shifts, override daily coverage targets, and publish drafts to Supabase (`upcoming_shifts`, `open_shifts`, `week_shifts`) when ready.
- Dashboard widgets track pending employee approvals, open shifts, availability submissions, and vacation requests with live Supabase channel updates.
- Employee onboarding flows create Supabase auth users, notify them via email (nodemailer + Gmail SMTP), and manage pending/active staff from a single table.
- Timesheet views aggregate hours from `past_shifts`, roll up monthly summaries, and drill into per-employee history.
- Vacation request management approves, rejects, or amends requests stored in `vacations_requests`, keeping admins and staff aligned.
- Responsive, theme-aware UI powered by shadcn/ui, Tailwind CSS, and lucide icons with persistent sidebar state stored via Zustand.

## Architecture at a Glance
- **Next.js 14 (App Router)** for server-side rendering, API routes, and routing.
- **Supabase** handles authentication, row-level security, Postgres storage, and real-time channels used across dashboards.
- **javascript-lp-solver** powers the auto-scheduling engine with fairness weighting and gap detection.
- **shadcn/ui + Tailwind CSS** supply a consistent design system with dark mode toggled through `next-themes`.
- **Zustand stores + React context** coordinate sidebar state, availability caches, settings, and Supabase-derived data.
- **Nodemailer** integrates Gmail SMTP for contact form submissions and one-time password onboarding emails.

## Getting Started

### Prerequisites
- Node.js 18.17+ and npm (or pnpm/bon/yarn) installed locally.
- A Supabase project or a local Supabase CLI instance with access to the Postgres database.
- Gmail account (or SMTP provider) with an app-specific password if you plan to send onboarding/contact emails.

### Environment Variables
Create a `.env.local` file in the project root with the following values:

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client-side anonymous key. |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key used in server actions and API routes (keep private). |
| `NEXT_PUBLIC_APP_URL` | Base URL used in client-side links (defaults to `http://localhost:3000`). |
| `APP_URL` | Server-side variant used for metadata and email links. |
| `GMAIL_USERNAME` | Gmail address used for SMTP (or your SMTP username). |
| `GMAIL_PASSWORD` | App-specific password or SMTP credential. |

> Tip: When developing locally you can point both `APP_URL` and `NEXT_PUBLIC_APP_URL` to `http://localhost:3000`. For production, set them to your deployed domain.

### Install & Run
1. Clone the repository and install dependencies:
   ```bash
   git clone <your-repo-url>
   cd mangemate-beta01
   npm install
   ```
2. (Optional) Start Supabase locally or ensure your remote project is reachable:
   ```bash
   # Requires the Supabase CLI
   supabase start
   supabase db reset
   ```
3. Apply migrations (see [Supabase Schema & Migrations](#supabase-schema--migrations)) so required tables exist.
4. Launch the app:
   ```bash
   npm run dev
   ```
5. Navigate to `http://localhost:3000` and sign in with an admin Supabase user to access the dashboard routes.

## Supabase Schema & Migrations
- SQL migrations live in `supabase/migrations`. The included migration creates the `auto_schedule_settings` table used by the scheduling defaults screen.
- The application additionally expects the following tables, which can be created through Supabase Studio or your own migrations:
  - `profiles`: canonical user profile data (extends Supabase auth users with role metadata).
  - `time_spans`: named shift windows (e.g., Morning, Midday, Closing) with `start_time` / `end_time`.
  - `availabilities`: weekly availability JSON keyed by weekday, associated with `employee_id`.
  - `auto_schedule_settings`: per-instance defaults such as `default_per_day`.
  - `upcoming_shifts`, `open_shifts`, `week_shifts`: storage for published schedules and outstanding open slots.
  - `past_shifts`: historical data used to build timesheets.
  - `vacations_requests`: pending/approved/rejected time-off requests.
- Run migrations with the Supabase CLI (`supabase db push`) or apply SQL scripts manually, then seed data as needed (employees, availability, time spans) before testing the scheduler.

## Core Workflows
- **Scheduling & Publishing**
  - Pick a target week from the Schedule view; the client fetches matching availabilities and builds placeholders.
  - Run *Auto Schedule* to generate assignments; gaps become `open` shifts while coverage converts to `auto-assigned` entries.
  - Adjust capacities per day, edit or add shifts manually, and publish when ready—this persists the week to `upcoming_shifts` and `open_shifts`.
- **Employee Onboarding**
  - Use the Employees page to invite staff. Invitations create users via Supabase Admin API and email them credentials through `api/otp/send`.
  - Pending users appear in the Pending section until they authenticate; admins can delete users if necessary.
- **Dashboard & Monitoring**
  - The dashboard surfaces total employees, open shifts, availability submission progress, and vacation request counts with live Supabase channel updates.
- **Timesheets**
  - Monthly overview aggregates `past_shifts` by employee; drill into a specific teammate to review shift-level history.
- **Vacation Management**
  - Review requests stored in `vacations_requests`, update statuses, or tweak dates directly from the admin UI.
- **Contact & Email**
  - `/api/send-email` powers the public contact form and uses nodemailer. Ensure SMTP variables are set or stub the route for development.

## Project Layout
```
.
├── public/                 # Static assets, favicons, placeholder imagery
├── screenshots/            # UI captures referenced in documentation
├── src/
│   ├── app/                # Next.js routes (marketing pages, API, authenticated areas)
│   ├── components/         # Reusable UI for admin dashboard (schedule, employees, etc.)
│   ├── contexts/           # React context providers (Supabase data, planner, settings)
│   ├── hooks/              # Zustand stores and UI helpers
│   ├── lib/                # Shared type definitions and utilities
│   └── utils/              # Supabase clients, scheduling logic, API helpers
└── supabase/
    └── migrations/         # Database migrations
```

## Tooling & Scripts
- `npm run dev` – start the Next.js development server.
- `npm run build` – build the production bundle.
- `npm run start` – run the production server.
- `npm run lint` – lint the codebase with Next.js/ESLint defaults.

## Troubleshooting
- **Auto scheduler returns an empty plan**: Confirm time spans exist, per-day capacities are > 0, and employee availability rows are seeded for the selected week.
- **Publishing fails**: Ensure the Supabase service role key is set server-side and the `upcoming_shifts`, `open_shifts`, and `week_shifts` tables are writeable by the service role.
- **Email sending errors**: Gmail requires an app-specific password when 2FA is enabled. For other providers, update the nodemailer transport in `src/app/api/send-email/route.ts`.
- **Stale employee data**: The Supabase context caches responses in `localStorage`. Call the *Clear cache* action or clear browser storage if roles or accounts change.

## License

This project is licensed under the [MIT License](LICENSE).
