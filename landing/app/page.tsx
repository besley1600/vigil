'use client'

import { useState, useEffect } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Zap, RefreshCw, Puzzle, GitMerge, Bot, Monitor, ArrowRight, CheckCircle2, Clock, Wrench, ShieldCheck, GitBranch, Lock } from 'lucide-react'

// ── Platform brand icons ──────────────────────────────────────────────────────

function AppleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 814 1000" fill="currentColor">
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.7 0 663 0 541.8c0-207.5 135.4-317.3 269-317.3 70.1 0 128.4 46.4 172.5 46.4 42.8 0 109.6-49 192.5-49 31 0 113.4 2.6 168.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z" />
    </svg>
  )
}

function WindowsIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 88 88" fill="currentColor">
      <path d="M0 12.402l35.687-4.86.016 34.423-35.67.203zm35.67 33.529l.028 34.453L.028 75.48.026 45.7zm4.326-38.951L87.314 0v41.527l-47.318.376zm47.329 39.26L87.314 88 40.096 82.1l-.065-34.808z" />
    </svg>
  )
}

function LinuxIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 448 512" fill="currentColor">
      <path d="M220.8 123.3c1 .5 1.8 1.7 3 1.7 1.1 0 2.8-.4 2.9-1.5.2-1.4-1.9-2.3-3.2-2.9-1.7-.7-3.9-1-5.5-.1-.4.2-.8.7-.6 1.1.3 1.3 2.3 1.1 3.4 1.7zm-21.9 1.7c1.2 0 2-1.2 3-1.7 1.1-.6 3.1-.4 3.5-1.6.2-.4-.2-.9-.6-1.1-1.6-.9-3.8-.6-5.5.1-1.3.6-3.4 1.5-3.2 2.9.1 1.1 1.8 1.5 2.8 1.4zM420 403.8c-3.6-4-5.3-11.6-7.2-19.7-1.8-8.1-3.9-16.8-10.5-22.4-1.3-1.1-2.6-2.1-4-2.9-1.3-.8-2.7-1.5-4.1-2 9.2-27.3 5.6-54.5-3.7-79.1-11.4-30.1-31.3-56.4-46.5-74.4-17.1-21.5-33.7-41.9-33.4-72C311.1 85.4 315.7.1 234.8 0 132.4-.2 158 103.4 156.9 135.2c-1.7 23.4-6.4 41.8-22.5 64.7-18.9 22.5-45.5 58.8-58.1 96.7-6 17.9-8.8 36.1-6.2 53.3-6.5 5.8-11.4 14.7-16.6 20.2-4.2 4.3-10.3 5.9-17 8.3s-14 6-18.5 11.2c-4.1 4.7-5.4 11.1-3.3 16.6 3.5 9.9 13.5 15.1 24.1 18.3 16.7 5.3 34.2 5.1 50.9 5.2 17.4.1 35.2 0 51.8-5.5 0 .1-.1.3-.1.4-9.8 10.3-29.9 9.4-49.9 5.9-20-3.5-40.3-11.1-47.9-24.9a17.6 17.6 0 0 1 1.9-2 .4.4 0 0 0-.3-.7c-1.7-.3-3.4 1.3-4.4 2.9-1 1.7-1.1 3.3-.4 4.5.9 1.6 2.4 2.8 4 3.7 5.4 3 12.2 4.3 19.3 5.2 7.2 1 14.7 1.4 21.8 1.5 14.6.2 28.9-1.3 41.8-7 10.4-4.6 19.4-11.9 26.4-21.3.3.1.5.2.8.3 4.5 1.8 9.2 3.4 13.6 4.8l5.6 1.9c-.4 1.6-.8 3.1-1.2 4.7-4.4 17.8-8 36.3-7.8 55.1.2 13.8 2.4 28 8.6 40.1 6.2 12.1 16.8 21.9 29.6 25.2 12.7 3.3 27.1 1.1 40.1-4.2 2.7-1.1 5.3-2.3 8-3.6 2.7-1.3 5.3-2.6 7.6-4.1 4.6-2.9 7.6-5.7 10.2-6.3 2.6-.5 4.2.9 6.8 2.4 2.5 1.4 6.2 3.2 11.7 3.7 3.1.3 6.7-.2 10.2-1.4 3.5-1.3 7-3.4 9.3-6.8 4.3-6.5 4.1-14.4 5.1-21.9 1-7.5 2.9-14.1 7-17.9.5-.5 1.1-.9 1.7-1.3l.9-.6c1.2-.9 2.6-1.9 3.9-3.2 1.2-1.3 2.4-3 2.8-5.1.4-2.1 0-4.4-1-6.6z" />
    </svg>
  )
}

// ── Config ────────────────────────────────────────────────────────────────────

const GITHUB_REPO = 'besley1600/vigil'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.vigilhq.ai'
const RELEASES_BASE = `https://github.com/${GITHUB_REPO}/releases/latest/download`

const DOWNLOADS: { platform: string; arch: string; Icon: React.FC<{ size?: number }>; url: string; ext: string }[] = [
  { platform: 'macOS', arch: 'Apple Silicon', Icon: AppleIcon, url: `${RELEASES_BASE}/Vigil-arm64.dmg`, ext: '.dmg' },
  { platform: 'macOS', arch: 'Intel', Icon: AppleIcon, url: `${RELEASES_BASE}/Vigil-x64.dmg`, ext: '.dmg' },
  { platform: 'Windows', arch: '64-bit', Icon: WindowsIcon, url: `${RELEASES_BASE}/Vigil-Setup-x64.exe`, ext: '.exe' },
  { platform: 'Linux', arch: 'x64', Icon: LinuxIcon, url: `${RELEASES_BASE}/Vigil-x64.AppImage`, ext: '.AppImage' },
]

