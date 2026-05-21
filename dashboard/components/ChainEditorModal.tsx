'use client'

import { useState, useEffect, useRef } from 'react'

interface ChainStep {
  type: 'parallel' | 'sequential'
  skills: string[]
}

interface Chain {
  name: string
  schedule?: string
  onError?: 'fail-fast' | 'continue'
  steps: ChainStep[]
}

interface ChainEditorModalProps {
  chain?: Chain | null       // null = create new, object = edit existing
  availableSkills: string[]
  onClose: () => void
  onSave: (chain: Chain) => Promise<void>
}

const SCHEDULE_PRESETS = [
  { label: 'On demand', value: '' },
  { label: '7 am daily', value: '0 7 * * *' },
  { label: 'Midnight', value: '0 0 * * *' },
  { label: 'Weekdays 9am', value: '0 9 * * 1-5' },
  { label: 'Hourly', value: '0 * * * *' },
]

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

export function ChainEditorModal({ chain, availableSkills, onClose, onSave }: ChainEditorModalProps) {
  const isNew = !chain
  const [name, setName] = useState(chain?.name ?? '')
  const [schedule, setSchedule] = useState(chain?.schedule ?? '')
  const [onError, setOnError] = useState<'fail-fast' | 'continue' | ''>(chain?.onError ?? '')
  const [steps, setSteps] = useState<ChainStep[]>(
    chain?.steps.map(s => ({ type: s.type, skills: [...s.skills] })) ??
    [{ type: 'sequential', skills: [] }]
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [skillInputIdx, setSkillInputIdx] = useState<number | null>(null)
  const [skillSearch, setSkillSearch] = useState('')
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isNew) nameRef.current?.focus()
  }, [isNew])

  // Close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  const addStep = () => setSteps(s => [...s, { type: 'sequential', skills: [] }])
  const removeStep = (i: number) => setSteps(s => s.filter((_, idx) => idx !== i))
  const moveStep = (i: number, dir: -1 | 1) => setSteps(s => {
    const n = [...s]
    const j = i + dir
    if (j < 0 || j >= n.length) return n
    ;[n[i], n[j]] = [n[j], n[i]]
    return n
  })
  const setStepType = (i: number, t: 'parallel' | 'sequential') =>
    setSteps(s => s.map((step, idx) => idx === i ? { ...step, type: t } : step))
  const addSkillToStep = (stepIdx: number, skill: string) => {
    setSteps(s => s.map((step, idx) => {
      if (idx !== stepIdx) return step
      if (step.skills.includes(skill)) return step
      const skills = step.type === 'sequential' ? [skill] : [...step.skills, skill]
      return { ...step, skills }
    }))
    setSkillSearch('')
    setSkillInputIdx(null)
  }
  const removeSkillFromStep = (stepIdx: number, skill: string) =>
    setSteps(s => s.map((step, idx) =>
      idx !== stepIdx ? step : { ...step, skills: step.skills.filter(sk => sk !== skill) }
    ))

  const handleSave = async () => {
    setError('')
    const slug = slugify(name)
    if (!slug) { setError('Name is required'); return }
    if (steps.some(s => s.skills.length === 0)) { setError('Each step needs at least one skill'); return }

    setSaving(true)
    try {
      await onSave({
        name: slug,
        schedule: schedule || undefined,
        onError: (onError as 'fail-fast' | 'continue') || undefined,
        steps,
      })
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const filteredSkills = availableSkills.filter(s =>
    (!skillSearch || s.includes(skillSearch.toLowerCase())) &&
    skillInputIdx !== null && !steps[skillInputIdx]?.skills.includes(s)
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-[#0D0D10] border border-[rgba(255,255,255,0.14)] w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl shadow-black/70">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(255,255,255,0.08)] shrink-0">
          <span className="text-label">{isNew ? 'New Chain' : `Edit: ${chain.name}`}</span>
          <button onClick={onClose} className="text-primary-35 hover:text-primary-70 text-xl leading-none transition-colors">×</button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* Name */}
          <div>
            <label className="text-[10px] font-mono text-primary-40 uppercase tracking-[1.5px] block mb-1.5">Chain Name</label>
            {isNew ? (
              <input
                ref={nameRef}
                value={name}
                onChange={e => setName(e.target.value)}
                onBlur={() => setName(slugify(name))}
                placeholder="my-pipeline"
                className="w-full bg-[#1A1A1E] text-primary-100 text-xs px-3 py-2 border border-[rgba(255,255,255,0.1)] outline-none font-mono focus:border-eva-orange placeholder:text-primary-35 transition-colors"
              />
            ) : (
              <div className="font-mono text-[12px] text-primary-60 px-3 py-2 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)]">
                {chain.name}
              </div>
            )}
            <div className="text-[9px] font-mono text-primary-35 mt-1">lowercase, hyphens only</div>
          </div>

          {/* Schedule */}
          <div>
            <label className="text-[10px] font-mono text-primary-40 uppercase tracking-[1.5px] block mb-1.5">Schedule</label>
            <div className="flex flex-wrap gap-1 mb-2">
              {SCHEDULE_PRESETS.map(p => (
                <button key={p.value} onClick={() => setSchedule(p.value)}
                  className={`text-[10px] font-mono px-2.5 py-1 transition-colors border ${
                    schedule === p.value
                      ? 'bg-eva-orange text-white border-eva-orange'
                      : 'text-primary-40 border-[rgba(255,255,255,0.1)] hover:text-primary-70'
                  }`}>
                  {p.label}
                </button>
              ))}
            </div>
            <input
              value={schedule}
              onChange={e => setSchedule(e.target.value)}
              placeholder="cron expression (e.g. 0 7 * * *)"
              className="w-full bg-[#1A1A1E] text-primary-70 text-xs px-3 py-2 border border-[rgba(255,255,255,0.1)] outline-none font-mono focus:border-eva-orange placeholder:text-primary-35 transition-colors"
            />
          </div>

          {/* On error */}
          <div>
            <label className="text-[10px] font-mono text-primary-40 uppercase tracking-[1.5px] block mb-1.5">On Error</label>
            <div className="flex gap-1">
              {(['', 'fail-fast', 'continue'] as const).map(opt => (
                <button key={opt} onClick={() => setOnError(opt)}
                  className={`text-[10px] font-mono px-3 py-1.5 transition-colors border ${
                    onError === opt
                      ? 'bg-eva-orange text-white border-eva-orange'
                      : 'text-primary-40 border-[rgba(255,255,255,0.1)] hover:text-primary-70'
                  }`}>
                  {opt === '' ? 'default' : opt}
                </button>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div>
            <label className="text-[10px] font-mono text-primary-40 uppercase tracking-[1.5px] block mb-2">Steps</label>
            <div className="space-y-2">
              {steps.map((step, i) => (
                <div key={i} className="border border-[rgba(255,255,255,0.09)] bg-[#111114] p-3">
                  {/* Step header */}
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="text-[9px] font-mono text-primary-35 w-12">Step {i + 1}</span>
                    {/* Type toggle */}
                    <div className="flex">
                      {(['sequential', 'parallel'] as const).map(t => (
                        <button key={t} onClick={() => setStepType(i, t)}
                          className={`text-[9px] font-mono px-2 py-1 transition-colors border border-[rgba(255,255,255,0.1)] ${
                            step.type === t ? 'bg-eva-orange/20 text-eva-orange border-eva-orange/40' : 'text-primary-35 hover:text-primary-60'
                          } ${t === 'parallel' ? '-ml-px' : ''}`}>
                          {t}
                        </button>
                      ))}
                    </div>
                    <div className="ml-auto flex items-center gap-1">
                      <button onClick={() => moveStep(i, -1)} disabled={i === 0}
                        className="text-[10px] text-primary-35 hover:text-primary-60 disabled:opacity-30 px-1 transition-colors">↑</button>
                      <button onClick={() => moveStep(i, 1)} disabled={i === steps.length - 1}
                        className="text-[10px] text-primary-35 hover:text-primary-60 disabled:opacity-30 px-1 transition-colors">↓</button>
                      <button onClick={() => removeStep(i)}
                        className="text-[10px] text-primary-35 hover:text-eva-red px-1 transition-colors ml-1">✕</button>
                    </div>
                  </div>

                  {/* Skill chips */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {step.skills.map(skill => (
                      <span key={skill} className="flex items-center gap-1 text-[10px] font-mono bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] px-2 py-0.5 text-primary-60">
                        {skill}
                        <button onClick={() => removeSkillFromStep(i, skill)} className="text-primary-35 hover:text-eva-red transition-colors leading-none ml-0.5">×</button>
                      </span>
                    ))}
                    {(step.type === 'parallel' || step.skills.length === 0) && (
                      <div className="relative">
                        <button onClick={() => setSkillInputIdx(skillInputIdx === i ? null : i)}
                          className="text-[10px] font-mono text-eva-orange border border-eva-orange/30 px-2 py-0.5 hover:bg-eva-orange/10 transition-colors">
                          + skill
                        </button>
                        {skillInputIdx === i && (
                          <div className="absolute left-0 top-full mt-1 z-10 bg-[#0D0D10] border border-[rgba(255,255,255,0.14)] shadow-xl w-52">
                            <input
                              autoFocus
                              value={skillSearch}
                              onChange={e => setSkillSearch(e.target.value)}
                              placeholder="filter skills…"
                              className="w-full bg-transparent text-[11px] font-mono text-primary-70 px-3 py-2 outline-none border-b border-[rgba(255,255,255,0.08)] placeholder:text-primary-35"
                            />
                            <div className="max-h-40 overflow-y-auto">
                              {filteredSkills.length === 0 ? (
                                <div className="px-3 py-2 text-[10px] font-mono text-primary-35">No skills available</div>
                              ) : filteredSkills.map(s => (
                                <button key={s} onClick={() => addSkillToStep(i, s)}
                                  className="w-full text-left px-3 py-1.5 text-[11px] font-mono text-primary-60 hover:bg-[rgba(255,255,255,0.05)] hover:text-eva-orange transition-colors">
                                  {s}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {step.type === 'parallel' && step.skills.length > 1 && (
                    <div className="text-[9px] font-mono text-primary-35">Runs concurrently</div>
                  )}
                  {step.type === 'sequential' && step.skills.length > 0 && (
                    <div className="text-[9px] font-mono text-primary-35">Runs after previous step completes</div>
                  )}
                </div>
              ))}
            </div>

            <button onClick={addStep}
              className="mt-2 w-full text-[10px] font-mono border border-dashed border-[rgba(255,255,255,0.15)] py-2 text-primary-35 hover:text-primary-60 hover:border-[rgba(255,255,255,0.25)] transition-colors">
              + Add Step
            </button>
          </div>

          {error && (
            <div className="text-[11px] font-mono text-eva-red border border-eva-red/30 bg-eva-red/08 px-3 py-2">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[rgba(255,255,255,0.08)] shrink-0">
          <button onClick={onClose} className="text-[11px] font-mono text-primary-40 hover:text-primary-70 px-4 py-2 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="bg-eva-orange text-white text-[11px] font-mono uppercase tracking-[1.5px] px-5 py-2 hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2">
            {saving ? <><span className="animate-pulse">◌</span> Saving…</> : (isNew ? '+ Create Chain' : 'Save Changes')}
          </button>
        </div>
      </div>
    </div>
  )
}
