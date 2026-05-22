---
name: Deal Flow
description: Weekly funding round tracker across configurable verticals — decision-ready with round size, lead investor, founder background, and a one-line signal verdict per deal
var: ""
tags: [research]
---

> **${var}** — Comma-separated verticals to track (e.g. `"AI infrastructure, DeFi, biotech"`). If empty, reads verticals from the `## Deal Flow Verticals` section of `memory/MEMORY.md`.

Today is ${today}. Read `memory/MEMORY.md` for tracked verticals, prior deal flow context, and active research threads.
Read the last 7 days of `memory/logs/` to avoid repeating deals already covered.

## Overview

Searches Crunchbase News, TechCrunch, and VentureBeat for funding rounds announced in the last 7 days across the configured verticals. Scores each deal on a signal rubric, clusters by theme, and writes a decision-ready article to `articles/`. Runs weekly — skip individual deals already seen in recent logs.

---

## Steps

### 1. Resolve verticals

Priority order:
1. If `${var}` is set, split on `,` → `VERTICALS` list.
2. Else if `memory/MEMORY.md` has a `## Deal Flow Verticals` section, use its bulleted entries.
3. Else use built-in defaults: `AI infrastructure`, `crypto/DeFi`, `developer tools`, `climate tech`, `biotech`.

### 2. Build dedup set

Read `memory/logs/` for the last 14 days. Extract company names from lines matching `DEAL:` prefix. This is the dedup set — skip any company already listed.

### 3. Search for deals per vertical

For each vertical, run 3 targeted searches:

```
Search 1: "${vertical}" funding round raised ${this_week} million
Search 2: "${vertical}" startup investment series seed ${today_year}
Search 3: site:techcrunch.com OR site:venturebeat.com "${vertical}" raises 2026
```

Also fetch Crunchbase News directly:
```
WebFetch: https://news.crunchbase.com/tag/funding-rounds/
```

Collect all deal candidates. A candidate must have: company name, round size (or "undisclosed"), and approximate date within last 7 days. Discard press release aggregators and SEO farm results.

### 4. Enrich each deal

For each candidate not in the dedup set, fetch the primary source (TechCrunch or VentureBeat article) via WebFetch. Extract:

- **Company** — name and one-line product description
- **Round size** — USD amount and series stage (Seed / Series A / Series B / etc.)
- **Lead investor(s)** — named firm(s), not "a group of investors"
- **Other backers** — notable names only; skip long lists
- **Valuation** — if disclosed
- **Founder background** — any notable signal (prior exit, big-co pedigree, repeat founder)
- **Use of funds** — what they're building with the money (one phrase)
- **Signal verdict** — one of: `NOTABLE` / `STANDARD` / `WATCH` — see rubric below

**Signal rubric** (assign top matching label):
- `NOTABLE` — round ≥ $50M, OR tier-1 lead (a16z, Sequoia, Benchmark, Accel, GV, Founders Fund, Coatue, Tiger Global, USV, Bessemer), OR repeat founder with prior exit
- `STANDARD` — round $5M–$49M with named lead, no tier-1, first-time founder
- `WATCH` — undisclosed or <$5M but vertical is in tracked interests from MEMORY.md

### 5. Cluster by theme

Group deals into 2–4 sub-themes within the week (e.g. "AI inference hardware", "onchain consumer apps", "climate infrastructure"). A deal belongs to the most specific matching cluster.

### 6. Write the article

Save to `articles/deal-flow-${today}.md`:

```markdown
# Deal Flow — Week of ${today}

**${total_deals} deals across ${vertical_count} verticals | ${notable_count} NOTABLE | ${watch_count} WATCH**

---

## [Cluster 1 Name]

### [Company Name] — $XM [Stage] — [VERDICT]
**Lead:** [Investor] | **Also:** [others if notable]
**What:** [one-line product description]
**Signal:** [one sentence on why this is notable/standard/watch — cite the specific data point]
**Source:** [Title](URL)

### [Company Name] — $XM [Stage] — [VERDICT]
...

---

## [Cluster 2 Name]

...

---

## Summary

- **Most interesting deal:** [Company] — [one sentence on why]
- **Hottest vertical this week:** [vertical] ([N] deals)
- **Biggest round:** [Company], $XM [Stage]
- **Tier-1 activity:** [list of tier-1-led deals, or "none this week"]

## Skipped
*[N] deals deduped from prior runs. [N] candidates dropped (no verifiable source).*
```

### 7. Notify

```
./notify "*Deal Flow — ${today}*

${total_deals} rounds | ${notable_count} NOTABLE | ${watch_count} WATCH

Notable:
$(for each NOTABLE deal: "- [Company] $XM [Stage] — [one-line signal verdict]")

Full report: articles/deal-flow-${today}.md"
```

If zero deals survived dedup and sourcing, send:
```
./notify "*Deal Flow — ${today}* — no new deals found this week across tracked verticals."
```

### 8. Log

Append to `memory/logs/${today}.md`:
```
### deal-flow
- Verticals: [list]
- Deals found: ${total_deals} (${notable_count} NOTABLE, ${watch_count} WATCH)
- Deduped: N
$(for each deal: "- DEAL: [Company] $XM [Stage] [VERDICT]")
- Article: articles/deal-flow-${today}.md
```

---

## Required secrets

None — all sources are public (Crunchbase News, TechCrunch, VentureBeat). WebFetch handles fetching without auth.

---

## Sandbox note

All data is fetched via WebSearch and WebFetch — no authenticated APIs required. If WebFetch on Crunchbase News returns a paywall or empty body, fall back to WebSearch with `site:news.crunchbase.com funding` for the same results. No curl or env-var headers needed.

## Constraints

- Only report deals with a verifiable source URL. Do not invent round sizes.
- Never report a company already in the dedup set from the last 14 days.
- The signal verdict must come from the rubric — no freelance labels.
- If a round size is genuinely undisclosed, write "undisclosed" — do not estimate.
