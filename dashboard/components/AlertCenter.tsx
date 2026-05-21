'use client'

import { useState, useEffect, useRef } from 'react'
import type { Run } from '../lib/types'
import { timeAgo } from '../lib/utils'

interface QualityEntry {
  name: string
  avgScore: number | null
  status: 'healthy' | 'degraded' | 'critical' | 'no-data'
  consecutiveFailures: number
  successRate: number | null
  lastRun: string | null
}

interface Alert {
  id: string
  level: 'critical' | 'warning' | 'info'
  title: string
  detail: string
  time: string | null
}

interface AlertCenterProps {
  runs: Run[]
}

function buildAlerts(runs: Run[], qualities: QualityEntry[]): Alert[] {
  const alerts: Alert[] = []

  // Critical quality degradations
  qualities.filter(q => q.status === 'critical').forEach(q => {
    alerts.push({
      id: `crit-${q.name}`,
      level: 'critical',
      title: q.name,
      detail: `${q.consecutiveFailures} consecutive failures`,
      time: q.lastRun,
    })
  })

  // Degraded skills
  qualities.filter(q => q.status === 'degraded').forEach(q => {
    const detail = q.avgScore !== null
      ? `Quality score ${q.avgScore}/5`
      : q.successRate !== null
        ? `${Math.round(q.successRate * 100)}% success rate`
        : 'Degraded'
    alerts.push({
      id: `deg-${q.name}`,
      level: 'warning',
      title: q.name,
      detail,
      time: q.lastRun,
    })
  })

  // Recent run failures (last 24h, not already in quality alerts)
  const qualityNames = new Set(qualities.filter(q => q.status !== 'no-data').map(q => q.name))
  const cutoff = Date.now() - 86_400_000
  runs
    .filter(r => r.conclusion === 'failure' && new Date(r.created_at).getTime() > cutoff)
    .slice(0, 5)
    .forEach(r => {
      const skill = r.workflow.replace('.yml', '')
      if (qualityNames.has(skill)) return
      alerts.push({
        id: `fail-${r.id}`,
        level: 'warning',
        title: skill,
        detail: 'Run failed',
        time: r.created_at,
      })
    })

  return alerts
}

export function AlertCenter({ runs }: AlertCenterProps) {
  const [open, setOpen] = useState(false)
  const [qualities, setQualities] = useState<QualityEntry[]>([])
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/quality')
      .then(r => r.ok ? r.json() : { qualities: [] })
      .then(d => setQualities(d.qualities || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const alerts = buildAlerts(runs, qualities)
  const critCount = alerts.filter(a => a.level === 'critical').length
  const warnCount = alerts.filter(a => a.level === 'warning').length
  const badgeCount = critCount + warnCount

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative text-[10px] font-mono text-primary-50 border border-[rgba(255,255,255,0.1)] px-2.5 py-1.5 hover:text-primary-70 hover:border-[rgba(255,255,255,0.2)] transition-colors"
        title="Alert center"
      >
        <span>◈</span>
        {badgeCount > 0 && (
          <span className={`absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 text-[9px] font-mono flex items-center justify-center ${
            critCount > 0 ? 'bg-eva-red text-white' : 'bg-eva-amber text-white'
          }`}>
            {badgeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-[#0D0D10] border border-[rgba(255,255,255,0.12)] shadow-2xl shadow-black/70 z-50 animate-fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(255,255,255,0.07)]">
            <span className="text-label">Alerts</span>
            <div className="flex items-center gap-2 text-[10px] font-mono">
              {critCount > 0 && <span className="text-eva-red">{critCount} critical</span>}
              {warnCount > 0 && <span className="text-eva-amber">{warnCount} warning</span>}
              {badgeCount === 0 && <span className="text-eva-green">All clear</span>}
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-[rgba(255,255,255,0.05)]">
            {alerts.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <div className="text-eva-green text-sm mb-1">◉</div>
                <div className="text-[11px] font-mono text-primary-50">Fleet is healthy</div>
                <div className="text-[10px] font-mono text-primary-35 mt-0.5">No alerts to report</div>
              </div>
            ) : (
              alerts.map(alert => (
                <div key={alert.id} className="flex items-start gap-3 px-4 py-3">
                  <span className={`text-sm mt-0.5 shrink-0 ${
                    alert.level === 'critical' ? 'text-eva-red' :
                    alert.level === 'warning'  ? 'text-eva-amber' :
                                                 'text-primary-40'
                  }`}>
                    {alert.level === 'critical' ? '✗' : alert.level === 'warning' ? '!' : '·'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-mono text-primary-70 truncate">{alert.title}</div>
                    <div className="text-[10px] font-mono text-primary-40 mt-0.5">{alert.detail}</div>
                  </div>
                  {alert.time && (
                    <span className="text-[9px] font-mono text-primary-35 shrink-0 mt-0.5">
                      {timeAgo(alert.time)}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