const FEATURES: { Icon: LucideIcon; title: string; desc: string; color: string; bg: string }[] = [
  {
    Icon: Zap,
    title: 'GitHub Actions runtime',
    desc: "Runs on GitHub's infrastructure — no VPS, no Docker, no Lambda. Free for public repos.",
    color: '#818cf8',
    bg: 'rgba(99,102,241,0.12)',
  },
  {
    Icon: RefreshCw,
    title: 'Self-healing agents',
    desc: 'Skills monitor their own output quality and repair themselves when they break.',
    color: '#34d399',
    bg: 'rgba(52,211,153,0.1)',
  },
  {
    Icon: Puzzle,
    title: '119 pre-built skills',
    desc: 'PR reviews, market monitoring, content writing, vulnerability scans — drop-in and go.',
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.1)',
  },
  {
    Icon: GitMerge,
    title: 'Skill chaining',
    desc: 'Compose agents into pipelines with parallel steps, conditional logic, and output passing.',
    color: '#22d3ee',
    bg: 'rgba(34,211,238,0.1)',
  },
  {
    Icon: Bot,
    title: 'Multi-model routing',
    desc: 'Run Claude, GPT, Gemini, or Kimi per-skill. Switch models without rewriting logic.',
    color: '#fbbf24',
    bg: 'rgba(251,191,36,0.1)',
  },
  {
    Icon: Monitor,
    title: 'Native desktop app',
    desc: 'Mac, Windows, and Linux app with a visual editor, tray integration, and auto-updates.',
    color: '#fb7185',
    bg: 'rgba(251,113,133,0.1)',
  },
  {
    Icon: GitBranch,
    title: 'Multi-repository management',
    desc: 'Connect any of your GitHub repos and switch between them instantly. Every repo holds its own independent skill config, schedules, and activation state.',
    color: '#f472b6',
    bg: 'rgba(244,114,182,0.1)',
  },
  {
    Icon: Lock,
    title: 'Per-user credential isolation',
    desc: 'Every user authenticates with their own GitHub account via OAuth. No shared tokens, no operator data ever leaking — complete per-user isolation by design.',
    color: '#a3e635',
    bg: 'rgba(163,230,53,0.08)',
  },
]

const PACKS = [
  { name: 'AI Builder', skills: 5, desc: 'PR reviews, monitoring, research, heartbeat, and self-repair for AI projects.', tag: 'Dev' },
  { name: 'Morning Ops', skills: 4, desc: 'Daily brief, digest aggregation, alert routing, and routine summaries.', tag: 'Productivity' },
  { name: 'Crypto Monitor', skills: 5, desc: 'Token tracking, DeFi yields, on-chain events, and Polymarket movements.', tag: 'Finance' },
  { name: 'Dev Ops', skills: 6, desc: 'PR triage, auto-merge, vulnerability scanning, and activity monitoring.', tag: 'Engineering' },
  { name: 'Content Machine', skills: 4, desc: 'Research, write, format, and publish long-form content automatically.', tag: 'Content' },
  { name: 'Self-Healing', skills: 4, desc: 'Health checks, quality scoring, automated repair, and system reporting.', tag: 'Ops' },
  { name: 'Fleet', skills: 4, desc: 'Manage forks, cohort analysis, and leaderboard tracking across deployments.', tag: 'Scale' },
]

const STEPS = [
  { n: '01', title: 'Connect your GitHub', desc: 'Sign in with GitHub OAuth. Vigil connects to your repositories securely — no manual token setup, no shared credentials, no leaking.' },
  { n: '02', title: 'Activate a repository', desc: 'Select any of your repos, flip the activation switch, then toggle skills and set their schedules. Each repo holds its own independent config.' },
  { n: '03', title: 'It runs forever', desc: 'GitHub Actions handles execution. Agents run on cron, react to events, and fix themselves when they fail.' },
]

const SKILL_NAMES_A = [
  'pr-reviewer', 'hacker-news-digest', 'morning-brief', 'crypto-monitor', 'self-repair',
  'heartbeat', 'vulnerability-scan', 'pr-triage', 'market-monitor', 'github-activity',
  'article-writer', 'code-review', 'agent-health', 'deploy-notify', 'changelog-writer',
  'research-digest', 'tweet-writer', 'competitor-watch', 'auto-merge', 'daily-brief',
]

const SKILL_NAMES_B = [
  'sentiment-monitor', 'skill-repair', 'arxiv-digest', 'pr-commenter', 'pod-notes',
  'flashcard-gen', 'repo-stats', 'dependency-audit', 'issue-triage', 'release-notes',
  'content-machine', 'slack-digest', 'link-monitor', 'blog-publisher', 'pr-summary',
  'token-tracker', 'contract-watcher', 'uptime-check', 'cost-report', 'autoresearch',
]

