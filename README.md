# FactNews — Real-time News Summarizer

A full-stack web app that delivers real-time news summaries on any topic using the **Grok API** with live web search capabilities.

## Features

- **Real-time summaries** — Search for any topic and get instant news summaries
- **Streaming responses** — Watch summaries appear progressively in real-time
- **Tone detection** — Understand coverage sentiment (neutral, mixed, or heated)
- **Live sources** — Click through to original articles
- **Responsive UI** — Works beautifully on mobile and desktop
- **Optional caching** — Reduce API calls with Upstash Redis

## Tech Stack

- **Next.js 14** — App Router, streaming, API routes
- **TypeScript** — Full type safety
- **Tailwind CSS** — Modern, responsive styling
- **Grok API** — Live web search and summarization
- **Upstash Redis** (optional) — Response caching

## Getting Started

### Prerequisites

- Node.js 18+
- A Grok API key from [console.x.ai](https://console.x.ai)
- (Optional) Upstash Redis credentials for caching

### Installation

1. Clone and install:
```bash
cd FactNews
npm install
```

2. Create `.env.local` from the example:
```bash
cp .env.local.example .env.local
```

3. Add your credentials to `.env.local`:
```bash
GROK_API_KEY=xai-your-key-here
UPSTASH_REDIS_REST_URL=https://... (optional)
UPSTASH_REDIS_REST_TOKEN=... (optional)
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Enter a news topic (e.g., "AI developments", "Bitcoin", "US elections")
2. Hit Enter or click Search
3. Watch the summary appear with:
   - **Headline** — The single most important story right now
   - **Bullets** — Key facts (animated in one by one)
   - **Tone badge** — Coverage sentiment color-coded
   - **Sources** — Clickable links to original articles

Pre-loaded category chips (Tech, Politics, Sports, etc.) make discovery easy.

## Project Structure

```
FactNews/
├── app/
│   ├── page.tsx              # Main UI
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Tailwind setup
│   └── api/
│       └── summarize/
│           └── route.ts      # POST /api/summarize
├── components/
│   ├── SearchBar.tsx         # Search input
│   ├── CategoryChips.tsx     # Category buttons
│   ├── SummaryCard.tsx       # Result display
│   └── SkeletonCard.tsx      # Loading state
├── lib/
│   ├── grok.ts               # Grok API client
│   ├── prompts.ts            # System prompt
│   ├── cache.ts              # Redis helper
│   └── cn.ts                 # Tailwind utilities
├── types/
│   └── summary.ts            # Response types
└── .env.local                # Environment variables
```

## API Route

**POST** `/api/summarize`

### Request
```json
{
  "topic": "latest AI breakthroughs"
}
```

### Response (Server-Sent Events)
```json
data: {
  "headline": "OpenAI releases GPT-5 with reasoning capabilities",
  "bullets": [
    "New model shows 40% improvement on complex tasks",
    "Training used 10x more data than previous version",
    "Beta access available to enterprise users",
    "Pricing per 1M tokens announced today"
  ],
  "bottom_line": "OpenAI's latest release marks another leap in AI capability. Enterprise customers now have access to significantly more powerful models.",
  "tone": "neutral",
  "freshness": "2 hours ago",
  "sources": [
    {"title": "OpenAI Blog", "url": "https://..."},
    {"title": "TechCrunch", "url": "https://..."},
    {"title": "The Verge", "url": "https://..."}
  ]
}
```

## Building & Deployment

### Development
```bash
npm run dev        # Local server on :3000
npm run build      # Production build
npm run lint       # Run ESLint
```

### Production (Vercel)
```bash
vercel deploy
```

Set environment variables in Vercel dashboard:
- `GROK_API_KEY`
- `UPSTASH_REDIS_REST_URL` (optional)
- `UPSTASH_REDIS_REST_TOKEN` (optional)

## Conventions

- All components are functional with typed props
- No `any` types anywhere
- Tailwind CSS for styling only
- Async/await for asynchronous code
- Error handling with graceful fallbacks
- Component size: keep under ~80 lines

## Out of Scope

- User accounts / authentication
- Saved summaries
- Email newsletter
- Multi-language support

These are solid v2 features to build on!

## License

MIT

---

Made with ❤️ as a portfolio showcase project.
