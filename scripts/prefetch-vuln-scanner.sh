#!/usr/bin/env bash
# Pre-install security scanner binaries OUTSIDE the Claude sandbox.
# Called by the workflow before Claude starts, with full network access.
# Skills read binaries from ~/.cache/vigil-scanners/ instead of downloading at runtime.
#
# chmod +x scripts/prefetch-vuln-scanner.sh
#
# Tools installed:
#   semgrep       — SAST / secret detection (pip)
#   trufflehog    — verified secret scanning (GitHub release binary)
#   osv-scanner   — dependency CVE scanning (GitHub release binary)
#   slither       — Solidity smart-contract analysis (pip, only if .sol files present)
set -uo pipefail

CACHE_DIR="${HOME}/.cache/vigil-scanners"
BIN_DIR="${CACHE_DIR}/bin"
mkdir -p "$BIN_DIR"

log()  { echo "prefetch-vuln-scanner: $*"; }
warn() { echo "::warning::prefetch-vuln-scanner: $*"; }

# ---------------------------------------------------------------------------
# 1. semgrep (pip install)
# ---------------------------------------------------------------------------
install_semgrep() {
  if command -v semgrep >/dev/null 2>&1; then
    log "semgrep already available at $(command -v semgrep)"
    return 0
  fi
  if [ -x "${BIN_DIR}/semgrep" ]; then
    log "semgrep cached at ${BIN_DIR}/semgrep"
    return 0
  fi
  log "installing semgrep via pip ..."
  if pip install --quiet --user semgrep 2>&1; then
    log "semgrep installed"
    # Symlink into cache bin so the skill can find it via PATH or explicit path
    SEMGREP_BIN=$(command -v semgrep 2>/dev/null || true)
    if [ -n "$SEMGREP_BIN" ]; then
      ln -sf "$SEMGREP_BIN" "${BIN_DIR}/semgrep" 2>/dev/null || true
    fi
  else
    warn "FAILED to install semgrep — skill will log semgrep=fail and continue"
  fi
}

# ---------------------------------------------------------------------------
# 2. trufflehog (GitHub release binary)
# ---------------------------------------------------------------------------
install_trufflehog() {
  if [ -x "${BIN_DIR}/trufflehog" ]; then
    log "trufflehog cached at ${BIN_DIR}/trufflehog"
    return 0
  fi
  log "downloading trufflehog binary ..."
  # Detect arch
  ARCH=$(uname -m)
  case "$ARCH" in
    x86_64)  TH_ARCH="amd64" ;;
    aarch64|arm64) TH_ARCH="arm64" ;;
    *) warn "unsupported arch $ARCH for trufflehog, skipping"; return 1 ;;
  esac
  OS=$(uname -s | tr '[:upper:]' '[:lower:]')
  # Resolve latest release tag via GitHub API (no auth required for public repos)
  TH_VERSION=$(curl -fsSL --max-time 15 \
    "https://api.github.com/repos/trufflesecurity/trufflehog/releases/latest" \
    2>/dev/null | grep '"tag_name"' | sed 's/.*"tag_name": *"v\([^"]*\)".*/\1/' | head -1)
  if [ -z "$TH_VERSION" ]; then
    warn "could not resolve trufflehog latest version, using fallback"
    TH_VERSION="3.88.1"
  fi
  TH_URL="https://github.com/trufflesecurity/trufflehog/releases/download/v${TH_VERSION}/trufflehog_${TH_VERSION}_${OS}_${TH_ARCH}.tar.gz"
  TMP_DIR=$(mktemp -d)
  if curl -fsSL --max-time 120 -o "${TMP_DIR}/trufflehog.tar.gz" "$TH_URL" 2>&1; then
    tar -xzf "${TMP_DIR}/trufflehog.tar.gz" -C "$TMP_DIR" trufflehog 2>/dev/null || \
      tar -xzf "${TMP_DIR}/trufflehog.tar.gz" -C "$TMP_DIR" 2>/dev/null
    if [ -f "${TMP_DIR}/trufflehog" ]; then
      mv "${TMP_DIR}/trufflehog" "${BIN_DIR}/trufflehog"
      chmod +x "${BIN_DIR}/trufflehog"
      log "trufflehog v${TH_VERSION} installed at ${BIN_DIR}/trufflehog"
    else
      warn "trufflehog binary not found in archive — skill will log trufflehog=fail and continue"
    fi
  else
    warn "FAILED to download trufflehog from ${TH_URL} — skill will log trufflehog=fail and continue"
  fi
  rm -rf "$TMP_DIR"
}

