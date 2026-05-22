import { NextResponse } from 'next/server'
import { execFileSync } from 'child_process'
import { resolve } from 'path'
import { readFileSync } from 'fs'
import { getWorkflowRuns, getFileContent } from '@/lib/github'

const REPO_ROOT = resolve(process.cwd(), '..')

function isRemote(request: Request) {
  return !!(request.headers.get('x-github-token') && request.headers.get('x-github-repo'))
}

interface RunRecord {
  name: string
  status: string
  conclusion: string | null
  createdAt: string
  updatedAt: string
}

interface SkillMetrics {
  name: string
  total: number
  success: number
  failure: number
  cancelled: number
  inProgress: number
  successRate: number
  lastRun: string | null
  lastConclusion: string | null
  avgDurationMin: number | null
  streak: number
}

interface Insight {
  type: 'warning' | 'info' | 'success'
  message: string
}

function computeMetrics(raw: RunRecord[]) {
  const bySkill = new Map<string, RunRecord[]>()
  for (const run of raw) {
    const match = (run.name as string).match(/^skill:\s*(\S+)/)
    if (!match) continue
    const skill = match[1]
    if (!bySkill.has(skill)) bySkill.set(skill, [])
    bySkill.get(skill)!.push(run)
  }

  const skills: SkillMetrics[] = []
  for (const [name, runs] of bySkill) {
    const sorted = runs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    const success = sorted.filter(r => r.conclusion === 'success').length
    const failure = sorted.filter(r => r.conclusion === 'failure').length
    const cancelled = sorted.filter(r => r.conclusion === 'cancelled').length
    const inProgress = sorted.filter(r => r.status === 'in_progress').length
    const total = sorted.length

    let avgDurationMin: number | null = null
    const completedRuns = sorted.filter(r => r.conclusion && r.createdAt && r.updatedAt)
    if (completedRuns.length > 0) {
      const totalMs = completedRuns.reduce((sum, r) => {
        return sum + (new Date(r.updatedAt).getTime() - new Date(r.createdAt).getTime())
      }, 0)
      avgDurationMin = Math.round((totalMs / completedRuns.length / 60000) * 10) / 10
    }

    let streak = 0
    if (sorted.length > 0) {
      const first = sorted[0].conclusion
      if (first === 'success' || first === 'failure') {
        const dir = first === 'success' ? 1 : -1
        for (const r of sorted) {
          if (r.conclusion === first) streak += dir
          else break
        }
      }
    }

    skills.push({
      name, total, success, failure, cancelled, inProgress,
      successRate: total > 0 ? Math.round((success / Math.max(total - inProgress, 1)) * 100) : 0,
      lastRun: sorted[0]?.createdAt || null,
      lastConclusion: sorted[0]?.conclusion || null,
      avgDurationMin,
      streak,
    })
  }

  skills.sort((a, b) => b.total - a.total)
  return { skills, raw }
}

function buildInsights(skills: SkillMetrics[], enabledSkillNames: string[]) {
  const insights: Insight[] = []
  const now = Date.now()
  const threeDaysMs = 3 * 24 * 60 * 60 * 1000

  for (const s of skills) {
    if (s.total >= 3 && s.successRate < 50) {
      insights.push({ type: 'warning', message: `${s.name} has a ${s.successRate}% success rate (${s.failure} failures out of ${s.total} runs)` })
    }
  }
  for (const s of skills) {
    if (s.streak <= -3) {
      insights.push({ type: 'warning', message: `${s.name} has failed ${Math.abs(s.streak)} times in a row` })
    }
  }
  for (const skillName of enabledSkillNames) {
    const metrics = skills.find(s => s.name === skillName)
    if (!metrics) {
      insights.push({ type: 'info', message: `${skillName} is enabled but has no recorded runs` })
    } else if (metrics.lastRun && now - new Date(metrics.lastRun).getTime() > threeDaysMs) {
      const daysAgo = Math.floor((now - new Date(metrics.lastRun).getTime()) / (24 * 60 * 60 * 1000))
      insights.push({ type: 'info', message: `${metrics.name} hasn't run in ${daysAgo} days` })
    }
  }
  for (const s of skills) {
    if (s.total >= 5 && s.successRate === 100) {
      insights.push({ type: 'success', message: `${s.name} has a perfect 100% success rate across ${s.total} runs` })
    }
  }

  return insights
}

export async function GET(request: Request) {
  try {
    let raw: RunRecord[]

    if (isRemote(request)) {
      const apiRuns = await getWorkflowRuns(200, request)
      raw = (apiRuns as Record<string, unknown>[]).map(r => ({
        name: (r.display_title || r.name) as string,
        status: r.status as string,
        conclusion: r.conclusion as string | null,
        createdAt: r.created_at as string,
        updatedAt: (r.updated_at || r.created_at) as string,
      }))
    } else {
      const out = execFileSync(
        'gh', ['run', 'list', '--json', 'name,status,conclusion,createdAt,updatedAt', '--limit', '200'],
        { stdio: 'pipe', cwd: REPO_ROOT, timeout: 30000 },
      ).toString()
      raw = JSON.parse(out)
    }

    const { skills } = computeMetrics(raw)

    // Read enabled skills from vigil.yml
    let enabledSkillNames: string[] = []
    try {
      let ymlContent: string
      if (isRemote(request)) {
        const { content } = await getFileContent('vigil.yml', request)
        ymlContent = content
      } else {
        ymlContent = readFileSync(resolve(REPO_ROOT, 'vigil.yml'), 'utf-8')
      }
      for (const line of ymlContent.split('\n')) {
        const m = line.match(/^\s+(\S+):\s*\{.*enabled:\s*true/)
        if (m) enabledSkillNames.push(m[1])
      }
    } catch { /* skip enabled-skill insights */ }

    const insights = buildInsights(skills, enabledSkillNames)
    const totalRuns = skills.reduce((s, sk) => s + sk.total, 0)
    const totalSuccess = skills.reduce((s, sk) => s + sk.success, 0)
    const totalFailure = skills.reduce((s, sk) => s + sk.failure, 0)

    return NextResponse.json({
      skills, insights,
      summary: {
        totalRuns, totalSuccess, totalFailure,
        overallSuccessRate: totalRuns > 0 ? Math.round((totalSuccess / totalRuns) * 100) : 0,
        uniqueSkills: skills.length,
        periodDays: raw.length > 0
          ? Math.ceil((Date.now() - new Date(raw[raw.length - 1].createdAt).getTime()) / (24 * 60 * 60 * 1000))
          : 0,
      },
    })
  } catch {
    return NextResponse.json({ skills: [], insights: [], summary: { totalRuns: 0, totalSuccess: 0, totalFailure: 0, overallSuccessRate: 0, uniqueSkills: 0, periodDays: 0 } })
  }
}
