'use client'

import { useState } from 'react'
import type { Run, SkillOutput } from '../lib/types'
import { timeAgo } from '../lib/utils'
import { SpecNode } from './SpecNode'

interface ActivityViewProps {
  runs: Run[]
  outputs: SkillOutput[]
  feedLoading: boolean
  onRefresh: () => void
}

function statusIcon(run: Run): { icon: string; cls: string } {
  if (run.conclusion === 'success')   return { icon: '✓', cls: 'text-eva-green' }
  if (run.conclusion === 'failure')   return { icon: '✗', cls: 'text-eva-red' }
  if (run.status === 'in_progress')   return { icon: '◌', cls: 'text-eva-amber' }
  return { icon: '·', cls: 'text-primary-35' }
}

export function ActivityView({ runs, outputs, feedLoading, onRefresh }: ActivityViewProps) {
  const [_tick, setTick] = useState(0) // reserved for future live-poll toggle

  const recentRuns = runs.slice(0, 30)

  return (
    <div className="max-w-4xl mx-auto space-y-[var(--space-lg)] py-[var(--space-lg)] px-[var(--space-lg)]">
      <div className="grid grid-cols-2 gap-[var(--space-md)]">

        {/* ── Left: Live Feed ── */}
        <div className="card-hst flex flex-col min-h-0">
          {/* Card header */}
          <div className="flex items-center justify-between px-[var(--space-md)] py-[var(--space-sm)] border-b border-[rgba(255,255,255,0.07)] shrink-0">
            <span className="text-label">Live Feed</span>
            <button
              onClick={onRefresh}
              title="Refresh"
              className="text-primary-35 hover:text-eva-orange transition-colors text-base font-mono leading-none"
            >
              ↻
            </button>
          </div>

          {/* Card body */}
          <div className="flex-1 overflow-y-auto">
            {feedLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-2 h-2 rounded-full bg-eva-orange animate-pulse" />
              </div>
            ) : outputs.length > 0 ? (
              <div className="space-y-3 p-[var(--space-md)]">
                {outputs.map(o => (
                  <div key={o.filename} className="animate-fade-in">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[11px] font-mono text-eva-orange">{o.skill}</span>
                      <span className="text-[11px] text-primary-35 font-mono">{timeAgo(o.timestamp)}</span>
                    </div>
                    {o.spec?.root && o.spec?.elements
                      ? <SpecNode id={o.spec.root} elements={o.spec.elements} />
                      : null}
                  </div>
                ))}
              </div>
            ) : recentRuns.length === 0 ? (
              <div className="px-4 py-12 text-center text-xs text-primary-35 font-mono">
                No activity yet
              </div>
            ) : (
              <div>
                {recentRuns.map(run => {
                  const { icon, cls } = statusIcon(run)
                  return (
                    <div
                      key={run.id}
                      className="flex items-center gap-2.5 px-4 py-2.5 border-b border-[rgba(255,255,255,0.05)] text-xs font-mono"
                    >
                      <span className={`text-sm ${cls}`}>{icon}</span>
                      <span className="text-primary-70 truncate flex-1">{run.workflow}</span>
                      <span className="text-[11px] text-primary-35 tabular-nums shrink-0">
                        {timeAgo(run.created_at)}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Run History ── */}
        <div className="card-hst flex flex-col min-h-0">
          {/* Card header */}
          <div className="flex items-center justify-between px-[var(--space-md)] py-[var(--space-sm)] border-b border-[rgba(255,255,255,0.07)] shrink-0">
            <span className="text-label">Run History</span>
            <span className="text-[10px] font-mono text-primary-35">
              {recentRuns.length} runs
            </span>
          </div>

          {/* Card body — scrollable list */}
          <div className="flex-1 overflow-y-auto">
            {recentRuns.length === 0 ? (
              <div className="px-4 py-12 text-center text-xs text-primary-35 font-mono">
                No runs yet
              </div>
            ) : (
              recentRuns.map(run => {
                const { icon, cls } = statusIcon(run)
                return (
                  <div
                    key={run.id}
                    className="flex items-center gap-2.5 px-4 py-2.5 border-b border-[rgba(255,255,255,0.05)] text-xs font-mono"
                  >
                    <span className={`text-sm ${cls}`}>{icon}</span>
                    <span className="text-primary-70 truncate flex-1">{run.workflow}</span>
                    <span className="text-[11px] text-primary-35 tabular-nums shrink-0">
                      {timeAgo(run.created_at)}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
