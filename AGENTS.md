# AGENTS.md - BaberNew

## Tech Stack
- **Framework**: Next.js 14 (App Router) + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Styling**: Tailwind CSS
- **Auth**: Clerk
- **Images**: Cloudinary
- **Email**: SMTP (configurable)

## Key Commands

```bash
# Setup
cp .env.example .env  # Configure DATABASE_URL and other vars
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

## Important Notes
- API routes use Zod for input validation (see `src/app/api/appointments/route.ts`)
- Prisma client is a singleton in dev mode (see `src/lib/prisma.ts`)
- The schema uses PostgreSQL-specific types (`@db.Decimal`)

## Env Required
- `DATABASE_URL` - PostgreSQL connection string (required)
- `NEXT_PUBLIC_CLERK_FRONTEND_API` - Clerk config
- `CLOUDINARY_*` - Image upload (optional)
- `SMTP_*` - Email notifications (optional)

## Skills Installed

### Authentication (Clerk)
- **clerk**: Authentication router - use for any Clerk-related task
- **clerk-setup**: Adding Clerk to project
- **clerk-custom-ui**: Custom sign-in/sign-up UI
- **clerk-orgs**: Organizations (multi-tenant)
- **clerk-testing**: E2E testing for Clerk
- **clerk-webhooks**: Webhook handlers

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
- **tail wand-css-patterns**: Tailwind CSS utilities
- **accessibility**: WCAG 2.2 audit
- **seo**: Search engine optimization

### Backend
- **backend-testing**: Jest + Supertest for APIs

### Utilities
- **context7-mcp**: Fetch library docs (auto-applied)
- **find-skills**: Discover new skills
- **typescript-advanced-types**: TypeScript type system