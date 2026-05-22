import { NextResponse } from 'next/server'
import { execFileSync } from 'child_process'
import { resolve } from 'path'
import { triggerWorkflow, getFileContent } from '@/lib/github'
import { parseConfig } from '@/lib/config'

const REPO_ROOT = resolve(process.cwd(), '..')

function isRemote(request: Request) {
  if (process.env.GITHUB_TOKEN && process.env.GITHUB_REPO) return true
  const token = request.headers.get('x-github-token')
  const repo = request.headers.get('x-github-repo')
  return !!(token && repo)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  try {
    const { name } = await params

    if (!/^[a-z][a-z0-9-]*$/.test(name)) {
      return NextResponse.json({ error: 'Invalid skill name' }, { status: 400 })
    }

    let skillVar = ''
    let model = ''
    try {
      const body = await request.json()
      if (body.var && typeof body.var === 'string') {
        skillVar = body.var.replace(/[^a-zA-Z0-9_ .\-/#@]/g, '')
      }
      if (body.model && typeof body.model === 'string') {
        model = body.model.replace(/[^a-zA-Z0-9_\-]/g, '')
      }
    } catch { /* no body is fine */ }

    if (isRemote(request)) {
      // Refuse to run if the repo hasn't been explicitly enabled
      try {
        const { content } = await getFileContent('vigil.yml', request)
        const config = parseConfig(content)
        if (!config.repoEnabled) {
          return NextResponse.json(
            { error: 'This repository is not enabled. Enable it in HQ settings before running skills.' },
            { status: 403 },
          )
        }
      } catch {
        // No vigil.yml = not enabled
        return NextResponse.json(
          { error: 'This repository is not enabled. Enable it in HQ settings before running skills.' },
          { status: 403 },
        )
      }

      const extraInputs: Record<string, string> = {}
      if (skillVar) extraInputs.var = skillVar
      if (model) extraInputs.model = model
      await triggerWorkflow(name, request, extraInputs)
      return NextResponse.json({ ok: true })
    }

    // Local: use gh CLI
    const args = ['workflow', 'run', 'vigil.yml', '-f', `skill=${name}`]
    if (skillVar) args.push('-f', `var=${skillVar}`)
    if (model) args.push('-f', `model=${model}`)
    execFileSync('gh', args, { stdio: 'pipe', cwd: REPO_ROOT })

    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to trigger run'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
