'use client'

import { useEffect } from 'react'
import type { Skill, Run } from '../lib/types'
import { DEPARTMENTS } from '../lib/constants'
import { displayName } from '../lib/utils'
import { SkillDetail } from './SkillDetail'

interface SlideOverProps {
  skill: Skill
  runs: Run[]
  model: string
  gateway: 'direct' | 'bankr'
  busy: Record<string, boolean>
  onClose: () => void
  onToggle: (name: string, enabled: boolean) => void
  onRun: (name: string, v?: string, m?: string) => void
  onDelete: (name: string) => void
  onUpdateSchedule: (name: string, schedule: string) => void
  onUpdateVar: (name: string, v: string) => void
  onUpdateModel: (name: string, m: string) => void
  onViewRun: (run: Run) => void
}

export function SlideOver({
  skill,
  runs,
  model,
  gateway,
  busy,
  onClose,
  onToggle,
  onRun,
  onDelete,
  onUpdateSchedule,
  onUpdateVar,
  onUpdateModel,
  onViewRun,
}: SlideOverProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const dept = skill.tags?.[0] ? DEPARTMENTS[skill.tags[0]] : null
  const deptColor = dept?.color ?? 'rgba(255,255,255,0.18)'

  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>

      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className="relative w-[480px] max-w-full h-full bg-eva-black border-l border-[rgba(255,255,255,0.10)] flex flex-col overflow-hidden"
        style={{ animation: 'slideInRight 0.25s ease-out' }}
      >
        {/* Header */}
        <div className="h-14 border-b border-[rgba(255,255,255,0.07)] flex items-center justify-between px-5 shrink-0">
          <div className="flex items-center gap-3">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: deptColor }}
            />
            <span className="font-display text-lg text-primary-100">
              {displayName(skill.name)}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close panel"
            className="text-primary-35 hover:text-primary-100 text-xl transition-colors leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-[var(--space-md)]">
          <SkillDetail
            skill={skill}
            runs={runs}
            model={model}
            gateway={gateway}
            busy={busy}
            onToggle={onToggle}
            onRun={onRun}
            onDelete={onDelete}
            onUpdateSchedule={onUpdateSchedule}
            onUpdateVar={onUpdateVar}
            onUpdateModel={onUpdateModel}
            onViewRun={onViewRun}
          />
        </div>
      </div>
    </div>
  )
}
