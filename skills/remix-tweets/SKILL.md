---
name: Remix Tweets
description: Fetch ~30 older tweets, pre-filter for remixability, then produce 10 new rephrased versions across diverse strategies with post-write quality gates
var: ""
tags: [social]
---

> **${var}** — Twitter username to remix tweets from (e.g. `naval`, `paulgraham`). If empty, remixes from the soul/examples/ directory or MEMORY.md's tracked accounts.

Today is ${today}. Read `memory/MEMORY.md` for tracked accounts, active voice notes, and recent remix history. Read soul files if present (`soul/SOUL.md`, `soul/STYLE.md`) to absorb the target voice before writing.

## Overview

Fetches ~30 older tweets from `${var}` (or from `soul/examples/`), scores them for remixability, selects the top 15 candidates, and produces 10 new tweet versions across 10 distinct remix strategies. Applies a quality gate (n-gram overlap check) to reject derivatives that are too close to the source. Writes output to `articles/`.

---

## Steps

### 1. Resolve source

**If `${var}` is set:**
- Primary: read `.xai-cache/refresh-x-${var}.json` (the pre-fetched profile cache from `refresh-x`). Extract tweets from the cache.
- Secondary: if cache is missing, run WebSearch for `site:x.com/${var}` to find up to 30 public tweets.

**If `${var}` is empty:**
- Read `soul/examples/` — treat each example tweet as a candidate.
- Also read `memory/topics/x-*.md` gists from `refresh-x` runs and extract quoted tweet excerpts.

Collect up to 40 raw candidates. Extract full text for each.

### 2. Pre-filter for remixability

Score each candidate on a remixability rubric. Higher = better source material:

| Criterion | Points |
|-----------|--------|
| Contains a specific claim, stat, or observation (not generic advice) | +3 |
| Contains an unexpected insight or counterintuitive take | +3 |
| Shorter than 200 characters (compression room) | +2 |
| Contains a named concept, person, or company | +2 |
| Is NOT primarily a personal update or "I did X today" | +2 |
| Does NOT include a URL as the main payload | +1 |
| NOT already remixed in the last 14 days (check memory/logs/) | +2 |

Drop candidates scoring ≤2. Sort descending. Take the top 15.

If fewer than 5 candidates survive, abort. Log:
```
### remix-tweets
- ABORTED: fewer than 5 remixable candidates found (source: ${var or "soul/examples"})
```
Stop — no notification.

### 3. Select 10 candidates for remixing

From the top 15, select 10 that cover the broadest range of topics and angles. Avoid selecting 3+ candidates on the same narrow theme.

### 4. Apply remix strategies

For each of the 10 selected candidates, apply one distinct strategy from the list below. Aim to use each strategy at most twice across the 10 outputs — spread the distribution.

**Remix strategies:**

1. **Inversion** — state the opposite, then show why the original was wrong or incomplete
2. **Question form** — convert the claim into a question that makes the reader think
3. **Specific → Universal** — take a concrete example and abstract it to a broader principle
4. **Add data** — add a real statistic or example that makes the claim 3× more credible
5. **Shorten to aphorism** — compress the core insight to its most essential form (≤80 chars)
6. **Thread hook** — rewrite as the opening tweet of a compelling thread
7. **Hot take** — dial up the conviction and sharpness; strip all hedging
8. **Analogy** — explain the same idea via an analogy from a different domain
9. **Numbered list** — restructure as a 3-item list that makes the insight scannable
10. **Quote format** — reframe as if quoting someone famous (fictional attribution, framed as if you'd say it)

Voice constraint: if soul files exist, write every remix in the soul's voice. If not, use a clear, direct, opinionated voice (same as write-tweet defaults).

### 5. Quality gate — n-gram overlap check

For each remix, compute trigram overlap with its source tweet:
- Extract all trigrams (3-word sequences) from source tweet text.
- Extract all trigrams from the remix.
- `overlap = |source_trigrams ∩ remix_trigrams| / |source_trigrams|`

**Reject** (mark `FAILED_GATE`) if `overlap > 0.40` (shares more than 40% of source trigrams).

For each rejected remix: attempt one more rewrite with the same strategy. If the second attempt also fails the gate, mark it `GATE_FAIL` in the output.

Target: 10 passing remixes. If ≥8 pass the gate after one retry, proceed. If fewer than 8 pass, note the deficit in the log.

### 6. Write output

Save to `articles/remix-tweets-${today}.md`:

```markdown
# Remix Tweets — ${today}
*Source: @${var} | Candidates: ${candidate_count} | Remixed: ${output_count} | Gate pass: ${gate_pass_count}/10*

---

## [Strategy Name] — Source tweet snippet
**Source:** "[first 80 chars of source tweet]" — [URL if available]

**Remix:**
> [full remix text]

*Gate: PASS (overlap: X.XX)*

---

## [Strategy Name] — Source tweet snippet
...

$(if any GATE_FAIL):
---
## Quality Gate Failures
- [Strategy]: overlap too high after 2 attempts — [source snippet]
```

### 7. Notify

```
./notify "*Remix Tweets — ${today}*

Source: @${var or "soul/examples"}
${output_count} remixes | ${gate_pass_count}/10 passed quality gate

Highlights:
- [Best remix — strategy name]: [first 100 chars of remix text]
- [Second best]: [first 100 chars]

Full output: articles/remix-tweets-${today}.md"
```

If `gate_pass_count < 8`:
Include a line: `Warning: only ${gate_pass_count} remixes cleared the 40% overlap gate.`

### 8. Log

Append to `memory/logs/${today}.md`:
```
### remix-tweets
- Source: ${var or "soul/examples"}
- Candidates evaluated: ${total_candidates}
- Remixable (score ≥3): ${remixable_count}
- Selected: 10 | Gate pass: ${gate_pass_count}/10
- Article: articles/remix-tweets-${today}.md
```

---

## Prefetch dependency

This skill reads `.xai-cache/refresh-x-${var}.json` written by the `refresh-x` skill. Run `refresh-x` (or its prefetch step) for the same account before running `remix-tweets` to ensure the cache is populated. If the cache is absent, the WebSearch fallback will work but may return fewer candidates.

---

## Required secrets

| Secret | Description |
|--------|-------------|
| `XAI_API_KEY` | xAI API key — needed only for the `refresh-x` prefetch step that populates the cache |

---

## Sandbox note

This skill does not call external APIs directly. It reads from `.xai-cache/` (written by `scripts/prefetch-xai.sh`) or from `soul/examples/`. The only external calls are WebSearch fallbacks (no auth required). No curl with env-var headers needed.

## Constraints

- Never use the same strategy twice unless fewer than 10 source candidates survive.
- Never copy more than 40% of source trigrams (quality gate is mandatory, not optional).
- Do not repeat remixes from the last 14 days (check memory/logs/).
- Respect soul voice if soul files exist — every remix must sound like the operator, not like a generic tweet bot.
- Output must be 10 distinct tweets — not 5 pairs of minor variations.
