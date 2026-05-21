'use client'

import { useState, useEffect } from 'react'
import { timeAgo } from '../lib/utils'

interface MemoryIndex {
  memory: { exists: boolean; size?: number; excerpt?: string }
  counts: { topics: number; logs: number; issues: number }
  latestLog: string | null
}

interface LogDay { date: string; filename: string; size: number; updatedAt: string }
interface IssueSummary { id: string; filename: string; updatedAt: string }
interface TopicFile { slug: string; filename: string; size: number; updatedAt: string }

type Tab = 'logs' | 'issues' | 'topics'

function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <div className="w-2 h-2 rounded-full bg-eva-orange animate-pulse" />
    </div>
  )
}

function EmptyRow({ msg }: { msg: string }) {
  return <div className="px-4 py-10 text-center text-[11px] text-primary-40 font-mono">{msg}</div>
}

export function MemoryView() {
  const [index, setIndex] = useState<MemoryIndex | null>(null)
  const [logs, setLogs] = useState<LogDay[]>([])
  const [issues, setIssues] = useState<IssueSummary[]>([])
  const [topics, setTopics] = useState<TopicFile[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('logs')
  const [openLog, setOpenLog] = useState<string | null>(null)
  const [logContent, setLogContent] = useState<Record<string, string>>({})
  const [logFetching, setLogFetching] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [idx, logsRes, issuesRes, topicsRes] = await Promise.all([
          fetch('/api/memory').then(r => r.ok ? r.json() : null),
          fetch('/api/memory/logs').then(r => r.ok ? r.json() : { logs: [] }),
          fetch('/api/memory/issues').then(r => r.ok ? r.json() : { issues: [] }),
          fetch('/api/memory/topics').then(r => r.ok ? r.json() : { topics: [] }),
        ])
        setIndex(idx)
        setLogs(logsRes.logs ?? [])
        setIssues(issuesRes.issues ?? [])
        setTopics(topicsRes.topics ?? [])
      } catch {} finally { setLoading(false) }
    }
    load()
  }, [])

  const toggleLog = async (date: string) => {
    if (openLog === date) { setOpenLog(null); return }
    setOpenLog(date)
    if (logContent[date]) return
    setLogFetching(true)
    try {
      const r = await fetch(`/api/memory/logs?date=${date}`)
      if (r.ok) { const d = await r.json(); setLogContent(c => ({ ...c, [date]: d.content })) }
    } catch {} finally { setLogFetching(false) }
  }

  if (loading) return (
    <div className="max-w-5xl mx-auto py-[var(--space-lg)] px-[var(--space-lg)]">
      <Spinner />
    </div>
  )

  const noMemory = !index?.memory.exists

  return (
    <div className="max-w-5xl mx-auto py-[var(--space-lg)] px-[var(--space-lg)] space-y-[var(--space-xl)]">

      {/* Brain summary */}
      <section>
        <div className="text-label mb-[var(--space-sm)]">Working Memory</div>
        {noMemory ? (
          <div className="card-hst px-4 py-10 text-center text-[11px] text-primary-40 font-mono">
            No memory found. Vigil writes to <span className="text-primary-60">memory/</span> after each skill run.
          </div>
        ) : (
          <div className="card-hst">
            {/* Stat row */}
            <div className="grid grid-cols-3 divide-x divide-[rgba(255,255,255,0.07)]">
              {[
                { label: 'Topics', value: index?.counts.topics ?? 0, cls: '' },
                { label: 'Log Days', value: index?.counts.logs ?? 0, cls: '' },
                { label: 'Open Issues', value: index?.counts.issues ?? 0, cls: index?.counts.issues ? 'text-eva-red' : '' },
              ].map(({ label, value, cls }) => (
                <div key={label} className="p-4">
                  <div className="text-label">{label}</div>
                  <div className={`font-display text-2xl mt-1 ${cls || 'text-primary-100'}`}>{value}</div>
                </div>
              ))}
            </div>

            {/* MEMORY.md excerpt */}
            {index?.memory.excerpt && (
              <div className="border-t border-[rgba(255,255,255,0.07)] p-4">
                <div className="text-[9px] font-mono text-primary-40 uppercase tracking-[1.5px] mb-2">MEMORY.md</div>
                <pre className="text-[11px] font-mono text-primary-50 whitespace-pre-wrap leading-relaxed line-clamp-4 overflow-hidden">
                  {index.memory.excerpt
                    .replace(/^#{1,6}\s+/gm, '')
                    .replace(/\*\*([^*]+)\*\*/g, '$1')
                    .trim()
                    .slice(0, 500)}
                </pre>
                {index.latestLog && (
                  <div className="text-[10px] font-mono text-primary-35 mt-2">
                    Last active {timeAgo(index.latestLog + 'T00:00:00Z')}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Tab section */}
      {!noMemory && (
        <section>
          <div className="flex gap-1 mb-[var(--space-sm)]">
            {([
              { id: 'logs' as Tab,   label: 'Logs',   count: logs.length },
              { id: 'issues' as Tab, label: 'Issues', count: issues.length },
              { id: 'topics' as Tab, label: 'Topics', count: topics.length },
            ]).map(({ id, label, count }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`text-[10px] font-mono px-3 py-1.5 transition-colors ${
                  tab === id
                    ? 'bg-eva-orange text-white'
                    : 'text-primary-40 border border-[rgba(255,255,255,0.1)] hover:text-primary-70'
                }`}>
                {label} ({count})
              </button>
            ))}
          </div>

          <div className="card-hst divide-y divide-[rgba(255,255,255,0.06)]">
            {tab === 'logs' && (
              logs.length === 0 ? <EmptyRow msg="No activity logs yet" /> :
              logs.slice(0, 60).map(log => (
                <div key={log.date}>
                  <button onClick={() => toggleLog(log.date)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[rgba(255,255,255,0.025)] transition-colors text-left">
                    <span className="font-mono text-[11px] text-primary-70 w-28 shrink-0">{log.date}</span>
                    <span className="text-[10px] font-mono text-primary-40 flex-1">
                      {timeAgo(log.updatedAt)}
                    </span>
                    <span className="text-[10px] font-mono text-primary-35 tabular-nums w-12 text-right">
                      {(log.size / 1024).toFixed(1)}kb
                    </span>
                    <span className="text-primary-35 text-[10px] ml-1">
                      {openLog === log.date ? '▲' : '▼'}
                    </span>
                  </button>
                  {openLog === log.date && (
                    <div className="px-4 pb-3">
                      {logFetching && !logContent[log.date] ? (
                        <div className="py-2 flex justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-eva-orange animate-pulse" />
                        </div>
                      ) : (
                        <pre className="text-[10px] font-mono text-primary-50 whitespace-pre-wrap leading-relaxed bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] p-3 max-h-72 overflow-y-auto">
                          {logContent[log.date] ?? ''}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}

            {tab === 'issues' && (
              issues.length === 0 ? <EmptyRow msg="No issues filed — fleet is clean" /> :
              issues.map(issue => (
                <div key={issue.id} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="font-mono text-[10px] text-eva-amber w-16 shrink-0">{issue.id}</span>
                  <span className="font-mono text-[11px] text-primary-60 flex-1 truncate">
                    {issue.filename.replace('.md', '')}
                  </span>
                  <span className="text-[10px] font-mono text-primary-35">{timeAgo(issue.updatedAt)}</span>
                </div>
              ))
            )}

            {tab === 'topics' && (
              topics.length === 0 ? <EmptyRow msg="No topic files yet" /> :
              topics.map(topic => (
                <div key={topic.slug} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="font-mono text-[11px] text-primary-70 flex-1 truncate">{topic.slug}</span>
                  <span className="text-[10px] font-mono text-primary-35 tabular-nums">
                    {(topic.size / 1024).toFixed(1)}kb
                  </span>
                  <span className="text-[10px] font-mono text-primary-35">{timeAgo(topic.updatedAt)}</span>
                </div>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  )
}
