<p align="center">
  <img src="assets/vigil.svg" alt="Vigil" width="80" />
</p>

<h1 align="center">VIGIL</h1>

<p align="center">
  <strong>The autonomous AI agent platform that works while you sleep.</strong><br>
  Run 119 pre-built skills or build your own. No servers. No surprise bills.
</p>

<p align="center">
  <a href="https://github.com/besley1600/vigil/stargazers"><img src="https://img.shields.io/github/stars/besley1600/vigil?style=flat-square&logo=github" alt="GitHub stars"></a>
  <a href="https://github.com/besley1600/vigil/network/members"><img src="https://img.shields.io/github/forks/besley1600/vigil?style=flat-square&logo=github" alt="GitHub forks"></a>
</p>

<p align="center">
  <img src="assets/vigilframework.gif" alt="Vigil Demo" />
</p>

---

## The Problem

Your workflows need automation. You've got research to do, code to review, tokens to monitor, content to write. But you can't babysit a bot 24/7, and you can't afford another subscription + learning curve + maintenance headache.

## The Solution

**Vigil is the AI agent runtime that actually stays running.** No local process to restart. No server to maintain. No approval loops. Configure it once, connect your GitHub account, and it handles the rest — even fixing itself when something breaks.

---

## Why Vigil?

| Feature | Vigil | Claude Code | AutoGen/CrewAI | n8n |
|---------|-------|-------------|-----------------|-----|
| **Runs unattended on schedule** | ✓ | — | — | ✓ |
| **Self-heals when skills fail** | ✓ | — | — | — |
| **Monitors its own output quality** | ✓ | — | — | — |
| **Reacts to conditions (not just cron)** | ✓ | — | — | Limited |
| **Zero infrastructure** | ✓ (GitHub Actions) | Local | Self-hosted | Self-hosted |
| **Per-user credential isolation** | ✓ (OAuth) | — | — | — |
| **Multi-repository management** | ✓ | — | — | — |
| **Works with any AI framework** | ✓ (MCP + A2A) | — | — | — |

---

## Use Vigil for Any Workflow

### 📊 Research & Analysis
- **Deep research on any topic** — pull from papers, code, web, and crypto data
- **Market monitoring** — track tokens, DeFi yields, and Polymarket movements
- **Competitor tracking** — digest HN, Product Hunt, and GitHub trends automatically
- **RSS digests** — aggregate feeds into curated daily briefs

### 💻 Software Development
- **Automated PR reviews** — analyse code changes and suggest improvements
- **Vulnerability scanning** — detect security issues before they reach prod
- **Auto-merge** — merge green PRs on schedule
- **Activity monitoring** — track GitHub events across all your repos

### 📱 Content & Social
- **Write tweets** — compose, review, and post to X automatically
- **Thread formatting** — turn articles into Twitter threads
- **Syndication** — cross-post to Medium, Dev.to, LinkedIn
- **Engagement tracking** — monitor comment threads and sentiment

### 🎯 Productivity
- **Morning briefs** — aggregate the day's key updates before you wake up
- **Weekly reviews** — synthesise accomplishments and plan the next week
- **Goal tracking** — monitor progress and adjust priorities
- **Deal flow** — monitor interesting opportunities in your space

### 🔧 Custom Workflows
- **Skill chaining** — compose agents into pipelines with parallel steps and output passing
- **Conditional execution** — react to real-time events, not just schedules
- **Multi-model routing** — route between Claude, GPT, Gemini, or Kimi per-skill
- **Custom integrations** — webhook triggers from Zapier, Slack, GitHub, and more

---

## How It Works

Vigil runs on **GitHub Actions** — the same infrastructure you already use. There are no extra servers, no Docker images, and no cloud bills. Every skill is a Claude Code agent that runs inside a workflow, reads a `SKILL.md` prompt, executes its task, and sends the output wherever you configure.

```
GitHub push / cron trigger
        │
        ▼
  GitHub Actions workflow
        │
        ▼
  Claude Code runs SKILL.md
        │
        ├── Fetches data (web, APIs, your repo)
        ├── Produces output (Telegram, Discord, Slack, dashboard)
        └── Logs result to memory/
```

Skills are stored in your repository alongside your code. Your config lives in `vigil.yml`. Everything is plain text, version-controlled, and yours.

---

## Get Started in Minutes

### Option 1: Use the Web App (Recommended)

Visit **[app.vigilhq.ai](https://app.vigilhq.ai)** → connect your GitHub account via OAuth → select a repository → activate it → toggle the skills you want.

No fork required. No token setup. Your credentials never leave your browser session.

### Option 2: Fork and Self-Host

Fork this repo, add your API key as a repo secret, and push. GitHub Actions takes it from there.

```bash
git clone https://github.com/besley1600/vigil your-vigil
cd your-vigil
./vigil-init
```

`vigil-init` walks you through:
- Choosing your AI model (Claude API key or Bankr gateway)
- Selecting skills to enable
- Setting up notifications (Telegram, Discord, Slack)
- Connecting to GitHub

### Option 3: Self-Host the Dashboard on Vercel

Deploy the web dashboard to your own Vercel account with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/besley1600/vigil&root=dashboard&project-name=vigil-dashboard&env=SKILLS_REPO&envDescription=The%20GitHub%20repo%20containing%20skill%20definitions%20(e.g.%20besley1600%2Fvigil))

Set one env var — `SKILLS_REPO=besley1600/vigil` — and users connect their own GitHub accounts via OAuth. Full per-user isolation out of the box.

