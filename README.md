# FactNews

A web app that analyzes news articles for credibility, bias, and misinformation risk.

## Features

- Analyze articles by URL or pasting text
- 4-pass LLM analysis (fact risk, bias, sensationalism, red flags)
- Analysis history (saved in browser)
- Copy results as markdown
- Dark/light mode
- Multi-language (English & Arabic)

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Groq API (llama-3.3-70b)
- Cheerio (web scraping)

## Deploy

```bash
vercel deploy
```

Set `GROQ_API_KEY` in environment variables.

## License

MIT