const AGENT_OUTPUTS = [
  {
    skill: 'pr-reviewer',
    Icon: CheckCircle2,
    iconColor: '#34d399',
    ago: '2h ago',
    title: 'Caught a security issue in PR #847',
    body: 'Found missing auth check on /api/admin/users and a potential SQL injection on line 234. Left 3 inline review comments and requested changes.',
    tag: '3 comments posted',
    tagColor: '#34d399',
  },
  {
    skill: 'morning-brief',
    Icon: Clock,
    iconColor: '#818cf8',
    ago: '6h ago',
    title: 'Delivered your 8am digest',
    body: '9 Hacker News stories, 2 AI research papers, ETH +3.1%, BTC flat. Sent to Telegram at 08:02. Clipped 4 links to your reading list.',
    tag: 'Sent to Telegram',
    tagColor: '#818cf8',
  },
  {
    skill: 'self-repair',
    Icon: Wrench,
    iconColor: '#fbbf24',
    ago: '14h ago',
    title: 'Fixed itself without your help',
    body: 'crypto-monitor failed 3× due to a CoinGecko rate-limit change. Diagnosed root cause, patched the fetcher, verified output format, opened PR #193.',
    tag: 'Auto-fixed',
    tagColor: '#fbbf24',
  },
  {
    skill: 'vulnerability-scan',
    Icon: ShieldCheck,
    iconColor: '#22d3ee',
    ago: '1d ago',
    title: 'Patched 2 CVEs before you woke up',
    body: 'Scanned 847 dependencies. Found CVE-2024-38374 in lodash (medium) and CVE-2024-41110 in axios (high). Auto-opened patch PR with test verification.',
    tag: 'Patch PR opened',
    tagColor: '#22d3ee',
  },
]

// ── Logo ──────────────────────────────────────────────────────────────────────

function VigilLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" fill="#0A0A0A" />
      <path d="M4 20 Q12 8 20 8 Q28 8 36 20" fill="none" stroke="#4F46E5" strokeWidth="1.5" />
      <path d="M4 20 Q12 32 20 32 Q28 32 36 20" fill="none" stroke="#4F46E5" strokeWidth="1.5" />
      <circle cx="20" cy="20" r="6" fill="#4F46E5" />
      <circle cx="20" cy="20" r="2.5" fill="#0A0A0A" />
      <circle cx="22" cy="18" r="1" fill="#06B6D4" opacity="0.9" />
      <line x1="4" y1="20" x2="36" y2="20" stroke="#06B6D4" strokeWidth="0.5" opacity="0.4" />
      <path d="M2 6 L2 2 L6 2" fill="none" stroke="#06B6D4" strokeWidth="1" strokeLinecap="square" />
      <path d="M38 34 L38 38 L34 38" fill="none" stroke="#06B6D4" strokeWidth="1" strokeLinecap="square" />
    </svg>
  )
}

// ── Nav ───────────────────────────────────────────────────────────────────────

const NAV_LINKS = ['Features', 'How it works', 'Download'] as const

