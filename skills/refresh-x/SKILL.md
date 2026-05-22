---
name: Refresh X
description: Fetch a tracked X/Twitter account's latest tweets, cluster them by theme, and save a decision-ready gist to memory — notifies only on meaningful theme shifts
var: ""
tags: [social]
---

> **${var}** — Twitter username to track, without the `@` (e.g. `vitalikbuterin`, `naval`, `pmarca`). Required.

Today is ${today}. Read `memory/MEMORY.md` for prior tracked accounts and recent context.

## Overview

Fetches the last 20 tweets from `${var}` using the pre-fetched xAI cache (from `scripts/prefetch-xai.sh`). Falls back to WebSearch for public tweets. Clusters by theme, diffs against the prior gist in `memory/topics/x-${var}.md`, and writes a fresh gist. Notifies only if there is a significant shift in themes since the last run.

Requires `XAI_API_KEY` (prefetch path) or falls back to WebSearch.

---

## Steps

### 1. Validate input

If `${var}` is empty, abort. Log:
```
### refresh-x
- ABORTED: ${var} is empty — provide a Twitter username
```
Stop.

### 2. Load prior gist (for diff)

Read `memory/topics/x-${var}.md` if it exists. Extract:
- `last_updated` date
- `top_themes` list (from the prior run's cluster names)
- `dominant_theme` (the theme with the most tweets last run)

If the file doesn't exist, this is the first run — set `FIRST_RUN=true`, `prior_themes=[]`.

### 3. Fetch latest tweets — cache first, WebSearch fallback

**Path A — pre-fetched cache (preferred):**

Read `.xai-cache/refresh-x-${var}.json` if it exists and is within 6 hours.

Parse with:
```bash
jq -r '.output[] | select(.type == "message") | .content[] | select(.type == "output_text") | .text' ".xai-cache/refresh-x-${var}.json"
```

If parsing yields at least 5 tweet-like entries, `SOURCE=cache`. Extract each tweet's text, timestamp, URL, and engagement (likes/retweets/replies).

**Path B — WebSearch fallback:**

```
Search 1: site:x.com/${var} after:${seven_days_ago}
Search 2: from:${var} tweet ${today_year}
Search 3: twitter.com/${var} latest posts
```

Extract up to 20 tweet candidates. `SOURCE=websearch`. Engagement counts unavailable.

If both paths yield fewer than 3 tweets, log and stop silently — no gist update, no notification.

### 4. Cluster by theme

Analyze the fetched tweets and group into 3–6 themes. A theme is a coherent subject, stance, or activity pattern in the account's recent posting.

For each theme:
- Name it in 2–4 words
- Count tweet membership
- List the 1–2 best representative tweet excerpts (first 120 chars)
- Estimate posting frequency: `high` (≥5 tweets), `medium` (2–4), `low` (1)

Also note:
- **Posting cadence** — roughly how many tweets per day in this batch
- **Tone** — one of: analytical / personal / promotional / reactive / exploratory
- **Notable engagement** — any tweet with an unusually high signal score (2× the batch average)

### 5. Diff against prior gist

Compare current theme list to `prior_themes`:

- **New themes** — themes present now but not in the prior gist (first run or newly emerged)
- **Dropped themes** — themes in the prior gist but absent now
- **Dominant shift** — if the dominant theme changed

`SIGNIFICANT_SHIFT = true` if any of:
- 2+ new themes appeared
- Dominant theme changed
- 2+ prior themes dropped
- This is `FIRST_RUN`

### 6. Write gist to memory

Write `memory/topics/x-${var}.md` (overwrite):

```markdown
# X Profile: @${var}
*Last updated: ${today} | Source: ${source} | Tweets analyzed: ${count}*

## Active Themes

### [Theme 1 Name] — ${frequency} frequency
[2–3 sentence description of what they're saying on this theme]

> "[Representative tweet excerpt]" — [URL]

### [Theme 2 Name] — ${frequency} frequency
...

## Meta

- **Posting cadence:** ~${tweets_per_day} tweets/day
- **Dominant tone:** ${tone}
- **Dominant theme:** ${top_theme}
- **Highest signal tweet:** "[excerpt]" — [URL] (signal: ${score})

## Theme Diff vs Prior Run
- New: ${new_themes or "none"}
- Dropped: ${dropped_themes or "none"}
- Shift: ${significant_shift}

## History
- ${prior_date}: dominant theme was "${prior_dominant}"
- ${today}: dominant theme is "${current_dominant}"
```

### 7. Notify

**If `SIGNIFICANT_SHIFT == false` and `FIRST_RUN == false`:** skip notification. Log only:
```
### refresh-x
- Account: ${var} — no significant theme shift since ${prior_date}
- Gist updated: memory/topics/x-${var}.md
```
Stop.

**If `SIGNIFICANT_SHIFT == true` or `FIRST_RUN == true`:**

```
./notify "*Refresh X: @${var} — ${today}*

$(if FIRST_RUN): First gist captured.
$(if significant_shift): Theme shift detected.

Themes: $(cluster names joined with " | ")
Dominant: ${top_theme}

$(if new_themes): New: ${new_themes}
$(if dropped_themes): Dropped: ${dropped_themes}

Top tweet: [excerpt] — [URL]

Gist: memory/topics/x-${var}.md"
```

### 8. Log

Append to `memory/logs/${today}.md`:
```
### refresh-x
- Account: ${var}
- Source: ${source}
- Tweets: ${count} | Themes: ${cluster_count}
- Dominant: ${top_theme}
- Shift: ${significant_shift}
- Gist: memory/topics/x-${var}.md
```

---

## Prefetch setup

Add to `scripts/prefetch-xai.sh` for each tracked account:

```bash
# refresh-x prefetch
REFRESH_X_USER="${REFRESH_X_VAR:-}"
if [ -n "$XAI_API_KEY" ] && [ -n "$REFRESH_X_USER" ]; then
  curl -s -X POST "https://api.x.ai/v1/responses" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $XAI_API_KEY" \
    -d "{
      \"model\": \"grok-4-1-fast\",
      \"input\": [{\"role\": \"user\", \"content\": \"Fetch the last 20 tweets from @${REFRESH_X_USER}. Return each tweet with full text, timestamp, URL, and engagement counts (likes, retweets, replies). Exclude retweets.\"}],
      \"tools\": [{\"type\": \"x_search\"}]
    }" > ".xai-cache/refresh-x-${REFRESH_X_USER}.json"
fi
```

Set `REFRESH_X_VAR` as a GitHub Actions secret or workflow variable.

---

## Required secrets

| Secret | Description |
|--------|-------------|
| `XAI_API_KEY` | xAI API key — used in prefetch script only, not at runtime |

---

## Sandbox note

The sandbox blocks outbound curl with `$XAI_API_KEY` in headers. Always read from the pre-fetched `.xai-cache/refresh-x-${var}.json` or fall back to WebSearch for public tweets. Do not attempt direct curl to `api.x.ai` at runtime. The WebSearch fallback can surface recent public tweets for most accounts without auth — it just lacks engagement counts.

## Constraints

- Only notify on significant theme shifts — this skill is meant to be a quiet tracker, not noisy.
- Never `@mention` the tracked handle in notifications.
- The gist in `memory/topics/x-${var}.md` is the single source of truth for this account's recent activity — keep it current.
- Do not store full tweet text in the gist — excerpts only (120 chars max).
