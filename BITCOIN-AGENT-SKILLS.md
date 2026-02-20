# Bitcoin Agent Skills

## Overview
Master Bitcoin infrastructure development with TypeScript. This skill set covers building AI-powered Bitcoin applications, from Lightning Network integration to RAG-powered educational agents.

---

## Core Philosophy
**"Bitcoin as Infrastructure > Bitcoin as Asset"**

- Verify, don't trust
- Cypherpunk ethos: privacy, decentralization, open sourcegigit
- Infrastructure-first mindset (not price speculation)
- Evolutive: respects whitepaper roots but embraces innovation

---

## Skill 1: Lightning Network Integration

### 1.1 Blink API Connection
Create instant Lightning invoices via HTTP API.

**Concept:**
Your app → Blink API → Lightning Invoice → User pays → Webhook confirmation

**Key Points:**
- No Bitcoin node required
- Global settlement in seconds
- Micropayments (1000 sats = ~$0.30)
- BOLT11 invoices work with any Lightning wallet

**TypeScript Pattern:**
```typescript
// POST /api/tip
// Request: { amount: number (sats), memo?: string }
// Response: { qrData: string (bolt11), paymentHash: string }

const createInvoice = async (amount: number, memo?: string) => {
  const response = await fetch('https://api.blink.sv/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.BLINK_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: `mutation LnInvoiceCreate($input: LnInvoiceCreateInput!) {
        lnInvoiceCreate(input: $input) {
          invoice { paymentRequest paymentHash }
        }
      }`,
      variables: { input: { walletId: process.env.BLINK_WALLET_ID, amount, memo } }
    })
  });
  return response.json();
};
```

**Environment Variables:**
```env
BLINK_API_KEY="blink_..."      # From dashboard.blink.sv
BLINK_WALLET_ID="..."          # Your wallet ID
```

### 1.2 QR Code Display
Render invoices for mobile wallet scanning.

**Concept:**
Convert BOLT11 string → QR Code → User scans with Wallet of Satoshi/Phoenix/etc.

**Implementation:**
```typescript
import { QRCodeSVG } from 'qrcode.react';

// In your component
<QRCodeSVG 
  value={invoice.paymentRequest} 
  size={256}
  bgColor="#0a0a0a"
  fgColor="#F7931A"  // Bitcoin orange
/>
```

### 1.3 Payment Verification
Poll for payment status or use webhooks.

**Polling Pattern:**
```typescript
const checkPayment = async (paymentHash: string) => {
  const res = await fetch('/api/tip/status', {
    method: 'POST',
    body: JSON.stringify({ paymentHash })
  });
  return res.json(); // { status: 'PENDING' | 'PAID' | 'EXPIRED' }
};

// Poll every 2 seconds
useEffect(() => {
  if (!paymentHash) return;
  const interval = setInterval(async () => {
    const status = await checkPayment(paymentHash);
    if (status === 'PAID') {
      setPaid(true);
      clearInterval(interval);
    }
  }, 2000);
  return () => clearInterval(interval);
}, [paymentHash]);
```

---

## Skill 2: AI Chat with RAG

### 2.1 RAG Architecture
**RAG = Retrieval Augmented Generation**

