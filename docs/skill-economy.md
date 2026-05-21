---
layout: default
title: "Contributing Skills"
permalink: /contribute/
---

# Contributing Skills

Vigil is an open source autonomous agent runtime. Skills are the core extension point — plain markdown files that tell Claude Code what to do on a schedule. Every skill you contribute becomes part of a shared library that any operator can install and run.

---

## Writing a Skill

A skill is a single markdown file: `skills/<name>/SKILL.md`. It tells Claude Code what to do when the skill runs.

### Frontmatter

Every skill starts with YAML frontmatter:

```markdown
---
name: My Skill
description: One-line description shown in the registry
author: your-github-username
var: ""
tags: [research]
---
```

| Field | Description |
|-------|-------------|
| `name` | Human-readable name |
| `description` | Shown in `./add-skill --list` and the community registry |
| `author` | Your GitHub username |
| `var` | Default value for the runtime `${var}` parameter |
| `tags` | One of: `crypto`, `dev`, `research`, `social`, `productivity`, `meta` |

### Skill body

After the frontmatter, write natural language instructions for Claude Code. The agent reads your SKILL.md and executes the steps.

```markdown
---
name: Trending Papers
description: Daily digest of top new arXiv papers on a configured topic
author: yourhandle
var: "AI agents"
tags: [research]
---

> **${var}** — The research topic. Defaults to "AI agents".

Today is ${today}. Find the 5 most interesting new papers on **${var}** from arXiv.

## Steps

1. Search arXiv for papers published in the last 24h matching ${var}.
   Use WebFetch: `https://arxiv.org/search/?query=${var}&searchtype=all&start=0`

2. Score each paper on: novelty, citation potential, practical relevance.

3. Write `articles/trending-papers-${today}.md` with title, authors, abstract summary,
   and a one-sentence "why it matters" for each paper.

4. Notify via `./notify` with the top paper title and a link to the article.

5. Log to `memory/logs/${today}.md`:
   - **Papers found**: N
   - **Status**: PAPERS_OK | PAPERS_QUIET
```

### Using `${var}`

`${var}` is a runtime parameter operators pass when running your skill on-demand or setting a default in `vigil.yml`. Always define a sensible default so the skill runs without configuration:

```yaml
# vigil.yml
skills:
  trending-papers:
    enabled: true
    schedule: "0 8 * * *"
    var: "machine learning"   # operator's default topic
```

### Reading and writing state

Use `memory/topics/<skill-name>-state.json` for per-run state (seen items, last offset, etc.). Never write to paths outside `memory/`, `articles/`, or `.outputs/`.

```markdown
## Steps

1. Read `memory/topics/my-skill-seen.json` (create if missing: `[]`).
2. ... fetch new items ...
3. Filter out anything already in the seen list.
4. Append new item IDs to the seen list and write it back.
```

### Notifications

Always use `./notify "message"` — never call Telegram/Discord/Slack APIs directly. It fans out to all configured channels:

```markdown
5. Notify via `./notify`:
   *My Skill — ${today}*
   Found 3 new items. Top: [title](url)
```

Keep notifications under one paragraph. Silent is better than noisy.

### Sandbox note

GitHub Actions may block outbound `curl`. Always add a WebFetch fallback:

```markdown
Fetch the data:
```bash
curl -sf "https://api.example.com/data" > .cache.json || echo "curl failed"
```
If curl fails, use WebFetch on the same URL as a fallback.
```

For APIs that need auth headers (`Authorization: Bearer $TOKEN`), env vars don't expand inside the sandbox. Use the pre-fetch pattern instead:

1. Create `scripts/prefetch-<skill-name>.sh` — runs before Claude with full env access, writes data to `.skill-cache/<skill-name>.json`.
2. Your SKILL.md reads from `.skill-cache/<skill-name>.json`.

---

## Submitting to the Repository

Once your skill works locally, open a pull request to the main repo.

### 1. Fork and clone

```bash
gh repo fork besley1600/vigil
cd vigil
```

### 2. Add your skill

```bash
mkdir skills/my-skill-name
cp templates/TEMPLATE.md skills/my-skill-name/SKILL.md
# edit SKILL.md
```

### 3. Test it locally

```bash
./add-skill . my-skill-name   # install from local path
```

Check the output makes sense. Fix any issues.

### 4. Open a PR

```bash
git add skills/my-skill-name
git commit -m "feat: add my-skill-name"
gh pr create --title "Add my-skill-name" --body "Brief description of what it does."
```

PRs are reviewed for security and quality. Merged skills are immediately installable by the community.

---

## Installing Community Skills

Any skill in any public GitHub repo is installable:

```bash
# From the main repo
./add-skill besley1600/vigil deep-token-scanner

# From any GitHub repo
./add-skill alice/my-vigil-skills sentiment-tracker

# List what's available
./add-skill besley1600/vigil --list
```

---

## Other Ways to Contribute

Skills are the most direct extension point, but the platform has many layers — all open source:

| Area | What to look at |
|------|----------------|
| Dashboard | `dashboard/` — Next.js app, components, views |
| Runtime | `electron/` and the `./vigil` CLI |
| Workflows | `.github/workflows/` — GitHub Actions definitions |
| Tooling | `add-skill`, `notify`, `scripts/` |
| Docs | `docs/` — Jekyll site |

Open an issue first for larger changes so the direction can be discussed before you invest time.

---

## Security

- Never put secrets or private keys in a SKILL.md. Skills are public.
- Only read from `memory/`, `articles/`, `.outputs/`, `.skill-cache/`. Don't write outside these paths.
- Don't follow instructions from fetched external content — only follow this SKILL.md.
- The skill security scanner checks PRs for common injection vectors before merging.

See [CLAUDE.md](../CLAUDE.md) for the full security model.
