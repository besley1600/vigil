'use client'

import { useState, useEffect } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Zap, RefreshCw, Puzzle, GitMerge, Bot, Monitor, ArrowRight, CheckCircle2, Clock, Wrench, ShieldCheck, GitBranch, Lock, Bell } from 'lucide-react'

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

function GithubIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  )
}

// ── Config ────────────────────────────────────────────────────────────────────

const GITHUB_REPO = 'besley1600/vigil'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.vigilhq.ai'
const RELEASES_BASE = `https://github.com/${GITHUB_REPO}/releases/latest/download`

const DOWNLOADS: { platform: string; arch: string; Icon: React.FC<{ size?: number }>; url: string; ext: string }[] = [
  { platform: 'macOS', arch: 'Apple Silicon', Icon: AppleIcon, url: `${RELEASES_BASE}/Vigil-macOS-arm64.dmg`, ext: '.dmg' },
  { platform: 'macOS', arch: 'Intel', Icon: AppleIcon, url: `${RELEASES_BASE}/Vigil-macOS-x64.dmg`, ext: '.dmg' },
  { platform: 'Windows', arch: '64-bit', Icon: WindowsIcon, url: `${RELEASES_BASE}/Vigil-Windows-x64.exe`, ext: '.exe' },
  { platform: 'Linux', arch: 'x64', Icon: LinuxIcon, url: `${RELEASES_BASE}/Vigil-Linux-x64.AppImage`, ext: '.AppImage' },
]

