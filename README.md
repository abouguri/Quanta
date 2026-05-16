# Quanta

*Truth, measured.*

The credibility instrument for the internet. Quanta measures bias, evidence, and source reliability for any news article — and shows its work.

## Features

- Analyze articles by URL or pasted text
- Four-pass LLM review (fact risk, bias & framing, sensationalism, red flags)
- Calibrated credibility score (0–100) with explanation
- Analysis history (stored locally in the browser)
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
