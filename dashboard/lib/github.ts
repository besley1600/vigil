import { readFile, writeFile, readdir, mkdir, stat, rm } from 'fs/promises'
import { join, resolve } from 'path'

const GITHUB_API = 'https://api.github.com'

// Resolve the repo root — prefer explicit env var (set by Electron for standalone server)
const REPO_ROOT = process.env.REPO_ROOT || resolve(process.cwd(), '..')

function isLocal(request?: Request) {
  if (request) {
    const token = request.headers.get('x-github-token')
    const repo = request.headers.get('x-github-repo')
    if (token && repo) return false
  }
  return true
}

function getConfig(request?: Request) {
  const token = request?.headers.get('x-github-token') || ''
  const repo = request?.headers.get('x-github-repo') || ''
  return { token, repo }
}

/**
 * Build a synthetic request that points at SKILLS_REPO using the caller's token.
 * Used so skill definitions are always read from the operator's Vigil repo
 * regardless of which repo the user has selected.
 */
export function makeSkillsRequest(userToken: string): Request | undefined {
  const skillsRepo = process.env.SKILLS_REPO || ''
  if (!skillsRepo || !userToken) return undefined
  const headers = new Headers()
  headers.set('x-github-token', userToken)
  headers.set('x-github-repo', skillsRepo)
  return new Request('http://internal', { headers })
}

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

// --- Unified interface: local filesystem or GitHub API ---

export async function getFileContent(path: string, request?: Request): Promise<{ content: string; sha: string }> {
  if (isLocal(request)) {
    const content = await readFile(join(REPO_ROOT, path), 'utf-8')
    return { content, sha: '' }
  }
  const { token, repo } = getConfig(request)
  const res = await fetch(`${GITHUB_API}/repos/${repo}/contents/${path}`, {
    headers: authHeaders(token),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`GitHub API ${res.status}: failed to read ${path}`)
  const data = await res.json()
  return {
    content: Buffer.from(data.content, 'base64').toString('utf-8'),
    sha: data.sha as string,
  }
}

export async function updateFile(path: string, content: string, sha: string, _message: string, request?: Request) {
  if (isLocal(request)) {
    await writeFile(join(REPO_ROOT, path), content, 'utf-8')
    return { ok: true }
  }
  const { token, repo } = getConfig(request)
  const res = await fetch(`${GITHUB_API}/repos/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({
      message: _message,
      content: Buffer.from(content).toString('base64'),
      sha,
    }),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`GitHub API ${res.status}: failed to update ${path}`)
  return res.json()
}

export async function createFile(path: string, content: string, message: string, request?: Request) {
  if (isLocal(request)) {
    const fullPath = join(REPO_ROOT, path)
    await mkdir(join(fullPath, '..'), { recursive: true })
    await writeFile(fullPath, content, 'utf-8')
    return { ok: true }
  }
  const { token, repo } = getConfig(request)
  try {
    const existing = await getFileContent(path, request)
    return updateFile(path, content, existing.sha, message, request)
  } catch {
    // File doesn't exist — create it
  }
  const res = await fetch(`${GITHUB_API}/repos/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({
      message,
      content: Buffer.from(content).toString('base64'),
    }),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`GitHub API ${res.status}: failed to create ${path}`)
  return res.json()
}

export async function getDirectory(path: string, request?: Request): Promise<Array<{ name: string; type: string; path: string }>> {
  if (isLocal(request)) {
    const fullPath = join(REPO_ROOT, path)
    try {
      const entries = await readdir(fullPath, { withFileTypes: true })
      return entries.map(e => ({
        name: e.name,
        type: e.isDirectory() ? 'dir' : 'file',
        path: join(path, e.name),
      }))
    } catch {
      return []
    }
  }
  const { token, repo } = getConfig(request)
  const res = await fetch(`${GITHUB_API}/repos/${repo}/contents/${path}`, {
    headers: authHeaders(token),
    cache: 'no-store',
  })
  if (!res.ok) return []
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

export async function triggerWorkflow(skill: string, request?: Request, extraInputs?: Record<string, string>) {
  if (isLocal(request)) {
    throw new Error('Cannot trigger GitHub Actions locally — connect your GitHub account to enable remote runs')
  }
  const { token, repo } = getConfig(request)
  const res = await fetch(`${GITHUB_API}/repos/${repo}/actions/workflows/vigil.yml/dispatches`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ ref: 'main', inputs: { skill, ...extraInputs } }),
    cache: 'no-store',
  })
  if (!res.ok) {
    const hint = res.status === 404
      ? ' — ensure the GitHub token has "workflow" scope and the repo contains .github/workflows/vigil.yml'
      : res.status === 422
      ? ' — workflow inputs may be invalid'
      : ''
    throw new Error(`GitHub API ${res.status}: failed to trigger workflow${hint}`)
  }
}

export async function getWorkflowRuns(perPage = 20, request?: Request) {
  if (isLocal(request)) {
    // Return empty — no GitHub Actions access locally
    return []
  }
  const { token, repo } = getConfig(request)
  const res = await fetch(
    `${GITHUB_API}/repos/${repo}/actions/runs?per_page=${perPage}`,
    { headers: authHeaders(token), cache: 'no-store' },
  )
  if (!res.ok) throw new Error(`GitHub API ${res.status}: failed to fetch runs`)
  const data = await res.json()
  return data.workflow_runs || []
}

// --- Remote repo helpers (for importing skills) ---

export async function getRemoteDirectory(remoteRepo: string, path: string): Promise<Array<{ name: string; type: string }>> {
  // Always uses GitHub API (remote repo)
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json' }
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  }
  const url = path
    ? `${GITHUB_API}/repos/${remoteRepo}/contents/${path}`
    : `${GITHUB_API}/repos/${remoteRepo}/contents`
  const res = await fetch(url, { headers, cache: 'no-store' })
  if (!res.ok) return []
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

export async function getRemoteFileContent(remoteRepo: string, path: string): Promise<string | null> {
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json' }
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  }
  const res = await fetch(`${GITHUB_API}/repos/${remoteRepo}/contents/${path}`, {
    headers,
    cache: 'no-store',
  })
  if (!res.ok) return null
  const data = await res.json()
  return Buffer.from(data.content, 'base64').toString('utf-8')
}

export async function deleteDirectory(path: string, message: string, request?: Request): Promise<void> {
  if (isLocal(request)) {
    await rm(join(REPO_ROOT, path), { recursive: true, force: true })
    return
  }
  const { token, repo } = getConfig(request)
  // GitHub API requires deleting files one by one
  const files = await getDirectory(path, request)
  for (const file of files) {
    if (file.type === 'dir') {
      await deleteDirectory(`${path}/${file.name}`, message, request)
    } else {
      const { sha } = await getFileContent(`${path}/${file.name}`, request)
      const res = await fetch(`${GITHUB_API}/repos/${repo}/contents/${path}/${file.name}`, {
        method: 'DELETE',
        headers: authHeaders(token),
        body: JSON.stringify({ message, sha }),
        cache: 'no-store',
      })
      if (!res.ok) throw new Error(`GitHub API ${res.status}: failed to delete ${path}/${file.name}`)
    }
  }
}

export async function fileExists(path: string, request?: Request): Promise<boolean> {
  if (isLocal(request)) {
    try {
      await stat(join(REPO_ROOT, path))
      return true
    } catch {
      return false
    }
  }
  try {
    await getFileContent(path, request)
    return true
  } catch {
    return false
  }
}
