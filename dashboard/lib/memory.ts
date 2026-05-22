import { readdir, readFile, stat } from 'fs/promises'
import { resolve, join, sep, normalize } from 'path'
import { getDirectory, getFileContent } from '@/lib/github'

const REPO_ROOT = resolve(process.cwd(), '..')
export const MEMORY_ROOT = join(REPO_ROOT, 'memory')

const TOPICS_DIR = join(MEMORY_ROOT, 'topics')
const LOGS_DIR = join(MEMORY_ROOT, 'logs')
const ISSUES_DIR = join(MEMORY_ROOT, 'issues')

const SLUG_PATTERN = /^[a-z0-9][a-z0-9._-]*$/i
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const ISSUE_PATTERN = /^ISS-\d{3,}$/

function isRemote(request?: Request) {
  if (process.env.GITHUB_TOKEN && process.env.GITHUB_REPO) return true
  if (request) {
    return !!(request.headers.get('x-github-token') && request.headers.get('x-github-repo'))
  }
  return false
}

function safeJoin(base: string, child: string): string | null {
  const joined = normalize(join(base, child))
  const withSep = joined.endsWith(sep) ? joined : joined + sep
  const baseWithSep = base.endsWith(sep) ? base : base + sep
  if (joined !== base && !withSep.startsWith(baseWithSep)) return null
  return joined
}

export async function readMemoryIndex(request?: Request): Promise<string | null> {
  try {
    if (isRemote(request)) {
      const { content } = await getFileContent('memory/MEMORY.md', request)
      return content
    }
    return await readFile(join(MEMORY_ROOT, 'MEMORY.md'), 'utf-8')
  } catch {
    return null
  }
}

export interface TopicFile {
  slug: string
  filename: string
  size: number
  updatedAt: string
}

export async function listTopics(request?: Request): Promise<TopicFile[]> {
  if (isRemote(request)) {
    try {
      const entries = await getDirectory('memory/topics', request)
      return entries
        .filter(e => e.type === 'file' && e.name.endsWith('.md'))
        .map(e => ({ slug: e.name.replace(/\.md$/, ''), filename: e.name, size: 0, updatedAt: '' }))
        .sort((a, b) => a.slug.localeCompare(b.slug))
    } catch {
      return []
    }
  }

  let entries: string[]
  try {
    entries = await readdir(TOPICS_DIR)
  } catch {
    return []
  }
  const topics: TopicFile[] = []
  for (const name of entries) {
    if (!name.endsWith('.md')) continue
    const full = join(TOPICS_DIR, name)
    try {
      const s = await stat(full)
      if (!s.isFile()) continue
      topics.push({ slug: name.replace(/\.md$/, ''), filename: name, size: s.size, updatedAt: s.mtime.toISOString() })
    } catch { /* skip unreadable */ }
  }
  topics.sort((a, b) => a.slug.localeCompare(b.slug))
  return topics
}

export async function readTopic(slug: string, request?: Request): Promise<{ slug: string; content: string; updatedAt: string } | null> {
  if (!SLUG_PATTERN.test(slug)) return null
  if (isRemote(request)) {
    try {
      const { content } = await getFileContent(`memory/topics/${slug}.md`, request)
      return { slug, content, updatedAt: '' }
    } catch {
      return null
    }
  }
  const path = safeJoin(TOPICS_DIR, `${slug}.md`)
  if (!path) return null
  try {
    const [content, s] = await Promise.all([readFile(path, 'utf-8'), stat(path)])
    return { slug, content, updatedAt: s.mtime.toISOString() }
  } catch {
    return null
  }
}

export interface LogDay {
  date: string
  filename: string
  size: number
  updatedAt: string
}

export async function listLogs(request?: Request): Promise<LogDay[]> {
  if (isRemote(request)) {
    try {
      const entries = await getDirectory('memory/logs', request)
      return entries
        .filter(e => e.type === 'file' && /^\d{4}-\d{2}-\d{2}\.md$/.test(e.name))
        .map(e => ({ date: e.name.replace(/\.md$/, ''), filename: e.name, size: 0, updatedAt: '' }))
        .sort((a, b) => b.date.localeCompare(a.date))
    } catch {
      return []
    }
  }

  let entries: string[]
  try {
    entries = await readdir(LOGS_DIR)
  } catch {
    return []
  }
  const logs: LogDay[] = []
  for (const name of entries) {
    const m = name.match(/^(\d{4}-\d{2}-\d{2})\.md$/)
    if (!m) continue
    const full = join(LOGS_DIR, name)
    try {
      const s = await stat(full)
      if (!s.isFile()) continue
      logs.push({ date: m[1], filename: name, size: s.size, updatedAt: s.mtime.toISOString() })
    } catch { /* skip unreadable */ }
  }
  logs.sort((a, b) => b.date.localeCompare(a.date))
  return logs
}

export async function readLog(date: string, request?: Request): Promise<{ date: string; content: string; updatedAt: string } | null> {
  if (!DATE_PATTERN.test(date)) return null
  if (isRemote(request)) {
    try {
      const { content } = await getFileContent(`memory/logs/${date}.md`, request)
      return { date, content, updatedAt: '' }
    } catch {
      return null
    }
  }
  const path = safeJoin(LOGS_DIR, `${date}.md`)
  if (!path) return null
  try {
    const [content, s] = await Promise.all([readFile(path, 'utf-8'), stat(path)])
    return { date, content, updatedAt: s.mtime.toISOString() }
  } catch {
    return null
  }
}

