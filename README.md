# Bitcoin Agent

An AI-powered educational tool for understanding Bitcoin and Lightning Network infrastructure. Built with Next.js 14, Groq, and Upstash.

![Bitcoin Agent](https://img.shields.io/badge/Bitcoin-f7931a?style=for-the-badge&logo=bitcoin)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript)

## Features

- 🤖 **AI-Powered Chat**: Ask questions about Bitcoin protocol, Lightning Network, mining, and more
- 📚 **RAG-Enhanced Responses**: Answers powered by the Bitcoin whitepaper and technical documentation
- 🌐 **Internationalization**: Available in English and Spanish
- ⚡ **Lightning Tips**: Accepts Lightning Network donations via Blink (Cashu)
- 💻 **Terminal UI**: Hacker-style terminal interface for authentic Bitcoin aesthetic

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **AI**: Groq (Mixtral-8x7b)
- **Database**: Upstash Vector (RAG), Upstash Redis (Rate limiting & chat history)
- **ORM**: Prisma
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Upstash account (for Vector and Redis)
- Groq API key

### Environment Variables

Create a `.env.local` file:

```env
# Groq
GROQ_API_KEY=your_groq_api_key

# Upstash Vector
UPSTASH_VECTOR_REST_URL=your_vector_rest_url
UPSTASH_VECTOR_REST_TOKEN=your_vector_rest_token

# Upstash Redis
UPSTASH_REDIS_REST_URL=your_redis_rest_url
UPSTASH_REDIS_REST_TOKEN=your_redis_rest_token

# Database (for Prisma)
DATABASE_URL=your_postgres_connection_string

# Blink/Cashu (optional, for tips)
BLINK_API_KEY=your_blink_api_key
```

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed vector database with Bitcoin whitepaper
npm run db:seed

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Project Structure

```
bitcoin-agent/
├── src/
│   ├── app/
│   │   ├── [lang]/           # i18n routing (en/es)
│   │   │   ├── layout.tsx    # Root layout with fonts
│   │   │   └── page.tsx      # Main page
│   │   ├── api/              # API routes
│   │   │   ├── chat/         # Groq streaming
│   │   │   ├── rag/          # Vector search
│   │   │   └── tip/          # Lightning donations
│   │   └── globals.css
│   ├── components/
│   │   ├── hero/             # Hero section with animations
│   │   ├── chat/             # Chat interface
│   │   ├── terminal/         # Terminal window UI
│   │   ├── tip-jar/          # Lightning tip jar
│   │   └── footer/           # Footer with resources
│   ├── lib/
│   │   ├── groq/             # Groq client & prompts
│   │   ├── vector/           # Upstash Vector client
│   │   └── i18n/             # i18n config & dictionaries
│   └── types/                # TypeScript interfaces
├── prisma/
│   └── schema.prisma         # Database schema
├── scripts/
│   └── seed-whitepaper.ts    # Vector DB seeding
├── tailwind.config.ts
└── package.json
```

## API Routes

### POST /api/chat
Send a chat message and receive an AI response.

```json
{
  "messages": [
    { "role": "user", "content": "What is proof of work?" }
  ],
  "lang": "en"
}
```

### POST /api/rag
Query the vector database for relevant context.

```json
{
  "query": "How does Lightning Network work?",
  "limit": 5
}
```

### POST /api/tip
Create a Lightning Network payment request.

```json
{
  "amount": 100,
  "recipient": "your@lightning.address",
  "message": "Thanks for the help!"
}
```

## i18n

The application supports English (`en`) and Spanish (`es`). Language is automatically detected from the URL path:
- `/en` - English
- `/es` - Spanish

To add a new language:
1. Add the locale to `src/lib/i18n/config.ts`
2. Create a new JSON file in `src/lib/i18n/`
3. Add translations for all keys

## Contributing

Contributions are welcome! Please read our [contributing guidelines](CONTRIBUTING.md) first.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Disclaimer

This is an educational tool. The information provided is for educational purposes only and should not be considered financial advice.

---

Built with ⚡ for the Bitcoin community