---

## Multi-Repository Management

Vigil is built for teams and power users who work across multiple repos. Every repository you connect gets its own independent configuration:

- **Per-repo `vigil.yml`** — each repo stores its own enabled skills, schedules, and model settings
- **Activation gate** — repos start inactive; nothing runs until you explicitly enable a repo
- **Instant switching** — switch between repos in the dashboard and the config view swaps with it
- **Isolated credentials** — each user authenticates with their own GitHub account via OAuth; no shared tokens, no operator data visible to other users

---

## 119 Pre-Built Skills

Every skill is independently installable, schedulable, and chainable:

```bash
./add-skill besley1600/vigil --list      # browse all skills
./add-skill besley1600/vigil morning-brief  # install one
```

| Category | Examples |
|----------|---------|
| **Research & Content** | deep-research, paper-digest, rss-digest, hacker-news-digest |
| **Dev & Code** | pr-review, github-monitor, auto-merge, vuln-scanner |
| **Crypto & Markets** | token-alert, defi-monitor, on-chain-monitor, polymarket-monitor |
| **Social & Writing** | write-tweet, thread-formatter, syndicate-article |
| **Productivity** | morning-brief, weekly-review, goal-tracker, deal-flow |
| **Meta & Self-Healing** | heartbeat, skill-repair, skill-health, fleet-control |

---

## Self-Healing Intelligence

Vigil isn't just a scheduler — it monitors itself and repairs what breaks.

1. **Heartbeat** — runs daily, detects failed or degraded skills
2. **Skill Health** — audits output quality and tracks API changes
3. **Skill Repair** — diagnoses root causes and auto-patches failing skills
4. **Self-Improve** — learns from output scores and evolves prompts over time

Every run is scored 1–5. Vigil logs results to `memory/`, learns what works, and improves over time without you touching a thing.

---

## Skill Chaining

Compose multiple agents into pipelines with parallel execution and output passing:

```yaml
# vigil.yml
chains:
  morning-pipeline:
    schedule: "0 7 * * *"
    steps:
      - parallel: [token-movers, hacker-news-digest]
      - skill: morning-brief
        consume: [token-movers, hacker-news-digest]
```

Steps run in parallel where possible. Downstream skills receive prior outputs injected into context automatically.

---

## Simple Configuration

All scheduling and settings live in one file per repository:

```yaml
# vigil.yml
enabled: true
model: claude-sonnet-4-6

skills:
  pr-review:
    enabled: true
    schedule: "0 9 * * *"   # Daily at 9 AM

  deep-research:
    enabled: true
    schedule: "workflow_dispatch"  # On-demand from dashboard
    var: "AI agent frameworks"

  morning-brief:
    enabled: true
    schedule: "0 7 * * *"
```

Standard cron syntax. Every change syncs from the dashboard to your repo instantly via the GitHub API.

---

## Integrate with Your Existing Tools

### Use Vigil Skills from Claude

Every skill appears as a native tool in Claude Desktop and Claude Code via MCP:

```bash
./add-mcp   # Register Vigil as an MCP server
```

### Use Vigil from Any Agent Framework

LangChain, AutoGen, CrewAI, OpenAI SDK — all work via A2A:

```bash
./add-a2a   # Start A2A gateway (port 41241)
```

```python
from openai import OpenAI
client = OpenAI(api_key="any", base_url="http://localhost:41241/v1")
response = client.chat.completions.create(
    model="vigil-deep-research",
    messages=[{"role": "user", "content": "latest AI research"}],
)
```

### Trigger Skills from Anywhere

Zapier, GitHub webhooks, Slack slash commands — trigger any skill via webhook:

```bash
curl -X POST http://localhost:5555/api/webhook \
  -H "Authorization: Bearer $VIGIL_WEBHOOK_SECRET" \
  -d '{"skill":"deep-research","var":"AI agents 2025"}'
```

---

## Notifications

Vigil notifies you only when it matters. Set one secret per channel to enable it:

| Channel | Outbound notifications | Interactive messaging |
|---------|----------------------|----------------------|
| **Telegram** | ✓ | ✓ |
| **Discord** | ✓ | ✓ |
| **Slack** | ✓ | ✓ |

No extra configuration — just set the secret and the channel activates automatically.

---

## Pricing & Cost

**GitHub Actions:** Free for public repos. Private repos: ~$0.25–$1.00/month depending on skill frequency.

**AI Model:** Choose your own:
- **Anthropic API key** — pay as you go; Claude Sonnet is the default
- **Bankr Gateway** — ~67% cheaper for high volume, also unlocks GPT-4, Gemini, and Kimi

No platform fees. No seat licences. No surprise bills.

---

## Documentation

- **[QUICK_START.md](QUICK_START.md)** — local dev setup
- **[CLAUDE.md](CLAUDE.md)** — agent runtime instructions (auto-loaded by Claude Code)
- **[Skills Catalog](skills.json)** — all 119 skills with metadata
- **[SHOWCASE.md](SHOWCASE.md)** — example outputs and use cases

---

## Community & Support

- **Issues:** Found a bug? [File an issue](https://github.com/besley1600/vigil/issues)
- **Discussions:** Want to share tips or a skill? [Start a discussion](https://github.com/besley1600/vigil/discussions)
- **Contributing:** Built a skill? [Open a PR](https://github.com/besley1600/vigil/pulls)

---

[![Star History Chart](https://api.star-history.com/svg?repos=besley1600/vigil&type=Date)](https://www.star-history.com/#besley1600/vigil&Date)
