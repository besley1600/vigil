import { NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { execFileSync, execSync } from 'child_process'
import { resolve } from 'path'
import { existsSync, readFileSync } from 'fs'

const REPO_ROOT = resolve(process.cwd(), '..')

function getSecret(): string | null {
  return process.env.VIGIL_WEBHOOK_SECRET ?? null
}

function verifyHmac(body: string, signature: string): boolean {
  const secret = getSecret()
  if (!secret) return false
  const expected = 'sha256=' + createHmac('sha256', secret).update(body).digest('hex')
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  } catch {
    return false
  }
}

function verifyBearer(authHeader: string): boolean {
  const secret = getSecret()
  if (!secret) return false
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!token || token.length !== secret.length) return false
  try {
    return timingSafeEqual(Buffer.from(token), Buffer.from(secret))
  } catch {
    return false
  }
}

function ghRepo(): string | null {
  try {
    return execSync('gh repo view --json nameWithOwner -q .nameWithOwner', {
      stdio: 'pipe', cwd: REPO_ROOT,
    }).toString().trim() || null
  } catch {
    return null
  }
}

function isLocalhost(request: Request): boolean {
  const host = request.headers.get('host') ?? ''
  return host.startsWith('localhost') || host.startsWith('127.0.0.1') || host.startsWith('[::1]')
}

function skillExists(skill: string): boolean {
  return existsSync(resolve(REPO_ROOT, 'skills', skill, 'SKILL.md'))
}

function listSkillSlugs(): string[] {
  try {
    const manifest = JSON.parse(readFileSync(resolve(REPO_ROOT, 'skills.json'), 'utf-8'))
    return (manifest.skills ?? []).map((s: { slug: string }) => s.slug)
  } catch {
    return []
  }
}

// POST /api/webhook — trigger a skill via HTTP
export async function POST(request: Request) {
  const secret = getSecret()
  const rawBody = await request.text()

  if (secret) {
    const sig = request.headers.get('x-vigil-signature') ?? request.headers.get('x-hub-signature-256') ?? ''
    const auth = request.headers.get('authorization') ?? ''
    if (!verifyHmac(rawBody, sig) && !verifyBearer(auth)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  } else if (!isLocalhost(request)) {
    return NextResponse.json(
      { error: 'VIGIL_WEBHOOK_SECRET not configured. Set it in GitHub Secrets and as a local env var.' },
      { status: 503 }
    )
  }

  let body: { skill?: string; var?: string; ref?: string; inputs?: Record<string, string> }
  try {
    body = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const skill = body.skill?.trim() ?? ''
  if (!skill) {
    return NextResponse.json(
      { error: '`skill` is required', example: { skill: 'deep-research', var: 'AI agents 2025' } },
      { status: 400 }
    )
  }

  if (!/^[a-z0-9-]+$/.test(skill)) {
    return NextResponse.json({ error: 'Invalid skill name — use lowercase kebab-case' }, { status: 400 })
  }

  if (!skillExists(skill)) {
    const available = listSkillSlugs().slice(0, 10)
    return NextResponse.json(
      { error: `Skill not found: ${skill}`, available },
      { status: 404 }
    )
  }

  const varValue = body.var ?? body.inputs?.var ?? ''
  const ref = body.ref ?? 'main'

  try {
    const repo = ghRepo()
    const repoArgs = repo ? ['-R', repo] : []
    const args = ['workflow', 'run', 'vigil.yml', ...repoArgs, '--ref', ref, '-f', `skill=${skill}`]
    if (varValue) args.push('-f', `var=${varValue}`)
    execFileSync('gh', args, { stdio: 'pipe', cwd: REPO_ROOT })
    return NextResponse.json({
      ok: true,
      queued: skill,
      var: varValue || null,
      ref,
      message: `Skill dispatched to GitHub Actions: ${skill}`,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to dispatch workflow'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// GET /api/webhook — introspection / health check
export async function GET() {
  const secret = getSecret()
  return NextResponse.json({
    ok: true,
    auth: secret ? 'configured (hmac-sha256 or bearer)' : 'none — localhost only',
    headers: {
      hmac: 'X-Vigil-Signature: sha256=<hmac-sha256-of-body>',
      bearer: 'Authorization: Bearer <VIGIL_WEBHOOK_SECRET>',
    },
    body: {
      skill: 'string (required) — skill slug, e.g. "deep-research"',
      var: 'string (optional) — variable input passed to the skill',
      ref: 'string (optional, default "main") — git ref to run on',
    },
    example: {
      curl: `curl -X POST http://localhost:5555/api/webhook \\
  -H "Authorization: Bearer $VIGIL_WEBHOOK_SECRET" \\
  -H "Content-Type: application/json" \\
  -d '{"skill":"deep-research","var":"AI agent frameworks"}'`,
    },
    docs: 'https://github.com/besley1600/vigil#webhooks',
  })
}
