---
name: Schedule Ads
description: Schedule paid ads across Meta/TikTok/Snapchat/Pinterest/LinkedIn via AdManage.ai, driven by a declarative config — launches PAUSED by default, never auto-activates live spend
var: ""
tags: [productivity]
---

> **${var}** — Campaign state label to target (e.g. `q3-launch`). Must match a label in `skills/create-campaign/state-${var}.json`. If empty, reads the first available label from existing state files.

Today is ${today}. Read `memory/MEMORY.md` for campaign context, active ad strategies, and prior schedule runs.

## Overview

Reads campaign and ad set IDs from the state file written by `create-campaign`, then schedules ad creative and targeting parameters via the AdManage.ai API. All scheduled ads are created in `PAUSED` state — the operator must manually activate them in the ad platform. Writes a schedule report to `articles/`.

Requires `ADMANAGE_API_KEY` to be set as a GitHub Actions secret.

---

## Steps

### 1. Resolve label and state file

If `${var}` is set, `label = ${var}`.

If `${var}` is empty:
- Glob `skills/create-campaign/state-*.json`
- Pick the most recently modified file
- Extract its `label` field

State file path: `skills/create-campaign/state-${label}.json`

If the state file does not exist or has `status != "complete"`, abort. Log:
```
### schedule-ads
- ABORTED: state-${label}.json missing or not complete — run create-campaign first
```
Stop — no notification.

### 2. Read schedule config

Read `skills/schedule-ads/schedule-config.yml`. Expected schema:

```yaml
label: "q3-launch"          # must match the campaign state label
platforms: [meta, tiktok]   # active platforms for this schedule
flights:
  - name: "Week 1 — Awareness"
    start_date: "2026-06-01"
    end_date: "2026-06-07"
    campaigns: ["Awareness — US"]
    daily_budget_usd: 50
    creatives:
      - ad_set: "Feed — Mobile"
        headline: "Build faster with AI"
        body: "The agent that works while you sleep."
        cta: "LEARN_MORE"
        image_url: "https://cdn.example.com/ad-1.jpg"
      - ad_set: "Stories"
        headline: "Ship in minutes"
        body: "Autonomous workflows for builders."
        cta: "SIGN_UP"
        image_url: "https://cdn.example.com/ad-2.jpg"
  - name: "Week 2 — Conversion"
    ...
```

If config is missing or malformed, abort with log. If the config `label` does not match the resolved label, abort — mismatched configs are a safety failure.

### 3. Cross-reference campaign and ad set IDs

From `state-${label}.json`, build a lookup map:
```
campaign name → campaign_id
ad_set name → ad_set_id
```

For each creative in each flight, verify that `campaigns[]` and `ad_set` values exist in the state lookup map. If any reference is missing, log a warning and skip that creative — do not abort the whole run.

### 4. Write pending API requests

Write to `.pending-admanage/schedule-ads-${label}-${today}.json`:

```json
{
  "action": "schedule_ads",
  "label": "${label}",
  "platforms": ["meta", "tiktok"],
  "schedule_output_path": "articles/schedule-ads-${label}-${today}.md",
  "all_paused": true,
  "flights": [
    {
      "name": "Week 1 — Awareness",
      "start_date": "2026-06-01",
      "end_date": "2026-06-07",
      "ads": [
        {
          "platform": "meta",
          "campaign_id": "120200001234567890",
          "ad_set_id": "120200009876543210",
          "headline": "Build faster with AI",
          "body": "The agent that works while you sleep.",
          "cta": "LEARN_MORE",
          "image_url": "https://cdn.example.com/ad-1.jpg",
          "status": "PAUSED"
        }
      ]
    }
  ]
}
```

All `status` fields must be `"PAUSED"`. This is immutable.

The `scripts/postprocess-admanage.sh` script reads `.pending-admanage/*.json` after Claude exits and calls the AdManage.ai API. It writes the ad IDs and schedule confirmation back to `schedule_output_path`.

### 5. Write draft schedule report

Write a draft to `articles/schedule-ads-${label}-${today}.md`:

```markdown
# Ad Schedule: ${label} — ${today}

**Status: PENDING** (postprocess-admanage.sh has not yet run)

## Summary
- Label: ${label}
- Platforms: ${platforms joined with ", "}
- Flights: ${flight_count}
- Total ads to schedule: ${ad_count}
- All ads will be created **PAUSED** — operator must activate in platform

## Flights

### ${flight_name}
- Period: ${start_date} → ${end_date}
- Budget: $${daily_budget}/day
- Campaigns: ${campaign_names}

| Ad Set | Headline | CTA | Status |
|--------|----------|-----|--------|
| Feed — Mobile | "Build faster with AI" | LEARN_MORE | PAUSED |
| Stories | "Ship in minutes" | SIGN_UP | PAUSED |

...

## IDs (filled by postprocess-admanage.sh)
*This section will be populated with ad IDs after the API calls complete.*

## Activation Checklist
- [ ] Review all creative copy and image URLs above
- [ ] Log in to Meta Ads Manager (or TikTok Ads) and verify entities are present
- [ ] Manually activate campaigns when ready to spend
- [ ] Set a spend cap alert in platform before activating
```

### 6. Log and notify

Append to `memory/logs/${today}.md`:
```
### schedule-ads
- Label: ${label}
- Platforms: ${platforms}
- Flights: ${flight_count} | Ads: ${ad_count}
- All PAUSED
- Pending batch: .pending-admanage/schedule-ads-${label}-${today}.json
- Draft report: articles/schedule-ads-${label}-${today}.md
- Postprocess: scripts/postprocess-admanage.sh will populate IDs after Claude exits
```

```
./notify "*Schedule Ads — ${today}*

Label: ${label}
${flight_count} flights | ${ad_count} ads across ${platforms}

All ads will be created PAUSED.
Review and activate manually in the ad platform.

Draft report: articles/schedule-ads-${label}-${today}.md"
```

---

## Config reference

`skills/schedule-ads/schedule-config.yml` — the declarative spec for flights, creatives, and targeting. Edit this to add or change ad copy, dates, or budget allocation.

`skills/create-campaign/state-${label}.json` — provides campaign and ad set IDs. Must exist and be `status: "complete"` before schedule-ads can run.

---

## Required secrets

| Secret | Description |
|--------|-------------|
| `ADMANAGE_API_KEY` | AdManage.ai API key from your account dashboard |

---

## Sandbox note

Like `create-campaign`, this skill does not call the AdManage.ai API directly. It writes structured requests to `.pending-admanage/schedule-ads-${label}-${today}.json`. The workflow runs `scripts/postprocess-admanage.sh` after Claude exits — that script handles auth and API calls, then writes ad IDs back to the schedule report.

## Constraints

- All scheduled ads must be `PAUSED`. Never set `ACTIVE` — the operator must activate manually.
- Never run if `state-${label}.json` is not `status: "complete"`.
- If a creative references an unknown campaign or ad set, skip it with a warning — do not abort.
- Config label must match state label exactly — abort on mismatch.
- Do not hard-code platform-specific ad IDs — they come back from postprocess only.
