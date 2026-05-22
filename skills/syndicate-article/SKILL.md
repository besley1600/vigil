---
name: Syndicate Article
description: Cross-post articles to Dev.to and Farcaster with hook-driven copy and click-optimized metadata
var: ""
tags: [social]
---

> **${var}** — Path to the article to syndicate (e.g. `articles/deep-research-2026-05-22.md`). If empty, picks the most recent article from `articles/` that has not yet been syndicated.

Today is ${today}. Read `memory/MEMORY.md` for canonical article URL base and active syndication targets.
Read `memory/topics/syndication.md` if it exists — it tracks which articles have already been published where.

## Overview

Reads an article from `articles/`, adapts it for Dev.to (developer blog) and Farcaster (short-form social), publishes to both via their respective APIs, and records the published URLs. Requires `DEVTO_API_KEY` and `NEYNAR_API_KEY`.

---

## Steps

### 1. Resolve article path

If `${var}` is set and the file exists, `article_path = ${var}`.

If `${var}` is empty:
- List `articles/*.md`, sorted by modification time descending
- Skip any article already in `memory/topics/syndication.md` (check for its filename)
- Pick the most recent un-syndicated article

If no un-syndicated article is found, abort:
```
### syndicate-article
- ABORTED: no un-syndicated article found in articles/
```
Stop — no notification.

### 2. Read and parse the article

Read the full article from `article_path`. Extract:
- `title` — the first `# Heading` line (strip `# ` prefix)
- `body` — everything after the first `# Heading`
- `summary` — the first paragraph (first non-blank block after the heading, ≤200 words)
- `word_count` — approximate
- `article_slug` — derived from the filename (e.g. `deep-research-2026-05-22`)

### 3. Adapt for Dev.to

Dev.to uses Markdown with front matter. Adapt:

**Tags** — derive 3–4 tags from the article title and content. Match to Dev.to's tag vocabulary:
- Research/tech articles: `ai`, `machinelearning`, `productivity`, `devops`, `opensource`, `webdev`, `javascript`, `python`, `crypto`, `blockchain`
- Keep tags lowercase, no spaces, max 4

**Canonical URL** — construct from `GITHUB_REPOSITORY`:
`https://${github_username}.github.io/vigil/articles/${article_slug}` (or the configured canonical base from MEMORY.md if present)

**Cover image** — if the article body contains an image URL (`![...](...)`), use it as the cover image. Otherwise omit.

**Dev.to article body format:**
```markdown
---
title: "${title}"
published: true
description: "${summary first sentence}"
tags: ${tags joined with comma}
canonical_url: "${canonical_url}"
cover_image: "${cover_image_url or omit}"
---

${article_body}

---
*Originally published on [Vigil](${canonical_url}).*
```

**Publish to Dev.to via WebFetch:**

```
POST https://dev.to/api/articles
api-key: DEVTO_API_KEY
Content-Type: application/json

{
  "article": {
    "title": "${title}",
    "body_markdown": "${escaped_markdown_body}",
    "published": true,
    "tags": ["${tag1}", "${tag2}", "${tag3}"],
    "canonical_url": "${canonical_url}",
    "description": "${summary_sentence}"
  }
}
```

Inline the actual `DEVTO_API_KEY` value in the WebFetch header. On success, extract `url` from the response as `devto_url`. On error, log `devto=fail` and continue to Farcaster — do not abort.

### 4. Adapt for Farcaster

Farcaster casts are short-form (max 320 characters for the text, plus an embed URL).

Write a hook-driven cast: 1–3 punchy sentences that give the reader a reason to click. Rules:
- Lead with the most interesting finding or claim, not the title
- No hashtags (not native on Farcaster)
- End with the canonical URL as an embed link
- Stay under 280 characters for the text (leaves room for the URL embed)

If soul files exist (`soul/STYLE.md`), write in the soul's voice.

**Find the right channel:**
- Default channel: `general` (cast to followers)
- If the article is about crypto/DeFi/on-chain: use channel `crypto` or `defi`
- If about AI/ML: use channel `ai`
- If about dev tools/code: use channel `dev`

**Publish to Farcaster via Neynar API:**

```
POST https://api.neynar.com/v2/farcaster/cast
api-key: NEYNAR_API_KEY
Content-Type: application/json

{
  "signer_uuid": "${NEYNAR_SIGNER_UUID}",
  "text": "${cast_text}",
  "embeds": [{"url": "${canonical_url}"}],
  "channel_id": "${channel}"
}
```

Inline the actual `NEYNAR_API_KEY` value in the WebFetch header. On success, extract `cast.hash` as `farcaster_hash` and construct `farcaster_url = https://warpcast.com/~/conversations/${farcaster_hash}`. On error, log `farcaster=fail` and continue.

If `NEYNAR_SIGNER_UUID` is not set in environment, skip Farcaster and log `farcaster=skip(no-signer)`.

### 5. Record syndication

Read `memory/topics/syndication.md` (or create if absent). Append:

```markdown
## ${title}
- **Article:** ${article_path}
- **Date:** ${today}
- **Dev.to:** ${devto_url or "FAILED"}
- **Farcaster:** ${farcaster_url or "FAILED/SKIPPED"}
- **Canonical:** ${canonical_url}
```

### 6. Log and notify

Append to `memory/logs/${today}.md`:
```
### syndicate-article
- Article: ${article_path}
- Dev.to: ${devto_url or "fail"}
- Farcaster: ${farcaster_url or "fail/skip"}
- Syndication log: memory/topics/syndication.md
```

```
./notify "*Syndicate Article — ${today}*

\"${title}\" published.

$(if devto_url): Dev.to: ${devto_url}
$(if farcaster_url): Farcaster: ${farcaster_url}
$(if any_fail): Failed: ${failed_channels}

Canonical: ${canonical_url}"
```

---

## Required secrets

Add to GitHub repo → Settings → Secrets and variables → Actions:

| Secret | Description |
|--------|-------------|
| `DEVTO_API_KEY` | Dev.to API key from dev.to/settings/extensions |
| `NEYNAR_API_KEY` | Neynar API key from neynar.com/my-account |
| `NEYNAR_SIGNER_UUID` | Neynar signer UUID for the publishing Farcaster account |

---

## Sandbox note

Both APIs require API keys in headers. Use WebFetch with the token value embedded inline for each call — do not use curl with `$DEVTO_API_KEY` or `$NEYNAR_API_KEY` in headers (that fails in the GitHub Actions sandbox). The article body must be escaped for JSON (newlines as `\n`, quotes as `\"`). If an article body is very long (>10,000 chars), truncate the Dev.to body at 8,000 characters and add `\n\n*[Read the full article on the canonical URL]*`.

## Constraints

- Never syndicate the same article twice — always check `memory/topics/syndication.md` first.
- Never publish `published: false` to Dev.to — this skill publishes immediately.
- Failure on one channel does not block the other — log the failure and continue.
- Cast text must not exceed 280 characters (excluding embed URL).
- Do not invent canonical URLs — derive them from the article filename and the configured base, or skip if unknown.
