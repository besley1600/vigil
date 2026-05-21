'use client'

const FRONTMATTER = `---
name: My Skill
description: What this skill does in one line
author: your-github-handle
var: ""
tags: [research]
---

> **\${var}** — Optional parameter operators can override.

Today is \${today}. [Describe what your skill does here.]

## Steps

1. **Fetch data** — use WebFetch or curl with a WebFetch fallback.
2. **Process** — filter, score, and summarise.
3. **Write output** — save to \`articles/my-skill-\${today}.md\`.
4. **Notify** — \`./notify "summary"\`
5. **Log** — append to \`memory/logs/\${today}.md\``.trim()

const STEPS = [
  {
    n: '01',
    title: 'Write your skill',
    body: 'Create skills/my-skill/SKILL.md. Write natural language steps — Claude Code executes them on a schedule. Start from a template or copy an existing skill.',
  },
  {
    n: '02',
    title: 'Test it locally',
    body: 'Install it into a local Vigil instance with ./add-skill and run it. Check the output makes sense before submitting.',
  },
  {
    n: '03',
    title: 'Open a pull request',
    body: 'Submit to the community skills repo. PRs are reviewed for security and quality. Merged skills are immediately installable by anyone running Vigil.',
  },
  {
    n: '04',
    title: 'Skills spread across the fleet',
    body: 'Every Vigil operator can install your skill with one command. It runs on their schedule, in their context, extending the platform beyond what any single person could build.',
  },
]

const AREAS = [
  { label: 'New skills', sub: 'Any automation you wish existed — research, social, dev, crypto, productivity' },
  { label: 'Core improvements', sub: 'Better scheduling, smarter chains, richer outputs, new notification channels' },
  { label: 'Dashboard & UI', sub: 'The Next.js dashboard you\'re looking at — components, views, UX' },
  { label: 'Integrations', sub: 'New data sources, APIs, platforms, or LLM providers' },
  { label: 'Documentation', sub: 'Clearer guides, better examples, translated content' },
  { label: 'Infrastructure', sub: 'GitHub Actions workflows, the ./vigil CLI, add-skill tooling' },
]

