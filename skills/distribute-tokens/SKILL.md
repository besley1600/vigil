---
name: Distribute Tokens
description: Send tokens to a list of contributors via Bankr Wallet API with per-recipient idempotency, two-phase resolve→execute, dry-run, and recovery from partial runs
var: ""
tags: [crypto]
---

> **${var}** — Distribution label matching a CSV filename (e.g. `contributors-may` → reads `skills/distribute-tokens/recipients-contributors-may.csv`). Append `dry-run` to simulate without sending (e.g. `contributors-may dry-run`). Required.

Today is ${today}. Read `memory/MEMORY.md` for wallet address, token config, and prior distribution history.

## Overview

Two-phase token distribution:
1. **Resolve** — map any Twitter handles in the recipient list to wallet addresses via Bankr API.
2. **Execute** — send tokens to each resolved address, with idempotency checks against prior state.

All state is written to `skills/distribute-tokens/state-${run_id}.json` before any sends begin, enabling recovery if a run is interrupted.

Requires `BANKR_API_KEY` and `AGENT_WALLET_ADDRESS` to be set as GitHub Actions secrets.

---

## Steps

### 1. Parse parameters

Extract from `${var}`:
- `label` — everything before `dry-run` (trimmed). E.g. `contributors-may`.
- `DRY_RUN` — `true` if `${var}` contains `dry-run`, else `false`.

If `label` is empty, abort. Log:
```
### distribute-tokens
- ABORTED: ${var} is empty — provide a distribution label
```
Stop — no notification.

Derive:
- `csv_path` = `skills/distribute-tokens/recipients-${label}.csv`
- `run_id` = `${label}-${today}`
- `state_path` = `skills/distribute-tokens/state-${run_id}.json`

### 2. Read recipient CSV

Read `${csv_path}`. Expected columns (header row required):
```
handle_or_address,amount,reason
```

- `handle_or_address` — Twitter handle (e.g. `@alice`) or `0x` wallet address.
- `amount` — token amount as a decimal string (e.g. `100.0`).
- `reason` — human-readable reason for the distribution (logged, not sent on-chain).

If the file is missing, abort with log. If any row is missing required fields, skip that row and log a warning — do not abort the whole run.

### 3. Load or initialize state

Read `${state_path}` if it exists. This enables recovery from partial runs.

State schema:
```json
{
  "run_id": "contributors-may-2026-05-22",
  "label": "contributors-may",
  "dry_run": false,
  "started_at": "2026-05-22T10:00:00Z",
  "resolved_at": null,
  "executed_at": null,
  "recipients": [
    {
      "handle_or_address": "@alice",
      "amount": "100.0",
      "reason": "May contributions",
      "resolved_address": null,
      "resolve_status": "pending",
      "send_status": "pending",
      "tx_hash": null,
      "error": null
    }
  ]
}
```

If state already exists and has entries with `send_status: "sent"`, skip those recipients — they were already sent in a prior partial run. Continue with remaining `send_status: "pending"` or `"failed"` entries.

If state does not exist, initialize it from the CSV and write it to `${state_path}` immediately.

### 4. Phase 1 — Resolve handles to addresses

For each recipient with `handle_or_address` starting with `@` and `resolve_status: "pending"`:

Write a resolve request to `.pending-admanage/` — or rather, since Bankr uses its own API, use WebFetch with the `BANKR_API_KEY` embedded inline:

```
POST https://api.bankr.bot/v1/resolve
Content-Type: application/json
Authorization: Bearer BANKR_API_KEY

{ "handle": "@alice" }
```

On success (`200`), set `resolved_address` and `resolve_status: "resolved"`.
On `404`, set `resolve_status: "unresolvable"` and skip in phase 2.
On other error, set `resolve_status: "failed"` with `error` message.

For entries that are already a `0x` address, set `resolve_address = handle_or_address` and `resolve_status: "resolved"` without calling the API.

After processing all entries, update `resolved_at` in state and write state to disk.

Print a resolve summary:
```
Resolve phase complete: ${resolved}/${total} resolved, ${unresolvable} unresolvable, ${failed} failed
```

### 5. Dry-run branch

If `DRY_RUN == true`:

Print a table of what would be sent:
```
DRY RUN — no tokens will be sent
| Handle/Address | Resolved Address | Amount | Reason |
|----------------|-----------------|--------|--------|
| @alice         | 0xABC...123      | 100.0  | May contributions |
| @bob (unresolvable) | — | 50.0 | — SKIP |
```

