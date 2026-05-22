import { NextResponse } from 'next/server'
import { execFileSync, execSync } from 'child_process'
import sodium from 'libsodium-wrappers'

const GITHUB_API = 'https://api.github.com'

const BUILTIN_SECRETS = [
  { name: 'CLAUDE_CODE_OAUTH_TOKEN', group: 'Core', description: 'Claude Code OAuth token (set via Authenticate button)', either: 'auth' },
  { name: 'ANTHROPIC_API_KEY', group: 'Core', description: 'Anthropic API key for Claude Code', either: 'auth' },
  { name: 'BANKR_LLM_KEY', group: 'Core', description: 'Bankr Gateway API key (bk_...) — enable at bankr.bot/api' },
  { name: 'TELEGRAM_BOT_TOKEN', group: 'Telegram', description: 'Bot token from @BotFather' },
  { name: 'TELEGRAM_CHAT_ID', group: 'Telegram', description: 'Your chat ID' },
  { name: 'DISCORD_BOT_TOKEN', group: 'Discord', description: 'Discord bot token' },
  { name: 'DISCORD_CHANNEL_ID', group: 'Discord', description: 'Channel ID for messages' },
  { name: 'DISCORD_WEBHOOK_URL', group: 'Discord', description: 'Webhook URL for notifications' },
  { name: 'SLACK_BOT_TOKEN', group: 'Slack', description: 'Slack bot OAuth token' },
  { name: 'SLACK_CHANNEL_ID', group: 'Slack', description: 'Channel ID for messages' },
  { name: 'SLACK_WEBHOOK_URL', group: 'Slack', description: 'Webhook URL for notifications' },
  { name: 'SENDGRID_API_KEY', group: 'Email', description: 'SendGrid API key — create at sendgrid.com/settings/api_keys' },
  { name: 'NOTIFY_EMAIL_TO', group: 'Email', description: 'Recipient email address for skill notifications' },
  { name: 'DEVTO_API_KEY', group: 'Distribution', description: 'Dev.to API key — generate at dev.to/settings/extensions' },
  { name: 'NEYNAR_API_KEY', group: 'Distribution', description: 'Neynar API key — used by farcaster-digest (read) and syndicate-article (cast)' },
  { name: 'NEYNAR_SIGNER_UUID', group: 'Distribution', description: 'Neynar managed signer UUID — required to publish Farcaster casts' },
  { name: 'XAI_API_KEY', group: 'Skill Keys', description: 'xAI/Grok API key (for tweet skills)' },
  { name: 'COINGECKO_API_KEY', group: 'Skill Keys', description: 'CoinGecko API key (for crypto skills)' },
  { name: 'ALCHEMY_API_KEY', group: 'Skill Keys', description: 'Alchemy API key (for on-chain skills)' },
  { name: 'GH_GLOBAL', group: 'Skill Keys', description: 'GitHub PAT with cross-repo access' },
]

const BUILTIN_NAMES = new Set(BUILTIN_SECRETS.map(s => s.name))
const VALID_SECRET_NAME = /^[A-Z][A-Z0-9_]{1,}$/

// ── Local mode (gh CLI) ──────────────────────────────────────────────────────

function ghAvailable(): boolean {
  try {
    execSync('gh auth status', { stdio: 'pipe', timeout: 6000 })
    return true
  } catch {
    return false
  }
}

function ghRepo(): string | null {
  try {
    const repo = execSync('gh repo set-default --view', { stdio: 'pipe', timeout: 6000 }).toString().trim()
    if (repo && !repo.startsWith('no default')) return repo
  } catch {}
  try {
    const repo = execSync('gh repo view --json nameWithOwner -q .nameWithOwner', { stdio: 'pipe', timeout: 6000 }).toString().trim()
    if (repo) return repo
  } catch {}
  return null
}

function ghArgsRepo(): string[] {
  const repo = ghRepo()
  return repo ? ['-R', repo] : []
}

function listSecretsLocal(): string[] {
  try {
    const out = execFileSync('gh', ['secret', 'list', ...ghArgsRepo(), '--json', 'name', '-q', '.[].name'], {
      stdio: 'pipe',
      cwd: process.cwd(),
      timeout: 10000,
    }).toString().trim()
    return out ? out.split('\n').filter(Boolean) : []
  } catch {
    return []
  }
}

// ── Remote mode (GitHub API) ─────────────────────────────────────────────────

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

function getRemoteConfig(request: Request) {
  const token = process.env.GITHUB_TOKEN || request.headers.get('x-github-token') || ''
  const repo = process.env.GITHUB_REPO || request.headers.get('x-github-repo') || ''
  return { token, repo }
}

function isRemote(request: Request): boolean {
  if (process.env.GITHUB_TOKEN && process.env.GITHUB_REPO) return true
  const token = request.headers.get('x-github-token')
  const repo = request.headers.get('x-github-repo')
  return !!(token && repo)
}

