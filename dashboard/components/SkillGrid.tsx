'use client'

import { useState } from 'react'
import type { Skill, Run } from '../lib/types'
import { DEPARTMENTS } from '../lib/constants'
import { displayName, getSkillStatus, cronLabel, getDayHistory } from '../lib/utils'

interface SkillGridProps {
  skills: Skill[]
  runs: Run[]
  busy: Record<string, boolean>
  enabledCount: number
  workingCount: number
  notSetup?: boolean
  onSelect: (name: string) => void
  onToggle: (name: string, enabled: boolean) => void
  onRun: (name: string, v?: string) => void
  onShowImport: () => void
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ name, enabled, runs }: { name: string; enabled: boolean; runs: Run[] }) {
  const st = getSkillStatus(name, enabled, runs)
  const containerCls =
    st.color === 'orange' ? 'bg-[rgba(251,146,60,0.12)] text-eva-amber border border-[rgba(251,146,60,0.25)]' :
    st.color === 'green'  ? 'bg-[rgba(245,158,11,0.12)] text-eva-green border border-[rgba(245,158,11,0.25)]' :
    st.color === 'red'    ? 'bg-[rgba(248,113,113,0.12)] text-eva-red border border-[rgba(248,113,113,0.25)]' :
                            'bg-[rgba(255,255,255,0.05)] text-primary-40 border border-[rgba(255,255,255,0.1)]'
  const dotCls =
    st.color === 'orange' ? 'bg-eva-amber animate-pulse' :
    st.color === 'green'  ? 'bg-eva-green' :
    st.color === 'red'    ? 'bg-eva-red' :
                            'bg-[rgba(255,255,255,0.25)]'
  return (
    <span className={`text-[10px] font-mono px-2 py-0.5 flex items-center gap-1 shrink-0 ${containerCls}`}>
      <span className={`w-1 h-1 rounded-full shrink-0 ${dotCls}`} />
      {st.label}
    </span>
  )
}

// ── 7-day history bar (grid cards) ────────────────────────────────────────────

function HistoryBar({ skillName, runs }: { skillName: string; runs: Run[] }) {
  const history = getDayHistory(skillName, runs, 7)
  return (
    <div>
      <div className="flex gap-0.5">
        {history.map((s, i) => (
          <div key={i} className={`flex-1 h-1.5 ${
            s === 'success' ? 'bg-eva-green opacity-80' :
            s === 'failure' ? 'bg-eva-red opacity-80' :
            s === 'mixed'   ? 'bg-eva-amber opacity-80' :
                              'bg-[rgba(255,255,255,0.08)]'
          }`} />
        ))}
      </div>
      <div className="text-[9px] font-mono text-primary-35 mt-1">7d history</div>
    </div>
  )
}

// ── Grid card ─────────────────────────────────────────────────────────────────

function SkillCard({ skill, runs, busy, onSelect, onToggle, onRun }: {
  skill: Skill; runs: Run[]; busy: Record<string, boolean>
  onSelect: (name: string) => void
  onToggle: (name: string, enabled: boolean) => void
  onRun: (name: string, v?: string) => void
}) {
  const tag = skill.tags?.[0] || 'meta'
  const dept = DEPARTMENTS[tag] || DEPARTMENTS.meta
  const isBusy = busy[skill.name] ?? false

  return (
    <div onClick={() => onSelect(skill.name)}
      className="card-hst p-5 flex flex-col gap-3 cursor-pointer transition-all duration-150 hover:border-[rgba(255,255,255,0.22)] group animate-fade-in">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dept.color }} />
        <span className="text-[10px] font-mono text-primary-40 uppercase tracking-[2px] flex-1 truncate">{dept.label}</span>
        <StatusBadge name={skill.name} enabled={skill.enabled} runs={runs} />
      </div>
      <div>
        <div className="font-display text-xl leading-tight group-hover:text-eva-orange transition-colors">{displayName(skill.name)}</div>
        <div className="text-[11px] text-primary-50 font-mono mt-1 line-clamp-2 leading-relaxed">{skill.description || 'No description'}</div>
      </div>
      <HistoryBar skillName={skill.name} runs={runs} />
      <div className="border-t border-[rgba(255,255,255,0.07)] pt-3 flex items-center gap-2">
        <span className="text-[10px] font-mono text-primary-40 flex-1 truncate">{cronLabel(skill.schedule)}</span>
        <button disabled={isBusy} onClick={e => { e.stopPropagation(); onRun(skill.name, skill.var) }}
          className="text-[10px] font-mono border border-[rgba(255,255,255,0.1)] px-2.5 py-1 hover:border-eva-orange hover:text-eva-orange transition-colors disabled:opacity-40">
          {isBusy ? '◌' : '▶'}
        </button>
        <button onClick={e => { e.stopPropagation(); onToggle(skill.name, !skill.enabled) }}
          className={`w-8 h-4 rounded-full relative transition-colors shrink-0 ${skill.enabled ? 'bg-eva-green' : 'bg-[rgba(255,255,255,0.15)]'}`}>
          <div className={`absolute top-[2px] w-3 h-3 rounded-full bg-white shadow transition-transform ${skill.enabled ? 'translate-x-[18px]' : 'translate-x-[2px]'}`} />
        </button>
      </div>
    </div>
  )
}

