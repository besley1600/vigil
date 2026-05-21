'use client'

import { useState, useEffect } from 'react'
import type { Run } from '../lib/types'
import { displayName, cronLabel } from '../lib/utils'
import { ChainEditorModal } from './ChainEditorModal'

interface ChainStep {
  type: 'parallel' | 'sequential'
  skills: string[]
  consume?: string[]
}

interface Chain {
  name: string
  schedule?: string
  onError?: 'fail-fast' | 'continue'
  steps: ChainStep[]
}

interface ChainsViewProps {
  runs: Run[]
  availableSkills: string[]
  onRunChain?: (name: string) => void
  chainBusy?: Record<string, boolean>
}

function lastRunStatus(skillName: string, runs: Run[]): 'success' | 'failure' | 'in_progress' | null {
  const skillRuns = runs
    .filter(r => r.workflow.toLowerCase().includes(skillName.toLowerCase()))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  if (!skillRuns.length) return null
  const r = skillRuns[0]
  if (r.status === 'in_progress') return 'in_progress'
  return (r.conclusion === 'success' || r.conclusion === 'failure') ? r.conclusion : null
}

function SkillPill({ name, runs }: { name: string; runs: Run[] }) {
  const status = lastRunStatus(name, runs)
  const dotCls =
    status === 'success'     ? 'bg-eva-green' :
    status === 'failure'     ? 'bg-eva-red' :
    status === 'in_progress' ? 'bg-eva-amber animate-pulse' :
                               'bg-[rgba(255,255,255,0.2)]'
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111114] border border-[rgba(255,255,255,0.1)] min-w-[100px] justify-center">
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotCls}`} />
      <span className="text-[11px] font-mono text-primary-70 truncate">{displayName(name)}</span>
    </div>
  )
}

function Connector({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center py-1">
      <div className="w-px h-4 bg-[rgba(255,255,255,0.15)]" />
      {label && (
        <span className="text-[9px] font-mono text-primary-35 uppercase tracking-[1.5px] my-0.5">{label}</span>
      )}
      <div className="w-1.5 h-1.5 border-r border-b border-[rgba(255,255,255,0.3)] rotate-45 mb-1" />
    </div>
  )
}

function ChainCard({ chain, runs, onRun, busy, onEdit, onDelete, deleting }: {
  chain: Chain; runs: Run[]
  onRun?: () => void
  busy?: boolean
  onEdit: () => void
  onDelete: () => void
  deleting?: boolean
}) {
  return (
    <div className="card-hst p-5 flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="font-display text-lg text-primary-100">{displayName(chain.name)}</div>
          <div className="text-[10px] font-mono text-primary-40 mt-0.5">{chain.name}</div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {chain.schedule && (
            <span className="text-[10px] font-mono text-primary-50 bg-[rgba(255,255,255,0.05)] px-2 py-0.5 border border-[rgba(255,255,255,0.08)]">
              {cronLabel(chain.schedule)}
            </span>
          )}
          {chain.onError && (
            <span className={`text-[9px] font-mono uppercase tracking-[1px] px-2 py-0.5 ${
              chain.onError === 'fail-fast'
                ? 'text-eva-red bg-[rgba(248,113,113,0.08)] border border-[rgba(248,113,113,0.2)]'
                : 'text-primary-50 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)]'
            }`}>
              {chain.onError}
            </span>
          )}
          {/* Edit / Delete */}
          <div className="flex gap-1 mt-0.5">
            <button onClick={onEdit}
              className="text-[9px] font-mono text-primary-35 hover:text-primary-60 border border-[rgba(255,255,255,0.08)] px-2 py-0.5 transition-colors">
              Edit
            </button>
            <button onClick={onDelete} disabled={deleting}
              className="text-[9px] font-mono text-primary-35 hover:text-eva-red border border-[rgba(255,255,255,0.08)] px-2 py-0.5 transition-colors disabled:opacity-40">
              {deleting ? '…' : 'Delete'}
            </button>
          </div>
        </div>
      </div>

      {/* Flow diagram */}
      <div className="flex flex-col items-center flex-1">
        <div className="px-4 py-1.5 border border-[rgba(99,102,241,0.35)] bg-[rgba(99,102,241,0.08)] text-[10px] font-mono text-eva-orange uppercase tracking-[1.5px]">
          {chain.schedule ? cronLabel(chain.schedule) : 'Manual trigger'}
        </div>

        {chain.steps.map((step, i) => (
          <div key={i} className="flex flex-col items-center w-full">
            <Connector label={step.consume ? `consumes ${step.consume.join(', ')}` : undefined} />
            {step.type === 'parallel' ? (
              <div className="flex flex-wrap gap-2 justify-center">
                {step.skills.map(skill => <SkillPill key={skill} name={skill} runs={runs} />)}
              </div>
            ) : (
              <SkillPill name={step.skills[0]} runs={runs} />
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.07)] flex items-center gap-2">
        <span className="text-[10px] font-mono text-primary-35">
          {chain.steps.length} step{chain.steps.length !== 1 ? 's' : ''}
        </span>
        <span className="text-[10px] font-mono text-primary-35">·</span>
        <span className="text-[10px] font-mono text-primary-35">
          {chain.steps.reduce((acc, s) => acc + s.skills.length, 0)} skills
        </span>
        {chain.steps.some(s => s.type === 'parallel') && (
          <>
            <span className="text-[10px] font-mono text-primary-35">·</span>
            <span className="text-[10px] font-mono text-eva-orange">parallel</span>
          </>
        )}
        {onRun && (
          <button onClick={onRun} disabled={busy}
            className="ml-auto text-[10px] font-mono border border-[rgba(255,255,255,0.1)] px-3 py-1 hover:border-eva-orange hover:text-eva-orange transition-colors disabled:opacity-40 flex items-center gap-1.5">
            <span className="text-xs leading-none">{busy ? '◌' : '▶'}</span>
            <span>{busy ? 'Running…' : 'Run'}</span>
          </button>
        )}
      </div>
    </div>
  )
}

export function ChainsView({ runs, availableSkills, onRunChain, chainBusy = {} }: ChainsViewProps) {
  const [chains, setChains] = useState<Chain[]>([])
  const [loading, setLoading] = useState(true)
  const [available, setAvailable] = useState(false)
  const [editorChain, setEditorChain] = useState<Chain | null | undefined>(undefined) // undefined=closed, null=new
  const [deletingChain, setDeletingChain] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    fetch('/api/chains')
      .then(r => r.ok ? r.json() : { chains: [], available: false })
      .then(d => { setChains(d.chains || []); setAvailable(d.available) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleSave = async (chain: Chain) => {
    const r = await fetch('/api/chains', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chain }),
    })
    if (!r.ok) {
      const d = await r.json()
      throw new Error(d.error || 'Save failed')
    }
    load()
  }

  const handleDelete = async (name: string) => {
    setDeletingChain(name)
    try {
      await fetch('/api/chains', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      load()
    } finally { setDeletingChain(null) }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-[var(--space-lg)] px-[var(--space-lg)]">
        <div className="flex justify-center py-16">
          <div className="w-2 h-2 rounded-full bg-eva-orange animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="max-w-5xl mx-auto py-[var(--space-lg)] px-[var(--space-lg)]">
        <div className="flex items-center justify-between mb-[var(--space-md)]">
          <div>
            <div className="text-label">Chains</div>
            <div className="text-[11px] font-mono text-primary-50 mt-1">
              Orchestrate skills into sequential and parallel pipelines
            </div>
          </div>
          <button onClick={() => setEditorChain(null)}
            className="text-[10px] font-mono bg-eva-orange text-white px-3 py-1.5 hover:opacity-90 transition-opacity uppercase tracking-[1.5px]">
            + New Chain
          </button>
        </div>

        {!available ? (
          <div className="card-hst px-4 py-12 text-center">
            <div className="text-[11px] font-mono text-primary-50">vigil.yml not found</div>
            <div className="text-[10px] font-mono text-primary-35 mt-1 mb-4">
              Create your first chain to generate vigil.yml automatically
            </div>
            <button onClick={() => setEditorChain(null)}
              className="text-[10px] font-mono bg-eva-orange text-white px-4 py-2 hover:opacity-90 transition-opacity">
              + Create First Chain
            </button>
          </div>
        ) : chains.length === 0 ? (
          <div className="card-hst px-4 py-12 text-center">
            <div className="text-[11px] font-mono text-primary-50 mb-2">No chains defined yet</div>
            <div className="text-[10px] font-mono text-primary-35 leading-relaxed max-w-sm mx-auto mb-4">
              Chains wire skills together into sequential or parallel pipelines, with optional scheduling and output passing.
            </div>
            <button onClick={() => setEditorChain(null)}
              className="text-[10px] font-mono bg-eva-orange text-white px-4 py-2 hover:opacity-90 transition-opacity">
              + Create First Chain
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--space-md)]">
            {chains.map(chain => (
              <ChainCard key={chain.name} chain={chain} runs={runs}
                onRun={onRunChain ? () => onRunChain(chain.name) : undefined}
                busy={chainBusy[chain.name]}
                onEdit={() => setEditorChain(chain)}
                onDelete={() => handleDelete(chain.name)}
                deleting={deletingChain === chain.name} />
            ))}
          </div>
        )}
      </div>

      {editorChain !== undefined && (
        <ChainEditorModal
          chain={editorChain}
          availableSkills={availableSkills}
          onClose={() => setEditorChain(undefined)}
          onSave={handleSave}
        />
      )}
    </>
  )
}
