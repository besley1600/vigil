<p align="center">
  <img src="assets/vigil.svg" alt="Vigil" width="80" />
</p>

<h1 align="center">VIGIL</h1>

<p align="center">
  <strong>The autonomous AI agent platform that works while you sleep.</strong><br>
  Run 117 pre-built skills or build your own. Deploy instantly. No servers to manage.
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

Your workflows need automation. You've got research to do, code to review, tokens to monitor, tweets to write. But you can't babysit a bot 24/7. And you can't afford another subscription + learning curve + maintenance headache.

## The Solution

**Vigil is the AI agent runtime that actually stays running.** No local process to restart. No server to maintain. No approval loops. Just configure it once, push to GitHub, and it handles the rest—even fixing itself when something breaks.

---

## Why Vigil?

| Feature | Vigil | Claude Code | AutoGen/CrewAI | n8n |
|---------|-------|-------------|-----------------|-----|
| **Runs unattended on schedule** | ✓ | — | — | ✓ |
| **Self-heals when skills fail** | ✓ | — | — | — |
| **Monitors its own output quality** | ✓ | — | — | — |
| **Reacts to conditions (not just cron)** | ✓ | — | — | Limited |
| **Zero infrastructure** | ✓ (GitHub Actions) | Local | Self-hosted | Self-hosted |
| **Works with any AI framework** | ✓ (MCP + A2A) | — | — | — |

---

## Use Vigil for Any Workflow

### 📊 Research & Analysis
- **Deep research on any topic** — pull from papers, code, web, crypto data
- **Market monitoring** — track tokens, defi yields, polymarket movements
- **Competitor tracking** — digest HN, Product Hunt, GitHub trends automatically
- **RSS digests** — aggregate feeds into curated daily briefs

### 💻 Software Development
- **Automated PR reviews** — analyze code changes, suggest improvements
- **Vulnerability scanning** — detect security issues before they reach prod
- **Auto-merge** — merge green PRs on schedule
- **Activity monitoring** — track GitHub events across your repos

### 📱 Content & Social
- **Write tweets** — compose, review, post to X automatically
- **Thread formatting** — turn articles into Twitter threads
- **Syndication** — cross-post to Medium, Dev.to, LinkedIn
- **Engagement tracking** — monitor comment threads and sentiment

### 🎯 Productivity
- **Morning briefs** — aggregate the day's key updates
- **Weekly reviews** — synthesize accomplishments and plan next week
- **Goal tracking** — monitor progress, adjust priorities
- **Deal flow** — monitor interesting opportunities in your space

### 🔧 Custom Workflows
- **Skill chaining** — combine multiple agents into pipelines
- **Conditional execution** — react to real-time events, not just schedules
- **Multi-model** — route between Claude, GPT, Gemini, Kimi based on task
- **Custom integrations** — webhook triggers from Zapier, Slack, GitHub

---

## Two Ways to Run

### 🌐 **Web Dashboard** (Free, Always Available)
- Start with `./vigil` → opens interactive dashboard at `http://localhost:5555`
- Manage skills, view outputs, configure schedules in real-time
- Works on any computer (Mac, Linux, Windows)
- Perfect for development and local testing
- Expose publicly with `./vigil-expose` (auto-detects ngrok/cloudflared)

### 🖥️ **Electron Desktop App** (Native macOS Experience)
- Polished native macOS application
- Standard window controls (traffic lights, dragging, minimize/maximize)
- Menu bar integration for quick access
- Production-ready desktop experience
- Same power as web dashboard with native OS integration

---

## Deploy in Minutes

```bash
git clone https://github.com/besley1600/vigil
cd vigil && ./vigil-init
```

`vigil-init` walks you through:
- Choosing your AI model (Claude Pro, API key, or Bankr gateway)
- Selecting pre-built skills to install
- Setting up notifications (Telegram, Discord, Slack)
- Connecting to GitHub

Then push `vigil.yml` to your repo and you're done. GitHub Actions handles the rest.

---

## 117 Pre-Built Skills (Or Build Your Own)

Every skill is independently installable, schedulable, and chainable. Browse the full catalog:

```bash
./add-skill besley1600/vigil --list
```

| Category | Count | Examples |
|----------|-------|---------|
| **Research & Content** | 19 | deep-research, paper-digest, rss-digest, hacker-news-digest |
| **Dev & Code** | 32 | pr-review, github-monitor, auto-merge, vuln-scanner, spawn-instance |
| **Crypto & Markets** | 19 | token-alert, defi-monitor, on-chain-monitor, polymarket-monitor |
| **Social & Writing** | 12 | write-tweet, thread-formatter, syndicate-article, refresh-x |
| **Productivity** | 14 | morning-brief, weekly-review, goal-tracker, deal-flow |
| **Meta & Agent** | 21 | heartbeat, skill-repair, self-improve, fleet-control, cost-report |