export function ContributeView() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 animate-fade-in">

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <div className="bg-[#0E0E12] border border-[rgba(255,255,255,0.07)] p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-eva-orange/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative space-y-3">
          <div className="text-[10px] font-mono text-eva-orange uppercase tracking-[2.5px]">Open Source</div>
          <h1 className="font-display text-3xl text-primary-100 leading-tight">
            Build skills.<br />Extend the platform.
          </h1>
          <p className="text-[13px] font-mono text-primary-50 leading-relaxed max-w-xl">
            Vigil is open source and designed to grow through community contributions. Every skill you write becomes part of a shared library that any operator can install and run. The platform gets more powerful with every pull request.
          </p>
          <div className="flex gap-6 pt-2">
            <div>
              <div className="text-xl font-mono text-eva-orange">117</div>
              <div className="text-[10px] font-mono text-primary-40 uppercase tracking-wide">skills and growing</div>
            </div>
            <div className="w-px bg-[rgba(255,255,255,0.07)]" />
            <div>
              <div className="text-xl font-mono text-primary-100">MIT</div>
              <div className="text-[10px] font-mono text-primary-40 uppercase tracking-wide">licensed, fork freely</div>
            </div>
            <div className="w-px bg-[rgba(255,255,255,0.07)]" />
            <div>
              <div className="text-xl font-mono text-primary-100">Markdown</div>
              <div className="text-[10px] font-mono text-primary-40 uppercase tracking-wide">skills are plain text</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Steps + Frontmatter ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-5">

        {/* Steps */}
        <div className="space-y-3">
          <div className="text-[10px] font-mono text-primary-40 uppercase tracking-[2.5px]">How to contribute a skill</div>
          {STEPS.map((s) => (
            <div key={s.n} className="bg-[#0E0E12] border border-[rgba(255,255,255,0.07)] p-4 flex gap-4">
              <div className="text-[10px] font-mono text-eva-orange shrink-0 pt-0.5">{s.n}</div>
              <div className="space-y-1">
                <div className="text-xs font-mono text-primary-100">{s.title}</div>
                <div className="text-[11px] font-mono text-primary-50 leading-relaxed">{s.body}</div>
              </div>
            </div>
          ))}
          <div className="flex gap-2 pt-1">
            <a
              href="https://github.com/besley1600/vigil"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center text-[10px] font-mono uppercase tracking-[1px] bg-eva-orange text-white px-4 py-2.5 hover:opacity-90 transition-opacity"
            >
              View on GitHub →
            </a>
            <a
              href="https://github.com/besley1600/vigil/blob/main/templates/TEMPLATE.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-mono uppercase tracking-[1px] border border-[rgba(255,255,255,0.1)] text-primary-50 px-4 py-2.5 hover:border-[rgba(255,255,255,0.25)] transition-colors"
            >
              Skill template
            </a>
          </div>
        </div>

        {/* Frontmatter */}
        <div className="space-y-3">
          <div className="text-[10px] font-mono text-primary-40 uppercase tracking-[2.5px]">Skill format</div>
          <div className="bg-[#0D0D10] border border-[rgba(255,255,255,0.07)] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[rgba(255,255,255,0.06)]">
              <span className="text-[10px] font-mono text-primary-40">skills/my-skill/SKILL.md</span>
              <span className="text-[10px] font-mono text-eva-green uppercase tracking-wide">Plain markdown</span>
            </div>
            <pre className="text-[11px] font-mono text-primary-70 p-4 overflow-x-auto leading-relaxed whitespace-pre-wrap">
              {FRONTMATTER.split('\n').map((line, i) => {
                const isKey = /^(author|name|description):/.test(line)
                return (
                  <span key={i} className={isKey ? 'text-eva-green' : undefined}>
                    {line}
                    {'\n'}
                  </span>
                )
              })}
            </pre>
          </div>
          <div className="bg-[#0E0E12] border border-[rgba(255,255,255,0.07)] p-3 space-y-1.5">
            <div className="text-[10px] font-mono text-primary-40 uppercase tracking-wide">How it works</div>
            {[
              { field: 'SKILL.md', desc: 'Natural language instructions — Claude Code executes them' },
              { field: '${var}', desc: 'Runtime parameter operators can override in vigil.yml' },
              { field: './notify', desc: 'Sends output to all configured channels (Telegram, Discord, Slack)' },
            ].map(({ field, desc }) => (
              <div key={field} className="flex gap-3 text-[11px] font-mono">
                <span className="text-eva-green shrink-0">{field}</span>
                <span className="text-primary-40">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Ways to contribute ─────────────────────────────────────────── */}
      <div className="bg-[#0E0E12] border border-[rgba(255,255,255,0.07)] p-5 space-y-4">
        <div className="text-[10px] font-mono text-primary-40 uppercase tracking-[2.5px]">Ways to contribute</div>
        <p className="text-[11px] font-mono text-primary-50 leading-relaxed">
          Skills are the most direct way to extend Vigil, but the platform has many layers. All of it is open source — the runtime, the dashboard, the CLI tooling, and the GitHub Actions workflows.
        </p>
        <div className="grid grid-cols-3 gap-3">
          {AREAS.map(({ label, sub }) => (
            <div key={label} className="bg-[#0D0D10] border border-[rgba(255,255,255,0.06)] p-4 space-y-1.5">
              <div className="text-xs font-mono text-primary-100">{label}</div>
              <div className="text-[10px] font-mono text-primary-40 leading-relaxed">{sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick links ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'GitHub repo', sub: 'Browse source, open issues, send PRs', href: 'https://github.com/besley1600/vigil' },
          { label: 'Skill template', sub: 'Copy the starter SKILL.md and build from there', href: 'https://github.com/besley1600/vigil/blob/main/templates/TEMPLATE.md' },
          { label: 'Documentation', sub: 'Guides for skill authoring and deployment', href: 'https://besley1600.github.io/vigil' },
        ].map(({ label, sub, href }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#0E0E12] border border-[rgba(255,255,255,0.07)] p-4 hover:border-[rgba(255,255,255,0.15)] transition-colors group block"
          >
            <div className="text-xs font-mono text-primary-100 group-hover:text-eva-orange transition-colors">{label} →</div>
            <div className="text-[10px] font-mono text-primary-40 mt-1">{sub}</div>
          </a>
        ))}
      </div>

    </div>
  )
}