async function listSecretsRemote(token: string, repo: string): Promise<string[]> {
  const res = await fetch(`${GITHUB_API}/repos/${repo}/actions/secrets?per_page=100`, {
    headers: authHeaders(token),
    cache: 'no-store',
  })
  if (!res.ok) return []
  const data = await res.json()
  return (data.secrets || []).map((s: { name: string }) => s.name)
}

async function encryptSecret(publicKey: string, value: string): Promise<string> {
  await sodium.ready
  const binKey = sodium.from_base64(publicKey, sodium.base64_variants.ORIGINAL)
  const binSec = sodium.from_string(value)
  const encrypted = sodium.crypto_box_seal(binSec, binKey)
  return sodium.to_base64(encrypted, sodium.base64_variants.ORIGINAL)
}

async function setSecretRemote(token: string, repo: string, name: string, value: string): Promise<void> {
  const pkRes = await fetch(`${GITHUB_API}/repos/${repo}/actions/secrets/public-key`, {
    headers: authHeaders(token),
    cache: 'no-store',
  })
  if (!pkRes.ok) throw new Error(`Failed to fetch public key: ${pkRes.status}`)
  const { key_id, key } = await pkRes.json()

  const encryptedValue = await encryptSecret(key, value)
  const res = await fetch(`${GITHUB_API}/repos/${repo}/actions/secrets/${name}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({ encrypted_value: encryptedValue, key_id }),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Failed to set secret: ${res.status}`)
}

async function deleteSecretRemote(token: string, repo: string, name: string): Promise<void> {
  const res = await fetch(`${GITHUB_API}/repos/${repo}/actions/secrets/${name}`, {
    method: 'DELETE',
    headers: authHeaders(token),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Failed to delete secret: ${res.status}`)
}

// ── Route handlers ───────────────────────────────────────────────────────────

export async function GET(request: Request) {
  if (isRemote(request)) {
    const { token, repo } = getRemoteConfig(request)
    const setSecretNames = new Set(await listSecretsRemote(token, repo))

    const secrets = BUILTIN_SECRETS.map(s => ({ ...s, isSet: setSecretNames.has(s.name) }))
    for (const name of setSecretNames) {
      if (!BUILTIN_NAMES.has(name)) {
        secrets.push({ name, group: 'Skill Keys', description: 'Custom secret', isSet: true })
      }
    }

    return NextResponse.json({ secrets, ghReady: true })
  }

  // Local mode
  const ghReady = ghAvailable()
  const setSecrets = new Set(ghReady ? listSecretsLocal() : [])
  const secrets = BUILTIN_SECRETS.map(s => ({ ...s, isSet: setSecrets.has(s.name) }))
  if (ghReady) {
    for (const name of setSecrets) {
      if (!BUILTIN_NAMES.has(name)) {
        secrets.push({ name, group: 'Skill Keys', description: 'Custom secret', isSet: true })
      }
    }
  }
  return NextResponse.json({ secrets, ghReady })
}

export async function POST(request: Request) {
  const { name, value } = await request.json()

  if (!name || !value) {
    return NextResponse.json({ error: 'name and value required' }, { status: 400 })
  }
  if (!VALID_SECRET_NAME.test(name)) {
    return NextResponse.json({ error: 'Invalid secret name — use UPPER_SNAKE_CASE' }, { status: 400 })
  }

  if (isRemote(request)) {
    const { token, repo } = getRemoteConfig(request)
    try {
      await setSecretRemote(token, repo, name, value)
      return NextResponse.json({ ok: true })
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to set secret'
      return NextResponse.json({ error: msg }, { status: 500 })
    }
  }

  if (!ghAvailable()) {
    return NextResponse.json({ error: 'GitHub CLI not authenticated' }, { status: 503 })
  }
  try {
    execFileSync('gh', ['secret', 'set', name, ...ghArgsRepo(), '-b', value], { stdio: 'pipe', cwd: process.cwd() })
    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to set secret'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { name } = await request.json()

  if (!name || !VALID_SECRET_NAME.test(name)) {
    return NextResponse.json({ error: 'Invalid secret name' }, { status: 400 })
  }

  if (isRemote(request)) {
    const { token, repo } = getRemoteConfig(request)
    try {
      await deleteSecretRemote(token, repo, name)
      return NextResponse.json({ ok: true })
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to delete secret'
      return NextResponse.json({ error: msg }, { status: 500 })
    }
  }

  if (!ghAvailable()) {
    return NextResponse.json({ error: 'GitHub CLI not authenticated' }, { status: 503 })
  }
  try {
    execFileSync('gh', ['secret', 'delete', name, ...ghArgsRepo()], { stdio: 'pipe', cwd: process.cwd() })
    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to delete secret'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
