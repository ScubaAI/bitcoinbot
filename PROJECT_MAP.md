# 🗺️ Bitcoin Agent — Project Map

> **Last updated:** 2026-02-20

---

## 📌 Overview

**Bitcoin Agent** is a Next.js 14 web application themed around Bitcoin's philosophy ("Don't trust, verify"). It features:

- 🤖 **AI Chat** powered by **Groq** (LLaMA 3.3 70B) with RAG over the Bitcoin Whitepaper
- 🛡️ **Digital Immune System** — middleware-level threat detection, rate limiting, PoW challenges, and ban management via Redis
- ⚡ **Lightning Network Tip Jar** — accept sats via Blink invoices
- 🌐 **i18n** — English & Spanish support
- 🔍 **Vector Search** (Upstash Vector) for semantic search over the whitepaper
- 📊 **Admin Dashboard** (`/satoshi/*`) — immune system stats, beacon monitoring

---

## 🛠️ Tech Stack

| Layer         | Technology                                   |
| ------------- | -------------------------------------------- |
| Framework     | Next.js 14 (App Router)                      |
| Language      | TypeScript 5                                 |
| Styling       | Tailwind CSS 3 + custom terminal theme       |
| AI / LLM      | Groq SDK → LLaMA 3.3 70B Versatile          |
| AI Framework  | Vercel AI SDK (`ai` v4)                      |
| Vector DB     | Upstash Vector                               |
| Cache / KV    | Upstash Redis                                |
| Database      | PostgreSQL via Prisma ORM                    |
| Animations    | Framer Motion                                |
| Charts        | Recharts                                     |
| Bitcoin       | bitcoinjs-lib, ecpair, tiny-secp256k1        |
| Icons         | Lucide React                                 |
| Fonts         | JetBrains Mono (mono), Inter (sans)          |

---

## 📁 Folder Structure

