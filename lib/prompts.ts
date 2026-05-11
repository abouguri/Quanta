export const FACT_RISK_PROMPT = `Analyze this article for factual accuracy risk. Look for:
- Unverified claims without sources
- Conflicting statements
- Quotes that seem fabricated
- Statistics without attribution
- Appeals to unnamed "experts"

Return ONLY valid JSON (no markdown):
{
  "riskScore": <0-100 where 100 = high risk of misinformation>,
  "issues": ["issue 1", "issue 2"],
  "explanation": "<1-2 sentence summary>"
}`

export const BIAS_PROMPT = `Detect editorial bias in this article. Look for:
- Loaded or inflammatory language
- One-sided coverage (missing opposing viewpoint)
- Emotional appeals instead of facts
- Selective data presentation
- Dismissive language about alternatives

Return ONLY valid JSON:
{
  "biasScore": <0-100 where 100 = high bias>,
  "biasType": "<partisan|sensationalist|alarmist|neutral>",
  "evidence": ["example 1", "example 2"],
  "explanation": "<1-2 sentence summary>"
}`

export const SENSATIONALISM_PROMPT = `Identify sensationalist/clickbait patterns:
- ALL CAPS words, multiple exclamation marks
- Emotional trigger words (shocking, unbelievable, etc.)
- Exaggeration or hyperbole
- Fear-based appeals
- Artificial urgency

Return ONLY valid JSON:
{
  "sensationalismScore": <0-100 where 100 = highly sensationalist>,
  "patterns": ["pattern 1", "pattern 2"],
  "examples": ["quote 1", "quote 2"],
  "explanation": "<1-2 sentence summary>"
}`

export const RED_FLAGS_PROMPT = `List specific credibility red flags:
- No author attribution
- No publish date
- Unknown or suspicious source
- Poor grammar/spelling
- No sources or citations
- Absence of dates for events
- Domain/URL suspicious
- Repetitive language

Return ONLY valid JSON:
{
  "flags": [
    {
      "type": "<flag type>",
      "severity": "<high|medium|low>",
      "description": "<1 sentence>"
    }
  ],
  "count": <number of flags>
}`
