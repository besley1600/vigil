import { NextResponse } from 'next/server'
import { resolve } from 'path'
import { readFileSync, existsSync } from 'fs'
import { execFileSync } from 'child_process'
import { parseDocument, isMap, isSeq, isScalar } from 'yaml'
import { triggerWorkflow, getFileContent } from '@/lib/github'

const REPO_ROOT = resolve(process.cwd(), '..')
const VIGIL_YML = resolve(REPO_ROOT, 'vigil.yml')
const SKILL_RE = /^[a-z][a-z0-9-]*$/

function isRemote(request: Request) {
  return !!(request.headers.get('x-github-token') && request.headers.get('x-github-repo'))
}

async function getVigilYml(request: Request): Promise<string> {
  if (isRemote(request)) {
    const { content } = await getFileContent('vigil.yml', request)
    return content
  }
  if (!existsSync(VIGIL_YML)) throw new Error('vigil.yml not found')
  return readFileSync(VIGIL_YML, 'utf-8')
}

async function dispatchSkill(skill: string, request: Request): Promise<void> {
  if (isRemote(request)) {
    await triggerWorkflow(skill, request)
    return
  }
  execFileSync('gh', ['workflow', 'run', 'vigil.yml', '-f', `skill=${skill}`], {
    stdio: 'pipe',
    cwd: REPO_ROOT,
  })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  try {
    const { name } = await params

    if (!SKILL_RE.test(name)) {
      return NextResponse.json({ error: 'Invalid chain name' }, { status: 400 })
    }

    const yamlContent = await getVigilYml(request)
    const doc = parseDocument(yamlContent)
    const chainsNode = doc.get('chains')
    if (!isMap(chainsNode)) {
      return NextResponse.json({ error: 'No chains defined' }, { status: 404 })
    }

    const chainNode = chainsNode.get(name, true)
    if (!isMap(chainNode)) {
      return NextResponse.json({ error: 'Chain not found' }, { status: 404 })
    }

    const stepsNode = chainNode.get('steps', true)
    if (!isSeq(stepsNode) || stepsNode.items.length === 0) {
      return NextResponse.json({ error: 'Chain has no steps' }, { status: 400 })
    }

    const firstStep = stepsNode.items[0]
    if (!isMap(firstStep)) {
      return NextResponse.json({ error: 'Invalid first step' }, { status: 400 })
    }

    const skillsToRun: string[] = []

    const parallel = firstStep.get('parallel', true)
    if (isSeq(parallel)) {
      for (const item of parallel.items) {
        if (isScalar(item) && SKILL_RE.test(String(item.value))) {
          skillsToRun.push(String(item.value))
        }
      }
    }

    if (skillsToRun.length === 0) {
      const skillName = firstStep.get('skill')
      if (typeof skillName === 'string' && SKILL_RE.test(skillName)) {
        skillsToRun.push(skillName)
      }
    }

    if (skillsToRun.length === 0) {
      return NextResponse.json({ error: 'No runnable skills in first step' }, { status: 400 })
    }

    const dispatched: string[] = []
    const errors: string[] = []

    for (const skill of skillsToRun) {
      try {
        await dispatchSkill(skill, request)
        dispatched.push(skill)
      } catch (e) {
        errors.push(skill)
        console.error(`Failed to dispatch ${skill}:`, e)
      }
    }

    if (dispatched.length === 0) {
      return NextResponse.json({ error: 'All dispatches failed', errors }, { status: 500 })
    }

    return NextResponse.json({ ok: true, dispatched, errors })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to run chain'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
