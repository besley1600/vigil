import { NextResponse } from 'next/server'
import { execFileSync, execSync } from 'child_process'
import { resolve } from 'path'
import { getWorkflowRuns } from '@/lib/github'

const REPO_ROOT = resolve(process.cwd(), '..')

function isRemote(request: Request) {
  return !!(request.headers.get('x-github-token') && request.headers.get('x-github-repo'))
}

function ghRepo(): string | null {
  try {
    const repo = execSync('gh repo set-default --view', { stdio: 'pipe', cwd: REPO_ROOT, timeout: 6000 }).toString().trim()
    if (repo && !repo.startsWith('no default')) return repo
  } catch {}
  try {
    const repo = execSync('gh repo view --json nameWithOwner -q .nameWithOwner', { stdio: 'pipe', cwd: REPO_ROOT, timeout: 6000 }).toString().trim()
    if (repo) return repo
  } catch {}
  return null
}

function ghArgsRepo(): string[] {
  const repo = ghRepo()
  return repo ? ['-R', repo] : []
}

export async function GET(request: Request) {
  if (isRemote(request)) {
    try {
      const raw = await getWorkflowRuns(20, request)
      const runs = (raw as Record<string, unknown>[]).map(r => ({
        id: r.id,
        workflow: r.display_title || r.name,
        status: r.status,
        conclusion: r.conclusion,
        created_at: r.created_at,
        url: r.html_url,
      }))
      return NextResponse.json({ runs })
    } catch {
      return NextResponse.json({ runs: [] })
    }
  }

  // Local: use gh CLI
  try {
    const out = execFileSync(
      'gh',
      ['run', 'list', ...ghArgsRepo(), '--json', 'databaseId,name,status,conclusion,createdAt,url,displayTitle', '--limit', '20'],
      { stdio: 'pipe', cwd: REPO_ROOT, timeout: 10000 },
    ).toString()
    const raw = JSON.parse(out)
    const runs = raw.map((r: Record<string, unknown>) => ({
      id: r.databaseId,
      workflow: r.displayTitle || r.name,
      status: r.status,
      conclusion: r.conclusion,
      created_at: r.createdAt,
      url: r.url,
    }))
    return NextResponse.json({ runs })
  } catch {
    return NextResponse.json({ runs: [] })
  }
}