# ---------------------------------------------------------------------------
# 3. osv-scanner (GitHub release binary)
# ---------------------------------------------------------------------------
install_osv_scanner() {
  if [ -x "${BIN_DIR}/osv-scanner" ]; then
    log "osv-scanner cached at ${BIN_DIR}/osv-scanner"
    return 0
  fi
  log "downloading osv-scanner binary ..."
  ARCH=$(uname -m)
  case "$ARCH" in
    x86_64)  OSV_ARCH="amd64" ;;
    aarch64|arm64) OSV_ARCH="arm64" ;;
    *) warn "unsupported arch $ARCH for osv-scanner, skipping"; return 1 ;;
  esac
  OS=$(uname -s | tr '[:upper:]' '[:lower:]')
  # Resolve latest release tag
  OSV_VERSION=$(curl -fsSL --max-time 15 \
    "https://api.github.com/repos/google/osv-scanner/releases/latest" \
    2>/dev/null | grep '"tag_name"' | sed 's/.*"tag_name": *"v\([^"]*\)".*/\1/' | head -1)
  if [ -z "$OSV_VERSION" ]; then
    warn "could not resolve osv-scanner latest version, using fallback"
    OSV_VERSION="1.9.2"
  fi
  OSV_URL="https://github.com/google/osv-scanner/releases/download/v${OSV_VERSION}/osv-scanner_${OS}_${OSV_ARCH}"
  if curl -fsSL --max-time 120 -o "${BIN_DIR}/osv-scanner" "$OSV_URL" 2>&1; then
    chmod +x "${BIN_DIR}/osv-scanner"
    log "osv-scanner v${OSV_VERSION} installed at ${BIN_DIR}/osv-scanner"
  else
    warn "FAILED to download osv-scanner from ${OSV_URL} — skill will log osv=fail and continue"
    rm -f "${BIN_DIR}/osv-scanner"
  fi
}

# ---------------------------------------------------------------------------
# 4. slither (pip install, only if Solidity files are present in the repo)
# ---------------------------------------------------------------------------
install_slither() {
  # Check for .sol files in the current working directory (the cloned repo)
  # Fall back to scanning the workspace root if CWD doesn't look like a repo
  SOL_COUNT=$(find . -name "*.sol" -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null | head -1 | wc -l | tr -d ' ')
  if [ "$SOL_COUNT" -eq 0 ]; then
    log "no .sol files found — skipping slither installation"
    return 0
  fi
  if command -v slither >/dev/null 2>&1; then
    log "slither already available at $(command -v slither)"
    return 0
  fi
  if [ -x "${BIN_DIR}/slither" ]; then
    log "slither cached at ${BIN_DIR}/slither"
    return 0
  fi
  log "Solidity files detected — installing slither-analyzer via pip ..."
  if pip install --quiet --user slither-analyzer 2>&1; then
    log "slither-analyzer installed"
    SLITHER_BIN=$(command -v slither 2>/dev/null || true)
    if [ -n "$SLITHER_BIN" ]; then
      ln -sf "$SLITHER_BIN" "${BIN_DIR}/slither" 2>/dev/null || true
    fi
  else
    warn "FAILED to install slither-analyzer — skill will log slither=fail and continue"
  fi
}

# ---------------------------------------------------------------------------
# Write a PATH hint file so the skill can source it to add $BIN_DIR to PATH
# ---------------------------------------------------------------------------
write_path_hint() {
  cat > "${CACHE_DIR}/env.sh" <<EOF
# Source this file to add vigil scanner binaries to PATH
export PATH="${BIN_DIR}:\$PATH"
EOF
  log "wrote ${CACHE_DIR}/env.sh — source it or prepend ${BIN_DIR} to PATH"
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
log "starting scanner prefetch (cache: ${CACHE_DIR})"

install_semgrep   || true
install_trufflehog || true
install_osv_scanner || true
install_slither   || true
write_path_hint

log "prefetch complete"
log "cached binaries:"
ls -lh "${BIN_DIR}/" 2>/dev/null || log "(none)"