**Flow:**
1. User asks question
2. Search vector database (Satoshi's whitepaper chunks)
3. Inject relevant context into AI prompt
4. Groq LLM generates sourced answer
5. Stream response to UI

**Why RAG for Bitcoin?**
- Prevents AI hallucinations about protocol details
- Grounds answers in Satoshi's actual words
- Can cite specific whitepaper sections
- Evolves: add BIPs, LND docs, your tutorials

### 2.2 Vector Search Setup
Using Upstash Vector for semantic search.

**Concept:**
Whitepaper text → Chunks → Embeddings (BGE_SMALL) → Vector DB → Similarity search

**Search Implementation:**
```typescript
// src/lib/vector/search.ts
import { Index } from '@upstash/vector';

const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN
});

export async function searchWhitepaper(query: string, topK: number = 3) {
  // BGE_SMALL embeddings via Upstash
  const results = await index.query({
    data: query,      // Auto-embeds with BGE_SMALL
    topK,
    includeMetadata: true
  });
  
  return results.map(r => ({
    text: r.metadata.text,
    score: r.score,
    source: r.metadata.source
  }));
}
```

### 2.3 Groq Streaming Chat
Fast inference with Llama 3.3 70B.

**API Route:**
```typescript
// src/app/api/chat/route.ts
import { Groq } from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  // 1. Get last user message
  const lastMessage = messages[messages.length - 1].content;
  
  // 2. Search whitepaper
  const context = await searchWhitepaper(lastMessage);
  
  // 3. Build system prompt with context
  const systemPrompt = `You are Bitcoin Agent, a geeky cypherpunk educator.
  
CONTEXT FROM SATOSHI'S WHITEPAPER:
${context.map(c => `[${c.source}]: ${c.text}`).join('\\n')}

RULES:
- Answer using ONLY the provided context
- 
- Use emojis (⚡🧙‍♂️🚀) and gaming/sci-fi analogies
- Never speculate on price, only infrastructure`;

  // 4. Stream response
  const stream = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages
    ],
    stream: true
  });
  
  return new Response(stream.toReadableStream(), {
    headers: { 'Content-Type': 'text/event-stream' }
  });
}
```

### 2.4 Geek Personality Prompt
Maintain cypherpunk tone across all interactions.

**System Prompt Template:**
```
You are Bitcoin Agent ⚡🧙‍♂️

IDENTITY:
- Geek/cypherpunk educator
- Infrastructure maximalist (not price)
- Satoshi respecter, innovation embracer

TONE:
- Precise but never boring
- Analogies: gaming, sci-fi, pop culture
- Emojis welcome: ⚡🔥🚀🛡️
- Catchphrases: "Don't trust, verify", "Infrastructure first"

CONSTRAINTS:
- Ground all claims in provided context
- Admit when something is beyond whitepaper scope
- Never give financial advice
- Celebrate decentralization wins

EXAMPLE RESPONSES:
User: "What is Bitcoin?"
Agent: "Bitcoin is a peer-to-peer electronic cash system ⚡ Think of it as digital gold that can teleport—no banks, no borders, just math and cryptography securing a shared ledger. Satoshi's genius was solving the double-spend problem without a central server."
```

---

## Skill 3: Terminal Hacker UI

### 3.1 Visual Identity
Aesthetic: Dark terminal with Bitcoin orange accents.

**Color Palette:**
```css
--terminal-black: #0a0a0a;    /* Background */
--terminal-green: #00ff41;    /* Code, prompts */
--btc-orange: #F7931A;        /* Bitcoin elements, CTAs */
--terminal-amber: #ffb000;    /* Warnings, highlights */
--terminal-gray: #2a2a2a;     /* Cards, containers */
```

**Typography:**
- Mono: JetBrains Mono (code, terminal text)
- Sans: Inter (UI elements)

### 3.2 Animated Components
Framer Motion for flowing block animations.

**Bitcoin Flow Visualization:**
```typescript
// Animated blocks representing transactions
const BitcoinFlow = () => (
  <motion.div
    animate={{ x: [0, 100, 0] }}
    transition={{ repeat: Infinity, duration: 3 }}
    className="w-4 h-4 bg-[#F7931A] rounded-sm"
  />
);
```

### 3.3 Terminal Window Component
Reusable terminal UI for chat interface.

**Structure:**
```typescript
interface TerminalWindowProps {
  title: string;
  children: React.ReactNode;
  showHeader?: boolean;
}

const TerminalWindow = ({ title, children }: TerminalWindowProps) => (
  <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg overflow-hidden">
    <div className="bg-[#2a2a2a] px-4 py-2 flex items-center gap-2">
      <div className="flex gap-1.5">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <div className="w-3 h-3 rounded-full bg-green-500" />
      </div>
      <span className="text-xs text-gray-400 font-mono">{title}</span>
    </div>
    <div className="p-4 font-mono text-sm">{children}</div>
  </div>
);
```

---

## Skill 4: Internationalization (i18n)

### 4.1 Next.js App Router i18n
Support English (primary) and Spanish.

**Structure:**
```
src/app/[lang]/
├── layout.tsx      # JetBrains Mono + Inter fonts
├── page.tsx        # Main landing
└── about/
    └── page.tsx    # About page
```

**Middleware:**
```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['en', 'es'];
const defaultLocale = 'en';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const pathnameIsMissingLocale = locales.every(
    locale => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );
  
  if (pathnameIsMissingLocale) {
    return NextResponse.redirect(
      new URL(`/${defaultLocale}${pathname}`, request.url)
    );
  }
}
```

### 4.2 Translation Files
JSON-based string management.

**en.json:**
```json
{
  "hero": {
    "title": "Bitcoin Agent",
    "subtitle": "AI-powered Bitcoin education",
    "cta": "Start Learning"
  },
  "chat": {
    "placeholder": "Ask about Bitcoin infrastructure...",
    "send": "Send"
  },
  "tip": {
    "title": "Support the Agent",
    "amount": "Amount (sats)",
    "generate": "Generate Invoice"
  }
}
```

**es.json:**
```json
{
  "hero": {
    "title": "Agente Bitcoin",
    "subtitle": "Educación Bitcoin con IA",
    "cta": "Comenzar"
  }
}
```

---

## Skill 5: Database & Persistence

### 5.1 Prisma Schema
PostgreSQL with Neon for serverless.

**Key Models:**
```prisma
// prisma/schema.prisma

model VisitorSession {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())
  messages  Message[]
  tips      Tip[]
}

model Message {
  id        String   @id @default(uuid())
  sessionId String
  role      String   // 'user' | 'assistant'
  content   String
  createdAt DateTime @default(now())
  session   VisitorSession @relation(fields: [sessionId], references: [id])
}

model Tip {
  id           String   @id @default(uuid())
  sessionId    String
  amount       Int      // sats
  paymentHash  String   @unique
  status       String   // 'PENDING' | 'PAID' | 'EXPIRED'
  createdAt    DateTime @default(now())
  session      VisitorSession @relation(fields: [sessionId], references: [id])
}
```

### 5.2 Anonymous Sessions
Privacy-first: no accounts, just UUID sessions.

**Pattern:**
```typescript
// On first visit, create session
const sessionId = localStorage.getItem('sessionId') || crypto.randomUUID();
localStorage.setItem('sessionId', sessionId);

// Include in all API calls
fetch('/api/chat', {
  headers: { 'X-Session-ID': sessionId },
  // ...
});
```

---

## Skill 6: Deployment & DevOps

### 6.1 Environment Variables
Required for production:

```env
# Database
DATABASE_URL="postgresql://neondb_owner:...@ep-...neon.tech/neondb?sslmode=require"

# Vector DB (Upstash)
UPSTASH_VECTOR_REST_URL="https://...upstash.io"
UPSTASH_VECTOR_REST_TOKEN="..."

# AI (Groq)
GROQ_API_KEY="gsk_..."

# Lightning (Blink)
BLINK_API_KEY="blink_..."
BLINK_WALLET_ID="..."
```

### 6.2 Vercel Deployment
1. Push to GitHub
2. Import repo in Vercel
3. Add environment variables
4. Deploy with `next build`

**Edge Runtime:**
Chat API runs on Edge for low latency:
```typescript
export const runtime = 'edge';
```

---

## Skill 7: Multi-Platform Embedding

Bitcoin Agent can be embedded in any website regardless of tech stack.

### 7.1 React / Next.js

Drop-in React component with full customization.

```tsx
import { BitcoinAgent } from '@bitcoin-agent/react';

export default function Page() {
  return (
    <BitcoinAgent 
      apiKey="your-key"
      theme="dark"
      lang="en"
      features={['chat', 'tip-jar', 'price-ticker']}
    />
  );
}
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `apiKey` | `string` | required | Your Bitcoin Agent API key |
| `theme` | `'dark' \| 'light'` | `'dark'` | Visual theme |
| `lang` | `'en' \| 'es'` | `'en'` | Language |
| `features` | `string[]` | `['chat']` | Enabled features |
| `position` | `'inline' \| 'bottom-right' \| 'bottom-left'` | `'inline'` | Widget placement |
| `onTipSent` | `(amount: number) => void` | — | Callback on successful tip |

### 7.2 Web Component (Vanilla JS / Any Framework)

Zero dependencies — works with plain HTML, Vue, Svelte, WordPress, etc.

**Include the script:**
```html
<script src="https://cdn.bitcoinagent.ai/v2/bitcoin-agent.js"></script>
```

**Use the custom element:**
```html
<bitcoin-agent 
  api-key="your-key"
  theme="dark"
  lang="es"
  position="bottom-right"
/>
```

**Attributes:**
| Attribute | Values | Description |
|-----------|--------|-------------|
| `api-key` | string | Your API key |
| `theme` | `dark`, `light` | Visual theme |
| `lang` | `en`, `es` | Language |
| `position` | `inline`, `bottom-right`, `bottom-left` | Placement mode |
| `features` | comma-separated | e.g. `"chat,tip-jar,price-ticker"` |

**JavaScript API:**
```javascript
const agent = document.querySelector('bitcoin-agent');

// Listen for events
agent.addEventListener('tip-sent', (e) => {
  console.log(`User sent ${e.detail.amount} sats`);
});

// Programmatic control
agent.open();
agent.close();
agent.setLang('es');
```

### 7.3 iframe Embed (Universal)

Works everywhere — Notion, WordPress, Squarespace, static HTML.

```html
<iframe 
  src="https://embed.bitcoinagent.ai/?key=YOUR_KEY&theme=dark&lang=en"
  width="100%" 
  height="600" 
  frameborder="0"
  allow="clipboard-write"
/>
```

**Query Parameters:**
| Param | Values | Description |
|-------|--------|-------------|
| `key` | string | Your API key |
| `theme` | `dark`, `light` | Visual theme |
| `lang` | `en`, `es` | Language |
| `features` | comma-separated | Enabled features |
| `minimal` | `true`, `false` | Compact mode (chat only) |

### 7.4 Theming & Customization

All embed methods support CSS custom properties for deep theming:

```css
bitcoin-agent,
.bitcoin-agent-embed {
  --ba-bg: #0a0a0a;
  --ba-text: #e2e8f0;
  --ba-accent: #F7931A;        /* Bitcoin orange */
  --ba-accent-hover: #e8851a;
  --ba-border: #1e293b;
  --ba-radius: 16px;
  --ba-font-mono: 'JetBrains Mono', monospace;
  --ba-font-sans: 'Inter', sans-serif;
}
```

### 7.5 Feature Flags

Enable only what you need:

| Feature | Description |
|---------|-------------|
| `chat` | AI-powered Bitcoin Q&A |
| `tip-jar` | Lightning Network tipping |
| `price-ticker` | Live BTC/USD price |
| `protocol-layers` | Interactive Bitcoin layer visualization |
| `markets` | Network metrics dashboard |

**Example — chat-only widget:**
```html
<bitcoin-agent 
  api-key="your-key"
  features="chat"
  position="bottom-right"
  theme="dark"
/>
```

---

## Quick Reference: Project Commands

```bash
# Development
npm run dev          # Start dev server (localhost:3000)

# Database
npx prisma migrate dev    # Run migrations
npx prisma db seed        # Seed whitepaper chunks
npx prisma studio         # Open DB GUI

# Build
npm run build        # Production build
npm start            # Start production server
```

---

## Resources

**Documentation:**
- [Bitcoin Whitepaper](https://bitcoin.org/bitcoin.pdf)
- [Groq API Docs](https://console.groq.com/docs)
- [Blink API](https://dashboard.blink.sv)
- [Upstash Vector](https://upstash.com/docs/vector)

**Communities:**
- Bitcoin Dev Kit (BDK)
- Lightning Dev Kit (LDK)
- Chaincode Labs

---

*Built with ⚡ by ScubaPav × Hidemai × Kimi K2.5 — VisionaryAI.lat*
*Don't trust, verify. Then build.* 🛠️
