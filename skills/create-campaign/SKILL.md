---
name: Create Campaign
description: Provision Meta campaigns and ad sets on AdManage.ai from a declarative config — creates entities PAUSED, writes returned IDs back into state so schedule-ads can launch into them
var: ""
tags: [productivity]
---

> **${var}** — Optional label suffix for the state file (e.g. `q3-launch`). If empty, uses the config's `campaign_group` field as the label.

Today is ${today}. Read `memory/MEMORY.md` for context on active campaigns and operator goals.

## Overview

Reads `skills/create-campaign/campaign-config.yml` to provision Meta campaigns and ad sets via AdManage.ai. All entities are created in `PAUSED` state — no spend is activated. Returned IDs are written to `skills/create-campaign/state-${label}.json` so the `schedule-ads` skill can target them later.

Requires `ADMANAGE_API_KEY` to be set as a GitHub Actions secret.

---

## Steps

### 1. Read and validate config

Read `skills/create-campaign/campaign-config.yml`. Expected schema:

```yaml
campaign_group: "q3-launch"    # used as state file label if ${var} is empty
objective: "OUTCOME_TRAFFIC"   # Meta campaign objective
budget_daily_usd: 50           # daily budget in USD cents × 100
start_date: "2026-06-01"
end_date: "2026-08-31"
campaigns:
  - name: "Awareness — US"
    targeting:
      geo: ["US"]
      age_min: 25
      age_max: 45
      interests: ["technology", "software"]
    ad_sets:
      - name: "Feed — Mobile"
        placement: "FEED"
        budget_share: 0.6       # fraction of daily budget
      - name: "Stories"
        placement: "STORIES"
        budget_share: 0.4
```

If the file is missing or malformed, abort. Append to `memory/logs/${today}.md`:
```
### create-campaign
- ABORTED: campaign-config.yml missing or invalid
```
Then stop — no notification.

Resolve the label: if `${var}` is non-empty use it; otherwise use `campaign_group` from the config.

### 2. Check for existing state

Read `skills/create-campaign/state-${label}.json` if it exists. If `status: "complete"` is present, abort with a log line:
```
### create-campaign
- SKIPPED: state-${label}.json already complete — delete or rename to re-provision
```
This prevents accidental double-provisioning on re-runs.

### 3. Write pending API requests

Write each API call to `.pending-admanage/create-campaign-${label}.json`:

```json
{
  "action": "create_campaign_tree",
  "label": "${label}",
  "config_path": "skills/create-campaign/campaign-config.yml",
  "state_output_path": "skills/create-campaign/state-${label}.json",
  "all_paused": true,
  "requests": [
    {
      "entity": "campaign",
      "name": "Awareness — US",
      "objective": "OUTCOME_TRAFFIC",
      "status": "PAUSED",
      "daily_budget": 5000
    },
    {
      "entity": "ad_set",
      "parent_campaign": "Awareness — US",
      "name": "Feed — Mobile",
      "placement": "FEED",
      "status": "PAUSED",
      "daily_budget": 3000
    },
    {
      "entity": "ad_set",
      "parent_campaign": "Awareness — US",
      "name": "Stories",
      "placement": "STORIES",
      "status": "PAUSED",
      "daily_budget": 2000
    }
  ]
}
```

All `status` fields must be `"PAUSED"`. Never set `"ACTIVE"` — this is an immutable rule.

The `scripts/postprocess-admanage.sh` script will read `.pending-admanage/*.json` after Claude exits, call the AdManage.ai API with `ADMANAGE_API_KEY` from the environment, and write the returned campaign/ad set IDs back into the `state_output_path`.

### 4. Log pre-execution state

Append to `memory/logs/${today}.md`:
```
### create-campaign
- Config: skills/create-campaign/campaign-config.yml
- Label: ${label}
- Campaigns to provision: N
- Ad sets to provision: M
- Pending API batch: .pending-admanage/create-campaign-${label}.json
- State output: skills/create-campaign/state-${label}.json
- All entities: PAUSED
- Postprocess: scripts/postprocess-admanage.sh will execute after Claude exits
```

### 5. Notify

```
./notify "*Create Campaign — ${today}*

Provisioning ${N} campaign(s) and ${M} ad set(s) for label: ${label}

All entities will be created PAUSED — no spend activated.
IDs will be written to skills/create-campaign/state-${label}.json
after postprocess-admanage.sh runs.

Next: run schedule-ads to target these IDs once live."
```

---

## Config reference

`skills/create-campaign/campaign-config.yml` — the declarative spec for what to create. Edit this file to change campaigns, targeting, budgets, or placements.

`skills/create-campaign/state-${label}.json` — written by `scripts/postprocess-admanage.sh` after the API calls succeed. Schema:
```json
{
  "label": "q3-launch",
  "status": "complete",
  "provisioned_at": "2026-05-22T10:00:00Z",
  "campaigns": [
    { "name": "Awareness — US", "id": "120200001234567890", "status": "PAUSED" }
  ],
  "ad_sets": [
    { "name": "Feed — Mobile", "campaign_id": "120200001234567890", "id": "120200009876543210", "status": "PAUSED" }
  ]
}
```

---

## Required secrets

Add to GitHub repo → Settings → Secrets and variables → Actions:

| Secret | Description |
|--------|-------------|
| `ADMANAGE_API_KEY` | AdManage.ai API key from your account dashboard |

---

## Sandbox note

The sandbox blocks outbound curl with `$ADMANAGE_API_KEY` in headers. This skill does **not** call the API directly. Instead, it writes a structured request to `.pending-admanage/create-campaign-${label}.json`. The workflow runs `scripts/postprocess-admanage.sh` after Claude exits — that script has full env access and handles the actual API calls, then writes IDs back to the state file.

Never attempt direct curl to the AdManage.ai API from within the skill steps. The postprocess path is the only supported route.

## Constraints

- All provisioned entities must be `PAUSED`. Never set `ACTIVE` in any API request.
- Never provision if `state-${label}.json` already has `status: "complete"`.
- Never skip the pending-file step — without it, postprocess-admanage.sh has nothing to execute.
- Do not hard-code campaign IDs — they come back from the API and live in the state file only.
