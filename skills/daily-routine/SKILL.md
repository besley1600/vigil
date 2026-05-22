---
name: Daily Routine
description: Morning briefing that combines token movers, tweet roundup, paper pick, GitHub issues, and HN digest into one notification
var: ""
tags: [news]
---
> **${var}** — Area to emphasize (e.g. "crypto", "AI", "security"). If empty, covers all areas equally.

This skill is designed to run as part of a chain (see `chains:` in `vigil.yml`). When chained, prior step outputs (token-movers, paper-pick, github-issues, hn-digest) are provided in the chain context above. Use those outputs directly — do not re-run the sub-skills.

If running standalone (no chain context provided), fall back to reading each sub-skill and executing it inline:
- Read `skills/token-movers/SKILL.md` and execute its steps
- Read `skills/paper-pick/SKILL.md` and execute its steps
- Read `skills/github-issues/SKILL.md` and execute its steps
- Read `skills/hn-digest/SKILL.md` and execute its steps

Read memory/MEMORY.md for context.
Read the last 2 days of memory/logs/ to avoid repeating items.

---

## Tweet Roundup

Search X for the latest chatter across topics relevant to your interests. If `XAI_API_KEY` is set, use the X.AI API via **WebFetch** for each of the following topics (run three separate calls):

- "crypto OR bitcoin OR ethereum OR DeFi"
- "artificial intelligence OR AI agents OR LLM"
- "programming OR open source OR developer tools"

For each topic, use WebFetch to POST to `https://api.x.ai/v1/responses` with:
- Header `Authorization: Bearer <value>` — read `$XAI_API_KEY` from the environment and embed the actual value directly in the request header (do not use a shell variable reference)
- Header `Content-Type: application/json`
- Body:
```json
{
  "model": "grok-4-1-fast",
  "input": [{"role": "user", "content": "Search X for the latest popular tweets about: TOPIC from YESTERDAY to TODAY. Return the 3-5 most interesting or viral tweets. For each: @handle, a one-line summary of what they said, and the direct link (https://x.com/username/status/ID). Skip low-engagement noise."}],
  "tools": [{"type": "x_search", "from_date": "YESTERDAY", "to_date": "TODAY"}]
}
```
Replace `TOPIC`, `YESTERDAY`, and `TODAY` with actual values (yesterday's date and today's date in `YYYY-MM-DD` format).

If `XAI_API_KEY` is not set, fall back to WebSearch for each topic and summarize the top 3-5 results per topic instead.

For each topic, write 2-3 bullet points capturing the gist. Include links.

---

## Format & Send

Combine everything (chain context outputs + tweet roundup) into a single notification via `./notify` (keep under 4000 chars):

```
*Daily Routine — ${today}*

*Top 10 Winners (24h)*
1. SYMBOL: $price (+X%)
...

*Top 10 Losers (24h)*
1. SYMBOL: $price (-X%)
...

*Tweet Roundup*
*Crypto:* gist of what's happening
*AI:* gist
*Dev:* gist

*Paper of the Day*
"Title" — why you should read it [link]

*GitHub Issues*
- repo: #N title (or "No new issues")

*HN Digest*
1. [Title](url) (Xpts) — summary
   [Discuss](hn_link)
...
```

If the combined message exceeds 4000 chars, trim the HN and tweet sections first — token data and paper pick are highest priority.

## Sandbox note

The sandbox may block outbound curl. Use **WebFetch** as a fallback for any URL fetch. For auth-required APIs, use the pre-fetch/post-process pattern (see CLAUDE.md).

## Log

Log everything to memory/logs/${today}.md.