```
bitcoin-agent/
│
├── prisma/
│   ├── schema.prisma          # Database models (see Data Models section)
│   ├── seed.ts                # DB seed script
│   └── migrations/            # Prisma migration history
│
├── scripts/
│   └── check-env.ts           # Environment variable validator
│
├── src/
│   ├── middleware.ts           # 🛡️ Digital Immune System (see below)
│   ├── types/
│   │   └── index.ts           # Shared TypeScript types (SearchResult, etc.)
│   │
│   ├── lib/                   # ⚙️ Core libraries
│   │   ├── redis.ts           # Upstash Redis client
│   │   ├── groq/
│   │   │   ├── client.ts      # Groq SDK client + streamChat / chat functions
│   │   │   └── prompts.ts     # System prompts for the AI
│   │   ├── vector/
│   │   │   ├── client.ts      # Upstash Vector index client
│   │   │   └── search.ts      # Semantic search (searchWhitepaper, getContextFromSearch)
│   │   ├── i18n/
│   │   │   ├── config.ts      # i18n configuration (supported locales, default locale)
│   │   │   ├── types.ts       # Translation type definitions
│   │   │   ├── en.json        # English translations
│   │   │   └── es.json        # Spanish translations
│   │   ├── beacon/
│   │   │   └── coinbin.ts     # Coinbin / network beacon utilities
│   │   └── coinbin/
│   │       └── beacon.ts      # Bitcoin address & transaction utilities
│   │
│   ├── components/            # 🧩 React Components
│   │   ├── hero/
│   │   │   ├── HeroSection.tsx     # Main landing hero (includes HiddenMenu trigger)
│   │   │   ├── BitcoinFlow.tsx     # Animated bitcoin flow visualization
│   │   │   └── NetworkNodes.tsx    # P2P network node animation
│   │   ├── chat/
│   │   │   └── ChatInterface.tsx   # AI chat widget (Groq + RAG)
│   │   ├── navigation/
│   │   │   └── HiddenMenu.tsx      # Password-protected admin navigation
│   │   ├── terminal/
│   │   │   └── TerminalWindow.tsx  # Terminal-style display component
│   │   ├── markets/
│   │   │   └── MarketSection.tsx   # Bitcoin market data section
│   │   ├── economies/
│   │   │   └── CircularEconomiesCarousel.tsx  # Circular economies showcase
│   │   ├── protocol-layers/
│   │   │   └── ProtocolLayers.tsx  # Bitcoin protocol layer visualization
│   │   ├── tip-jar/
│   │   │   └── TipJar.tsx         # ⚡ Lightning tip jar (Blink invoices)
│   │   └── footer/
│   │       └── Footer.tsx         # Site footer
│   │
│   └── app/                   # 📄 Pages & API Routes (Next.js App Router)
│       ├── layout.tsx         # Root layout (fonts, dark mode, global CSS)
│       ├── page.tsx           # Root page (redirects → /en)
│       ├── globals.css        # Global styles + Tailwind directives
│       │
│       ├── [lang]/            # 🌐 Internationalized pages
│       │   ├── layout.tsx     # Lang layout (loads translations)
│       │   ├── page.tsx       # Home page (hero, chat, markets, etc.)
│       │   ├── providers.tsx  # Client-side providers
│       │   └── about/
│       │       └── page.tsx   # About page
│       │
│       ├── challenge/         # 🛡️ Security challenge pages
│       │   ├── layout.tsx     # Challenge layout
│       │   └── pow/
│       │       ├── layout.tsx # PoW challenge layout
│       │       └── page.tsx   # Proof-of-Work challenge page
│       │
│       ├── satoshi/           # 🔐 Admin section (API-key protected)
│       │   ├── layout.tsx     # Admin layout
│       │   ├── beacon/
│       │   │   └── native/
│       │   │       └── page.tsx           # Beacon native monitoring page
│       │   └── immune-dashboard/
│       │       └── page.tsx               # Immune system dashboard
│       │
│       └── api/               # 🔌 API Routes
│           ├── chat/
│           │   └── route.ts   # POST — AI chat (Groq streaming + RAG context)
│           ├── rag/
│           │   └── route.ts   # POST — RAG search endpoint
│           ├── tip/
│           │   └── route.ts   # POST — Create Lightning tip / invoice
│           ├── challenge/
│           │   ├── verify/
│           │   │   └── route.ts   # POST — Verify PoW challenge solution
│           │   └── bypass/
│           │       └── route.ts   # POST — Challenge bypass (accessibility)
│           └── satoshi/
│               └── immune/        # 🛡️ Immune System Admin API
│                   ├── stats/
│                   │   └── route.ts   # GET — System stats
│                   ├── threats/
│                   │   └── route.ts   # GET — Recent threats
│                   ├── bans/
│                   │   └── route.ts   # GET — Active bans
│                   ├── unban/
│                   │   └── route.ts   # POST — Unban an IP
│                   ├── bypasses/
│                   │   └── route.ts   # GET — Bypass attempts
│                   └── config/
│                       └── route.ts   # GET/PUT — Immune system config
│
├── next.config.js             # Next.js configuration
├── tailwind.config.ts         # Tailwind theme (terminal colors, fonts)
├── tsconfig.json              # TypeScript config
├── postcss.config.js          # PostCSS config
├── package.json               # Dependencies & scripts
├── .env / .env.local          # Environment variables
└── BITCOIN-AGENT-SKILLS.md    # Agent capabilities documentation
```

---

## 🗄️ Data Models (Prisma)

| Model             | Purpose                                             |
| ----------------- | --------------------------------------------------- |
| `VisitorSession`  | Anonymous visitor session (links messages, tips, logs) |
| `Message`         | Chat messages (user / assistant / system)           |
| `Tip`             | Lightning Network tips/donations (Blink invoices)   |
| `ImmuneLog`       | Immune system threat detection audit log            |
| `BypassAttempt`   | Records of challenge bypass requests                |
| `BannedNode`      | Persistently banned IPs (with expiry & history)     |
| `AccessToken`     | PoW / bypass access tokens                          |
| `Feedback`        | User feedback (positive, negative, suggestion, bug) |

### Enums
- `MessageRole`: `user` | `assistant` | `system`
- `TipStatus`: `PENDING` | `SETTLED` | `FAILED` | `EXPIRED` | `CANCELLED`
- `FeedbackType`: `POSITIVE` | `NEGATIVE` | `SUGGESTION` | `BUG`