---

## Self-Healing Intelligence

Vigil isn't just a scheduler—it's an intelligent agent that monitors itself.

1. **Heartbeat** (3× daily) — Detects failed, stuck, or degraded skills
2. **Skill Health** — Audits output quality, tracks API changes
3. **Skill Repair** — Automatically diagnoses and patches failing skills
4. **Self-Improve** — Learns from output scores, evolves prompts and config

Every run is scored 1–5. Vigil learns what works and what doesn't, improving over time.

---

## Simple Configuration

All scheduling lives in one file:

```yaml
# vigil.yml
model: claude-opus-4-7

skills:
  pr-review:
    enabled: true
    schedule: "0 9 * * *"  # Daily at 9 AM
    
  deep-research:
    enabled: true
    schedule: "workflow_dispatch"  # On-demand from dashboard
    var: "AI agent frameworks"

chains:
  morning-pipeline:
    schedule: "0 7 * * *"
    steps:
      - parallel: [token-movers, hacker-news-digest]
      - skill: morning-brief
        consume: [token-movers, hacker-news-digest]
```

Standard cron syntax. Every change syncs automatically from your dashboard.

---

## Integrate with Your Existing Tools

### Use Vigil Skills from Claude
Every skill appears as a native tool in Claude Desktop and Claude Code via MCP:

```bash
./add-mcp              # Register Vigil as an MCP server
```

Now Claude can invoke your Vigil skills directly.

### Use Vigil from Any Agent Framework
LangChain, AutoGen, CrewAI, OpenAI SDK, Vertex AI — all work via A2A:

```bash
./add-a2a              # Start A2A gateway (port 41241)
```

Then call Vigil skills like models:

```python
from openai import OpenAI
client = OpenAI(api_key="any", base_url="http://localhost:41241/v1")
response = client.chat.completions.create(
    model="vigil-deep-research",
    messages=[{"role": "user", "content": "latest AI research"}],
)
```

### Trigger Skills from Anywhere
Zapier, GitHub webhooks, Slack slash commands — trigger any skill:

```bash
curl -X POST http://localhost:5555/api/webhook \
  -H "Authorization: Bearer $VIGIL_WEBHOOK_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"skill":"deep-research","var":"AI agents 2025"}'
```

---

## Stay Informed

Vigil notifies you only when it matters. Set one secret to enable each channel:

| Channel | Notify on failures | Interactive feedback |
|---------|-------------------|---------------------|
| **Telegram** | ✓ | ✓ |
| **Discord** | ✓ | ✓ |
| **Slack** | ✓ | ✓ |
| **Email** | ✓ | — |

No configuration needed—just set the secret and it activates.

---

## Pricing & Cost

**GitHub Actions:** Free for public repos (unlimited minutes). Private repos: ~$0.25–$1.00/month depending on skill complexity.

**AI Model:** Choose your own:
- **Claude Pro** ($20/month) — Use included tokens from Claude Code
- **API key** — Pay as you go via Anthropic
- **Bankr Gateway** — ~67% cheaper for high volume, access to GPT/Gemini/Kimi

No platform fees. No seat charges. No approval loops.

---

## Get Started

### Option 1: Use the Template (Recommended)
Fork this repo and customize `vigil.yml`. Everything stays private in your fork.

```bash
git clone https://github.com/besley1600/vigil your-vigil
cd your-vigil
./vigil-init
```

### Option 2: Use the CLI
Install Vigil as a CLI tool (coming soon):

```bash
npm install -g vigil
vigil init my-agent
```

### Option 3: Deploy with Docker
```bash
docker run -e ANTHROPIC_API_KEY=sk-... besley1600/vigil
```

---

## What Users Say

> "Vigil replaced 5 hours of manual research and monitoring per week. It just works."

> "The self-healing loop is insane. Skills break, fix themselves, and I never notice."

> "We use it to monitor 20 crypto tokens across 3 blockchains. Cost is basically free."

---

## Documentation

- **[Full Docs](docs/)** — Deep dives on every feature
- **[Skills Catalog](skills.json)** — All 117 skills with examples
- **[CLAUDE.md](CLAUDE.md)** — Agent instructions (auto-loaded by Claude Code)
- **[Examples](examples/)** — LangChain, AutoGen, CrewAI integration samples

---

## Community & Support

- **Issues:** Found a bug? [File an issue](https://github.com/besley1600/vigil/issues)
- **Discussions:** Want to share tips? [Start a discussion](https://github.com/besley1600/vigil/discussions)
- **Contributing:** Built a skill? [Open a PR](https://github.com/besley1600/vigil/pulls)

---

[![Star History Chart](https://api.star-history.com/svg?repos=besley1600/vigil&type=Date)](https://www.star-history.com/#besley1600/vigil&Date)
