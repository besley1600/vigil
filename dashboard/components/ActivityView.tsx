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

type Tab = 'feed' | 'runs'
type Selection =
  | { type: 'output'; item: SkillOutput }
  | { type: 'run'; item: Run }
  | null

function statusIcon(run: Run): { icon: string; cls: string } {
  if (run.conclusion === 'success')  return { icon: '✓', cls: 'text-eva-green' }
  if (run.conclusion === 'failure')  return { icon: '✗', cls: 'text-eva-red' }
  if (run.status === 'in_progress')  return { icon: '◌', cls: 'text-eva-amber animate-pulse' }
  return { icon: '·', cls: 'text-primary-35' }
}

function conclusionBadge(run: Run): { label: string; cls: string } {
  if (run.conclusion === 'success')  return { label: 'success', cls: 'text-eva-green bg-[rgba(245,158,11,0.10)] border-[rgba(245,158,11,0.20)]' }
  if (run.conclusion === 'failure')  return { label: 'failure', cls: 'text-eva-red   bg-[rgba(248,113,113,0.10)] border-[rgba(248,113,113,0.25)]' }
  if (run.status === 'in_progress')  return { label: 'running', cls: 'text-eva-amber bg-[rgba(251,146,60,0.10)]  border-[rgba(251,146,60,0.25)]' }
  return { label: run.status, cls: 'text-primary-50 bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.10)]' }
}

function skillFromWorkflow(workflow: string): string {
  const parts = workflow.split(' / ')
  return parts[parts.length - 1].replace(/\.ya?ml$/i, '').trim()
}

function feedPreview(o: SkillOutput): string {
  if (!o.spec?.elements) return ''
  for (const el of Object.values(o.spec.elements)) {
    if (el.type === 'Heading' && el.props?.text) return String(el.props.text)
    if (el.type === 'Card'    && el.props?.title) return String(el.props.title)
    if (el.type === 'Text'    && el.props?.text)  return String(el.props.text)
  }
  return ''
}