---

## 🛡️ Middleware — Digital Immune System

The middleware (`src/middleware.ts`) runs on every request and implements:

1. **Ban Check** — Looks up IP in Redis banlist
2. **Threat Analysis** — Scans URL, user-agent, and request body against signature patterns:
   - Prompt Injection, Address Poisoning, Path Traversal, SQL Injection, XSS
3. **Immune Response** — High threat → ban; medium threat → redirect to PoW challenge
4. **Rate Limiting** — Tiered rate limits via Redis (public / node / miner / satoshi)
5. **Audit Logging** — Logs threats to Redis for dashboard visibility

### Rate Limit Tiers

| Tier     | Requests/min | Access                     |
| -------- | ------------ | -------------------------- |
| public   | 20           | Default                    |
| node     | 60           | Registered nodes           |
| miner    | 120          | Verified miners            |
| satoshi  | 300          | Admin (requires API key)   |

---

## 🔌 API Routes Summary

| Route                              | Method | Description                          |
| ---------------------------------- | ------ | ------------------------------------ |
| `/api/chat`                        | POST   | AI chat (Groq + RAG streaming)       |
| `/api/rag`                         | POST   | Semantic search over whitepaper      |
| `/api/tip`                         | POST   | Create Lightning invoice             |
| `/api/challenge/verify`            | POST   | Verify PoW solution                  |
| `/api/challenge/bypass`            | POST   | Request challenge bypass             |
| `/api/satoshi/immune/stats`        | GET    | Immune system statistics             |
| `/api/satoshi/immune/threats`      | GET    | Recent threat detections             |
| `/api/satoshi/immune/bans`         | GET    | Active IP bans                       |
| `/api/satoshi/immune/unban`        | POST   | Remove an IP ban                     |
| `/api/satoshi/immune/bypasses`     | GET    | Bypass attempt history               |
| `/api/satoshi/immune/config`       | GET/PUT| Read/update immune config            |

---

## 📄 Pages Summary

| Route                         | Description                                    |
| ----------------------------- | ---------------------------------------------- |
| `/`                           | Redirects to `/en`                             |
| `/[lang]`                     | Home page (hero, chat, markets, economies, etc.) |
| `/[lang]/about`               | About page                                     |
| `/challenge/pow`              | Proof-of-Work challenge (threat mitigation)    |
| `/satoshi/beacon/native`      | Beacon network monitoring (admin)              |
| `/satoshi/immune-dashboard`   | Immune system dashboard (admin)                |

---

## 🧩 Component Map

```
Home Page (/[lang])
├── HeroSection          — Landing hero + HiddenMenu trigger
│   ├── BitcoinFlow      — Animated BTC flow
│   ├── NetworkNodes     — P2P node visualization
│   └── HiddenMenu       — Password-protected admin nav
├── ChatInterface        — AI chat widget
├── MarketSection        — Live market data
├── CircularEconomiesCarousel — Circular economies
├── ProtocolLayers       — Protocol layer breakdown
├── TipJar               — ⚡ Lightning tip jar
└── Footer               — Site footer
```

---

## ⚙️ NPM Scripts

| Script       | Command                                    |
| ------------ | ------------------------------------------ |
| `dev`        | `next dev`                                 |
| `build`      | `prisma generate && next build`            |
| `start`      | `next start`                               |
| `lint`       | `next lint`                                |
| `db:push`    | `prisma db push`                           |
| `db:seed`    | `tsx scripts/seed-whitepaper.ts`           |
| `check-env`  | `tsx scripts/check-env.ts`                 |

---

## 🔑 Key Environment Variables

| Variable                     | Service        |
| ---------------------------- | -------------- |
| `DATABASE_URL`               | PostgreSQL     |
| `GROQ_API_KEY`               | Groq AI        |
| `UPSTASH_REDIS_REST_URL`     | Upstash Redis  |
| `UPSTASH_REDIS_REST_TOKEN`   | Upstash Redis  |
| `UPSTASH_VECTOR_REST_URL`    | Upstash Vector |
| `UPSTASH_VECTOR_REST_TOKEN`  | Upstash Vector |
| `ADMIN_API_KEY`              | Admin routes   |
