# Bitcoin Agent - Project Map

## Overview
A Next.js-based Bitcoin education agent with AI-powered chat, internationalization (i18n), and cryptocurrency tipping functionality.

---

## Directory Structure

```
bitcoin-agent/
├── .next/                    # Next.js build output
├── .vercel/                  # Vercel deployment config
├── prisma/                   # Database ORM
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Database seeding
├── scripts/                  # Build/utility scripts
│   └── check-env.ts          # Environment validation
└── src/                      # Source code
    ├── app/                  # Next.js App Router
    ├── components/           # React components
    ├── lib/                  # Libraries & utilities
    └── types/                # TypeScript types
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        bitcoin-agent                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                     src/app (Pages)                       │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │  │
│  │  │  [lang]/    │  │  [lang]/    │  │     api/            │ │  │
│  │  │   page.tsx  │  │   about/    │  │  ├─ chat/route.ts  │ │  │
│  │  │  (Home)     │  │  page.tsx   │  │  ├─ rag/route.ts   │ │  │
│  │  │             │  │  (About)    │  │  └─ tip/route.ts    │ │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘ │  │
│  └────────────────────────────────────────────────────────────┘  │
│                              │                                    │
│                              ▼                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                    src/components                           │  │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────┐ │  │
│  │  │   chat/    │ │  economies/│ │   footer/  │ │  hero/   │ │  │
│  │  │ChatInterface│ │Circular... │ │  Footer.tsx│ │Bitcoin.. │ │  │
│  │  └────────────┘ └────────────┘ └────────────┘ │Network.. │ │  │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ └──────────┘ │  │
│  │  │  markets/  │ │protocol-   │ │ terminal/  │              │  │
│  │  │MarketSec.. │ │ layers/    │ │TerminalWin.│              │  │
│  │  │            │ │Protocol... │ │            │              │  │
│  │  └────────────┘ └────────────┘ └────────────┘              │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │                   tip-jar/                           │  │  │
│  │  │                  TipJar.tsx                          │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────┘  │
│                              │                                    │
│                              ▼                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                      src/lib                               │  │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────────────────┐ │  │
│  │  │   groq/    │ │   i18n/    │ │       vector/          │ │  │
│  │  │ client.ts  │ │ config.ts  │ │ client.ts, search.ts   │ │  │
│  │  │ prompts.ts │ │ en.json    │ │                        │ │  │
│  │  │            │ │ es.json    │ │                        │ │  │
│  │  └────────────┘ └────────────┘ └────────────────────────┘ │  │
│  └────────────────────────────────────────────────────────────┘  │
│                              │                                    │
│                              ▼                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                    External Services                        │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌────────────────────┐  │  │
│  │  │   Groq AI   │  │   Vector    │  │  Lightning Network │  │  │
│  │  │  (LLM API)  │  │  (Embeddings)│  │    (Tip Jar)       │  │  │
│  │  └─────────────┘  └─────────────┘  └────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Details

### Pages (`src/app/`)
| File | Description |
|------|-------------|
| [`[lang]/page.tsx`](bitcoin-agent/src/app/[lang]/page.tsx) | Home page with hero, chat, markets |
| [`[lang]/about/page.tsx`](bitcoin-agent/src/app/[lang]/about/page.tsx) | About page with detailed info |
| [`api/chat/route.ts`](bitcoin-agent/src/app/api/chat/route.ts) | AI chat endpoint (Groq) |
| [`api/rag/route.ts`](bitcoin-agent/src/app/api/rag/route.ts) | RAG (Retrieval-Augmented Generation) |
| [`api/tip/route.ts`](bitcoin-agent/src/app/api/tip/route.ts) | Lightning Network tips |

### Components (`src/components/`)
| Component | Description |
|-----------|-------------|
| [`chat/ChatInterface.tsx`](bitcoin-agent/src/components/chat/ChatInterface.tsx) | AI chatbot UI |
| [`economies/CircularEconomiesCarousel.tsx`](bitcoin-agent/src/components/economies/CircularEconomiesCarousel.tsx) | Bitcoin economies showcase |
| [`footer/Footer.tsx`](bitcoin-agent/src/components/footer/Footer.tsx) | Site footer |
| [`hero/BitcoinFlow.tsx`](bitcoin-agent/src/components/hero/BitcoinFlow.tsx) | Animated Bitcoin flow |
| [`hero/HeroSection.tsx`](bitcoin-agent/src/components/hero/HeroSection.tsx) | Main hero section |
| [`hero/NetworkNodes.tsx`](bitcoin-agent/src/components/hero/NetworkNodes.tsx) | Network visualization |
| [`markets/MarketSection.tsx`](bitcoin-agent/src/components/markets/MarketSection.tsx) | Market data display |
| [`protocol-layers/ProtocolLayers.tsx`](bitcoin-agent/src/components/protocol-layers/ProtocolLayers.tsx) | Bitcoin protocol layers |
| [`terminal/TerminalWindow.tsx`](bitcoin-agent/src/components/terminal/TerminalWindow.tsx) | Terminal simulator |
| [`tip-jar/TipJar.tsx`](bitcoin-agent/src/components/tip-jar/TipJar.tsx) | Lightning Network tip jar |

### Libraries (`src/lib/`)
| Library | Purpose |
|---------|---------|
| [`groq/client.ts`](bitcoin-agent/src/lib/groq/client.ts) | Groq AI API client |
| [`groq/prompts.ts`](bitcoin-agent/src/lib/groq/prompts.ts) | AI prompt templates |
| [`i18n/config.ts`](bitcoin-agent/src/lib/i18n/config.ts) | i18n configuration |
| [`i18n/en.json`](bitcoin-agent/src/lib/i18n/en.json) | English translations |
| [`i18n/es.json`](bitcoin-agent/src/lib/i18n/es.json) | Spanish translations |
| [`vector/client.ts`](bitcoin-agent/src/lib/vector/client.ts) | Vector DB client |
| [`vector/search.ts`](bitcoin-agent/src/lib/vector/search.ts) | Semantic search |

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Prisma (SQLite by default)
- **AI**: Groq (LLM)
- **Vector DB**: Embedding-based search
- **Payments**: Lightning Network (BTC)
- **i18n**: Next.js internationalization

---

## Data Flow

```
User Input → ChatInterface → API /api/chat → Groq AI → Response
                ↑                                              │
                └──────────────────────────────────────────────┘

User Tip → TipJar → API /api/tip → Lightning Network → On-chain
```
