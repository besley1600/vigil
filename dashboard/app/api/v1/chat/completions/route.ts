/**
 * OpenAI-compatible /v1/chat/completions endpoint
 *
 * Lets any OpenAI SDK client invoke Vigil skills by setting:
 *   base_url = "http://localhost:5555/v1"
 *   api_key  = "<your VIGIL_WEBHOOK_SECRET or any string if local>"
 *
 * Model field → skill slug mapping:
 *   "vigil-deep-research"  → runs the deep-research skill
 *   "vigil-article"        → runs the article skill
 *   "vigil"                → auto-picks skill from last message content
 *
 * The last user message is passed as the skill's `var` input.
 * Skills run via GitHub Actions (same as scheduled runs).
 *
 * Example (Python):
 *   from openai import OpenAI
 *   client = OpenAI(api_key="any", base_url="http://localhost:5555/v1")
 *   resp = client.chat.completions.create(
 *     model="vigil-deep-research",
 *     messages=[{"role": "user", "content": "AI agent frameworks 2025"}],
 *   )
 *   print(resp.choices[0].message.content)
 */

import { NextResponse } from 'next/server'
import { execFileSync, execSync } from 'child_process'
import { resolve } from 'path'
import { existsSync, readFileSync } from 'fs'
import { randomUUID } from 'crypto'

const REPO_ROOT = resolve(process.cwd(), '..')

interface OAIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OAIRequest {
  model: string
  messages: OAIMessage[]
  stream?: boolean
  temperature?: number
  max_tokens?: number
}

interface Skill {
  slug: string
  name: string
  description: string
  category: string
}

function loadSkills(): Skill[] {
  try {
    const manifest = JSON.parse(readFileSync(resolve(REPO_ROOT, 'skills.json'), 'utf-8'))
    return manifest.skills ?? []
  } catch {
    return []
  }
}

function skillFromModel(model: string): string | null {
  const slug = model.replace(/^vigil-/, '')
  if (existsSync(resolve(REPO_ROOT, 'skills', slug, 'SKILL.md'))) return slug
  return null
}

function skillFromMessage(text: string, skills: Skill[]): string | null {
  const lower = text.toLowerCase()
  const explicit = lower.match(/\b(vigil-)?([a-z0-9-]+)\b/)
  if (explicit) {
    const candidate = explicit[2]
    if (skills.find(s => s.slug === candidate)) return candidate
  }
  // Keyword heuristics
  if (lower.includes('research') || lower.includes('investigate')) return 'deep-research'
  if (lower.includes('news') || lower.includes('hacker')) return 'hacker-news-digest'
  if (lower.includes('pr ') || lower.includes('pull request')) return 'pr-review'
  if (lower.includes('price') || lower.includes('crypto') || lower.includes('token')) return 'token-alert'
  if (lower.includes('tweet') || lower.includes('twitter')) return 'write-tweet'
  if (lower.includes('article') || lower.includes('blog')) return 'article'
  return null
}

function ghRepo(): string | null {
  try {
    return execSync('gh repo view --json nameWithOwner -q .nameWithOwner', {
      stdio: 'pipe', cwd: REPO_ROOT,
    }).toString().trim() || null
  } catch {
    return null
  }
}

function dispatchSkill(slug: string, varValue: string): void {
  const repo = ghRepo()
  const repoArgs = repo ? ['-R', repo] : []
  const args = ['workflow', 'run', 'vigil.yml', ...repoArgs, '--ref', 'main', '-f', `skill=${slug}`]
  if (varValue) args.push('-f', `var=${varValue}`)
  execFileSync('gh', args, { stdio: 'pipe', cwd: REPO_ROOT })
}

function oaiResponse(id: string, model: string, content: string) {
  return {
    id: `chatcmpl-${id}`,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [
      {
        index: 0,
        message: { role: 'assistant', content },
        finish_reason: 'stop',
      },
    ],
    usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
  }
}

export async function POST(request: Request) {
  let body: OAIRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: { message: 'Invalid JSON', type: 'invalid_request_error' } }, { status: 400 })
  }

  if (!body.messages?.length) {
    return NextResponse.json(
      { error: { message: '`messages` array is required', type: 'invalid_request_error' } },
      { status: 400 }
    )
  }

  const skills = loadSkills()
  const model = body.model ?? 'vigil'
  const lastUser = [...body.messages].reverse().find(m => m.role === 'user')
  const userText = lastUser?.content?.trim() ?? ''

  // Resolve skill slug
  let slug: string | null = null
  if (model !== 'vigil') {
    slug = skillFromModel(model)
    if (!slug) {
      return NextResponse.json(
        {
          error: {
            message: `Model not found: ${model}. Use "vigil-<skill-slug>" or "vigil" for auto-routing.`,
            type: 'invalid_request_error',
            available_models: skills.slice(0, 10).map(s => `vigil-${s.slug}`),
          }
        },
        { status: 404 }
      )
    }
  } else {
    slug = skillFromMessage(userText, skills)
    if (!slug) {
      return NextResponse.json(
        {
          error: {
            message: 'Could not determine skill from message. Use model="vigil-<slug>" to be explicit.',
            type: 'invalid_request_error',
            hint: `Try model="vigil-deep-research" with your question as the message content.`,
          }
        },
        { status: 400 }
      )
    }
  }

  const id = randomUUID().replace(/-/g, '').slice(0, 24)

  try {
    dispatchSkill(slug, userText)
    const content = [
      `**Skill dispatched:** \`${slug}\``,
      userText ? `**Input:** ${userText}` : null,
      ``,
      `The skill is now running on GitHub Actions. Check the **Runs** tab in the Vigil dashboard for live output, or watch your configured notification channel (Telegram, Discord, Slack).`,
      ``,
      `*Note: Vigil skills are background agents — they run asynchronously and post results when complete.*`,
    ].filter(Boolean).join('\n')

    return NextResponse.json(oaiResponse(id, model, content))
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to dispatch skill'
    return NextResponse.json(
      { error: { message: msg, type: 'api_error' } },
      { status: 500 }
    )
  }
}

// GET /v1/chat/completions — list available "models" (skills)
export async function GET() {
  const skills = loadSkills()
  return NextResponse.json({
    object: 'list',
    data: [
      {
        id: 'vigil',
        object: 'model',
        description: 'Auto-routes to the best skill based on your message',
      },
      ...skills.map(s => ({
        id: `vigil-${s.slug}`,
        object: 'model',
        description: s.description,
      })),
    ],
  })
}
