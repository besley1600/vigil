---
name: Vibecoding Digest
description: Decision-ready pulse of r/vibecoding — ranked by signal score, narrative-clustered, with a one-line verdict and tools leaderboard
var: ""
tags: [research]
---

> **${var}** — Optional filter (e.g. `"Cursor"`, `"v0"`) to focus the digest on a specific tool. If empty, covers the full subreddit.

Today is ${today}. Read `memory/MEMORY.md` for prior vibecoding context and tracked tools.
Read the last 7 days of `memory/logs/` to avoid repeating top posts already covered.

## Overview

Fetches r/vibecoding via the public Reddit JSON API (no auth required). Scores posts by engagement, clusters by tool/framework mentioned, builds a tools leaderboard, and delivers a one-line verdict on which tool won this week. Writes the digest to `articles/`. Notifies.

---

## Steps

### 1. Fetch subreddit data

**Primary — Reddit JSON API (no auth):**

```bash
curl -s -A "Mozilla/5.0 (compatible; vigil-agent/1.0)" \
  "https://www.reddit.com/r/vibecoding/top.json?t=week&limit=50"
```

If curl fails or returns an empty body, fall back to WebFetch:
```
WebFetch: https://www.reddit.com/r/vibecoding/top.json?t=week&limit=50
User-Agent: Mozilla/5.0 (compatible; vigil-agent/1.0)
```

Also fetch new posts to catch emerging topics:
```
WebFetch: https://www.reddit.com/r/vibecoding/new.json?limit=25
```

Parse the JSON. For each post in `.data.children[].data`, extract:
- `id`
- `title`
- `selftext` (post body, first 500 chars)
- `score` (upvotes)
- `upvote_ratio`
- `num_comments`
- `url`
- `permalink` → `https://www.reddit.com${permalink}`
- `created_utc` — convert to ISO date

If the subreddit returns no posts (sub too new, API blocked, or sub doesn't exist), abort with log. Stop.

### 2. Build dedup set

Read `memory/logs/` for the last 14 days. Extract Reddit post IDs from lines matching `VIBE_POST:`. Skip any post ID already seen.

### 3. Filter by `${var}`

If `${var}` is set, filter to posts where `title + selftext` contains `${var}` (case-insensitive). If this leaves fewer than 5 posts, widen to the full set and note the filter in the output.

### 4. Score posts

For each post, compute:

```
signal_score = upvote_ratio × num_comments
```

This weights posts that sparked discussion over those with passive upvotes. Break ties by `score`.

Sort descending. Take the top 30 (or all if fewer than 30 survive dedup).

### 5. Detect tool/framework mentions

For each post, scan `title + selftext` for the following tool names (case-insensitive):

| Tool | Aliases to match |
|------|-----------------|
| Cursor | cursor, cursor ai |
| Windsurf | windsurf |
| Claude Code | claude code, claude-code |
| v0 | v0, v0.dev, vercel v0 |
| Bolt | bolt, bolt.new |
| Lovable | lovable |
| Replit | replit |
| GitHub Copilot | copilot, github copilot |
| Gemini | gemini, google gemini |
| GPT-4o | gpt-4o, chatgpt |
| Devin | devin |
| Aider | aider |

For each post, set `tools_mentioned = [list of matched tool names]`. A post can match multiple tools.

### 6. Build tools leaderboard

Count how many posts mention each tool. Also sum the `signal_score` of all posts mentioning each tool.

Build the leaderboard sorted by `mention_count` descending (break ties by total `signal_score`):

| Rank | Tool | Mentions | Total Signal |
|------|------|----------|-------------|
| 1 | Cursor | 12 | 4,820 |
| 2 | v0 | 8 | 2,100 |
| ... | | | |

**Winner** = tool at rank 1. If tied (same mention count), winner = higher total signal.

**Verdict** = one sentence: `"${winner} dominated r/vibecoding this week with ${mentions} posts and ${total_signal} signal — [one-sentence on why, based on post titles]"`

### 7. Cluster posts by narrative

Group the top 30 posts into 3–5 narrative clusters based on the dominant theme:

Suggested cluster names (adjust to what's actually in the posts):
- "Show HN / project showcases" — posts showing something they built
- "Tool comparison / debate" — which tool is better for X
- "Workflow tips" — how-to and optimization posts
- "Failures / frustrations" — things that don't work, rants, gotchas
- "New features / releases" — announcements and updates

Assign each post to the best-fit cluster. Surface the top 2 posts per cluster (by signal score).

### 8. Write the digest

Save to `articles/vibecoding-digest-${today}.md`:

```markdown
# r/vibecoding Digest — ${today}

**${total_posts} posts analyzed | Top tool: ${winner} | ${date_range}**

---

## Verdict

${verdict_sentence}

---

## Tools Leaderboard

| Rank | Tool | Posts | Signal |
|------|------|-------|--------|
$(leaderboard rows)

---

## Top Posts by Narrative

### ${cluster_1_name} (${count} posts)

**[${post_title}](${post_url})**
Score: ${score} | Comments: ${num_comments} | Signal: ${signal_score}
${one-line insight: what the post actually claims or shows}

**[${post_title}](${post_url})**
...

---

### ${cluster_2_name} (${count} posts)
...

---

## Raw Top 10 (by signal score)

| # | Title | Tool | Signal | Link |
|---|-------|------|--------|------|
$(top 10 rows)

---

*Sources: r/vibecoding top (7d) + new (48h) | ${total_posts} posts | Deduped: ${deduped_count}*
```

### 9. Notify

```
./notify "*r/vibecoding Digest — ${today}*

${verdict_sentence}

Tools leaderboard:
$(top 5 tools: "  ${rank}. ${tool}: ${mentions} posts (${total_signal} signal)")

Top posts:
$(top 3 by signal): "- [${post_title}](${post_url}) — ${signal_score} signal"

Full digest: articles/vibecoding-digest-${today}.md"
```

If zero posts (after dedup), send:
```
./notify "*r/vibecoding Digest — ${today}* — no new posts found this week."
```

### 10. Log

Append to `memory/logs/${today}.md`:
```
### vibecoding-digest
- Posts: ${total_posts} analyzed (${deduped_count} deduped)
- Winner: ${winner} (${winner_mentions} mentions)
- Verdict: ${verdict_sentence}
- Article: articles/vibecoding-digest-${today}.md
$(for each top post in top 10: "- VIBE_POST: ${post_id} — ${post_title}")
```

---

## Required secrets

None — r/vibecoding is a public subreddit. Reddit's JSON API works without authentication.

---

## Sandbox note

The Reddit JSON API is public. `curl` with a User-Agent header works but may fail in the sandbox. Always add a **WebFetch fallback** for the same URLs. WebFetch bypasses the sandbox and reliably fetches public Reddit JSON. No auth headers needed — just the User-Agent string in the URL if needed (`?raw_json=1` can also help with encoding).

## Constraints

- Dedup against the last 14 days — never re-report the same post ID.
- Signal score must use the formula `upvote_ratio × num_comments` — do not freelance the scoring.
- The verdict must name the tool with the highest mention count — no editorializing beyond that.
- Do not fabricate post data — every entry must trace to the Reddit API response.
- If a post mentions no known tool, assign it to the generic cluster "Other / general" — do not force a tool assignment.