Compute totals: `total_tokens = sum of all resolved-recipient amounts`.

Append to `memory/logs/${today}.md`:
```
### distribute-tokens
- DRY RUN: ${label}
- Recipients: ${total} (${resolved} resolved, ${unresolvable} unresolvable)
- Total tokens (would send): ${total_tokens}
- State: ${state_path}
```

Send via `./notify`:
```
*Distribute Tokens — DRY RUN — ${today}*

Label: ${label}
Recipients: ${total} (${resolved} resolved, ${unresolvable} unresolvable)
Would send: ${total_tokens} tokens total

Top recipients:
- @alice: 100.0 → 0xABC...123
- @bob: SKIP (unresolvable)

No tokens sent. Remove "dry-run" from var to execute.
```

Stop — do not proceed to phase 2.

### 6. Phase 2 — Execute sends

Pre-flight check:

Use WebFetch to query the sender wallet balance:
```
GET https://api.bankr.bot/v1/wallet/${AGENT_WALLET_ADDRESS}/balance
Authorization: Bearer BANKR_API_KEY
```

If balance < sum of pending send amounts, abort with log and notification:
```
ABORTED: Insufficient balance. Required: ${required}, Available: ${balance}
```

For each recipient with `resolve_status: "resolved"` and `send_status: "pending"` (or `"failed"` on recovery):

```
POST https://api.bankr.bot/v1/send
Content-Type: application/json
Authorization: Bearer BANKR_API_KEY

{
  "from": "${AGENT_WALLET_ADDRESS}",
  "to": "${resolved_address}",
  "amount": "${amount}",
  "idempotency_key": "${run_id}-${handle_or_address}"
}
```

On success: set `send_status: "sent"`, `tx_hash` from response. Write state to disk immediately after each send (crash-safe).
On `409` (idempotency conflict — already sent): set `send_status: "sent"`, note `"duplicate_prevented": true`.
On other error: set `send_status: "failed"`, `error` from response. Continue to next recipient — never abort mid-run.

After all sends, set `executed_at` in state. Write final state.

### 7. Write confirmation log and notify

Append to `memory/logs/${today}.md`:
```
### distribute-tokens
- Label: ${label}
- Recipients: ${total} | Resolved: ${resolved} | Sent: ${sent} | Failed: ${failed} | Skipped: ${skipped}
- Total tokens sent: ${total_tokens}
- State: ${state_path}
$(for each sent: "- SENT: ${handle_or_address} → ${resolved_address} | ${amount} tokens | tx: ${tx_hash}")
$(for each failed: "- FAILED: ${handle_or_address} — ${error}")
```

```
./notify "*Distribute Tokens — ${today}*

Label: ${label}
Sent: ${sent}/${resolved} recipients — ${total_tokens} tokens

$(if failed > 0): FAILED: ${failed} recipients — check state-${run_id}.json for details

Top sends:
- @alice → 100.0 tokens ✓
- @carol → 75.0 tokens ✓"
```

---

## Recovery

If a run is interrupted, re-run with the same `${var}`. The skill reads `state-${run_id}.json`, skips already-sent recipients (via `send_status: "sent"`), and resumes from the first pending/failed entry. The `idempotency_key` in the API call provides a second layer of protection — Bankr will return 409 rather than double-send even if the state file was lost.

---

## Required secrets

Add to GitHub repo → Settings → Secrets and variables → Actions:

| Secret | Description |
|--------|-------------|
| `BANKR_API_KEY` | Bankr Wallet API key |
| `AGENT_WALLET_ADDRESS` | The agent's sender wallet address (e.g. `0xABC...123`) |

---

## Sandbox note

The Bankr API requires `BANKR_API_KEY` in an Authorization header. Use WebFetch with the token embedded inline for both the resolve and send calls. Do not use curl with `$BANKR_API_KEY` in headers — that fails in the GitHub Actions sandbox. `AGENT_WALLET_ADDRESS` can be embedded inline in the request body without risk (it's a public wallet address).

## Constraints

- Always write state to disk before any sends begin and after every individual send.
- Never send without a pre-flight balance check.
- Always respect idempotency: skip `send_status: "sent"` entries on recovery.
- Dry-run must never call the send endpoint — resolve only.
- Do not abort the whole run on a single send failure — log it and continue.
- Never log `BANKR_API_KEY` to any file.
