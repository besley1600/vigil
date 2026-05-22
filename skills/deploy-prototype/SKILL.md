---
name: Deploy Prototype
description: Generate a small app or tool and deploy it live to Vercel via API — returns a working URL in minutes
var: ""
tags: [dev]
---

> **${var}** — The app idea to build and deploy (e.g. `"token price ticker for Base tokens"`, `"markdown to tweet thread converter"`). Required — if empty, abort.

Today is ${today}. Read `memory/MEMORY.md` for prior deployments and active project context.

## Overview

Takes an app idea from `${var}`, generates a minimal Next.js or static app, deploys it to Vercel via the Vercel API, and returns the live URL. The generated project is written to `prototypes/${slug}/` in the repo. The deployment URL is written to `articles/deploy-prototype-${today}.md` and notified.

Requires `VERCEL_TOKEN` to be set as a GitHub Actions secret.

---

## Steps

### 1. Validate input

If `${var}` is empty, abort. Log:
```
### deploy-prototype
- ABORTED: ${var} is empty — provide an app idea
```
Stop — no notification.

### 2. Derive slug and project name

From `${var}`, derive:
- `slug` — lowercase, hyphenated, max 32 chars (e.g. `token-price-ticker`)
- `project_name` — human-readable title (e.g. `Token Price Ticker`)

Check if `prototypes/${slug}/` already exists. If yes, skip generation and jump to step 5 to re-deploy from the existing code.

### 3. Generate the app

Decide the app type:
- **Static HTML** — for display/tool apps with no backend (price tickers, converters, calculators)
- **Next.js** — for apps that benefit from React components or basic API routes

Generate minimal, production-quality code. Rules:
- No placeholder content — the app must actually work.
- Inline styles only (no external CSS dependencies unless Tailwind via CDN).
- No auth, no database — purely client-side or edge-runtime.
- Include a page `<title>` matching the project name.
- Include a `package.json` with `"build": "next build"` for Next.js, or a single `index.html` for static.
- Include `vercel.json` at root:

**For static:**
```json
{ "version": 2 }
```

**For Next.js:**
```json
{
  "version": 2,
  "builds": [{ "src": "package.json", "use": "@vercel/next" }]
}
```

Write all files under `prototypes/${slug}/`.

### 4. Read VERCEL_TOKEN and create Vercel project

Use WebFetch to call the Vercel API. Replace `VERCEL_TOKEN` inline with the actual value from the `VERCEL_TOKEN` environment variable.

Create project:
```
POST https://api.vercel.com/v9/projects
Authorization: Bearer VERCEL_TOKEN
Content-Type: application/json

{
  "name": "${slug}-vigil",
  "framework": "nextjs"   // or null for static
}
```

Extract `project_id` from the response.

If project creation returns 409 (already exists), fetch the existing project by name and extract its `project_id`.

### 5. Deploy via Vercel API

Collect all files under `prototypes/${slug}/`. For each file, base64-encode the content.

```
POST https://api.vercel.com/v13/deployments
Authorization: Bearer VERCEL_TOKEN
Content-Type: application/json

{
  "name": "${slug}-vigil",
  "project": "${project_id}",
  "target": "production",
  "files": [
    {
      "file": "index.html",
      "data": "<base64-encoded content>",
      "encoding": "base64"
    }
    // ... all other files
  ]
}
```

Extract `deployment_url` from `response.url` (format: `https://${slug}-vigil-XXXX.vercel.app`).

Poll the deployment status:
```
GET https://api.vercel.com/v13/deployments/${deployment_id}
Authorization: Bearer VERCEL_TOKEN
```
Wait up to 90 seconds (3 × 30s polls). Stop when `state == "READY"` or `state == "ERROR"`.

If `state == "ERROR"`, log the error and notify with failure message. Stop.

### 6. Write deployment record

Save to `articles/deploy-prototype-${today}.md`:

```markdown
# Prototype Deployed: ${project_name}

**Date:** ${today}
**Idea:** ${var}
**URL:** ${deployment_url}
**Project:** ${project_id}
**Code:** prototypes/${slug}/

## What it does
[2–3 sentences describing the generated app and how to use it]

## Files generated
[bulleted list of files created under prototypes/${slug}/]

## Notes
[Any notable decisions made during generation — why static vs Next.js, etc.]
```

### 7. Log and notify

Append to `memory/logs/${today}.md`:
```
### deploy-prototype
- Idea: ${var}
- Slug: ${slug}
- URL: ${deployment_url}
- Project ID: ${project_id}
- Code: prototypes/${slug}/
```

```
./notify "*Deploy Prototype — ${today}*

${project_name} is live.

${deployment_url}

Idea: ${var}
Code: prototypes/${slug}/"
```

---

## Required secrets

Add to GitHub repo → Settings → Secrets and variables → Actions:

| Secret | Description |
|--------|-------------|
| `VERCEL_TOKEN` | Vercel API token from vercel.com/account/tokens |

---

## Sandbox note

The Vercel API requires the `VERCEL_TOKEN` in an Authorization header. Inline the actual token value in each WebFetch call — do not use `$VERCEL_TOKEN` in a curl command (that fails in the sandbox). WebFetch can embed the token inline as a request header value. The generated project files are written to the filesystem, not curl'd — no sandbox issues there.

## Constraints

- Never generate apps with external API calls that require secrets — keep it client-side.
- Never deploy with `target: "preview"` — always `"production"` so the URL is stable.
- If `VERCEL_TOKEN` is not available in environment, abort with a clear error message.
- The generated app must actually function — no stub pages or "coming soon" content.
- Respect rate limits: if Vercel returns 429, wait 10 seconds and retry once.