function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handler = () => {
      setScrolled(window.scrollY > 20)
      if (window.scrollY > 20) setMobileOpen(false)
    }
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const navBg = scrolled || mobileOpen ? 'rgba(13,13,26,0.96)' : 'transparent'
  const navBorder = scrolled || mobileOpen ? '1px solid rgba(99,102,241,0.15)' : '1px solid transparent'

  return (
    <>
      <style>{`
        .nav-desktop { display: flex; }
        .nav-burger  { display: none; }
        @media (max-width: 640px) {
          .nav-desktop { display: none !important; }
          .nav-burger  { display: flex !important; }
        }
      `}</style>

      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        backgroundColor: navBg,
        backdropFilter: scrolled || mobileOpen ? 'blur(20px)' : 'none',
        borderBottom: navBorder,
        transition: 'background-color 0.25s ease, border-color 0.25s ease',
      }}>
        {/* Main bar */}
        <div style={{ padding: '0 1.5rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <VigilLogo size={28} />
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fafafa', letterSpacing: '0.05em' }}>VIGIL</span>
          </a>

          {/* Desktop links + CTAs */}
          <div className="nav-desktop" style={{ alignItems: 'center', gap: '2rem' }}>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              {NAV_LINKS.map((label) => (
                <a key={label} href={`#${label.toLowerCase().replace(/\s+/g, '-')}`}
                  style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.15s' }}
                  onMouseEnter={(e) => ((e.currentTarget).style.color = '#fafafa')}
                  onMouseLeave={(e) => ((e.currentTarget).style.color = '#a1a1aa')}
                >{label}</a>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <a href={`https://github.com/${GITHUB_REPO}`} target="_blank" rel="noopener noreferrer"
                style={{ padding: '0.375rem 0.875rem', borderRadius: '6px', border: '1px solid rgba(99,102,241,0.25)', color: '#d4d4d8', fontSize: '0.875rem', textDecoration: 'none', transition: 'all 0.15s' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; e.currentTarget.style.color = '#fafafa' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.25)'; e.currentTarget.style.color = '#d4d4d8' }}
              >GitHub</a>
              <a href={APP_URL} target="_blank" rel="noopener noreferrer"
                style={{ padding: '0.375rem 0.875rem', borderRadius: '6px', background: 'linear-gradient(135deg,#4f46e5,#6366f1)', color: '#fff', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none', boxShadow: '0 0 16px rgba(79,70,229,0.4)', transition: 'all 0.15s' }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85' }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
              >Open App →</a>
            </div>
          </div>

          {/* Mobile burger — two lines that become ✕ */}
          <button
            className="nav-burger"
            onClick={() => setMobileOpen(o => !o)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', flexDirection: 'column', gap: '5px', alignItems: 'center', justifyContent: 'center' }}
          >
            <span style={{
              display: 'block', width: '22px', height: '1.5px', backgroundColor: '#fafafa',
              transition: 'transform 0.2s ease, opacity 0.2s ease',
              transform: mobileOpen ? 'rotate(45deg) translate(2.5px, 3.5px)' : 'none',
            }} />
            <span style={{
              display: 'block', width: '22px', height: '1.5px', backgroundColor: '#fafafa',
              transition: 'transform 0.2s ease, opacity 0.2s ease',
              transform: mobileOpen ? 'rotate(-45deg) translate(2.5px, -3.5px)' : 'none',
            }} />
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div style={{ borderTop: '1px solid rgba(99,102,241,0.12)', padding: '1rem 1.5rem 1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {NAV_LINKS.map((label) => (
                <a key={label} href={`#${label.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setMobileOpen(false)}
                  style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: '0.9rem', padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'block' }}
                >{label}</a>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.25rem' }}>
              <a href={`https://github.com/${GITHUB_REPO}`} target="_blank" rel="noopener noreferrer"
                onClick={() => setMobileOpen(false)}
                style={{ padding: '0.625rem 1rem', borderRadius: '6px', border: '1px solid rgba(99,102,241,0.25)', color: '#d4d4d8', fontSize: '0.875rem', textDecoration: 'none', textAlign: 'center' }}
              >GitHub</a>
              <a href={APP_URL} target="_blank" rel="noopener noreferrer"
                onClick={() => setMobileOpen(false)}
                style={{ padding: '0.625rem 1rem', borderRadius: '6px', background: 'linear-gradient(135deg,#4f46e5,#6366f1)', color: '#fff', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none', textAlign: 'center', boxShadow: '0 0 16px rgba(79,70,229,0.4)' }}
              >Open App →</a>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}

// ── Hero ──────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section
      id="hero"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8rem 1.5rem 0',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center',
      }}
    >
      {/* Dot grid */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.18) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 30%, black 40%, transparent 100%)',
          maskImage: 'radial-gradient(ellipse 80% 70% at 50% 30%, black 40%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Primary glow */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '15%',
          left: '50%',
          width: '900px',
          height: '600px',
          background: 'radial-gradient(ellipse, rgba(79,70,229,0.22) 0%, rgba(99,102,241,0.08) 45%, transparent 70%)',
          animation: 'glow-breathe 6s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />

      {/* Cyan accent */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '40%',
          left: '62%',
          width: '500px',
          height: '400px',
          background: 'radial-gradient(ellipse, rgba(6,182,212,0.12) 0%, transparent 65%)',
          animation: 'glow-breathe-2 8s 2s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />

      {/* Badge */}
      <div
        className="animate-slide-up"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.3rem 1rem',
          borderRadius: '100px',
          border: '1px solid rgba(99,102,241,0.3)',
          backgroundColor: 'rgba(79,70,229,0.1)',
          fontSize: '0.8rem',
          color: '#a5b4fc',
          marginBottom: '2rem',
          backdropFilter: 'blur(8px)',
        }}
      >
        <span style={{ color: '#34d399', fontSize: '0.65rem', animation: 'pulse-dot 2s ease-in-out infinite' }}>&#9679;</span>
        Open source &nbsp;&middot;&nbsp; GitHub Actions powered &nbsp;&middot;&nbsp; 119 skills
      </div>

      {/* Headline */}
      <h1
        className="animate-slide-up-1"
        style={{
          fontSize: 'clamp(2.75rem, 8vw, 5.5rem)',
          fontWeight: 900,
          lineHeight: 1.05,
          letterSpacing: '-0.04em',
          color: '#fafafa',
          margin: '0 0 1.5rem',
          maxWidth: '16ch',
        }}
      >
        Your AI team.{' '}
        <span
          style={{
            background: 'linear-gradient(135deg, #818cf8 0%, #06b6d4 60%, #34d399 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Zero servers.
        </span>{' '}
        Runs forever.
      </h1>

      <p
        className="animate-slide-up-2"
        style={{
          fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
          color: '#a1a1aa',
          maxWidth: '56ch',
          lineHeight: 1.65,
          margin: '0 0 2.75rem',
        }}
      >
        Deploy an AI workforce that reviews your PRs, monitors your stack, publishes your content, and
        fixes itself when it breaks &mdash; across any of your GitHub repositories. No infrastructure. No surprise bills. Each repo runs its own independent agent config.
      </p>

      {/* CTAs */}
      <div
        className="animate-slide-up-3"
        style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '5rem' }}
      >
        <a
          href="#download"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.8rem 1.875rem',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '1rem',
            textDecoration: 'none',
            boxShadow: '0 0 40px rgba(79,70,229,0.4)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { const el = e.currentTarget; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = '0 0 60px rgba(79,70,229,0.6)' }}
          onMouseLeave={(e) => { const el = e.currentTarget; el.style.transform = 'translateY(0)'; el.style.boxShadow = '0 0 40px rgba(79,70,229,0.4)' }}
        >
          Desktop App &mdash; Coming Soon
        </a>
        <a
          href={APP_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.8rem 1.875rem',
            borderRadius: '8px',
            border: '1px solid rgba(99,102,241,0.3)',
            backgroundColor: 'rgba(79,70,229,0.08)',
            color: '#fafafa',
            fontWeight: 600,
            fontSize: '1rem',
            textDecoration: 'none',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { const el = e.currentTarget; el.style.borderColor = 'rgba(99,102,241,0.6)'; el.style.backgroundColor = 'rgba(79,70,229,0.15)'; el.style.transform = 'translateY(-2px)' }}
          onMouseLeave={(e) => { const el = e.currentTarget; el.style.borderColor = 'rgba(99,102,241,0.3)'; el.style.backgroundColor = 'rgba(79,70,229,0.08)'; el.style.transform = 'translateY(0)' }}
        >
          Open Web App <ArrowRight size={16} />
        </a>
      </div>

      {/* App screenshot */}
      <div
        className="animate-slide-up-4"
        style={{ width: '100%', maxWidth: '1160px', position: 'relative', marginBottom: '-4px' }}
      >
        {/* Glow behind screenshot */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: '-8% -5%',
            background: 'radial-gradient(ellipse 70% 60% at 50% 60%, rgba(79,70,229,0.35) 0%, rgba(6,182,212,0.12) 50%, transparent 75%)',
            filter: 'blur(50px)',
            pointerEvents: 'none',
          }}
        />

        {/* Window frame */}
        <div
          className="animate-float"
          style={{
            position: 'relative',
            borderRadius: '12px 12px 0 0',
            border: '1px solid rgba(255,255,255,0.1)',
            borderBottom: 'none',
            overflow: 'hidden',
            boxShadow: '0 -2px 0 rgba(99,102,241,0.4), 0 40px 120px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)',
            transformOrigin: 'center bottom',
          }}
        >
          {/* Title bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0.625rem 1rem',
              background: 'linear-gradient(180deg, #0f0f1e 0%, #13132a 100%)',
              borderBottom: '1px solid rgba(99,102,241,0.15)',
              gap: '0.5rem',
            }}
          >
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block', flexShrink: 0 }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block', flexShrink: 0 }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block', flexShrink: 0 }} />
            <span style={{ flex: 1 }} />
            <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: '#71717a', letterSpacing: '0.08em' }}>app.vigilhq.ai</span>
            <span style={{ flex: 1 }} />
          </div>

          <img
            src="/app-preview.png"
            alt="Vigil dashboard — skills management"
            style={{ display: 'block', width: '100%', height: 'auto' }}
          />
        </div>
      </div>
    </section>
  )
}

// ── Stats ─────────────────────────────────────────────────────────────────────

function Stats() {
  const items = [
    { value: '119+', label: 'Pre-built skills', color: '#818cf8' },
    { value: '7', label: 'Curated packs', color: '#34d399' },
    { value: '$0', label: 'Infra to manage', color: '#22d3ee' },
    { value: '24/7', label: 'Always running', color: '#fbbf24' },
  ]

  return (
    <section
      style={{
        borderTop: '1px solid rgba(99,102,241,0.2)',
        borderBottom: '1px solid rgba(99,102,241,0.2)',
        background: 'linear-gradient(180deg, rgba(79,70,229,0.06) 0%, transparent 100%)',
        padding: '2.5rem 1.5rem',
      }}
    >
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem',
          textAlign: 'center',
        }}
      >
        {items.map(({ value, label, color }) => (
          <div key={label}>
            <div
              style={{
                fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                fontWeight: 900,
                color,
                letterSpacing: '-0.03em',
                lineHeight: 1,
                marginBottom: '0.375rem',
              }}
            >
              {value}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── Skill Ticker ──────────────────────────────────────────────────────────────

function SkillTicker() {
  const rowA = [...SKILL_NAMES_A, ...SKILL_NAMES_A]
  const rowB = [...SKILL_NAMES_B, ...SKILL_NAMES_B]

  return (
    <section
      style={{
        padding: '3.5rem 0',
        overflow: 'hidden',
        borderBottom: '1px solid rgba(99,102,241,0.12)',
        position: 'relative',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 60% 100% at 50% 50%, rgba(79,70,229,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <p
        style={{
          textAlign: 'center',
          fontSize: '0.7rem',
          fontFamily: 'var(--font-mono)',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: '#4f46e5',
          marginBottom: '1.75rem',
        }}
      >
        119 skills available
      </p>

      <div style={{ overflow: 'hidden', marginBottom: '0.625rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', animation: 'marquee-fwd 35s linear infinite', width: 'max-content' }}>
          {rowA.map((name, i) => (
            <span
              key={i}
              style={{
                padding: '0.3rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid rgba(99,102,241,0.2)',
                backgroundColor: 'rgba(79,70,229,0.07)',
                fontSize: '0.775rem',
                fontFamily: 'var(--font-mono)',
                color: '#a5b4fc',
                whiteSpace: 'nowrap',
              }}
            >
              {name}
            </span>
          ))}
        </div>
      </div>

      <div style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: '0.75rem', animation: 'marquee-rev 42s linear infinite', width: 'max-content' }}>
          {rowB.map((name, i) => (
            <span
              key={i}
              style={{
                padding: '0.3rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid rgba(34,211,238,0.15)',
                backgroundColor: 'rgba(6,182,212,0.06)',
                fontSize: '0.775rem',
                fontFamily: 'var(--font-mono)',
                color: '#67e8f9',
                whiteSpace: 'nowrap',
              }}
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Agent Outputs ─────────────────────────────────────────────────────────────

function AgentOutputs() {
  return (
    <section style={{ padding: '6rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <p
          style={{
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#6366f1',
            marginBottom: '0.75rem',
          }}
        >
          Proof of work
        </p>
        <h2
          style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 800,
            color: '#fafafa',
            margin: '0 0 1rem',
            letterSpacing: '-0.02em',
          }}
        >
          What your agents did while you slept
        </h2>
        <p style={{ color: '#a1a1aa', fontSize: '1.05rem', maxWidth: '48ch', margin: '0 auto', lineHeight: 1.6 }}>
          Real outputs from real skills. Not cron jobs &mdash; agents that think, act, and fix themselves.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
          gap: '1rem',
        }}
      >
        {AGENT_OUTPUTS.map(({ skill, Icon, iconColor, ago, title, body, tag, tagColor }) => (
          <div
            key={skill}
            style={{
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '12px',
              padding: '1.5rem',
              background: 'linear-gradient(135deg, rgba(15,15,30,0.9) 0%, rgba(20,20,40,0.95) 100%)',
              transition: 'border-color 0.2s, transform 0.2s',
              cursor: 'default',
            }}
            onMouseEnter={(e) => { const el = e.currentTarget; el.style.borderColor = iconColor + '44'; el.style.transform = 'translateY(-2px)' }}
            onMouseLeave={(e) => { const el = e.currentTarget; el.style.borderColor = 'rgba(255,255,255,0.07)'; el.style.transform = 'translateY(0)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    backgroundColor: iconColor + '18',
                    border: '1px solid ' + iconColor + '33',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: iconColor,
                    flexShrink: 0,
                  }}
                >
                  <Icon size={15} strokeWidth={2} />
                </div>
                <code style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#71717a' }}>{skill}</code>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#52525b', fontFamily: 'var(--font-mono)' }}>{ago}</span>
            </div>

            <h3 style={{ fontSize: '0.975rem', fontWeight: 700, color: '#fafafa', margin: '0 0 0.5rem', lineHeight: 1.35 }}>
              {title}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#a1a1aa', lineHeight: 1.6, margin: '0 0 1rem' }}>{body}</p>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                fontSize: '0.72rem',
                fontWeight: 600,
                color: tagColor,
                backgroundColor: tagColor + '15',
                border: '1px solid ' + tagColor + '30',
                padding: '0.2rem 0.625rem',
                borderRadius: '100px',
              }}
            >
              <span style={{ fontSize: '0.55rem' }}>&#9679;</span>
              {tag}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── Features ──────────────────────────────────────────────────────────────────

function Features() {
  return (
    <section
      id="features"
      style={{
        padding: '6rem 1.5rem',
        maxWidth: '1100px',
        margin: '0 auto',
        borderTop: '1px solid rgba(99,102,241,0.1)',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <p
          style={{
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#6366f1',
            marginBottom: '0.75rem',
          }}
        >
          Built different
        </p>
        <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: '#fafafa', margin: '0 0 1rem', letterSpacing: '-0.02em' }}>
          Built for autonomous operation
        </h2>
        <p style={{ color: '#a1a1aa', fontSize: '1.05rem', maxWidth: '48ch', margin: '0 auto', lineHeight: 1.6 }}>
          Every piece is designed to run unattended &mdash; no babysitting, no approval loops, no surprise bills.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
          gap: '1rem',
        }}
      >
        {FEATURES.map(({ Icon, title, desc, color, bg }) => (
          <div
            key={title}
            style={{
              backgroundColor: 'rgba(15,15,28,0.85)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '12px',
              padding: '1.75rem',
              transition: 'border-color 0.2s, transform 0.2s, background-color 0.2s',
              cursor: 'default',
            }}
            onMouseEnter={(e) => { const el = e.currentTarget; el.style.borderColor = color + '44'; el.style.transform = 'translateY(-3px)'; el.style.backgroundColor = 'rgba(20,20,38,0.95)' }}
            onMouseLeave={(e) => { const el = e.currentTarget; el.style.borderColor = 'rgba(255,255,255,0.07)'; el.style.transform = 'translateY(0)'; el.style.backgroundColor = 'rgba(15,15,28,0.85)' }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                backgroundColor: bg,
                border: '1px solid ' + color + '33',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color,
                marginBottom: '1rem',
                flexShrink: 0,
              }}
            >
              <Icon size={19} strokeWidth={1.75} />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fafafa', margin: '0 0 0.5rem' }}>{title}</h3>
            <p style={{ fontSize: '0.875rem', color: '#a1a1aa', lineHeight: 1.65, margin: 0 }}>{desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── How It Works ──────────────────────────────────────────────────────────────

function HowItWorks() {
  return (
    <section
      id="how-it-works"
      style={{
        padding: '6rem 1.5rem',
        background: 'linear-gradient(180deg, rgba(10,10,22,0.9) 0%, rgba(15,15,30,0.95) 100%)',
        borderTop: '1px solid rgba(99,102,241,0.12)',
        borderBottom: '1px solid rgba(99,102,241,0.12)',
      }}
    >
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <p
            style={{
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#6366f1',
              marginBottom: '0.75rem',
            }}
          >
            Setup
          </p>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: '#fafafa', margin: '0 0 1rem', letterSpacing: '-0.02em' }}>
            Up and running in minutes
          </h2>
          <p style={{ color: '#a1a1aa', fontSize: '1.05rem', margin: 0, lineHeight: 1.6 }}>
            No infrastructure to provision. No Docker to learn. No bills at the end of the month.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
          {STEPS.map(({ n, title, desc }) => (
            <div
              key={n}
              style={{
                padding: '1.75rem',
                borderRadius: '12px',
                border: '1px solid rgba(99,102,241,0.15)',
                background: 'rgba(79,70,229,0.04)',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '2rem',
                  fontWeight: 900,
                  color: 'rgba(79,70,229,0.25)',
                  lineHeight: 1,
                  marginBottom: '1rem',
                  letterSpacing: '-0.04em',
                }}
              >
                {n}
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fafafa', margin: '0 0 0.5rem' }}>{title}</h3>
              <p style={{ fontSize: '0.875rem', color: '#a1a1aa', lineHeight: 1.65, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Packs ─────────────────────────────────────────────────────────────────────

function Packs() {
  const tagColors: Record<string, string> = {
    Dev: '#818cf8',
    Productivity: '#22d3ee',
    Finance: '#34d399',
    Engineering: '#a78bfa',
    Content: '#fbbf24',
    Ops: '#fb7185',
    Scale: '#67e8f9',
  }

  return (
    <section style={{ padding: '6rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <p
          style={{
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#6366f1',
            marginBottom: '0.75rem',
          }}
        >
          Quickstart
        </p>
        <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: '#fafafa', margin: '0 0 1rem', letterSpacing: '-0.02em' }}>
          Curated skill packs
        </h2>
        <p style={{ color: '#a1a1aa', fontSize: '1.05rem', margin: 0, lineHeight: 1.6 }}>
          Install a pack and your agent is operational in seconds. Mix and match.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1rem' }}>
        {PACKS.map(({ name, skills, desc, tag }) => (
          <div
            key={name}
            style={{
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '12px',
              padding: '1.375rem',
              backgroundColor: 'rgba(15,15,28,0.85)',
              transition: 'border-color 0.2s, transform 0.2s',
              cursor: 'default',
            }}
            onMouseEnter={(e) => { const el = e.currentTarget; el.style.borderColor = (tagColors[tag] ?? '#818cf8') + '55'; el.style.transform = 'translateY(-2px)' }}
            onMouseLeave={(e) => { const el = e.currentTarget; el.style.borderColor = 'rgba(255,255,255,0.07)'; el.style.transform = 'translateY(0)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.625rem' }}>
              <span style={{ fontWeight: 700, color: '#fafafa', fontSize: '0.95rem' }}>{name}</span>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '100px',
                  backgroundColor: (tagColors[tag] ?? '#818cf8') + '15',
                  color: tagColors[tag] ?? '#818cf8',
                  border: '1px solid ' + (tagColors[tag] ?? '#818cf8') + '30',
                  whiteSpace: 'nowrap',
                }}
              >
                {tag}
              </span>
            </div>
            <p style={{ fontSize: '0.83rem', color: '#a1a1aa', lineHeight: 1.6, margin: '0 0 0.875rem' }}>{desc}</p>
            <div style={{ fontSize: '0.72rem', color: '#4f46e5', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
              {skills} skills
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── Download ──────────────────────────────────────────────────────────────────

function Download() {
  return (
    <section
      id="download"
      style={{
        padding: '6rem 1.5rem',
        background: 'linear-gradient(180deg, rgba(10,10,22,0.9) 0%, rgba(15,15,30,0.95) 100%)',
        borderTop: '1px solid rgba(99,102,241,0.12)',
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.3rem 0.875rem',
              borderRadius: '100px',
              border: '1px solid rgba(99,102,241,0.3)',
              backgroundColor: 'rgba(79,70,229,0.1)',
              fontSize: '0.8rem',
              color: '#a5b4fc',
              marginBottom: '1.25rem',
            }}
          >
            <span style={{ fontSize: '0.65rem', animation: 'pulse-dot 2s ease-in-out infinite', color: '#fbbf24' }}>&#9679;</span>
            Coming soon
          </div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: '#fafafa', margin: '0 0 1rem', letterSpacing: '-0.02em' }}>
            Vigil Desktop
          </h2>
          <p style={{ color: '#a1a1aa', fontSize: '1.05rem', margin: '0 auto', maxWidth: '44ch', lineHeight: 1.6 }}>
            Native app for Mac, Windows, and Linux &mdash; visual skill editor, system tray, and auto-updates. Launching soon.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '0.875rem',
            marginBottom: '2rem',
            opacity: 0.4,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          {DOWNLOADS.map(({ platform, arch, Icon, ext }) => (
            <div
              key={`${platform}-${arch}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '1.5rem 1rem',
                borderRadius: '10px',
                border: '1px solid rgba(99,102,241,0.2)',
                backgroundColor: 'rgba(79,70,229,0.05)',
              }}
            >
              <span style={{ color: '#d4d4d8' }}><Icon size={28} /></span>
              <span style={{ fontWeight: 700, color: '#fafafa', fontSize: '0.9rem' }}>{platform}</span>
              <span style={{ color: '#a1a1aa', fontSize: '0.75rem' }}>{arch}</span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  color: '#71717a',
                  backgroundColor: 'rgba(99,102,241,0.08)',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  border: '1px solid rgba(99,102,241,0.15)',
                }}
              >
                {ext}
              </span>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', color: '#52525b', fontSize: '0.8rem' }}>
          Watch{' '}
          <a
            href={`https://github.com/${GITHUB_REPO}/releases`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#a1a1aa', textDecoration: 'underline' }}
          >
            GitHub Releases
          </a>
          {' '}to be notified when it drops.
        </p>
      </div>
    </section>
  )
}

// ── Deploy Your Own ───────────────────────────────────────────────────────────

function DeployYourOwn() {
  const vercelUrl =
    `https://vercel.com/new/clone?repository-url=https://github.com/${GITHUB_REPO}` +
    `&root=dashboard&project-name=vigil-dashboard` +
    `&env=SKILLS_REPO` +
    `&envDescription=The%20GitHub%20repo%20containing%20skill%20definitions%20(e.g.%20besley1600%2Fvigil)`

  return (
    <section
      style={{
        padding: '6rem 1.5rem',
        borderTop: '1px solid rgba(99,102,241,0.12)',
        borderBottom: '1px solid rgba(99,102,241,0.12)',
      }}
    >
      <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.3rem 0.875rem',
            borderRadius: '100px',
            border: '1px solid rgba(99,102,241,0.2)',
            backgroundColor: 'rgba(79,70,229,0.07)',
            fontSize: '0.8rem',
            color: '#a5b4fc',
            marginBottom: '1.5rem',
          }}
        >
          Web version
        </div>

        <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 800, color: '#fafafa', margin: '0 0 1rem', letterSpacing: '-0.02em' }}>
          Deploy your own dashboard
        </h2>
        <p style={{ color: '#a1a1aa', fontSize: '1rem', lineHeight: 1.65, margin: '0 0 2rem', maxWidth: '50ch', marginLeft: 'auto', marginRight: 'auto' }}>
          Host the Vigil dashboard on Vercel in one click. Users connect their own GitHub accounts
          via OAuth — no shared tokens, complete per-user isolation out of the box.
        </p>

        <a
          href={vercelUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.625rem',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            backgroundColor: '#fafafa',
            color: '#09090b',
            fontWeight: 700,
            fontSize: '0.95rem',
            textDecoration: 'none',
            marginBottom: '2.5rem',
            boxShadow: '0 0 30px rgba(250,250,250,0.1)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { const el = e.currentTarget; el.style.opacity = '0.88'; el.style.transform = 'translateY(-1px)' }}
          onMouseLeave={(e) => { const el = e.currentTarget; el.style.opacity = '1'; el.style.transform = 'translateY(0)' }}
        >
          <svg width="16" height="16" viewBox="0 0 116 100" fill="#09090b">
            <path d="M57.5 0L115 100H0L57.5 0z" />
          </svg>
          Deploy to Vercel
        </a>

        <div
          style={{
            backgroundColor: 'rgba(15,15,28,0.9)',
            border: '1px solid rgba(99,102,241,0.18)',
            borderRadius: '10px',
            padding: '1.375rem',
            textAlign: 'left',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              color: '#4f46e5',
              margin: '0 0 0.875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontWeight: 600,
            }}
          >
            Required env var
          </p>
          {[
            { name: 'SKILLS_REPO', desc: 'Skills definitions repo (e.g. besley1600/vigil)' },
          ].map(({ name, desc }) => (
            <div key={name} style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem', alignItems: 'baseline' }}>
              <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#818cf8', minWidth: '160px' }}>
                {name}
              </code>
              <span style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>{desc}</span>
            </div>
          ))}
          <p style={{ margin: '0.875rem 0 0', fontSize: '0.78rem', color: '#71717a', lineHeight: 1.55 }}>
            Users connect their own GitHub accounts via OAuth when they visit your app — no per-user token configuration needed.
          </p>
        </div>
      </div>
    </section>
  )
}

// ── Final CTA ─────────────────────────────────────────────────────────────────

function FinalCTA() {
  return (
    <section
      style={{
        padding: '7rem 1.5rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '800px',
          height: '500px',
          background: 'radial-gradient(ellipse, rgba(79,70,229,0.25) 0%, rgba(6,182,212,0.1) 45%, transparent 70%)',
          pointerEvents: 'none',
          animation: 'glow-breathe 7s ease-in-out infinite',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.12) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 80% at 50% 50%, black 30%, transparent 100%)',
          maskImage: 'radial-gradient(ellipse 70% 80% at 50% 50%, black 30%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative' }}>
        <p
          style={{
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#6366f1',
            marginBottom: '1rem',
          }}
        >
          Get started
        </p>
        <h2
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 900,
            color: '#fafafa',
            margin: '0 0 1.25rem',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
          }}
        >
          Stop doing work that<br />
          <span
            style={{
              background: 'linear-gradient(135deg, #818cf8, #22d3ee)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            doesn&apos;t require a human.
          </span>
        </h2>
        <p style={{ color: '#a1a1aa', fontSize: '1.1rem', maxWidth: '46ch', margin: '0 auto 2.5rem', lineHeight: 1.65 }}>
          Open the app, connect your GitHub account, and activate a repository. Your AI team is operational in under two minutes. Free forever on GitHub&apos;s infrastructure.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href={`https://github.com/${GITHUB_REPO}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.875rem 2rem',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '1rem',
              textDecoration: 'none',
              boxShadow: '0 0 50px rgba(79,70,229,0.45)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { const el = e.currentTarget; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = '0 0 70px rgba(79,70,229,0.65)' }}
            onMouseLeave={(e) => { const el = e.currentTarget; el.style.transform = 'translateY(0)'; el.style.boxShadow = '0 0 50px rgba(79,70,229,0.45)' }}
          >
            Fork on GitHub <ArrowRight size={16} />
          </a>
          <a
            href={APP_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.875rem 2rem',
              borderRadius: '8px',
              border: '1px solid rgba(99,102,241,0.3)',
              backgroundColor: 'rgba(79,70,229,0.08)',
              color: '#fafafa',
              fontWeight: 600,
              fontSize: '1rem',
              textDecoration: 'none',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { const el = e.currentTarget; el.style.borderColor = 'rgba(99,102,241,0.55)'; el.style.backgroundColor = 'rgba(79,70,229,0.15)'; el.style.transform = 'translateY(-2px)' }}
            onMouseLeave={(e) => { const el = e.currentTarget; el.style.borderColor = 'rgba(99,102,241,0.3)'; el.style.backgroundColor = 'rgba(79,70,229,0.08)'; el.style.transform = 'translateY(0)' }}
          >
            Open Web App
          </a>
        </div>
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer
      style={{
        padding: '2.5rem 1.5rem',
        background: 'linear-gradient(180deg, rgba(10,10,22,0.95) 0%, #0a0a16 100%)',
        borderTop: '1px solid rgba(99,102,241,0.12)',
      }}
    >
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <VigilLogo size={22} />
          <span style={{ fontSize: '0.875rem', color: '#52525b' }}>Vigil &middot; Open source, MIT license</span>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {[
            { label: 'GitHub', href: `https://github.com/${GITHUB_REPO}` },
            { label: 'Docs', href: `https://github.com/${GITHUB_REPO}#readme` },
            { label: 'Issues', href: `https://github.com/${GITHUB_REPO}/issues` },
            { label: 'Releases', href: `https://github.com/${GITHUB_REPO}/releases` },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '0.825rem', color: '#52525b', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#d4d4d8')}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = '#52525b')}
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Stats />
        <SkillTicker />
        <AgentOutputs />
        <Features />
        <HowItWorks />
        <Packs />
        <Download />
        <DeployYourOwn />
        <FinalCTA />
      </main>
      <Footer />
    </>
  )
}