// ── List row ──────────────────────────────────────────────────────────────────

function SkillRow({ skill, runs, busy, onSelect, onToggle, onRun }: {
  skill: Skill; runs: Run[]; busy: Record<string, boolean>
  onSelect: (name: string) => void
  onToggle: (name: string, enabled: boolean) => void
  onRun: (name: string, v?: string) => void
}) {
  const tag = skill.tags?.[0] || 'meta'
  const dept = DEPARTMENTS[tag] || DEPARTMENTS.meta
  const st = getSkillStatus(skill.name, skill.enabled, runs)
  const isRunBusy = busy[`r-${skill.name}`] ?? false
  const history = getDayHistory(skill.name, runs, 7)

  const statusDotCls =
    st.color === 'orange' ? 'bg-eva-amber animate-pulse' :
    st.color === 'green'  ? 'bg-eva-green' :
    st.color === 'red'    ? 'bg-eva-red' :
                            'bg-[rgba(255,255,255,0.20)]'

  return (
    <div onClick={() => onSelect(skill.name)}
      className="flex items-center gap-3 px-4 py-2.5 border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.025)] cursor-pointer group transition-colors">
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDotCls}`} />
      <span className="w-1.5 h-1.5 rounded-full shrink-0 opacity-55" style={{ backgroundColor: dept.color }} />
      <span className="font-mono text-[12px] text-primary-70 group-hover:text-eva-orange transition-colors flex-1 md:flex-none md:w-44 shrink-0 truncate">
        {displayName(skill.name)}
      </span>
      <span className="hidden md:block text-[11px] text-primary-50 font-mono flex-1 min-w-0 truncate">
        {skill.description || '—'}
      </span>
      <span className="hidden md:block text-[10px] font-mono text-primary-40 w-24 text-right shrink-0 tabular-nums">
        {cronLabel(skill.schedule)}
      </span>
      <div className="hidden md:flex gap-px shrink-0 w-[62px]">
        {history.map((s, i) => (
          <div key={i} className={`flex-1 h-4 ${
            s === 'success' ? 'bg-eva-green/50' :
            s === 'failure' ? 'bg-eva-red/50' :
            s === 'mixed'   ? 'bg-eva-amber/50' :
                              'bg-[rgba(255,255,255,0.06)]'
          }`} />
        ))}
      </div>
      <button disabled={isRunBusy}
        onClick={e => { e.stopPropagation(); onRun(skill.name, skill.var) }}
        className="text-[10px] font-mono border border-[rgba(255,255,255,0.1)] w-7 h-6 flex items-center justify-center hover:border-eva-orange hover:text-eva-orange transition-colors disabled:opacity-40 shrink-0">
        {isRunBusy ? '◌' : '▶'}
      </button>
      <button onClick={e => { e.stopPropagation(); onToggle(skill.name, !skill.enabled) }}
        className={`w-8 h-4 rounded-full relative transition-colors shrink-0 ${skill.enabled ? 'bg-eva-green' : 'bg-[rgba(255,255,255,0.15)]'}`}>
        <div className={`absolute top-[2px] w-3 h-3 rounded-full bg-white shadow transition-transform ${skill.enabled ? 'translate-x-[18px]' : 'translate-x-[2px]'}`} />
      </button>
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ onShowImport }: { onShowImport: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6">
      <div className="logo-mark">
        <div className="logo-mark-inner" />
        <span className="logo-mark-letter">V</span>
      </div>
      <div className="text-center">
        <div className="font-display text-xl text-primary-70">No skills installed</div>
        <div className="text-[11px] font-mono text-primary-50 mt-1">Install your first skill to get started</div>
      </div>
      <button onClick={onShowImport}
        className="text-[10px] font-mono border border-[rgba(99,102,241,0.4)] text-eva-orange px-4 py-2 hover:bg-[rgba(99,102,241,0.1)] transition-colors">
        + Install Skill
      </button>
    </div>
  )
}

// ── Main SkillGrid ────────────────────────────────────────────────────────────

export function SkillGrid({ skills, runs, busy, enabledCount, workingCount, notSetup, onSelect, onToggle, onRun, onShowImport }: SkillGridProps) {
  const [activeDept, setActiveDept] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  const deptTags = Array.from(new Set(skills.map(s => s.tags?.[0] || 'meta'))).sort((a, b) => {
    const la = DEPARTMENTS[a]?.label || a
    const lb = DEPARTMENTS[b]?.label || b
    return la.localeCompare(lb)
  })

  const filtered = skills.filter(s => {
    const matchesDept = activeDept === 'all' || (s.tags?.[0] || 'meta') === activeDept
    const matchesSearch = !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      displayName(s.name).toLowerCase().includes(search.toLowerCase()) ||
      (s.description || '').toLowerCase().includes(search.toLowerCase())
    return matchesDept && matchesSearch
  })

  if (skills.length === 0) {
    if (notSetup) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-6">
          <div className="logo-mark">
            <div className="logo-mark-inner" />
            <span className="logo-mark-letter">V</span>
          </div>
          <div className="text-center">
            <div className="font-display text-xl text-primary-70">Repository not configured</div>
            <div className="text-[11px] font-mono text-primary-50 mt-1">This repo does not have Vigil set up yet.</div>
            <div className="text-[11px] font-mono text-primary-40 mt-0.5">Fork the Vigil template or install your first skill to get started.</div>
          </div>
          <button onClick={onShowImport}
            className="text-[10px] font-mono border border-[rgba(99,102,241,0.4)] text-eva-orange px-4 py-2 hover:bg-[rgba(99,102,241,0.1)] transition-colors">
            + Install Skill
          </button>
        </div>
      )
    }
    return <EmptyState onShowImport={onShowImport} />
  }

  return (
    <div className="flex flex-1 min-h-0">

      {/* ── Left sidebar - hidden on mobile ─────────────────────────────── */}
      <aside className="hidden md:flex md:flex-col w-48 shrink-0 border-r border-[rgba(255,255,255,0.07)] bg-[#13152B]">

        {/* Fleet stats */}
        <div className="p-4 border-b border-[rgba(255,255,255,0.07)]">
          <div className="text-label mb-3">Fleet</div>
          <div className="space-y-2.5">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-primary-50">Skills</span>
              <span className="text-primary-70 tabular-nums">{skills.length}</span>
            </div>
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-primary-50">On Duty</span>
              <span className="text-eva-green tabular-nums">{enabledCount}</span>
            </div>
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-primary-50">Working</span>
              <span className="text-eva-amber tabular-nums">{workingCount}</span>
            </div>
          </div>
        </div>

        {/* Dept list */}
        <div className="flex-1 overflow-y-auto py-1">
          <button onClick={() => setActiveDept('all')}
            className={`w-full flex items-center justify-between px-3 py-2 text-[11px] font-mono transition-colors text-left ${
              activeDept === 'all'
                ? 'text-eva-orange bg-[rgba(99,102,241,0.12)]'
                : 'text-primary-50 hover:text-primary-70 hover:bg-[rgba(255,255,255,0.03)]'
            }`}>
            <span>All</span>
            <span className="text-primary-40 tabular-nums">{skills.length}</span>
          </button>
          {deptTags.map(tag => {
            const dept = DEPARTMENTS[tag] || DEPARTMENTS.meta
            const count = skills.filter(s => (s.tags?.[0] || 'meta') === tag).length
            const isActive = activeDept === tag
            return (
              <button key={tag} onClick={() => setActiveDept(tag)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-[11px] font-mono transition-colors text-left ${
                  isActive
                    ? 'text-eva-orange bg-[rgba(99,102,241,0.12)]'
                    : 'text-primary-50 hover:text-primary-70 hover:bg-[rgba(255,255,255,0.03)]'
                }`}>
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: dept.color }} />
                <span className="flex-1 truncate">{dept.label}</span>
                <span className="text-primary-40 tabular-nums">{count}</span>
              </button>
            )
          })}
        </div>

        {/* Install */}
        <div className="p-3 border-t border-[rgba(255,255,255,0.07)]">
          <button onClick={onShowImport}
            className="w-full text-[10px] font-mono border border-[rgba(99,102,241,0.3)] text-eva-orange py-2 hover:bg-[rgba(99,102,241,0.1)] transition-colors">
            + Install
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Toolbar */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[rgba(255,255,255,0.07)] shrink-0 bg-[#171930]">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search skills…"
            className="bg-eva-white text-primary-70 text-[11px] px-3 py-1.5 border border-[rgba(255,255,255,0.08)] outline-none font-mono focus:border-eva-orange placeholder:text-primary-40 w-52 transition-colors" />
          <span className="text-[10px] font-mono text-primary-50">
            {filtered.length} {filtered.length === 1 ? 'skill' : 'skills'}
          </span>
          <div className="ml-auto flex">
            <button onClick={() => setViewMode('list')} title="List view"
              className={`px-3 py-1.5 text-[11px] border border-[rgba(255,255,255,0.1)] transition-colors ${viewMode === 'list' ? 'bg-eva-orange text-white border-eva-orange' : 'text-primary-50 hover:text-primary-70'}`}>
              ☰
            </button>
            <button onClick={() => setViewMode('grid')} title="Grid view"
              className={`px-3 py-1.5 text-[11px] border border-l-0 border-[rgba(255,255,255,0.1)] transition-colors ${viewMode === 'grid' ? 'bg-eva-orange text-white border-eva-orange' : 'text-primary-50 hover:text-primary-70'}`}>
              ⊞
            </button>
          </div>
        </div>

        {/* Mobile: horizontal dept filter pills - hidden on desktop */}
        <div className="md:hidden flex gap-1.5 px-3 py-2 overflow-x-auto border-b border-[rgba(255,255,255,0.07)] shrink-0 bg-[#171930]">
          <button
            onClick={() => setActiveDept('all')}
            className={`shrink-0 text-[10px] font-mono px-2.5 py-1 border transition-colors ${
              activeDept === 'all'
                ? 'border-eva-orange text-eva-orange bg-[rgba(99,102,241,0.08)]'
                : 'border-[rgba(255,255,255,0.1)] text-primary-50 hover:text-primary-70'
            }`}
          >
            All
          </button>
          {deptTags.map(tag => {
            const dept = DEPARTMENTS[tag] || DEPARTMENTS.meta
            const isActive = activeDept === tag
            return (
              <button
                key={tag}
                onClick={() => setActiveDept(tag)}
                className={`shrink-0 flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 border transition-colors ${
                  isActive
                    ? 'border-eva-orange text-eva-orange bg-[rgba(99,102,241,0.08)]'
                    : 'border-[rgba(255,255,255,0.1)] text-primary-50 hover:text-primary-70'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: dept.color }} />
                <span className="truncate">{dept.label}</span>
              </button>
            )
          })}
        </div>

        {/* Content area */}
        {filtered.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-[11px] font-mono text-primary-50">No skills match your filter</div>
          </div>
        ) : viewMode === 'list' ? (
          <div className="flex-1 overflow-y-auto">
            {/* Column headers */}
            <div className="flex items-center gap-3 px-4 py-1.5 border-b border-[rgba(255,255,255,0.07)] bg-[#171930] sticky top-0 z-10">
              <span className="w-1.5 shrink-0" />
              <span className="w-1.5 shrink-0" />
              <span className="text-[9px] font-mono text-primary-40 uppercase tracking-[1.5px] flex-1 md:flex-none md:w-44 shrink-0">Skill</span>
              <span className="hidden md:block text-[9px] font-mono text-primary-40 uppercase tracking-[1.5px] flex-1 min-w-0">Description</span>
              <span className="hidden md:block text-[9px] font-mono text-primary-40 uppercase tracking-[1.5px] w-24 text-right shrink-0">Schedule</span>
              <span className="hidden md:block text-[9px] font-mono text-primary-40 uppercase tracking-[1.5px] w-[62px] shrink-0">History</span>
              <span className="w-7 shrink-0" />
              <span className="w-8 shrink-0" />
            </div>
            {filtered.map(skill => (
              <SkillRow key={skill.name} skill={skill} runs={runs} busy={busy}
                onSelect={onSelect} onToggle={onToggle} onRun={onRun} />
            ))}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(skill => (
                <SkillCard key={skill.name} skill={skill} runs={runs} busy={busy}
                  onSelect={onSelect} onToggle={onToggle} onRun={onRun} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
