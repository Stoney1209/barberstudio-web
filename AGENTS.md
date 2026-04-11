# AGENTS.md - BaberNew

## Tech Stack
- **Framework**: Next.js 14 (App Router) + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Styling**: Tailwind CSS
- **Auth**: Supabase Auth
- **Images**: Cloudinary
- **Email**: SMTP (configurable)

## Key Commands

```bash
# Setup
cp .env.example .env  # Configure DATABASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY
npx prisma generate   # Generate Prisma client
npx prisma db push    # Push schema to database

# Development
npm run dev           # Start dev server (port 3000)

# Database
npx prisma studio     # Open Prisma admin GUI
```

## Project Structure
- `src/app/` - Next.js App Router pages and API routes
- `prisma/schema.prisma` - Database schema (single source of truth)
- `src/lib/prisma.ts` - Prisma client singleton
- `src/lib/supabase/` - Supabase client/server/browser clients
- `src/lib/auth.ts` - Auth helpers (getUser, requireAuth)

## Important Notes
- API routes use Zod for input validation (see `src/app/api/appointments/route.ts`)
- Prisma client is a singleton in dev mode (see `src/lib/prisma.ts`)
- The schema uses PostgreSQL-specific types (`@db.Decimal`)
- Supabase Auth uses email/password signup and login
- Middleware handles session refresh (see `src/middleware.ts`)

## Env Required
- `DATABASE_URL` - PostgreSQL connection string (required)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side only)
- `CLOUDINARY_*` - Image upload (optional)
- `SMTP_*` - Email notifications (optional)

## Skills Installed

### Authentication (Supabase)
- Uses Supabase Auth with `@supabase/ssr` for SSR support
- Custom login page at `/login` with sign up/sign in
- Session management via cookies in middleware

### Database (Prisma)
- **prisma-cli**: Prisma commands (migrate, generate, studio)
- **prisma-client-api**: Database queries, CRUD, relations
- **prisma-database-setup**: Connect to databases
- **prisma-postgres**: PostgreSQL-specific setup

### Next.js
- **next-best-practices**: File conventions, RSC, async APIs, metadata
- **next-cache-components**: Next.js 16 cache directives
- **next-upgrade**: Upgrading Next.js versions
- **vercel-react-best-practices**: React performance (bundling, rendering, rerenders)

### Frontend
- **frontend-design**: Production-grade UI design
- **tailwind-css-patterns**: Tailwind CSS utilities
- **accessibility**: WCAG 2.2 audit
- **seo**: Search engine optimization

### Backend
- **backend-testing**: Jest + Supertest for APIs

### Utilities
- **context7-mcp**: Fetch library docs (auto-applied)
- **find-skills**: Discover new skills
- **typescript-advanced-types**: TypeScript type system