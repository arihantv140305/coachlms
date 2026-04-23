# CoachLMS

A modern, Moodle-inspired Learning Management System for coaching institutes.

## Features (Phase 1)

- 🔐 **Authentication** — Signup, login, logout with secure session management
- 👥 **Role-Based Access** — Admin, Instructor, Student with granular permissions
- 📚 **Course Management** — Create, edit, archive courses
- 📋 **Batch Management** — Create batches with auto-generated codes
- 🎟️ **Enrollment** — Students join batches via 6-character codes
- 📊 **Dashboards** — Role-specific dashboards with stats
- 👤 **User Management** — Admin can manage users, change roles, activate/deactivate

## Tech Stack

- **Next.js 14** (App Router, Server Actions)
- **TypeScript**
- **PostgreSQL** (Supabase compatible)
- **Prisma ORM**
- **Tailwind CSS**
- **NextAuth.js v4**

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or [Supabase](https://supabase.com))

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL and NEXTAUTH_SECRET

# 3. Run database migrations
npx prisma migrate dev --name init

# 4. Seed the database
npx prisma db seed

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@coachlms.com | Admin@123 |
| Instructor | instructor@coachlms.com | Instructor@123 |
| Student | student@coachlms.com | Student@123 |

**Demo Batch Code:** `MTH25A`

## Project Structure

```
src/
├── app/             # Next.js pages and routes
├── actions/         # Server actions (business logic)
├── components/      # Reusable UI components
├── lib/             # Utilities, auth config, prisma client
└── types/           # TypeScript type definitions
```

## Deployment

### Free (Vercel + Supabase)

1. Push to GitHub
2. Deploy on [Vercel](https://vercel.com) — import from GitHub
3. Create free PostgreSQL on [Supabase](https://supabase.com)
4. Add environment variables in Vercel dashboard
5. Run `npx prisma migrate deploy` pointing to Supabase

### Environment Variables

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="openssl rand -base64 32"
```

## Roadmap

- [x] Phase 1: Auth, roles, courses, batches, enrollment
- [ ] Phase 2: Assignments, grading, materials, announcements
- [ ] Phase 3: Attendance, forums, quizzes, reports
- [ ] Future: OAuth, 2FA, fees, mobile app
