import type { Run } from '../lib/types'
import { timeAgo } from '../lib/utils'

interface StatusTickerProps {
  runs: Run[]
}

function statusIcon(run: Run): { icon: string; cls: string } {
  if (run.status === 'in_progress') return { icon: '◌', cls: 'text-eva-amber' }
  if (run.conclusion === 'success')  return { icon: '✓', cls: 'text-eva-green' }
  if (run.conclusion === 'failure')  return { icon: '✗', cls: 'text-eva-red' }
  return { icon: '·', cls: 'text-primary-35' }
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max - 1) + '…' : str
}

export function StatusTicker({ runs }: StatusTickerProps) {
  const recent = runs.slice(0, 8)

  return (
    <div className="h-9 border-t border-[rgba(255,255,255,0.07)] bg-[#0D0D10] flex items-center px-4 gap-0 overflow-hidden shrink-0">
      <span className="text-label mr-4 shrink-0">FEED</span>

      {recent.length === 0 ? (
        <span className="text-primary-35 text-[11px] font-mono">
          No activity yet — runs will appear here
        </span>
      ) : (
        <div className="flex items-center overflow-hidden">
          {recent.map((run, i) => {
            const { icon, cls } = statusIcon(run)
            return (
              <div key={run.id} className="flex items-center shrink-0">
                <span className={`${cls} text-[11px] font-mono mr-1`}>{icon}</span>
                <span className="text-primary-70 text-[11px] font-mono mr-1.5">
                  {truncate(run.workflow, 20)}
                </span>
                <span className="text-primary-35 text-[11px] font-mono">
                  {timeAgo(run.created_at)}
                </span>
                {i < recent.length - 1 && (
                  <span className="text-primary-35 text-[11px] font-mono mx-3">·</span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
