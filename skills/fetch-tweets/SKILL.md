---
name: Fetch Tweets
description: Search X/Twitter for tweets about a token, keyword, username, or topic — clustered by sub-narrative with signal scoring
var: ""
tags: [research, social]
---

> **${var}** — Topic, keyword, token symbol, or Twitter username to search (e.g. `"$SOL"`, `"AI agents"`, `"@vitalikbuterin"`). Required.

Today is ${today}. Read `memory/MEMORY.md` for tracked topics and prior tweet context.

## Overview

Fetches recent tweets about `${var}` using the pre-fetched xAI cache (from `scripts/prefetch-xai.sh`). Falls back to WebSearch if no cache is available. Clusters results by sub-narrative, scores by signal, and writes a structured JSON + human-readable summary.

Requires `XAI_API_KEY` to be configured (prefetch path) or falls back to WebSearch silently.

---

## Steps

### 1. Derive slug and cache path

From `${var}`, derive:
- `slug` — lowercase, alphanumeric+dash, max 32 chars (e.g. `sol`, `ai-agents`, `vitalikbuterin`)
- `cache_path` = `.xai-cache/fetch-tweets-${slug}.json`

### 2. Fetch tweets — cache first, WebSearch fallback

**Path A — pre-fetched cache (preferred):**

Read `${cache_path}` if it exists and its modification time is within the last 6 hours.

Parse with:
```bash
jq -r '.output[] | select(.type == "message") | .content[] | select(.type == "output_text") | .text' "${cache_path}"
```

If parsing yields text with at least 3 tweet-like entries, `SOURCE=cache`. Extract each tweet's `@handle`, text, engagement counts (likes/retweets/replies), URL, and post timestamp.

**Path B — direct xAI API:** Skipped. The sandbox blocks env-var-authenticated curl.

**Path C — WebSearch fallback** (when cache is missing, stale, or empty):

Run 3 searches:
```
Search 1: site:x.com "${var}" after:${yesterday}
Search 2: "${var}" tweet OR twitter site:x.com
Search 3: "${var}" discussion OR reaction ${today}
```

From search results, extract tweet URLs of the form `https://x.com/<handle>/status/<id>`. Collect up to 20 candidates. Mark `SOURCE=websearch`. Engagement counts will be unavailable — use search rank as proxy.

If both paths yield zero results, log and stop silently — no article, no notification.

### 3. Score and deduplicate

For each tweet candidate:

Compute `signal_score`:
- From cache: `likes + 2 × retweets + replies`
- From WebSearch: rank-based proxy (rank 1 → score 20, rank N → score 20/N)

Remove:
- Replies to a parent tweet (want original posts, not reactions)
- Near-duplicates: >70% n-gram overlap with a higher-scoring tweet already selected
- Tweets older than 72 hours
- Accounts with obvious bot patterns (numeric-suffix handles with <10 followers signal, all-caps names)

Retain top 30 by signal score.

### 4. Cluster by sub-narrative

Analyze the retained tweets and group into 3–6 sub-narratives. A sub-narrative is a coherent theme, claim, or angle within the broader topic.

Examples for `$SOL`:
- "Price action / momentum" — tweets about price moves
- "Ecosystem launches" — new protocols, NFT drops
- "Criticism / FUD" — bearish takes, criticism threads
- "Dev activity" — technical updates, tooling

For each cluster:
- Name it in 2–5 words
- Count how many tweets belong to it
- Surface the top 1–2 tweets (highest signal) as exemplars

### 5. Write output files

**Structured JSON** — write to `.xai-cache/fetch-tweets-${today}.json`:
```json
{
  "var": "${var}",
  "slug": "${slug}",
  "fetched_at": "${today}",
  "source": "cache|websearch",
  "total_tweets": N,
  "clusters": [
    {
      "name": "Price action / momentum",
      "tweet_count": 8,
      "exemplars": [
        {
          "handle": "user123",
          "text": "...",
          "url": "https://x.com/user123/status/...",
          "signal_score": 1420,
          "timestamp": "2026-05-22T08:30:00Z"
        }
      ]
    }
  ]
}
```