export function ActivityView({ runs, outputs, feedLoading, onRefresh }: ActivityViewProps) {
  const [tab, setTab] = useState<Tab>('feed')
  const [selection, setSelection] = useState<Selection>(
    outputs[0] ? { type: 'output', item: outputs[0] } : null
  )

  const recentRuns = runs.slice(0, 40)

  function selectOutput(o: SkillOutput) {
    setSelection({ type: 'output', item: o })
    setTab('feed')
  }

  function selectRun(r: Run) {
    setSelection({ type: 'run', item: r })
    setTab('runs')
  }

  const selectedOutputFilename = selection?.type === 'output' ? selection.item.filename : null
  const selectedRunId          = selection?.type === 'run'    ? selection.item.id       : null

  return (
    <div className="flex gap-[var(--space-md)] px-[var(--space-lg)] py-[var(--space-lg)] h-[calc(100vh-80px)]">

      {/* ── Left: list panel ── */}
      <div className="w-80 shrink-0 card-hst flex flex-col min-h-0">

        {/* Header with tabs */}
        <div className="flex items-center justify-between px-[var(--space-md)] py-[var(--space-sm)] border-b border-[rgba(255,255,255,0.07)] shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTab('feed')}
              className={`text-label transition-colors ${tab === 'feed' ? 'text-eva-orange' : 'text-primary-35 hover:text-primary-60'}`}
            >
              Live Feed
            </button>
            <span className="text-primary-35 text-[10px]">·</span>
            <button
              onClick={() => setTab('runs')}
              className={`text-label transition-colors ${tab === 'runs' ? 'text-eva-orange' : 'text-primary-35 hover:text-primary-60'}`}
            >
              Runs
            </button>
          </div>
          <button
            onClick={onRefresh}
            title="Refresh"
            className="text-primary-35 hover:text-eva-orange transition-colors text-base font-mono leading-none"
          >
            ↻
          </button>
        </div>

        {/* List body */}
        <div className="flex-1 overflow-y-auto">
          {tab === 'feed' ? (
            feedLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-2 h-2 rounded-full bg-eva-orange animate-pulse" />
              </div>
            ) : outputs.length > 0 ? (
              outputs.map(o => {
                const isSelected = selectedOutputFilename === o.filename
                const preview = feedPreview(o)
                return (
                  <button
                    key={o.filename}
                    onClick={() => selectOutput(o)}
                    className={`w-full text-left px-4 py-3 border-b border-[rgba(255,255,255,0.05)] transition-colors hover:bg-[rgba(255,255,255,0.03)] ${
                      isSelected ? 'selected-indicator bg-[rgba(99,102,241,0.06)]' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="text-[11px] font-mono text-eva-orange truncate">{o.skill}</span>
                      <span className="text-[10px] text-primary-35 font-mono shrink-0">{timeAgo(o.timestamp)}</span>
                    </div>
                    {preview && (
                      <p className="text-[11px] text-primary-50 font-mono truncate leading-snug">{preview}</p>
                    )}
                  </button>
                )
              })
            ) : (
              <div className="px-4 py-12 text-center text-xs text-primary-35 font-mono">
                No feed output yet
              </div>
            )
          ) : (
            recentRuns.length === 0 ? (
              <div className="px-4 py-12 text-center text-xs text-primary-35 font-mono">
                No runs yet
              </div>
            ) : (
              recentRuns.map(run => {
                const { icon, cls } = statusIcon(run)
                const isSelected = selectedRunId === run.id
                const skill = skillFromWorkflow(run.workflow)
                return (
                  <button
                    key={run.id}
                    onClick={() => selectRun(run)}
                    className={`w-full text-left flex items-center gap-2.5 px-4 py-2.5 border-b border-[rgba(255,255,255,0.05)] transition-colors hover:bg-[rgba(255,255,255,0.03)] ${
                      isSelected ? 'selected-indicator bg-[rgba(99,102,241,0.06)]' : ''
                    }`}
                  >
                    <span className={`text-sm shrink-0 ${cls}`}>{icon}</span>
                    <span className="text-primary-70 font-mono text-[11px] truncate flex-1">{skill}</span>
                    <span className="text-[10px] text-primary-35 font-mono tabular-nums shrink-0">
                      {timeAgo(run.created_at)}
                    </span>
                  </button>
                )
              })
            )
          )}
        </div>
      </div>

      {/* ── Right: detail panel ── */}
      <div className="flex-1 card-hst flex flex-col min-h-0">
        {selection === null ? (
          <div className="flex-1 flex items-center justify-center">
            <span className="text-xs text-primary-35 font-mono">Select an item from the feed</span>
          </div>
        ) : selection.type === 'output' ? (
          <OutputDetail output={selection.item} />
        ) : (
          <RunDetail run={selection.item} outputs={outputs} />
        )}
      </div>

    </div>
  )
}

// ── Output detail ────────────────────────────────────────────────────────────

function OutputDetail({ output }: { output: SkillOutput }) {
  return (
    <>
      <div className="flex items-center gap-3 px-[var(--space-md)] py-[var(--space-sm)] border-b border-[rgba(255,255,255,0.07)] shrink-0">
        <span className="text-[11px] font-mono text-eva-orange">{output.skill}</span>
        <span className="text-primary-35 text-[10px]">·</span>
        <span className="text-[11px] font-mono text-primary-35">{timeAgo(output.timestamp)}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-[var(--space-md)]">
        {output.spec?.root && output.spec?.elements
          ? <SpecNode id={output.spec.root} elements={output.spec.elements} />
          : <p className="text-xs text-primary-35 font-mono">No rendered output for this run.</p>
        }
      </div>
    </>
  )
}

// ── Run detail ───────────────────────────────────────────────────────────────

function RunDetail({ run, outputs }: { run: Run; outputs: SkillOutput[] }) {
  const { label, cls } = conclusionBadge(run)
  const skillName = skillFromWorkflow(run.workflow)
  const matchedOutput = outputs.find(o => o.skill === skillName)

  const runDate = new Date(run.created_at)
  const formattedDate = runDate.toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-[var(--space-md)] py-[var(--space-sm)] border-b border-[rgba(255,255,255,0.07)] shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-[11px] font-mono text-eva-orange truncate">{skillName}</span>
          <span className={`text-[10px] font-mono px-1.5 py-0.5 border ${cls}`}>{label}</span>
        </div>
        <a
          href={run.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-mono text-primary-35 hover:text-eva-orange transition-colors shrink-0 ml-3"
        >
          #{run.id} ↗
        </a>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Stats strip */}
        <div className="grid grid-cols-3 border-b border-[rgba(255,255,255,0.07)]">
          {[
            { label: 'Workflow', value: run.workflow },
            { label: 'Run at',   value: formattedDate },
            { label: 'Status',   value: run.status },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="px-[var(--space-md)] py-3 border-r border-[rgba(255,255,255,0.07)] last:border-r-0"
            >
              <div className="text-label mb-1">{label}</div>
              <div className="text-[11px] font-mono text-primary-70 truncate">{value}</div>
            </div>
          ))}
        </div>

        {/* Output */}
        <div className="p-[var(--space-md)]">
          {matchedOutput?.spec?.root && matchedOutput?.spec?.elements ? (
            <>
              <div className="flex items-center gap-2 mb-[var(--space-md)]">
                <span className="text-label">Skill Output</span>
                <span className="text-[10px] font-mono text-primary-35">
                  {timeAgo(matchedOutput.timestamp)}
                </span>
              </div>
              <SpecNode id={matchedOutput.spec.root} elements={matchedOutput.spec.elements} />
            </>
          ) : (
            <div className="py-12 text-center">
              <p className="text-xs text-primary-35 font-mono mb-2">No rendered output for this run.</p>
              <a
                href={run.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-mono text-eva-orange hover:underline underline-offset-2"
              >
                View logs on GitHub ↗
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
