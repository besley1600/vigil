#!/usr/bin/env bash
# Pre-fetch treasury wallet data OUTSIDE the Claude sandbox.
# Called by the workflow before Claude starts, with full env access.
# Caches API responses under .treasury-cache/ so the treasury-info skill
# can read them instead of calling auth-required APIs directly.
#
# chmod +x scripts/prefetch-treasury.sh
#
# Data sources:
#   ALCHEMY_API_KEY  — Alchemy Portfolio API (EVM + Solana token balances)
#   BANKR_API_KEY    — Bankr wallet portfolio + PnL enrichment
#
# If neither key is set, exits 0 silently — treasury-info falls back to
# public RPC endpoints at runtime.
set -uo pipefail

TODAY=$(date -u +%Y-%m-%d)
CACHE_DIR=".treasury-cache"
WATCHES_FILE="memory/on-chain-watches.yml"

log()  { echo "prefetch-treasury: $*"; }
warn() { echo "::warning::prefetch-treasury: $*"; }

# Exit immediately if neither key is configured
if [ -z "${ALCHEMY_API_KEY:-}" ] && [ -z "${BANKR_API_KEY:-}" ]; then
  log "neither ALCHEMY_API_KEY nor BANKR_API_KEY is set — skipping (treasury-info will use public RPC)"
  exit 0
fi

mkdir -p "$CACHE_DIR"

# ---------------------------------------------------------------------------
# Parse wallet addresses from memory/on-chain-watches.yml
# Returns lines of "label|address|chain" for type:wallet entries only.
# ---------------------------------------------------------------------------
parse_watches() {
  if [ ! -f "$WATCHES_FILE" ]; then
    log "no watches file found at ${WATCHES_FILE}"
    return
  fi

  # Simple YAML parser: extract label/address/chain blocks under `watches:`
  # Works for the minimal schema defined in SKILL.md (indented key: value pairs).
  python3 - "$WATCHES_FILE" <<'PYEOF' 2>/dev/null || true
import sys, re

path = sys.argv[1]
try:
    with open(path) as f:
        content = f.read()
except Exception:
    sys.exit(0)

# Find the watches: block
in_watches = False
entries = []
current = {}
for line in content.splitlines():
    stripped = line.strip()
    if stripped == 'watches:':
        in_watches = True
        continue
    if in_watches:
        if stripped.startswith('- ') or stripped == '-':
            if current:
                entries.append(current)
            current = {}
            rest = stripped[2:].strip()
            if rest:
                m = re.match(r'(\w+):\s*(.*)', rest)
                if m:
                    current[m.group(1)] = m.group(2).strip('"\'')
        elif re.match(r'^\w', stripped) and ':' not in stripped[:20]:
            # top-level section — exit watches block
            break
        elif stripped and not stripped.startswith('#'):
            m = re.match(r'(\w+):\s*(.*)', stripped)
            if m:
                current[m.group(1)] = m.group(2).strip('"\'')
if current:
    entries.append(current)

for e in entries:
    etype = e.get('type', 'wallet')
    if etype != 'wallet':
        continue
    label = e.get('label', 'unknown')
    address = e.get('address', '')
    chain = e.get('chain', 'ethereum')
    if address and not address.startswith('0x_placeholder') and len(address) > 10:
        print(f"{label}|{address}|{chain}")
PYEOF
}

# Map chain label to Alchemy network name
chain_to_alchemy_network() {
  case "$1" in
    base)       echo "base-mainnet" ;;
    ethereum)   echo "eth-mainnet" ;;
    optimism)   echo "opt-mainnet" ;;
    arbitrum)   echo "arb-mainnet" ;;
    polygon)    echo "polygon-mainnet" ;;
    solana)     echo "solana-mainnet" ;;
    *)          echo "eth-mainnet" ;;
  esac
}

