'use client'

import { useState } from 'react'
import type { Skill, Run } from '../lib/types'
import { MODELS, BANKR_EXTRA_MODELS, DEPARTMENTS } from '../lib/constants'
import { displayName, initials, getSkillStatus, cronLabel, statusDot, getDayHistory, inputCls } from '../lib/utils'
import { ScheduleEditor } from './ScheduleEditor'
import { timeAgo } from '../lib/utils'

interface SkillDetailProps {
  skill: Skill
  runs: Run[]
  model: string
  gateway: 'direct' | 'bankr'
  busy: Record<string, boolean>
  onToggle: (name: string, enabled: boolean) => void
  onRun: (name: string, v?: string, m?: string) => void
  onDelete: (name: string) => void
  onUpdateSchedule: (name: string, schedule: string) => void
  onUpdateVar: (name: string, v: string) => void
  onUpdateModel: (name: string, m: string) => void
  onViewRun: (run: Run) => void
}

export function SkillDetail({ skill, runs, model, gateway, busy, onToggle, onRun, onDelete, onUpdateSchedule, onUpdateVar, onUpdateModel, onViewRun }: SkillDetailProps) {
  const modelOptions = gateway === 'bankr' ? [...MODELS, ...BANKR_EXTRA_MODELS] : MODELS
  const [editingSchedule, setEditingSchedule] = useState(false)
  const [editingVar, setEditingVar] = useState(false)
  const [varDraft, setVarDraft] = useState('')

  const dept = skill.tags?.[0] ? DEPARTMENTS[skill.tags[0]] : null
  const skillRuns = runs.filter(r => r.workflow.toLowerCase().includes(skill.name))

  return (
    <div className="max-w-2xl mx-auto space-y-[var(--space-md)]">
      {/* Profile */}
      <div className="card-hst p-[var(--space-lg)] corner-markers">
        <div className="corner-marker corner-marker-sm top-left" /><div className="corner-marker corner-marker-sm top-right" />
        <div className="corner-marker corner-marker-sm bottom-left" /><div className="corner-marker corner-marker-sm bottom-right" />
        <div className="flex items-start gap-4">
          <div
            className="w-16 h-16 flex items-center justify-center text-lg font-bold text-white shrink-0"
            style={{
              backgroundColor: skill.enabled ? (dept?.color || '#6B7280') : 'rgba(255,255,255,0.08)',
              boxShadow: dept?.color ? `inset 0 0 0 1px ${dept.color}` : undefined,
            }}
          >
            {initials(skill.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-2xl">{displayName(skill.name)}</h2>
              {(() => { const st = getSkillStatus(skill.name, skill.enabled, runs); return (
                <span className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 font-mono ${st.color === 'green' ? 'bg-[rgba(34,211,238,0.1)] text-eva-green' : st.color === 'orange' ? 'bg-[rgba(99,102,241,0.12)] text-eva-orange' : st.color === 'red' ? 'bg-[rgba(248,113,113,0.1)] text-eva-red' : 'bg-eva-gray text-primary-40'}`}>
                  <span className={statusDot(st.color)} />{st.label}
                </span>
              )})()}
            </div>
            {skill.description && <p className="text-sm text-primary-50 mt-2 leading-relaxed font-display">{skill.description}</p>}
          </div>
        </div>
        <div className="warning-stripes mt-[var(--space-md)]" />
        <div className="flex items-center gap-2 mt-[var(--space-md)]">
          <button onClick={() => onToggle(skill.name, !skill.enabled)} disabled={!!busy[skill.name]}
            className={`text-[11px] px-5 py-2 font-mono uppercase tracking-[1px] transition-opacity hover:opacity-90 ${skill.enabled ? 'bg-[rgba(255,255,255,0.06)] text-primary-70 border border-[rgba(255,255,255,0.10)]' : 'bg-eva-green text-white'}`}>
            {skill.enabled ? 'Off Duty' : 'On Duty'}
          </button>
          <button onClick={() => onRun(skill.name, skill.var, skill.model)} disabled={!!busy[`r-${skill.name}`]}
            className="bg-eva-orange text-white text-[11px] px-5 py-2 font-mono uppercase tracking-[1px] hover:opacity-90 transition-opacity disabled:opacity-50">
            {busy[`r-${skill.name}`] ? '...' : 'Run'}
          </button>
          <button onClick={() => { if (confirm(`Remove ${displayName(skill.name)}?`)) onDelete(skill.name) }}
            className="text-[11px] text-eva-red/40 hover:text-eva-red font-mono px-3 py-2 ml-auto transition-colors">Remove</button>
        </div>
      </div>

      {/* Shift */}
      <div className="card-hst p-[var(--space-md)]">
        <div className="flex items-center justify-between mb-[var(--space-sm)]">
          <span className="text-label">Shift Schedule</span>
          <button onClick={() => setEditingSchedule(!editingSchedule)} className="text-[11px] text-primary-40 font-mono hover:text-eva-orange transition-colors">{editingSchedule ? 'Cancel' : 'Edit'}</button>
        </div>
        {editingSchedule ? <ScheduleEditor cron={skill.schedule} onSave={(c) => { onUpdateSchedule(skill.name, c); setEditingSchedule(false) }} /> : <div className="font-display text-xl">{cronLabel(skill.schedule)}</div>}
      </div>

      {/* Brief */}
      <div className="card-hst p-[var(--space-md)]">
        <div className="flex items-center justify-between mb-[var(--space-sm)]">
          <span className="text-label">Assignment Brief</span>
          <button onClick={() => { setEditingVar(!editingVar); setVarDraft(skill.var) }} className="text-[11px] text-primary-40 font-mono hover:text-eva-orange transition-colors">{editingVar ? 'Cancel' : 'Edit'}</button>
        </div>
        {editingVar ? (
          <div className="flex gap-2"><input type="text" value={varDraft} onChange={(e) => setVarDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { onUpdateVar(skill.name, varDraft); setEditingVar(false) } }} placeholder="e.g. AI, bitcoin" className={inputCls} /><button onClick={() => { onUpdateVar(skill.name, varDraft); setEditingVar(false) }} className="bg-eva-orange text-white text-[11px] px-4 py-2 font-mono hover:opacity-90">Save</button></div>
        ) : <div className="font-display text-lg">{skill.var || <span className="text-primary-35">No assignment</span>}</div>}
      </div>

      {/* Model */}
      <div className="card-hst p-[var(--space-md)]">
        <div className="text-label mb-[var(--space-sm)]">Capability Level</div>
        <select value={skill.model} onChange={(e) => onUpdateModel(skill.name, e.target.value)} className="bg-[#1A1A1E] text-primary-100 text-xs px-3 py-2 border-2 border-[rgba(255,255,255,0.10)] outline-none font-mono w-full cursor-pointer focus:border-eva-orange transition-colors">
          <option value="">Default ({modelOptions.find(m => m.id === model)?.label ?? model})</option>
          {modelOptions.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
        </select>
      </div>

      {/* Run History */}
      <div className="card-hst p-[var(--space-md)]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-label">14-Day Run History</span>
          <div className="flex items-center gap-3 text-[10px] font-mono text-primary-35">
            {[['bg-eva-green', 'pass'], ['bg-eva-red', 'fail'], ['bg-eva-amber', 'mixed']].map(([bg, label]) => (
              <span key={label} className="flex items-center gap-1"><span className={`w-2 h-2 inline-block ${bg}`} />{label}</span>
            ))}
          </div>
        </div>
        <div className="flex gap-0.5">
          {getDayHistory(skill.name, runs, 14).map((status, i) => {
            const date = new Date(Date.now() - (13 - i) * 86_400_000)
            const label = `${date.toLocaleDateString('en', { month: 'short', day: 'numeric' })}: ${status}`
            return (
              <div key={i} title={label} className={`flex-1 h-6 transition-opacity hover:opacity-70 ${
                status === 'success' ? 'bg-eva-green' :
                status === 'failure' ? 'bg-eva-red' :
                status === 'mixed' ? 'bg-eva-amber' :
                'bg-[rgba(255,255,255,0.07)]'
              }`} />
            )
          })}
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-primary-35 font-mono">14d ago</span>
          <span className="text-[10px] text-primary-35 font-mono">today</span>
        </div>
      </div>

      {/* Activity */}
      <div>
        <div className="text-label mb-[var(--space-sm)]">Activity Log</div>
        <div className="card-hst divide-y divide-[rgba(255,255,255,0.06)]">
          {skillRuns.slice(0, 10).map(run => (
            <button key={run.id} onClick={() => onViewRun(run)}
              className="w-full flex items-center gap-3 px-[var(--space-md)] py-[var(--space-sm)] hover:bg-eva-gray transition-colors text-left">
              <span className={`text-sm ${run.conclusion === 'success' ? 'text-eva-green' : run.conclusion === 'failure' ? 'text-eva-red' : run.status === 'in_progress' ? 'text-eva-amber' : 'text-primary-35'}`}>
                {run.conclusion === 'success' ? '✓' : run.conclusion === 'failure' ? '✗' : run.status === 'in_progress' ? '◌' : '·'}
              </span>
              <span className="text-xs text-primary-70 truncate flex-1 font-mono">{run.conclusion === 'success' ? 'Task completed' : run.conclusion === 'failure' ? 'Task failed' : run.status === 'in_progress' ? 'Working...' : 'Queued'}</span>
              <span className="text-[11px] text-primary-35 font-mono tabular-nums">{timeAgo(run.created_at)}</span>
            </button>
          ))}
          {!skillRuns.length && <div className="px-[var(--space-md)] py-[var(--space-xl)] text-center text-xs text-primary-35 font-mono">No activity</div>}
        </div>
      </div>
    </div>
  )
}