// Grid area assignments for bento — 3-col layout, 4 rows, 9 cells total
const FEATURES: { Icon: LucideIcon; title: string; desc: string; color: string; bg: string; area: string }[] = [
  {
    Icon: Zap,
    title: 'GitHub Actions runtime',
    desc: "Runs on GitHub's infrastructure. No VPS, no Docker, no Lambda. Free for public repos.",
    color: '#818cf8',
    bg: 'rgba(99,102,241,0.1)',
    area: 'github',
  },
  {
    Icon: RefreshCw,
    title: 'Self-healing agents',
    desc: 'Skills monitor their own output quality and repair themselves when they break.',
    color: '#34d399',
    bg: 'rgba(52,211,153,0.08)',
    area: 'self-heal',
  },
  {
    Icon: Puzzle,
    title: '119 pre-built skills',
    desc: 'PR reviews, market monitoring, content writing, vulnerability scans. Drop-in and go.',
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.08)',
    area: 'skills',
  },
  {
    Icon: GitMerge,
    title: 'Skill chaining',
    desc: 'Compose agents into pipelines with parallel steps, conditional logic, and output passing.',
    color: '#22d3ee',
    bg: 'rgba(34,211,238,0.08)',
    area: 'chain',
  },
  {
    Icon: Bot,
    title: 'Multi-model routing',
    desc: 'Run Claude, GPT, Gemini, or Kimi per-skill. Switch models without rewriting logic.',
    color: '#fbbf24',
    bg: 'rgba(251,191,36,0.08)',
    area: 'model',
  },
  {
    Icon: Monitor,
    title: 'Native desktop app',
    desc: 'Mac, Windows, and Linux app with a visual editor, tray integration, and auto-updates.',
    color: '#fb7185',
    bg: 'rgba(251,113,133,0.08)',
    area: 'desktop',
  },
  {
    Icon: GitBranch,
    title: 'Multi-repository management',
    desc: 'Connect any of your GitHub repos and switch between them instantly. Every repo holds its own independent skill config, schedules, and activation state.',
    color: '#f472b6',
    bg: 'rgba(244,114,182,0.08)',
    area: 'multirepo',
  },
  {
    Icon: Lock,
    title: 'Per-user credential isolation',
    desc: 'Every user authenticates with their own GitHub account via OAuth. No shared tokens, complete per-user isolation by design.',
    color: '#a3e635',
    bg: 'rgba(163,230,53,0.06)',
    area: 'creds',
  },
  {
    Icon: Bell,
    title: 'Multi-channel notifications',
    desc: 'Push alerts to Telegram, Discord, or Slack the moment a skill runs, flags an anomaly, or repairs itself. Each channel is opt-in.',
    color: '#fb923c',
    bg: 'rgba(251,146,60,0.06)',
    area: 'notifs',
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
  { title: 'Connect your GitHub', desc: 'Sign in with GitHub OAuth. Vigil connects to your repositories securely. No manual token setup, no shared credentials.' },
  { title: 'Activate a repository', desc: 'Select any repo, flip the activation switch, then toggle skills and set schedules. Each repo holds its own independent config.' },
  { title: 'It runs forever', desc: 'GitHub Actions handles execution. Agents run on cron, react to events, and fix themselves when they fail.' },
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
    featured: true,
  },
  {
    skill: 'morning-brief',
    Icon: Clock,
    iconColor: '#818cf8',
    ago: '6h ago',
    title: 'Delivered your 8am digest',
    body: '9 Hacker News stories, 2 AI research papers, ETH +3.1%, BTC flat. Sent to Telegram at 08:02.',
    tag: 'Sent to Telegram',
    tagColor: '#818cf8',
    featured: false,
  },
  {
    skill: 'self-repair',
    Icon: Wrench,
    iconColor: '#fbbf24',
    ago: '14h ago',
    title: 'Fixed itself without your help',
    body: 'crypto-monitor failed 3x due to a CoinGecko rate-limit change. Diagnosed root cause, patched the fetcher, opened PR #193.',
    tag: 'Auto-fixed',
    tagColor: '#fbbf24',
    featured: false,
  },
  {
    skill: 'vulnerability-scan',
    Icon: ShieldCheck,
    iconColor: '#22d3ee',
    ago: '1d ago',
    title: 'Patched 2 CVEs before you woke up',
    body: 'Scanned 847 dependencies. Found CVE-2024-38374 in lodash and CVE-2024-41110 in axios (high). Auto-opened patch PR with test verification.',
    tag: 'Patch PR opened',
    tagColor: '#22d3ee',
    featured: false,
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
        <div style={{ padding: '0 1.5rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <VigilLogo size={28} />
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fafafa', letterSpacing: '0.05em' }}>VIGIL</span>
          </a>

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
              >Open App</a>
            </div>
          </div>

          <button
            className="nav-burger"
            onClick={() => setMobileOpen(o => !o)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', flexDirection: 'column', gap: '5px', alignItems: 'center', justifyContent: 'center' }}
          >
            <span style={{ display: 'block', width: '22px', height: '1.5px', backgroundColor: '#fafafa', transition: 'transform 0.2s ease, opacity 0.2s ease', transform: mobileOpen ? 'rotate(45deg) translate(2.5px, 3.5px)' : 'none' }} />
            <span style={{ display: 'block', width: '22px', height: '1.5px', backgroundColor: '#fafafa', transition: 'transform 0.2s ease, opacity 0.2s ease', transform: mobileOpen ? 'rotate(-45deg) translate(2.5px, -3.5px)' : 'none' }} />
          </button>
        </div>

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
              >Open App</a>
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
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        padding: '5.5rem 1.5rem 3rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .animate-slide-up-1,
          .animate-slide-up-2,
          .animate-slide-up-3,
          .animate-slide-up-4 { animation: none !important; opacity: 1 !important; transform: none !important; }
        }
        .hero-split {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3.5rem;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }
        @media (max-width: 900px) {
          .hero-split {
            grid-template-columns: 1fr;
          }
          .hero-screenshot {
            order: 2;
          }
          .hero-text {
            text-align: center !important;
          }
          .hero-ctas {
            justify-content: center !important;
          }
        }
      `}</style>

      {/* Dot grid background */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.15) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 80% at 40% 40%, black 30%, transparent 100%)',
          maskImage: 'radial-gradient(ellipse 90% 80% at 40% 40%, black 30%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Subtle gradient glow */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '10%',
          left: '25%',
          width: '700px',
          height: '500px',
          background: 'radial-gradient(ellipse, rgba(79,70,229,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div className="hero-split">
        {/* Left: text content */}
        <div className="hero-text" style={{ textAlign: 'left' }}>
          <h1
            className="animate-slide-up-1"
            style={{
              fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)',
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: '-0.04em',
              color: '#fafafa',
              margin: '0 0 1.25rem',
            }}
          >
            Your AI team.{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #818cf8 0%, #06b6d4 100%)',
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
              fontSize: 'clamp(1rem, 1.8vw, 1.125rem)',
              color: '#a1a1aa',
              maxWidth: '44ch',
              lineHeight: 1.65,
              margin: '0 0 2.25rem',
            }}
          >
            Run an AI workforce across your GitHub repos. No infrastructure, no bills, no servers to manage.
          </p>

          <div
            className="hero-ctas animate-slide-up-3"
            style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap' }}
          >
            <a
              href="#download"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.625rem',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.9375rem',
                textDecoration: 'none',
                boxShadow: '0 0 32px rgba(79,70,229,0.35)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { const el = e.currentTarget; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = '0 0 48px rgba(79,70,229,0.55)' }}
              onMouseLeave={(e) => { const el = e.currentTarget; el.style.transform = 'translateY(0)'; el.style.boxShadow = '0 0 32px rgba(79,70,229,0.35)' }}
            >
              Download
            </a>
            <a
              href={APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.625rem',
                borderRadius: '8px',
                border: '1px solid rgba(99,102,241,0.3)',
                backgroundColor: 'rgba(79,70,229,0.08)',
                color: '#fafafa',
                fontWeight: 600,
                fontSize: '0.9375rem',
                textDecoration: 'none',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { const el = e.currentTarget; el.style.borderColor = 'rgba(99,102,241,0.55)'; el.style.backgroundColor = 'rgba(79,70,229,0.15)'; el.style.transform = 'translateY(-2px)' }}
              onMouseLeave={(e) => { const el = e.currentTarget; el.style.borderColor = 'rgba(99,102,241,0.3)'; el.style.backgroundColor = 'rgba(79,70,229,0.08)'; el.style.transform = 'translateY(0)' }}
            >
              Open App <ArrowRight size={15} />
            </a>
          </div>
        </div>

        {/* Right: app screenshot */}
        <div
          className="hero-screenshot animate-slide-up-4"
          style={{ position: 'relative' }}
        >
          {/* Glow behind screenshot */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: '-6% -4%',
              background: 'radial-gradient(ellipse 80% 70% at 50% 55%, rgba(79,70,229,0.28) 0%, rgba(6,182,212,0.1) 55%, transparent 75%)',
              filter: 'blur(40px)',
              pointerEvents: 'none',
            }}
          />

          {/* Browser frame */}
          <div
            style={{
              position: 'relative',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.1)',
              overflow: 'hidden',
              boxShadow: '0 -2px 0 rgba(99,102,241,0.35), 0 32px 100px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.5rem 0.875rem',
                background: 'linear-gradient(180deg, #0f0f1e 0%, #13132a 100%)',
                borderBottom: '1px solid rgba(99,102,241,0.15)',
                gap: '0.5rem',
              }}
            >
              <span style={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block', flexShrink: 0 }} />
              <span style={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block', flexShrink: 0 }} />
              <span style={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block', flexShrink: 0 }} />
              <span style={{ flex: 1 }} />
              <span style={{ fontSize: '0.675rem', fontFamily: 'var(--font-mono)', color: '#71717a', letterSpacing: '0.08em' }}>app.vigilhq.ai</span>
              <span style={{ flex: 1 }} />
            </div>

            <img
              src="/app-preview.png"
              alt="Vigil dashboard"
              style={{ display: 'block', width: '100%', height: 'auto' }}
            />
          </div>
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
    <>
      <style>{`
        @media (max-width: 540px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .stats-grid > *:nth-child(2) { border-right: none !important; }
          .stats-grid > *:nth-child(3) { border-top: 1px solid rgba(99,102,241,0.1); }
          .stats-grid > *:nth-child(4) { border-top: 1px solid rgba(99,102,241,0.1); border-right: none !important; }
        }
      `}</style>
      <section
        style={{
          borderTop: '1px solid rgba(99,102,241,0.15)',
          borderBottom: '1px solid rgba(99,102,241,0.15)',
          padding: '2.25rem 1.5rem',
        }}
      >
        <div
          className="stats-grid"
          style={{
            maxWidth: '800px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0',
            textAlign: 'center',
          }}
        >
          {items.map(({ value, label, color }, i) => (
            <div
              key={label}
              style={{
                padding: '0 1rem',
                borderRight: i < items.length - 1 ? '1px solid rgba(99,102,241,0.1)' : 'none',
              }}
            >
              <div
                style={{
                  fontSize: 'clamp(1.625rem, 3.5vw, 2.375rem)',
                  fontWeight: 900,
                  color,
                  letterSpacing: '-0.04em',
                  lineHeight: 1,
                  marginBottom: '0.3rem',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {value}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#52525b', letterSpacing: '0.05em' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

// ── Skill Ticker ──────────────────────────────────────────────────────────────

function SkillTicker() {
  const rowA = [...SKILL_NAMES_A, ...SKILL_NAMES_A]
  const rowB = [...SKILL_NAMES_B, ...SKILL_NAMES_B]

  return (
    <section
      style={{
        padding: '3rem 0',
        overflow: 'hidden',
        borderBottom: '1px solid rgba(99,102,241,0.1)',
      }}
    >
      <div style={{ overflow: 'hidden', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.625rem', animation: 'marquee-fwd 35s linear infinite', width: 'max-content' }}>
          {rowA.map((name, i) => (
            <span
              key={i}
              style={{
                padding: '0.275rem 0.7rem',
                borderRadius: '5px',
                border: '1px solid rgba(99,102,241,0.18)',
                backgroundColor: 'rgba(79,70,229,0.06)',
                fontSize: '0.75rem',
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
        <div style={{ display: 'flex', gap: '0.625rem', animation: 'marquee-rev 42s linear infinite', width: 'max-content' }}>
          {rowB.map((name, i) => (
            <span
              key={i}
              style={{
                padding: '0.275rem 0.7rem',
                borderRadius: '5px',
                border: '1px solid rgba(34,211,238,0.12)',
                backgroundColor: 'rgba(6,182,212,0.05)',
                fontSize: '0.75rem',
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
    <>
      <style>{`
        .agent-grid {
          display: grid;
          grid-template-columns: 1.45fr 1fr;
          grid-template-rows: repeat(3, auto);
          gap: 0.875rem;
        }
        .agent-featured {
          grid-row: span 3;
        }
        @media (max-width: 768px) {
          .agent-grid {
            grid-template-columns: 1fr !important;
          }
          .agent-featured {
            grid-row: span 1 !important;
          }
        }
      `}</style>
      <section style={{ padding: '5.5rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ marginBottom: '3rem' }}>
          <h2
            style={{
              fontSize: 'clamp(1.625rem, 3.5vw, 2.25rem)',
              fontWeight: 800,
              color: '#fafafa',
              margin: '0 0 0.75rem',
              letterSpacing: '-0.025em',
            }}
          >
            What your agents did while you slept
          </h2>
          <p style={{ color: '#71717a', fontSize: '1rem', maxWidth: '48ch', lineHeight: 1.6, margin: 0 }}>
            Real outputs from real skills. Not cron jobs, agents that think, act, and fix themselves.
          </p>
        </div>

        <div className="agent-grid">
          {AGENT_OUTPUTS.map(({ skill, Icon, iconColor, ago, title, body, tag, tagColor, featured }) => (
            <div
              key={skill}
              className={featured ? 'agent-featured' : ''}
              style={{
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '10px',
                padding: featured ? '2rem' : '1.375rem',
                background: 'linear-gradient(135deg, rgba(15,15,30,0.9) 0%, rgba(20,20,40,0.95) 100%)',
                transition: 'border-color 0.2s, transform 0.2s',
                cursor: 'default',
                display: 'flex',
                flexDirection: 'column',
              }}
              onMouseEnter={(e) => { const el = e.currentTarget; el.style.borderColor = iconColor + '40'; el.style.transform = 'translateY(-2px)' }}
              onMouseLeave={(e) => { const el = e.currentTarget; el.style.borderColor = 'rgba(255,255,255,0.07)'; el.style.transform = 'translateY(0)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div
                    style={{
                      width: featured ? 36 : 30,
                      height: featured ? 36 : 30,
                      borderRadius: '8px',
                      backgroundColor: iconColor + '16',
                      border: '1px solid ' + iconColor + '30',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: iconColor,
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={featured ? 16 : 14} strokeWidth={2} />
                  </div>
                  <code style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#52525b' }}>{skill}</code>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#3f3f46', fontFamily: 'var(--font-mono)' }}>{ago}</span>
              </div>

              <h3 style={{ fontSize: featured ? '1.0625rem' : '0.9rem', fontWeight: 700, color: '#fafafa', margin: '0 0 0.5rem', lineHeight: 1.35 }}>
                {title}
              </h3>
              <p style={{ fontSize: featured ? '0.9rem' : '0.825rem', color: '#a1a1aa', lineHeight: 1.6, margin: '0 0 1rem', flex: 1 }}>{body}</p>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: tagColor,
                  backgroundColor: tagColor + '12',
                  border: '1px solid ' + tagColor + '28',
                  padding: '0.2rem 0.575rem',
                  borderRadius: '100px',
                  alignSelf: 'flex-start',
                }}
              >
                <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: tagColor, display: 'inline-block', flexShrink: 0 }} />
                {tag}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

// ── Features ──────────────────────────────────────────────────────────────────

function Features() {
  return (
    <>
      <style>{`
        .features-bento {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-template-areas:
            "github github self-heal"
            "skills chain model"
            "desktop multirepo multirepo"
            "creds notifs notifs";
          gap: 0.875rem;
        }
        @media (max-width: 900px) {
          .features-bento {
            grid-template-columns: repeat(2, 1fr) !important;
            grid-template-areas:
              "github github"
              "self-heal skills"
              "chain model"
              "desktop multirepo"
              "creds notifs" !important;
          }
        }
        @media (max-width: 600px) {
          .features-bento {
            grid-template-columns: 1fr !important;
            grid-template-areas: none !important;
          }
          .features-bento > * {
            grid-area: auto !important;
          }
        }
      `}</style>
      <section
        id="features"
        style={{
          padding: '5.5rem 1.5rem',
          maxWidth: '1100px',
          margin: '0 auto',
          borderTop: '1px solid rgba(99,102,241,0.1)',
        }}
      >
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: 'clamp(1.625rem, 3.5vw, 2.25rem)', fontWeight: 800, color: '#fafafa', margin: '0 0 0.75rem', letterSpacing: '-0.025em' }}>
            Built for autonomous operation
          </h2>
          <p style={{ color: '#71717a', fontSize: '1rem', maxWidth: '48ch', lineHeight: 1.6, margin: 0 }}>
            Every piece is designed to run unattended. No babysitting, no approval loops, no surprise bills.
          </p>
        </div>

        <div className="features-bento">
          {FEATURES.map(({ Icon, title, desc, color, bg, area }) => {
            const isWide = area === 'github' || area === 'multirepo' || area === 'notifs'
            return (
              <div
                key={title}
                style={{
                  gridArea: area,
                  backgroundColor: 'rgba(15,15,28,0.85)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '10px',
                  padding: isWide ? '2rem 2rem' : '1.625rem',
                  transition: 'border-color 0.2s, transform 0.2s',
                  cursor: 'default',
                  display: 'flex',
                  flexDirection: isWide ? 'row' : 'column',
                  gap: isWide ? '1.5rem' : '0',
                  alignItems: isWide ? 'flex-start' : 'stretch',
                }}
                onMouseEnter={(e) => { const el = e.currentTarget; el.style.borderColor = color + '40'; el.style.transform = 'translateY(-2px)' }}
                onMouseLeave={(e) => { const el = e.currentTarget; el.style.borderColor = 'rgba(255,255,255,0.07)'; el.style.transform = 'translateY(0)' }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '9px',
                    backgroundColor: bg,
                    border: '1px solid ' + color + '30',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color,
                    marginBottom: isWide ? '0' : '1rem',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={18} strokeWidth={1.75} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#fafafa', margin: '0 0 0.4rem' }}>{title}</h3>
                  <p style={{ fontSize: '0.85rem', color: '#71717a', lineHeight: 1.65, margin: 0 }}>{desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </>
  )
}

// ── How It Works ──────────────────────────────────────────────────────────────

function HowItWorks() {
  return (
    <>
      <style>{`
        .steps-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0;
          position: relative;
        }
        .steps-grid::before {
          content: '';
          position: absolute;
          top: 11px;
          left: calc(16.67% + 8px);
          right: calc(16.67% + 8px);
          height: 1px;
          background: linear-gradient(90deg, rgba(79,70,229,0.4) 0%, rgba(6,182,212,0.4) 100%);
          pointer-events: none;
        }
        @media (max-width: 640px) {
          .steps-grid { grid-template-columns: 1fr !important; gap: 1.5rem !important; }
          .steps-grid::before { display: none; }
        }
      `}</style>
      <section
        id="how-it-works"
        style={{
          padding: '5.5rem 1.5rem',
          borderTop: '1px solid rgba(99,102,241,0.1)',
          borderBottom: '1px solid rgba(99,102,241,0.1)',
        }}
      >
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 'clamp(1.625rem, 3.5vw, 2.25rem)', fontWeight: 800, color: '#fafafa', margin: '0 0 0.75rem', letterSpacing: '-0.025em' }}>
              Up and running in minutes
            </h2>
            <p style={{ color: '#71717a', fontSize: '1rem', margin: 0, lineHeight: 1.6 }}>
              No infrastructure to provision. No Docker to learn.
            </p>
          </div>

          <div className="steps-grid">
            {STEPS.map(({ title, desc }, i) => (
              <div
                key={title}
                style={{
                  padding: '0 2rem 0 0',
                  paddingRight: i < STEPS.length - 1 ? '2rem' : '0',
                }}
              >
                {/* Step indicator */}
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(79,70,229,0.15)',
                    border: '2px solid rgba(79,70,229,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.25rem',
                    position: 'relative',
                    zIndex: 1,
                    flexShrink: 0,
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#6366f1', display: 'block' }} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fafafa', margin: '0 0 0.5rem' }}>{title}</h3>
                <p style={{ fontSize: '0.875rem', color: '#71717a', lineHeight: 1.65, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
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
    <section style={{ padding: '5.5rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: 'clamp(1.625rem, 3.5vw, 2.25rem)', fontWeight: 800, color: '#fafafa', margin: '0 0 0.75rem', letterSpacing: '-0.025em' }}>
          Curated skill packs
        </h2>
        <p style={{ color: '#71717a', fontSize: '1rem', margin: 0, lineHeight: 1.6 }}>
          Install a pack and your agent is operational in seconds. Mix and match.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.875rem' }}>
        {PACKS.map(({ name, skills, desc, tag }) => (
          <div
            key={name}
            style={{
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '10px',
              padding: '1.375rem',
              backgroundColor: 'rgba(15,15,28,0.85)',
              transition: 'border-color 0.2s, transform 0.2s',
              cursor: 'default',
            }}
            onMouseEnter={(e) => { const el = e.currentTarget; el.style.borderColor = (tagColors[tag] ?? '#818cf8') + '50'; el.style.transform = 'translateY(-2px)' }}
            onMouseLeave={(e) => { const el = e.currentTarget; el.style.borderColor = 'rgba(255,255,255,0.07)'; el.style.transform = 'translateY(0)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.625rem' }}>
              <span style={{ fontWeight: 700, color: '#fafafa', fontSize: '0.9375rem' }}>{name}</span>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  padding: '0.175rem 0.55rem',
                  borderRadius: '100px',
                  backgroundColor: (tagColors[tag] ?? '#818cf8') + '14',
                  color: tagColors[tag] ?? '#818cf8',
                  border: '1px solid ' + (tagColors[tag] ?? '#818cf8') + '28',
                  whiteSpace: 'nowrap',
                }}
              >
                {tag}
              </span>
            </div>
            <p style={{ fontSize: '0.825rem', color: '#71717a', lineHeight: 1.6, margin: '0 0 0.875rem' }}>{desc}</p>
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
        padding: '5.5rem 1.5rem',
        borderTop: '1px solid rgba(99,102,241,0.1)',
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: 'clamp(1.625rem, 3.5vw, 2.25rem)', fontWeight: 800, color: '#fafafa', margin: '0 0 0.75rem', letterSpacing: '-0.025em' }}>
            Vigil Desktop
          </h2>
          <p style={{ color: '#71717a', fontSize: '1rem', margin: 0, maxWidth: '44ch', lineHeight: 1.6 }}>
            Native app for Mac, Windows, and Linux. Visual skill editor, system tray, and auto-updates.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '0.75rem',
            marginBottom: '2rem',
          }}
        >
          {DOWNLOADS.map(({ platform, arch, Icon, url, ext }) => (
            <a
              key={`${platform}-${arch}`}
              href={url}
              download
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '1.375rem 1rem',
                borderRadius: '9px',
                border: '1px solid rgba(99,102,241,0.18)',
                backgroundColor: 'rgba(79,70,229,0.05)',
                textDecoration: 'none',
                transition: 'border-color 0.15s, background-color 0.15s, transform 0.15s',
              }}
              onMouseEnter={(e) => { const el = e.currentTarget; el.style.borderColor = 'rgba(99,102,241,0.45)'; el.style.backgroundColor = 'rgba(79,70,229,0.1)'; el.style.transform = 'translateY(-2px)' }}
              onMouseLeave={(e) => { const el = e.currentTarget; el.style.borderColor = 'rgba(99,102,241,0.18)'; el.style.backgroundColor = 'rgba(79,70,229,0.05)'; el.style.transform = 'translateY(0)' }}
            >
              <span style={{ color: '#d4d4d8' }}><Icon size={26} /></span>
              <span style={{ fontWeight: 700, color: '#fafafa', fontSize: '0.875rem' }}>{platform}</span>
              <span style={{ color: '#71717a', fontSize: '0.75rem' }}>{arch}</span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.675rem',
                  color: '#6366f1',
                  backgroundColor: 'rgba(99,102,241,0.08)',
                  padding: '0.175rem 0.55rem',
                  borderRadius: '4px',
                  border: '1px solid rgba(99,102,241,0.22)',
                  marginTop: '0.2rem',
                }}
              >
                {ext}
              </span>
            </a>
          ))}
        </div>

        <div>
          <a
            href={`https://github.com/${GITHUB_REPO}/releases`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.8rem',
              color: '#71717a',
              textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '6px',
              padding: '0.45rem 0.875rem',
              transition: 'color 0.15s, border-color 0.15s',
            }}
            onMouseEnter={(e) => { const el = e.currentTarget; el.style.color = '#fafafa'; el.style.borderColor = 'rgba(255,255,255,0.2)' }}
            onMouseLeave={(e) => { const el = e.currentTarget; el.style.color = '#71717a'; el.style.borderColor = 'rgba(255,255,255,0.08)' }}
          >
            <GithubIcon size={13} /> View all releases on GitHub
          </a>
        </div>
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
        padding: '5.5rem 1.5rem',
        borderTop: '1px solid rgba(99,102,241,0.1)',
        borderBottom: '1px solid rgba(99,102,241,0.1)',
      }}
    >
      <div style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.25rem 0.8rem',
            borderRadius: '100px',
            border: '1px solid rgba(99,102,241,0.2)',
            backgroundColor: 'rgba(79,70,229,0.07)',
            fontSize: '0.75rem',
            color: '#a5b4fc',
            marginBottom: '1.5rem',
          }}
        >
          Web version
        </div>

        <h2 style={{ fontSize: 'clamp(1.625rem, 3.5vw, 2.25rem)', fontWeight: 800, color: '#fafafa', margin: '0 0 1rem', letterSpacing: '-0.025em' }}>
          Deploy your own dashboard
        </h2>
        <p style={{ color: '#71717a', fontSize: '1rem', lineHeight: 1.65, margin: '0 0 2rem', maxWidth: '50ch', marginLeft: 'auto', marginRight: 'auto' }}>
          Host the Vigil dashboard on Vercel in one click. Users connect their own GitHub accounts
          via OAuth. No shared tokens, complete per-user isolation out of the box.
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
            fontSize: '0.9375rem',
            textDecoration: 'none',
            marginBottom: '2.5rem',
            boxShadow: '0 0 24px rgba(250,250,250,0.08)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { const el = e.currentTarget; el.style.opacity = '0.88'; el.style.transform = 'translateY(-1px)' }}
          onMouseLeave={(e) => { const el = e.currentTarget; el.style.opacity = '1'; el.style.transform = 'translateY(0)' }}
        >
          <svg width="15" height="15" viewBox="0 0 116 100" fill="#09090b">
            <path d="M57.5 0L115 100H0L57.5 0z" />
          </svg>
          Deploy to Vercel
        </a>

        <div
          style={{
            backgroundColor: 'rgba(15,15,28,0.9)',
            border: '1px solid rgba(99,102,241,0.15)',
            borderRadius: '9px',
            padding: '1.375rem',
            textAlign: 'left',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.675rem',
              color: '#4f46e5',
              margin: '0 0 0.875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontWeight: 600,
            }}
          >
            Required env var
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem', alignItems: 'baseline' }}>
            <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#818cf8', minWidth: '140px' }}>
              SKILLS_REPO
            </code>
            <span style={{ fontSize: '0.8rem', color: '#71717a' }}>Skills definitions repo (e.g. besley1600/vigil)</span>
          </div>
          <p style={{ margin: '0.875rem 0 0', fontSize: '0.775rem', color: '#52525b', lineHeight: 1.55 }}>
            Users connect their own GitHub accounts via OAuth when they visit your app. No per-user token configuration needed.
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
          width: '700px',
          height: '450px',
          background: 'radial-gradient(ellipse, rgba(79,70,229,0.2) 0%, rgba(6,182,212,0.08) 50%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.1) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 80% at 50% 50%, black 20%, transparent 100%)',
          maskImage: 'radial-gradient(ellipse 70% 80% at 50% 50%, black 20%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative' }}>
        <h2
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.25rem)',
            fontWeight: 900,
            color: '#fafafa',
            margin: '0 0 1.25rem',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
          }}
        >
          Stop doing work that{' '}
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
        <p style={{ color: '#71717a', fontSize: '1rem', maxWidth: '46ch', margin: '0 auto 2.5rem', lineHeight: 1.65 }}>
          Connect your GitHub account and activate a repository. Your AI team is operational in under two minutes. Free forever on GitHub&apos;s infrastructure.
        </p>

        <div style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href={`https://github.com/${GITHUB_REPO}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.8125rem 1.875rem',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.9375rem',
              textDecoration: 'none',
              boxShadow: '0 0 40px rgba(79,70,229,0.4)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { const el = e.currentTarget; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = '0 0 60px rgba(79,70,229,0.6)' }}
            onMouseLeave={(e) => { const el = e.currentTarget; el.style.transform = 'translateY(0)'; el.style.boxShadow = '0 0 40px rgba(79,70,229,0.4)' }}
          >
            Fork on GitHub <ArrowRight size={15} />
          </a>
          <a
            href={APP_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.8125rem 1.875rem',
              borderRadius: '8px',
              border: '1px solid rgba(99,102,241,0.3)',
              backgroundColor: 'rgba(79,70,229,0.08)',
              color: '#fafafa',
              fontWeight: 600,
              fontSize: '0.9375rem',
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
        borderTop: '1px solid rgba(99,102,241,0.1)',
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
          <span style={{ fontSize: '0.825rem', color: '#3f3f46' }}>Vigil &middot; Open source, MIT license</span>
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
              style={{ fontSize: '0.8rem', color: '#3f3f46', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#d4d4d8')}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = '#3f3f46')}
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
