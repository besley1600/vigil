import { NextResponse } from 'next/server'
import { readdir, readFile } from 'fs/promises'
import { join, resolve } from 'path'
import { execSync } from 'child_process'
import { getDirectory, getFileContent } from '@/lib/github'

const OUTPUTS_DIR = join(process.cwd(), 'outputs')
const REPO_ROOT = resolve(process.cwd(), '..')
const REMOTE_OUTPUTS_PATH = 'dashboard/outputs'

function isRemote(request: Request) {
  if (process.env.GITHUB_TOKEN && process.env.GITHUB_REPO) return true
  return !!(request.headers.get('x-github-token') && request.headers.get('x-github-repo'))
}

function parseOutput(filename: string, raw: string) {
  try {
    const spec = JSON.parse(raw)
    const base = filename.replace('.json', '')
    const tsMatch = base.match(/^(.+?)-(\d{4}-\d{2}-\d{2}T.+Z)$/)
    return {
      filename,
      skill: tsMatch ? tsMatch[1] : base,
      timestamp: tsMatch ? tsMatch[2] : '',
      spec,
    }
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  if (isRemote(request)) {
    try {
      const entries = await getDirectory(REMOTE_OUTPUTS_PATH, request)
      const jsonFiles = entries
        .filter(e => e.type === 'file' && e.name.endsWith('.json'))
        .map(e => e.name)
        .sort((a, b) => {
          const tsA = a.match(/(\d{4}-\d{2}-\d{2}T[\d-]+Z)\.json$/)?.[1] || ''
          const tsB = b.match(/(\d{4}-\d{2}-\d{2}T[\d-]+Z)\.json$/)?.[1] || ''
          return tsB.localeCompare(tsA)
        })
        .slice(0, 100)

      const outputs = await Promise.all(
        jsonFiles.map(async (filename) => {
          try {
            const { content } = await getFileContent(`${REMOTE_OUTPUTS_PATH}/${filename}`, request)
            return parseOutput(filename, content)
          } catch {
            return null
          }
        })
      )

      return NextResponse.json({ outputs: outputs.filter(Boolean) })
    } catch {
      return NextResponse.json({ outputs: [] })
    }
  }

  // Local: read from filesystem
  try {
    const files = await readdir(OUTPUTS_DIR).catch(() => [] as string[])
    const jsonFiles = files
      .filter(f => f.endsWith('.json'))
      .sort((a, b) => {
        const tsA = a.match(/(\d{4}-\d{2}-\d{2}T[\d-]+Z)\.json$/)?.[1] || ''
        const tsB = b.match(/(\d{4}-\d{2}-\d{2}T[\d-]+Z)\.json$/)?.[1] || ''
        return tsB.localeCompare(tsA)
      })

    const outputs = await Promise.all(
      jsonFiles.slice(0, 100).map(async (filename) => {
        try {
          const raw = await readFile(join(OUTPUTS_DIR, filename), 'utf-8')
          return parseOutput(filename, raw)
        } catch {
          return null
        }
      })
    )

    return NextResponse.json({ outputs: outputs.filter(Boolean) })
  } catch {
    return NextResponse.json({ outputs: [] })
  }
}

export async function POST(request: Request) {
  if (isRemote(request)) {
    // No local repo to pull — outputs are read live from GitHub API
    return NextResponse.json({ ok: true })
  }

  const run = (cmd: string) => execSync(cmd, { stdio: 'pipe', cwd: REPO_ROOT, timeout: 15000 }).toString().trim()
  try {
    const dirty = run('git status --porcelain').length > 0
    if (dirty) run('git stash --include-untracked')
    try {
      run('git pull --rebase origin main')
    } finally {
      if (dirty) run('git stash pop')
    }
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Pull failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