**Human-readable summary** — write to `articles/fetch-tweets-${slug}-${today}.md`:

```markdown
# Tweet Fetch: ${var} — ${today}

**${total_tweets} tweets | ${cluster_count} sub-narratives | Source: ${source}**

---

## [Cluster 1 Name] (${count} tweets)

> **[@handle](URL):** [tweet text]
> Signal: ${score} | ${timestamp}

> **[@handle](URL):** [tweet text]
> Signal: ${score} | ${timestamp}

*Cluster vibe: [one-line summary of what this cluster is saying]*

---

## [Cluster 2 Name] (${count} tweets)
...

---

## Summary

- **Dominant narrative:** [cluster with most tweets]
- **Highest signal tweet:** [@handle](URL) — [tweet text snippet] (${score})
- **Sentiment lean:** [bullish / bearish / neutral / mixed]
- **Notable accounts:** [any verified or high-follower accounts in the set]
```

### 6. Notify

```
./notify "*Fetch Tweets: ${var} — ${today}*

${total_tweets} tweets | ${cluster_count} clusters | Source: ${source}

$(for top 2 clusters: "*${cluster_name}* (${count}): [exemplar tweet snippet]")

Dominant: ${dominant_cluster}
Highest signal: x.com/${top_handle}/status/... (${top_score})

Summary: articles/fetch-tweets-${slug}-${today}.md"
```

If zero tweets after dedup, send:
```
./notify "*Fetch Tweets: ${var} — ${today}* — no recent tweets found (${source})"
```

### 7. Log

Append to `memory/logs/${today}.md`:
```
### fetch-tweets
- Topic: ${var} (slug: ${slug})
- Source: ${source}
- Total tweets: ${total_tweets} (${cluster_count} clusters)
- Dominant narrative: ${dominant_cluster}
- JSON: .xai-cache/fetch-tweets-${today}.json
- Article: articles/fetch-tweets-${slug}-${today}.md
```

---

## Prefetch setup

To enable the cache path, add to `scripts/prefetch-xai.sh`:

```bash
# fetch-tweets prefetch
SLUG=$(echo "${FETCH_TWEETS_VAR:-}" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | cut -c1-32)
if [ -n "$XAI_API_KEY" ] && [ -n "$SLUG" ]; then
  curl -s -X POST "https://api.x.ai/v1/responses" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $XAI_API_KEY" \
    -d "{
      \"model\": \"grok-4-1-fast\",
      \"input\": [{\"role\": \"user\", \"content\": \"Search X for the latest tweets about ${FETCH_TWEETS_VAR} in the last 48 hours. Return up to 30 tweets with @handle, text, engagement counts (likes/retweets/replies), URL, and timestamp. Include a mix of popular and recent posts.\"}],
      \"tools\": [{\"type\": \"x_search\"}]
    }" > ".xai-cache/fetch-tweets-${SLUG}.json"
fi
```

Set `FETCH_TWEETS_VAR` as a GitHub Actions secret or workflow input matching `${var}`.

---

## Required secrets

| Secret | Description |
|--------|-------------|
| `XAI_API_KEY` | xAI API key — used in prefetch script only, not at runtime |

---

## Sandbox note

The sandbox blocks outbound curl with `$XAI_API_KEY` in headers. Always read from the pre-fetched `.xai-cache/fetch-tweets-${slug}.json` (written by `scripts/prefetch-xai.sh` before Claude runs) or fall back to WebSearch. Do not attempt direct curl to `api.x.ai` at runtime. The WebSearch fallback works for any topic — it just lacks engagement counts.

## Constraints

- Never `@mention` handles in notification text (Telegram ping hazard). Use `x.com/handle/status/ID` links only.
- Cluster names must be descriptive phrases, not single words.
- Do not invent engagement counts — if unavailable (WebSearch path), omit them from the summary.
- If cache is older than 6 hours, treat as stale and fall back to WebSearch.
