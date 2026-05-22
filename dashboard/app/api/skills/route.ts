import { NextResponse } from 'next/server'
import { execSync } from 'child_process'
import { resolve } from 'path'
import { getFileContent, getDirectory, updateFile, createFile, deleteDirectory, makeSkillsRequest } from '@/lib/github'
import {
  parseConfig,
  addSkillToConfig,
  updateSkillInConfig,
  updateModelInConfig,
  updateJsonrenderInConfig,
  updateRepoEnabledInConfig,
  removeSkillFromConfig,
  type SkillConfig,
} from '@/lib/config'

const DEFAULT_VIGIL_YML = `enabled: false
model: claude-sonnet-4-6

skills:
  heartbeat: {enabled: true, schedule: "0 12 * * *"}
`

function getRepoSlug(): string {
  try {
    const url = execSync('git remote get-url origin', { stdio: 'pipe', cwd: resolve(process.cwd(), '..') }).toString().trim()
    const m = url.match(/github\.com[/:]([\w.-]+\/[\w.-]+?)(?:\.git)?$/)
    return m ? m[1] : ''
  } catch {
    return ''
  }
}

function extractFrontmatter(content: string): { description: string; tags: string[] } {
  const fm = content.match(/^---\s*\n([\s\S]*?)\n---/)
  let description = ''
  let tags: string[] = []
  if (fm) {
    const desc = fm[1].match(/description:\s*(.+)/)
    if (desc) description = desc[1].trim().replace(/^['"]|['"]$/g, '')
    const tagsMatch = fm[1].match(/tags:\s*\[([^\]]*)\]/)
    if (tagsMatch) {
      tags = tagsMatch[1].split(',').map(t => t.trim()).filter(Boolean)
    }
  }
  if (!description) {
    for (const line of content.split('\n')) {
      const t = line.trim()
      if (t && !t.startsWith('#') && !t.startsWith('---')) {
        description = t.length > 120 ? t.slice(0, 117) + '...' : t
        break
      }
    }
  }
  return { description, tags }
}

export async function GET(request: Request) {
  // Require user credentials — no env-var fallback for user-facing data
  const userToken = request.headers.get('x-github-token')
  const userRepo = request.headers.get('x-github-repo')
  if (!userToken || !userRepo) {
    return NextResponse.json({
      skills: [], model: 'claude-sonnet-4-6', gateway: null, repo: '',
      notSetup: true, notSetupReason: 'Not authenticated', hasToken: false, repoEnabled: false,
    })
  }

  try {
    // Skill definitions (SKILL.md files) come from SKILLS_REPO when set,
    // otherwise from the user's selected repo (their own Vigil fork).
    const skillsReq = makeSkillsRequest(userToken) ?? request

    let skillDirs: Array<{ name: string; type: string; path: string }> = []
    try {
      skillDirs = await getDirectory('skills', skillsReq)
    } catch {
      if (hasEnvVars) {
        // Env var repo has no skills dir — nothing to show
      } else {
        // No skills on selected repo in OAuth mode
        const token = request.headers.get('x-github-token')
        const repo = request.headers.get('x-github-repo') || getRepoSlug()
        return NextResponse.json({
          skills: [], model: 'claude-sonnet-4-6', gateway: null, repo,
          notSetup: true,
          notSetupReason: 'No skills directory found in selected repository',
          hasToken: !!token,
        })
      }
    }

    // Config (enabled/schedule/etc.) always comes from the SELECTED repo.
    // If the repo has no vigil.yml yet, use defaults (heartbeat on, all else off).
    let configContent = ''
    let configExists = false
    try {
      const result = await getFileContent('vigil.yml', request)
      configContent = result.content
      configExists = true
    } catch { /* use defaults */ }

    const config = configExists
      ? parseConfig(configContent)
      : {
          model: 'claude-sonnet-4-6',
          gateway: { provider: 'direct' as const },
          jsonrenderEnabled: false,
          repoEnabled: false,
          skills: {} as Record<string, SkillConfig>,
        }

    const dirNames = skillDirs.filter(d => d.type === 'dir').map(d => d.name)

    const meta = await Promise.all(
      dirNames.map(async (name) => {
        try {
          const { content } = await getFileContent(`skills/${name}/SKILL.md`, skillsReq)
          return { name, ...extractFrontmatter(content) }
        } catch {
          return { name, description: '', tags: [] as string[] }
        }
      }),
    )

    const skills = dirNames.map(name => {
      const m = meta.find(d => d.name === name)
      const skillConfig = config.skills[name]
      return {
        name,
        description: m?.description || '',
        tags: m?.tags || [],
        // Default: heartbeat on for repos that don't have a vigil.yml yet
        enabled: skillConfig?.enabled ?? (!configExists && name === 'heartbeat'),
        schedule: skillConfig?.schedule || '0 12 * * *',
        var: skillConfig?.var || '',
        model: skillConfig?.model || '',
      }
    })

    const repo = request.headers.get('x-github-repo') || getRepoSlug()
    return NextResponse.json({
      skills, model: config.model, gateway: config.gateway, repo,
      jsonrenderEnabled: config.jsonrenderEnabled,
      repoEnabled: config.repoEnabled,
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { name, enabled, schedule, var: skillVar, model, skillModel, jsonrenderEnabled, repoEnabled } = await request.json()

    // Read config from the selected repo; create from template if missing
    let existingContent = ''
    let sha = ''
    let isNew = false
    try {
      const result = await getFileContent('vigil.yml', request)
      existingContent = result.content
      sha = result.sha
    } catch {
      existingContent = DEFAULT_VIGIL_YML
      isNew = true
    }

    let updated = existingContent

    if (typeof repoEnabled === 'boolean') {
      updated = updateRepoEnabledInConfig(updated, repoEnabled)
    }
    if (typeof jsonrenderEnabled === 'boolean') {
      updated = updateJsonrenderInConfig(updated, jsonrenderEnabled)
    }
    if (typeof model === 'string' && model) {
      updated = updateModelInConfig(updated, model)
    }
    if (name && (typeof enabled === 'boolean' || typeof schedule === 'string' || typeof skillVar === 'string' || typeof skillModel === 'string')) {
      // Ensure the skill entry exists before updating (addSkillToConfig is a no-op if already present)
      updated = addSkillToConfig(updated, name)
      updated = updateSkillInConfig(updated, name, {
        ...(typeof enabled === 'boolean' ? { enabled } : {}),
        ...(typeof schedule === 'string' && schedule ? { schedule } : {}),
        ...(typeof skillVar === 'string' ? { var: skillVar } : {}),
        ...(typeof skillModel === 'string' ? { model: skillModel } : {}),
      })
    }

    if (updated !== existingContent || isNew) {
      const msg = typeof repoEnabled === 'boolean'
        ? `chore: ${repoEnabled ? 'enable' : 'disable'} repository`
        : model
          ? `chore: set model to ${model}`
          : typeof jsonrenderEnabled === 'boolean'
            ? `chore: ${jsonrenderEnabled ? 'enable' : 'disable'} json-render channel`
            : `chore: update ${name} config`

      if (isNew) {
        await createFile('vigil.yml', updated, msg, request)
      } else {
        await updateFile('vigil.yml', updated, sha, msg, request)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { name } = await request.json()
    if (!name || !/^[a-z][a-z0-9-]*$/.test(name)) {
      return NextResponse.json({ error: 'Invalid skill name' }, { status: 400 })
    }

    await deleteDirectory(`skills/${name}`, `chore: delete ${name} skill`, request)

    try {
      const { content, sha } = await getFileContent('vigil.yml', request)
      const updated = removeSkillFromConfig(content, name)
      if (updated !== content) {
        await updateFile('vigil.yml', updated, sha, `chore: remove ${name} from config`, request)
      }
    } catch { /* config cleanup is best-effort */ }

    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