# ---------------------------------------------------------------------------
# 1. Alchemy Portfolio API
# ---------------------------------------------------------------------------
fetch_alchemy() {
  if [ -z "${ALCHEMY_API_KEY:-}" ]; then
    log "ALCHEMY_API_KEY not set — skipping Alchemy fetch"
    return
  fi

  local outfile="${CACHE_DIR}/alchemy-${TODAY}.json"
  if [ -f "$outfile" ] && [ -s "$outfile" ]; then
    log "Alchemy cache already exists for today (${outfile}), skipping re-fetch"
    return
  fi

  # Collect all wallet addresses
  local addresses_json="[]"
  local found=0
  while IFS='|' read -r label address chain; do
    [ -z "$address" ] && continue
    local network
    network=$(chain_to_alchemy_network "$chain")
    addresses_json=$(printf '%s' "$addresses_json" | \
      python3 -c "
import sys, json
data = json.load(sys.stdin)
data.append({'address': '${address}', 'networks': ['${network}']})
print(json.dumps(data))
" 2>/dev/null) || {
      warn "failed to build addresses JSON for ${label} — skipping this wallet"
      continue
    }
    found=$((found + 1))
    log "queuing ${label} (${address}) on ${network}"
  done < <(parse_watches)

  if [ "$found" -eq 0 ]; then
    log "no wallet addresses found in ${WATCHES_FILE} — writing empty Alchemy cache"
    echo '{"status":"no_wallets","fetched_at":"'"${TODAY}"'"}' > "$outfile"
    return
  fi

  local request_body
  request_body=$(python3 -c "
import json, sys
addresses = json.loads(sys.stdin.read())
body = {
    'addresses': addresses,
    'withMetadata': True,
    'withPrices': True
}
print(json.dumps(body))
" <<< "$addresses_json" 2>/dev/null) || {
    warn "failed to build Alchemy request body"
    echo '{"status":"error","error":"request_build_failed","fetched_at":"'"${TODAY}"'"}' > "$outfile"
    return
  }

  log "fetching Alchemy Portfolio API for ${found} wallet(s) ..."
  local response http_code
  response=$(curl -s --max-time 60 -w "\n__HTTP_CODE__%{http_code}" \
    -X POST "https://api.g.alchemy.com/data/v1/${ALCHEMY_API_KEY}/assets/tokens/by-address" \
    -H "Content-Type: application/json" \
    -d "$request_body" 2>&1) || {
    warn "curl failed for Alchemy API — writing error cache"
    echo '{"status":"error","error":"curl_failed","fetched_at":"'"${TODAY}"'"}' > "$outfile"
    return
  }

  http_code=$(printf '%s' "$response" | grep '__HTTP_CODE__' | sed 's/__HTTP_CODE__//')
  response=$(printf '%s' "$response" | grep -v '__HTTP_CODE__')

  if [ "$http_code" = "200" ]; then
    printf '%s' "$response" > "$outfile"
    local byte_count
    byte_count=$(printf '%s' "$response" | wc -c | tr -d ' ')
    log "Alchemy response saved to ${outfile} (${byte_count} bytes)"
  else
    warn "Alchemy API returned HTTP ${http_code}"
    local error_msg
    error_msg=$(printf '%s' "$response" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('error',{}).get('message','unknown'))" 2>/dev/null || printf '%s' "$response" | head -c 200)
    echo '{"status":"error","http_code":"'"${http_code}"'","error":"'"${error_msg}"'","fetched_at":"'"${TODAY}"'"}' > "$outfile"
    warn "error detail: ${error_msg}"
  fi
}

# ---------------------------------------------------------------------------
# 2. Bankr Portfolio API
# ---------------------------------------------------------------------------
fetch_bankr() {
  if [ -z "${BANKR_API_KEY:-}" ]; then
    log "BANKR_API_KEY not set — skipping Bankr fetch"
    return
  fi

  local outfile="${CACHE_DIR}/bankr-${TODAY}.json"
  if [ -f "$outfile" ] && [ -s "$outfile" ]; then
    log "Bankr cache already exists for today (${outfile}), skipping re-fetch"
    return
  fi

  log "fetching Bankr portfolio + PnL ..."
  local response http_code
  response=$(curl -s --max-time 30 -w "\n__HTTP_CODE__%{http_code}" \
    "https://api.bankr.bot/wallet/portfolio?include=pnl&showLowValueTokens=false" \
    -H "X-API-Key: ${BANKR_API_KEY}" 2>&1) || {
    warn "curl failed for Bankr API — writing error cache"
    echo '{"status":"error","error":"curl_failed","fetched_at":"'"${TODAY}"'"}' > "$outfile"
    return
  }

  http_code=$(printf '%s' "$response" | grep '__HTTP_CODE__' | sed 's/__HTTP_CODE__//')
  response=$(printf '%s' "$response" | grep -v '__HTTP_CODE__')

  if [ "$http_code" = "200" ]; then
    printf '%s' "$response" > "$outfile"
    local byte_count
    byte_count=$(printf '%s' "$response" | wc -c | tr -d ' ')
    log "Bankr response saved to ${outfile} (${byte_count} bytes)"
  else
    warn "Bankr API returned HTTP ${http_code}"
    local error_msg
    error_msg=$(printf '%s' "$response" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('message','unknown'))" 2>/dev/null || printf '%s' "$response" | head -c 200)
    echo '{"status":"error","http_code":"'"${http_code}"'","error":"'"${error_msg}"'","fetched_at":"'"${TODAY}"'"}' > "$outfile"
    warn "error detail: ${error_msg}"
  fi
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
log "starting treasury prefetch (cache dir: ${CACHE_DIR})"

fetch_alchemy || true
fetch_bankr   || true

log "prefetch complete"
log "cache contents:"
ls -lh "${CACHE_DIR}/" 2>/dev/null || log "(empty)"