export interface IssueSummary {
  id: string
  filename: string
  updatedAt: string
}

export async function listIssues(request?: Request): Promise<IssueSummary[]> {
  if (isRemote(request)) {
    try {
      const entries = await getDirectory('memory/issues', request)
      return entries
        .filter(e => e.type === 'file' && /^ISS-\d{3,}\.md$/.test(e.name))
        .map(e => ({ id: e.name.replace(/\.md$/, ''), filename: e.name, updatedAt: '' }))
        .sort((a, b) => b.id.localeCompare(a.id))
    } catch {
      return []
    }
  }

  let entries: string[]
  try {
    entries = await readdir(ISSUES_DIR)
  } catch {
    return []
  }
  const issues: IssueSummary[] = []
  for (const name of entries) {
    const m = name.match(/^(ISS-\d{3,})\.md$/)
    if (!m) continue
    const full = join(ISSUES_DIR, name)
    try {
      const s = await stat(full)
      if (!s.isFile()) continue
      issues.push({ id: m[1], filename: name, updatedAt: s.mtime.toISOString() })
    } catch { /* skip unreadable */ }
  }
  issues.sort((a, b) => b.id.localeCompare(a.id))
  return issues
}

export async function readIssue(id: string, request?: Request): Promise<{ id: string; content: string; updatedAt: string } | null> {
  if (!ISSUE_PATTERN.test(id)) return null
  if (isRemote(request)) {
    try {
      const { content } = await getFileContent(`memory/issues/${id}.md`, request)
      return { id, content, updatedAt: '' }
    } catch {
      return null
    }
  }
  const path = safeJoin(ISSUES_DIR, `${id}.md`)
  if (!path) return null
  try {
    const [content, s] = await Promise.all([readFile(path, 'utf-8'), stat(path)])
    return { id, content, updatedAt: s.mtime.toISOString() }
  } catch {
    return null
  }
}

export interface SearchHit {
  source: 'memory' | 'topic' | 'log' | 'issue'
  ref: string
  filename: string
  score: number
  matches: number
  snippet: string
  lineNumber: number
}

interface Corpus {
  source: SearchHit['source']
  ref: string
  filename: string
  content: string
}

async function loadCorpus(request?: Request): Promise<Corpus[]> {
  const corpus: Corpus[] = []

  const memory = await readMemoryIndex(request)
  if (memory) corpus.push({ source: 'memory', ref: 'MEMORY', filename: 'MEMORY.md', content: memory })

  const topics = await listTopics(request)
  for (const t of topics) {
    const full = await readTopic(t.slug, request)
    if (full) corpus.push({ source: 'topic', ref: t.slug, filename: t.filename, content: full.content })
  }

  const logs = await listLogs(request)
  for (const l of logs) {
    const full = await readLog(l.date, request)
    if (full) corpus.push({ source: 'log', ref: l.date, filename: l.filename, content: full.content })
  }

  const issues = await listIssues(request)
  for (const i of issues) {
    const full = await readIssue(i.id, request)
    if (full) corpus.push({ source: 'issue', ref: i.id, filename: i.filename, content: full.content })
  }

  return corpus
}

function tokenize(q: string): string[] {
  return q
    .toLowerCase()
    .split(/[^a-z0-9$_-]+/)
    .map(t => t.trim())
    .filter(t => t.length >= 2)
}

function buildSnippet(lines: string[], hitLine: number, needle: string): string {
  const start = Math.max(0, hitLine - 1)
  const end = Math.min(lines.length, hitLine + 2)
  const window = lines.slice(start, end).join('\n').trim()
  if (!needle) return window.slice(0, 400)
  const re = new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'ig')
  return window.replace(re, m => `**${m}**`).slice(0, 400)
}

export async function searchMemory(
  query: string,
  opts: { limit?: number; sources?: SearchHit['source'][]; request?: Request } = {},
): Promise<SearchHit[]> {
  const terms = tokenize(query)
  if (terms.length === 0) return []

  const limit = Math.max(1, Math.min(opts.limit ?? 20, 100))
  const allow = opts.sources && opts.sources.length > 0 ? new Set(opts.sources) : null

  const corpus = await loadCorpus(opts.request)
  const hits: SearchHit[] = []

  for (const doc of corpus) {
    if (allow && !allow.has(doc.source)) continue
    const lines = doc.content.split('\n')
    const lower = doc.content.toLowerCase()

    let totalMatches = 0
    let distinctTerms = 0
    for (const term of terms) {
      const occurrences = lower.split(term).length - 1
      if (occurrences > 0) {
        distinctTerms += 1
        totalMatches += occurrences
      }
    }
    if (totalMatches === 0) continue

    const termsByLength = [...terms].sort((a, b) => b.length - a.length)
    let hitLine = -1
    let hitTerm = ''
    for (const term of termsByLength) {
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].toLowerCase().includes(term)) {
          hitLine = i
          hitTerm = term
          break
        }
      }
      if (hitLine >= 0) break
    }
    if (hitLine < 0) continue

    const score =
      totalMatches +
      distinctTerms * 2 +
      (doc.source === 'memory' ? 5 : 0)

    hits.push({
      source: doc.source,
      ref: doc.ref,
      filename: doc.filename,
      score,
      matches: totalMatches,
      snippet: buildSnippet(lines, hitLine, hitTerm),
      lineNumber: hitLine + 1,
    })
  }

  hits.sort((a, b) => b.score - a.score)
  return hits.slice(0, limit)
}
