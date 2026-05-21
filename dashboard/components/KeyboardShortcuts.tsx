'use client'

import { useEffect, useState } from 'react'

interface KeyboardShortcutsProps {
  skills: string[]
  selectedSkill: string | null
  skillEnabled: boolean
  onSelectSkill: (name: string | null) => void
  onToggle: () => void
  onRun: () => void
}

const SHORTCUTS = [
  { key: '← →', desc: 'Navigate skills' },
  { key: 'R',   desc: 'Run selected skill' },
  { key: 'E',   desc: 'Enable / disable skill' },
  { key: 'Esc', desc: 'Back to HQ' },
  { key: '?',   desc: 'Toggle this overlay' },
]

export function KeyboardShortcuts({ skills, selectedSkill, skillEnabled, onSelectSkill, onToggle, onRun }: KeyboardShortcutsProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      switch (e.key) {
        case '?':
          e.preventDefault()
          setShow(s => !s)
          break
        case 'Escape':
          e.preventDefault()
          if (show) { setShow(false); return }
          onSelectSkill(null)
          break
        case 'ArrowLeft': {
          if (!selectedSkill || !skills.length) break
          e.preventDefault()
          const idx = skills.indexOf(selectedSkill)
          onSelectSkill(skills[idx <= 0 ? skills.length - 1 : idx - 1])
          break
        }
        case 'ArrowRight': {
          if (!skills.length) break
          e.preventDefault()
          if (!selectedSkill) { onSelectSkill(skills[0]); break }
          const idx = skills.indexOf(selectedSkill)
          onSelectSkill(skills[idx >= skills.length - 1 ? 0 : idx + 1])
          break
        }
        case 'e':
        case 'E':
          if (selectedSkill) { e.preventDefault(); onToggle() }
          break
        case 'r':
        case 'R':
          if (selectedSkill) { e.preventDefault(); onRun() }
          break
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [show, skills, selectedSkill, skillEnabled, onSelectSkill, onToggle, onRun])

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={() => setShow(false)}>
      <div className="bg-[#0D0D10] border border-[rgba(255,255,255,0.14)] p-[var(--space-lg)] w-80 shadow-2xl shadow-black/70"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-[var(--space-md)]">
          <span className="text-label">Keyboard Shortcuts</span>
          <button onClick={() => setShow(false)} className="text-primary-35 hover:text-primary-70 text-lg leading-none transition-colors">×</button>
        </div>
        <div className="space-y-2.5">
          {SHORTCUTS.map(({ key, desc }) => (
            <div key={key} className="flex items-center gap-3">
              <span className="font-mono text-[11px] px-2.5 py-1 bg-[#1A1A1E] border border-[rgba(255,255,255,0.1)] text-eva-orange text-center shrink-0" style={{ minWidth: '4.5rem' }}>{key}</span>
              <span className="text-xs text-primary-50 font-mono">{desc}</span>
            </div>
          ))}
        </div>
        <div className="mt-[var(--space-md)] pt-[var(--space-sm)] border-t border-[rgba(255,255,255,0.07)] text-[10px] text-primary-35 font-mono text-center">
          Press <span className="text-eva-orange">?</span> to dismiss
        </div>
      </div>
    </div>
  )
}
