'use client'

import { useState, useRef, useEffect } from 'react'
import type { Skill } from '../lib/types'
import { displayName } from '../lib/utils'

interface FloatingDispatchProps {
  skills: Skill[]
  busy: Record<string, boolean>
  onRun: (name: string, v?: string) => void
}

export function FloatingDispatch({ skills, busy, onRun }: FloatingDispatchProps) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState('')
  const [varInput, setVarInput] = useState('')
  const selectRef = useRef<HTMLSelectElement>(null)

  const enabledSkills = skills.filter(s => s.enabled)
  const skill = enabledSkills.find(s => s.name === selected)
  const isBusy = !!busy[`r-${selected}`]

  useEffect(() => {
    if (open) setTimeout(() => selectRef.current?.focus(), 50)
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  const handleRun = () => {
    if (!selected || isBusy) return
    onRun(selected, varInput.trim() || skill?.var)
    setOpen(false)
    setSelected('')
    setVarInput('')
  }

  return (
    <>
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}

      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {open && (
          <div className="w-72 bg-eva-black border border-[rgba(255,255,255,0.14)] shadow-2xl shadow-black/70 p-4 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-label">Dispatch</span>
              <span className="text-[10px] text-primary-35 font-mono">{enabledSkills.length} available</span>
            </div>

            <select ref={selectRef} value={selected} onChange={(e) => setSelected(e.target.value)}
              className="w-full bg-eva-white text-primary-100 text-xs px-3 py-2 border border-[rgba(255,255,255,0.1)] outline-none font-mono focus:border-eva-orange transition-colors">
              <option value="">Select skill…</option>
              {enabledSkills.map(s => (
                <option key={s.name} value={s.name}>{displayName(s.name)}</option>
              ))}
            </select>

            {selected && (
              <input
                type="text"
                value={varInput}
                onChange={(e) => setVarInput(e.target.value)}
                placeholder={skill?.var ? `Default: ${skill.var}` : 'Optional input…'}
                className="w-full bg-eva-white text-primary-100 text-xs px-3 py-2 border border-[rgba(255,255,255,0.1)] outline-none font-mono focus:border-eva-orange transition-colors placeholder:text-primary-35"
                onKeyDown={(e) => e.key === 'Enter' && handleRun()}
              />
            )}

            <button onClick={handleRun} disabled={!selected || isBusy}
              className="w-full bg-eva-orange text-white text-[11px] py-2.5 font-mono uppercase tracking-[2px] hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2">
              <span className="text-base leading-none">◉</span>
              <span>{isBusy ? 'Dispatching…' : 'Dispatch'}</span>
            </button>
          </div>
        )}

        <button onClick={() => setOpen(o => !o)}
          className={`flex items-center gap-2 text-[11px] font-mono uppercase tracking-[2px] px-4 py-2.5 shadow-lg transition-all ${
            open
              ? 'bg-eva-white text-primary-50 border border-[rgba(255,255,255,0.1)]'
              : 'bg-eva-orange text-white hover:opacity-90'
          }`}>
          <span className={`text-base leading-none transition-transform duration-200 ${open ? 'rotate-45' : ''}`}>◉</span>
          <span>{open ? 'Close' : 'Dispatch'}</span>
        </button>
      </div>
    </>
  )
}
