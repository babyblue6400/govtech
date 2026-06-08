# GovTech — Citizen Service Requests & Fees

Here, it's Abhay who has made the changes

## Tech Stack
- **Frontend/Backend**: Next.js 14+ (App Router, TypeScript)
- **Database**: Supabase (PostgreSQL)
- **ORM**: Prisma 6
- **Auth**: Custom JWT (Access + Refresh tokens)
- **Styling**: Tailwind CSS

## Prerequisites
- Node.js 20.19+
- A Supabase project (free tier works)

## Setup

### 1. Clone & install
```bash
git clone <your-repo-url>
cd govtech
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```
Fill in `.env`:
- `DATABASE_URL` — from Supabase: Dashboard → Project → Settings → Database → URI
- `JWT_ACCESS_SECRET` — random 64-byte hex string
- `JWT_REFRESH_SECRET` — random 64-byte hex string

Generate secrets quickly:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Generate Prisma client
```bash
npm run db:generate
```

### 4. Run migrations (after schema is ready — Phase 1-02)
```bash
npm run db:migrate
```

### 5. Start dev server
```bash
npm run dev
```
App: http://localhost:3000  
Health check: http://localhost:3000/api/health

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Supabase PostgreSQL connection URI |
| `JWT_ACCESS_SECRET` | Secret for signing access tokens (TTL: 15min) |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens (TTL: 7 days) |
| `NEXT_PUBLIC_APP_URL` | App base URL |

## Evidence
See [Evidence.md](./Evidence.md)