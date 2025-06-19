# Samstöðin Subscription System

A Next.js subscription management system for the Samstöðin media company.

## Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: Turso (SQLite) with Drizzle ORM
- **Styling**: Tailwind CSS
- **Authentication**: Google OAuth + Email/Password
- **Payments**: Askell integration
- **Hosting**: Vercel

## Key Libraries

- **@t3-oss/env-nextjs**: Type-safe environment variables
- **drizzle-orm**: Type-safe SQL database toolkit
- **iron-session**: Encrypted session management
- **@shopify/react-form**: Form state management
- **@oslojs/jwt**: JWT handling for Google OAuth
- **neverthrow**: Railway-oriented programming for error handling

## Development Commands

```bash
# Development
pnpm dev                # Start dev server with Turbopack
pnpm build              # Build for production

# Code Quality
pnpm format             # Format code with Prettier
pnpm lint               # Lint with oxlint + ESLint
pnpm tsc                # TypeScript type checking

# Database
pnpm db:generate        # Generate Drizzle migrations
pnpm db:migrate         # Apply migrations
pnpm db:push            # Push schema changes
pnpm db:studio          # Open Drizzle Studio
```

## Authentication Flow

1. **Google OAuth**: Primary authentication method
2. **Email/Password**: Direct signup for users without Google accounts
3. **Sessions**: Encrypted with iron-session, stored in cookies

## Architecture

- **App Router**: Server components by default
- **Server Actions**: Form submissions and mutations
- **Type Safety**: End-to-end with TypeScript + Drizzle + T3 Env
- **Error Handling**: Result types with neverthrow for robust error management
