import { NextResponse } from 'next/server'
import { getDirectory, getFileContent } from '@/lib/github'

interface SkillHealthEntry {
  skill?: string
  scores?: number[]
  avg_score?: number
  runs?: Array<{ score?: number; timestamp?: string; flags?: string[] }>
  last_updated?: string
  status?: string
}

interface CronStateEntry {
  status?: string
  consecutive_failures?: number
  last_success?: string
  last_run?: string
  success_rate?: number
  total_runs?: number
  quality_score?: number
}

export interface SkillQuality {
  name: string
  avgScore: number | null
  recentScores: number[]
  status: 'healthy' | 'degraded' | 'critical' | 'no-data'
  consecutiveFailures: number
  successRate: number | null
  lastRun: string | null
}

function parseHealthContent(content: string): SkillHealthEntry {
  try {
    return JSON.parse(content)
  } catch {
    return {}
  }
}

async function parseCronState(): Promise<Record<string, CronStateEntry>> {
  try {
    const { content } = await getFileContent('memory/cron-state.json')
    return JSON.parse(content)
  } catch {
    return {}
  }
}

function scoreStatus(
  avgScore: number | null,
  consecutiveFailures: number,
  successRate: number | null,
): SkillQuality['status'] {
  if (consecutiveFailures >= 3) return 'critical'
  if (avgScore !== null && avgScore < 2.5) return 'degraded'
  if (successRate !== null && successRate < 0.6) return 'degraded'
  if (avgScore !== null || successRate !== null) return 'healthy'
  return 'no-data'
}

export async function GET() {
  const qualities: SkillQuality[] = []
  const cronState = await parseCronState()

  const healthBySkill: Record<string, SkillHealthEntry> = {}
  try {
    const files = await getDirectory('memory/skill-health')
    const jsonFiles = files.filter(
      f => f.type === 'file' && f.name.endsWith('.json') && f.name !== 'last-report.json',
    )
    await Promise.all(
      jsonFiles.map(async file => {
        try {
          const slug = file.name.replace('.json', '')
          const { content } = await getFileContent(`memory/skill-health/${file.name}`)
          healthBySkill[slug] = parseHealthContent(content)
        } catch {}
      }),
    )
  } catch {}

  const allSlugs = new Set([
    ...Object.keys(cronState),
    ...Object.keys(healthBySkill),
  ])

  for (const name of allSlugs) {
    const cron = cronState[name] as CronStateEntry | undefined
    const health = healthBySkill[name] as SkillHealthEntry | undefined

    let scores: number[] = []
    if (health?.scores) {
      scores = health.scores.filter(s => typeof s === 'number')
    } else if (health?.runs) {
      scores = health.runs
        .map(r => r.score)
        .filter((s): s is number => typeof s === 'number')
    }
    if (cron?.quality_score !== undefined) {
      scores = [cron.quality_score, ...scores].slice(0, 30)
    }

    const avgScore =
      health?.avg_score ??
      (scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null)

    const consecutiveFailures = cron?.consecutive_failures ?? 0
    const successRate = cron?.success_rate ?? null
    const lastRun = cron?.last_run ?? health?.last_updated ?? null

    qualities.push({
      name,
      avgScore: avgScore !== null ? Math.round(avgScore * 10) / 10 : null,
      recentScores: scores.slice(-10),
      status: scoreStatus(avgScore, consecutiveFailures, successRate),
      consecutiveFailures,
      successRate,
      lastRun,
    })
  }

  qualities.sort((a, b) => {
    const order = { critical: 0, degraded: 1, healthy: 2, 'no-data': 3 }
    return order[a.status] - order[b.status]
  })

  const summary = {
    total: qualities.length,
    healthy: qualities.filter(q => q.status === 'healthy').length,
    degraded: qualities.filter(q => q.status === 'degraded').length,
    critical: qualities.filter(q => q.status === 'critical').length,
    noData: qualities.filter(q => q.status === 'no-data').length,
    avgScore:
      qualities.filter(q => q.avgScore !== null).length > 0
        ? Math.round(
            (qualities
              .filter(q => q.avgScore !== null)
              .reduce((a, b) => a + (b.avgScore ?? 0), 0) /
              qualities.filter(q => q.avgScore !== null).length) *
              10,
          ) / 10
        : null,
  }

  return NextResponse.json({ qualities, summary })
}
