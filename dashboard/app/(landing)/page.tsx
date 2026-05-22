'use client'

import { useState, useEffect } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Zap, RefreshCw, Puzzle, GitMerge, Bot, Monitor, GitBranch, Lock } from 'lucide-react'

// ── Brand icons ───────────────────────────────────────────────────────────────

function XIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.736-8.834L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
    </svg>
  )
}

function GithubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
    </svg>
  )
}

// ── Platform brand icons (inline SVG — Lucide has no brand logos) ─────────────

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
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || '/app'
const RELEASES_BASE = `https://github.com/${GITHUB_REPO}/releases/latest/download`

// ── Token — update TOKEN_CA when contract is deployed ────────────────────────
const TOKEN_CA: string | null = null // TODO: replace with real contract address
const BANKR_URL = TOKEN_CA ? `https://bankr.bot/discover/${TOKEN_CA}` : null

const SOCIALS = [
  { label: 'X / Twitter', href: 'https://x.com/NightWatch_0' },
  { label: 'GitHub', href: `https://github.com/${GITHUB_REPO}` },
  { label: 'Bankr', href: BANKR_URL },
]

const DOWNLOADS: { platform: string; arch: string; Icon: React.FC<{ size?: number }>; url: string; ext: string }[] = [
  {
    platform: 'macOS',
    arch: 'Apple Silicon',
    Icon: AppleIcon,
    url: `${RELEASES_BASE}/Vigil-arm64.dmg`,
    ext: '.dmg',
  },
  {
    platform: 'macOS',
    arch: 'Intel',
    Icon: AppleIcon,
    url: `${RELEASES_BASE}/Vigil-x64.dmg`,
    ext: '.dmg',
  },
  {
    platform: 'Windows',
    arch: '64-bit',
    Icon: WindowsIcon,
    url: `${RELEASES_BASE}/Vigil-Setup-x64.exe`,
    ext: '.exe',
  },
  {
    platform: 'Linux',
    arch: 'x64',
    Icon: LinuxIcon,
    url: `${RELEASES_BASE}/Vigil-x64.AppImage`,
    ext: '.AppImage',
  },
]

const FEATURES: { Icon: LucideIcon; title: string; desc: string }[] = [
  {
    Icon: Zap,
    title: 'GitHub Actions runtime',
    desc: "Runs on GitHub's infrastructure — no VPS, no Docker, no Lambda. Free for public repos.",
  },
  {
    Icon: RefreshCw,
    title: 'Self-healing agents',
    desc: 'Skills monitor their own output quality and repair themselves when they break.',
  },
  {
    Icon: Puzzle,
    title: '119 pre-built skills',
    desc: 'PR reviews, market monitoring, content writing, vulnerability scans — drop-in and go.',
  },
  {
    Icon: GitMerge,
    title: 'Skill chaining',
    desc: 'Compose agents into pipelines with parallel steps, conditional logic, and output passing.',
  },
  {
    Icon: Bot,
    title: 'Multi-model routing',
    desc: 'Run Claude, GPT, Gemini, or Kimi per-skill. Switch models without rewriting logic.',
  },
  {
    Icon: Monitor,
    title: 'Native desktop app',
    desc: 'Mac, Windows, and Linux app with a visual editor, tray integration, and auto-updates.',
  },
  {
    Icon: GitBranch,
    title: 'Multi-repository management',
    desc: 'Connect any of your GitHub repos and switch between them instantly. Each repo holds its own independent skill config, schedules, and activation state.',
  },
  {
    Icon: Lock,
    title: 'Per-user credential isolation',
    desc: 'Every user authenticates with their own GitHub account via OAuth. No shared tokens, no operator data ever leaking — complete isolation by design.',
  },
]

const PACKS = [
  {
    name: 'AI Builder',
    skills: 5,
    desc: 'PR reviews, monitoring, research, heartbeat, and self-repair for AI projects.',
    tag: 'Dev',
  },
  {
    name: 'Morning Ops',
    skills: 4,
    desc: 'Daily brief, digest aggregation, alert routing, and routine summaries.',
    tag: 'Productivity',
  },
  {
    name: 'Crypto Monitor',
    skills: 5,
    desc: 'Token tracking, DeFi yields, on-chain events, and Polymarket movements.',
    tag: 'Finance',
  },
  {
    name: 'Dev Ops',
    skills: 6,
    desc: 'PR triage, auto-merge, vulnerability scanning, and activity monitoring.',
    tag: 'Engineering',
  },
  {
    name: 'Content Machine',
    skills: 4,
    desc: 'Research, write, format, and publish long-form content automatically.',
    tag: 'Content',
  },
  {
    name: 'Self-Healing',
    skills: 4,
    desc: 'Health checks, quality scoring, automated repair, and system reporting.',
    tag: 'Ops',
  },
  {
    name: 'Fleet',
    skills: 4,
    desc: 'Manage forks, cohort analysis, and leaderboard tracking across deployments.',
    tag: 'Scale',
  },
]

const STEPS = [
  {
    n: '01',
    title: 'Connect your GitHub',
    desc: 'Sign in with GitHub OAuth. Vigil connects to your repositories securely — no manual token setup, no shared credentials.',
  },
  {
    n: '02',
    title: 'Activate a repository',
    desc: 'Select any of your repos, flip the activation switch, then toggle skills and set their schedules. Each repo holds its own independent config.',
  },
  {
    n: '03',
    title: 'It runs forever',
    desc: 'GitHub Actions handles execution. Agents run on cron, react to events, and fix themselves when they fail.',
  },
]

// ── Components ────────────────────────────────────────────────────────────────

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

const NAV_LINKS = ['Features', 'How it works', 'Download'] as const
const TOKEN_NAV_HREF = '#token'

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

  const solid = scrolled || mobileOpen

  return (
    <>
      <style>{`
        .nav-links  { display: flex; }
        .nav-burger { display: none; }
        @media (max-width: 640px) {
          .nav-links  { display: none !important; }
          .nav-burger { display: flex !important; }
        }
      `}</style>

      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        backgroundColor: solid ? 'rgba(15,17,36,0.96)' : 'transparent',
        backdropFilter: solid ? 'blur(12px)' : 'none',
        borderBottom: solid ? '1px solid #2E3058' : '1px solid transparent',
        transition: 'all 0.2s ease',
      }}>
        {/* Main bar */}
        <div style={{ padding: '0 1.5rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <VigilLogo size={28} />
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fafafa', letterSpacing: '0.05em' }}>VIGIL</span>
          </a>

          {/* Desktop: links + CTAs grouped on the right */}
          <div className="nav-links" style={{ alignItems: 'center', gap: '2rem' }}>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              {NAV_LINKS.map((label) => (
                <a key={label} href={`#${label.toLowerCase().replace(/\s+/g, '-')}`}
                  style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.15s' }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#fafafa')}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.color = '#a1a1aa')}
                >{label}</a>
              ))}
              <a href={TOKEN_NAV_HREF}
                style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#818cf8', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.04em', padding: '0.2rem 0.55rem', borderRadius: '99px', border: '1px solid rgba(99,102,241,0.4)', background: 'rgba(99,102,241,0.08)', transition: 'all 0.15s' }}
                onMouseEnter={(e) => { const el = e.currentTarget; el.style.borderColor = 'rgba(99,102,241,0.7)'; el.style.color = '#a5b4fc' }}
                onMouseLeave={(e) => { const el = e.currentTarget; el.style.borderColor = 'rgba(99,102,241,0.4)'; el.style.color = '#818cf8' }}
              >$VIGIL</a>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <a href={`https://github.com/${GITHUB_REPO}`} target="_blank" rel="noopener noreferrer"
                style={{ padding: '0.375rem 0.875rem', borderRadius: '6px', border: '1px solid #2E3058', color: '#a1a1aa', fontSize: '0.875rem', textDecoration: 'none', transition: 'all 0.15s' }}
                onMouseEnter={(e) => { const el = e.currentTarget; el.style.borderColor = '#3A3D68'; el.style.color = '#fafafa' }}
                onMouseLeave={(e) => { const el = e.currentTarget; el.style.borderColor = '#2E3058'; el.style.color = '#a1a1aa' }}
              >GitHub</a>
              <a href={APP_URL} rel="noopener noreferrer"
                style={{ padding: '0.375rem 0.875rem', borderRadius: '6px', background: 'linear-gradient(135deg,#4f46e5,#6366f1)', color: '#fff', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none', transition: 'opacity 0.15s' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.85')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')}
              >Open App →</a>
            </div>
          </div>

          {/* Mobile burger */}
          <button
            className="nav-burger"
            onClick={() => setMobileOpen(o => !o)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', flexDirection: 'column', gap: '5px', alignItems: 'center', justifyContent: 'center' }}
          >
            <span style={{ display: 'block', width: '22px', height: '1.5px', backgroundColor: '#fafafa', transition: 'transform 0.2s ease', transform: mobileOpen ? 'rotate(45deg) translate(2.5px, 3.5px)' : 'none' }} />
            <span style={{ display: 'block', width: '22px', height: '1.5px', backgroundColor: '#fafafa', transition: 'transform 0.2s ease', transform: mobileOpen ? 'rotate(-45deg) translate(2.5px, -3.5px)' : 'none' }} />
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div style={{ borderTop: '1px solid #2E3058', padding: '1rem 1.5rem 1.5rem', backgroundColor: 'rgba(15,17,36,0.98)' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {NAV_LINKS.map((label) => (
                <a key={label} href={`#${label.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setMobileOpen(false)}
                  style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: '0.9rem', padding: '0.75rem 0', borderBottom: '1px solid #1C1E38', display: 'block' }}
                >{label}</a>
              ))}
              <a href={TOKEN_NAV_HREF} onClick={() => setMobileOpen(false)}
                style={{ color: '#818cf8', textDecoration: 'none', fontSize: '0.9rem', padding: '0.75rem 0', fontWeight: 700, display: 'block' }}
              >$VIGIL Token</a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.25rem' }}>
              <a href={`https://github.com/${GITHUB_REPO}`} target="_blank" rel="noopener noreferrer"
                onClick={() => setMobileOpen(false)}
                style={{ padding: '0.625rem 1rem', borderRadius: '6px', border: '1px solid #2E3058', color: '#a1a1aa', fontSize: '0.875rem', textDecoration: 'none', textAlign: 'center' }}
              >GitHub</a>
              <a href={APP_URL} rel="noopener noreferrer"
                onClick={() => setMobileOpen(false)}
                style={{ padding: '0.625rem 1rem', borderRadius: '6px', background: 'linear-gradient(135deg,#4f46e5,#6366f1)', color: '#fff', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none', textAlign: 'center' }}
              >Open App →</a>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}

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
        padding: '8rem 1.5rem 4rem',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center',
      }}
    >
      {/* Background glow */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '800px',
          height: '500px',
          background: 'radial-gradient(ellipse, rgba(79,70,229,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Badge */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.3rem 0.875rem',
          borderRadius: '100px',
          border: '1px solid #2E3058',
          backgroundColor: '#181A32',
          fontSize: '0.8rem',
          color: '#a1a1aa',
          marginBottom: '2rem',
        }}
      >
        <span style={{ color: '#06b6d4', fontSize: '0.7rem' }}>●</span>
        Open source &nbsp;·&nbsp; GitHub Actions powered
      </div>

      {/* Headline */}
      <h1
        style={{
          fontSize: 'clamp(2.5rem, 7vw, 5rem)',
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: '-0.03em',
          color: '#fafafa',
          margin: '0 0 1.5rem',
          maxWidth: '14ch',
        }}
      >
        The AI workforce that works while you sleep.
      </h1>

      <p
        style={{
          fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
          color: '#71717a',
          maxWidth: '52ch',
          lineHeight: 1.6,
          margin: '0 0 2.5rem',
        }}
      >
        119 pre-built skills. No servers. Self-healing agents that run on GitHub Actions and fix
        themselves when they break.
      </p>

      {/* CTAs */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '4rem' }}>
        <a
          href="#download"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.75rem',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '1rem',
            textDecoration: 'none',
            boxShadow: '0 0 30px rgba(79,70,229,0.3)',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.transform = 'translateY(0)')}
        >
          ↓ Download Desktop App
        </a>
        <a
          href={APP_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.75rem',
            borderRadius: '8px',
            border: '1px solid #2E3058',
            backgroundColor: '#181A32',
            color: '#fafafa',
            fontWeight: 600,
            fontSize: '1rem',
            textDecoration: 'none',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.borderColor = '#4f46e5'
            el.style.backgroundColor = '#1C1E38'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.borderColor = '#2E3058'
            el.style.backgroundColor = '#181A32'
          }}
        >
          Open Web App →
        </a>
      </div>

      {/* Code preview */}
      <div
        style={{
          width: '100%',
          maxWidth: '620px',
          borderRadius: '12px',
          border: '1px solid #2E3058',
          backgroundColor: '#181A32',
          overflow: 'hidden',
          textAlign: 'left',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            borderBottom: '1px solid #2E3058',
            backgroundColor: '#131528',
          }}
        >
          <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }} />
          <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#52525b', fontFamily: 'var(--font-mono)' }}>
            vigil.yml
          </span>
        </div>
        <pre
          style={{
            margin: 0,
            padding: '1.25rem',
            fontSize: '0.8rem',
            lineHeight: 1.7,
            color: '#a1a1aa',
            fontFamily: 'var(--font-mono)',
            overflowX: 'auto',
          }}
        >
          <code>{`skills:
  hacker-news-digest:
    enabled: `}<span style={{ color: '#22c55e' }}>true</span>{`
    schedule: `}<span style={{ color: '#f59e0b' }}>"0 8 * * *"</span>{`   # 8am daily

  pr-reviewer:
    enabled: `}<span style={{ color: '#22c55e' }}>true</span>{`
    model: `}<span style={{ color: '#6366f1' }}>claude-opus-4-7</span>{`

  self-repair:
    enabled: `}<span style={{ color: '#22c55e' }}>true</span>{`
    schedule: `}<span style={{ color: '#f59e0b' }}>"0 6 * * 1"</span>{`   # Mondays`}</code>
        </pre>
      </div>
    </section>
  )
}

function Stats() {
  const items = [
    { value: '119+', label: 'Pre-built skills' },
    { value: '7', label: 'Curated packs' },
    { value: '0', label: 'Servers to manage' },
    { value: '24/7', label: 'Always running' },
  ]

  return (
    <section
      style={{
        borderTop: '1px solid #2E3058',
        borderBottom: '1px solid #2E3058',
        backgroundColor: '#181A32',
        padding: '2rem 1.5rem',
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
        {items.map(({ value, label }) => (
          <div key={label}>
            <div
              style={{
                fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #fafafa, #71717a)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {value}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#52525b', marginTop: '0.25rem' }}>{label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── Token Bar ─────────────────────────────────────────────────────────────────

function TokenBar() {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    if (!TOKEN_CA) return
    navigator.clipboard.writeText(TOKEN_CA)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shortCA = TOKEN_CA
    ? `${TOKEN_CA.slice(0, 6)}...${TOKEN_CA.slice(-4)}`
    : 'Coming soon'

  return (
    <div style={{ borderTop: '1px solid #2E3058', borderBottom: '1px solid #2E3058', backgroundColor: '#0a0b1a', padding: '0.6rem 1.5rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>

        {/* Left: badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#34d399', display: 'inline-block', flexShrink: 0, boxShadow: '0 0 6px rgba(52,211,153,0.6)' }} />
          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fafafa', letterSpacing: '0.06em' }}>$VIGIL</span>
          <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: '#3a3d5c', padding: '0.15rem 0.5rem', border: '1px solid #2E3058', borderRadius: '4px' }}>Base chain</span>
        </div>

        {/* Center: CA + copy */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: '#3a3d5c', letterSpacing: '0.08em', textTransform: 'uppercase' }}>CA</span>
          <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: TOKEN_CA ? '#a1a1aa' : '#52525b', letterSpacing: '0.03em' }}>{shortCA}</span>
          <button
            onClick={copy}
            disabled={!TOKEN_CA}
            style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: copied ? '#34d399' : '#52525b', background: 'none', border: '1px solid #2E3058', borderRadius: '3px', padding: '0.1rem 0.4rem', cursor: TOKEN_CA ? 'pointer' : 'default', transition: 'color 0.15s', opacity: TOKEN_CA ? 1 : 0.4 }}
          >
            {copied ? '✓' : 'copy'}
          </button>
        </div>

        {/* Right: socials + buy */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <a href="https://x.com/NightWatch_0" target="_blank" rel="noopener noreferrer"
              style={{ color: '#52525b', transition: 'color 0.15s', display: 'flex', alignItems: 'center' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#fafafa')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#52525b')}
            ><XIcon size={14} /></a>
            <a href={`https://github.com/${GITHUB_REPO}`} target="_blank" rel="noopener noreferrer"
              style={{ color: '#52525b', transition: 'color 0.15s', display: 'flex', alignItems: 'center' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#fafafa')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#52525b')}
            ><GithubIcon size={14} /></a>
            {BANKR_URL ? (
              <a href={BANKR_URL} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#52525b', textDecoration: 'none', transition: 'color 0.15s', letterSpacing: '0.05em' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#fafafa')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#52525b')}
              >BANKR</a>
            ) : (
              <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#2E3058', letterSpacing: '0.05em' }}>BANKR</span>
            )}
          </div>

          {BANKR_URL ? (
            <a href={BANKR_URL} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#4f46e5', border: '1px solid #4f46e5', borderRadius: '4px', padding: '0.25rem 0.625rem', textDecoration: 'none', letterSpacing: '0.06em', transition: 'all 0.15s' }}
              onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = '#4f46e5'; el.style.color = '#fff' }}
              onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = 'transparent'; el.style.color = '#4f46e5' }}
            >Buy $VIGIL →</a>
          ) : (
            <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#2E3058', border: '1px solid #2E3058', borderRadius: '4px', padding: '0.25rem 0.625rem', letterSpacing: '0.06em' }}>Buy soon</span>
          )}
        </div>
      </div>
    </div>
  )
}

function Features() {
  return (
    <section id="features" style={{ padding: '6rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: '#fafafa', margin: '0 0 1rem' }}>
          Built for autonomous operation
        </h2>
        <p style={{ color: '#71717a', fontSize: '1.1rem', maxWidth: '48ch', margin: '0 auto' }}>
          Every piece is designed to run unattended — no babysitting, no approval loops, no surprise bills.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1px',
          backgroundColor: '#2E3058',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid #2E3058',
        }}
      >
        {FEATURES.map(({ Icon, title, desc }) => (
          <div
            key={title}
            style={{
              backgroundColor: '#0F1124',
              padding: '1.75rem',
              transition: 'background-color 0.15s',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#181A32')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#0F1124')}
          >
            <div style={{ color: '#4f46e5', marginBottom: '0.875rem' }}>
              <Icon size={22} strokeWidth={1.75} />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fafafa', margin: '0 0 0.5rem' }}>{title}</h3>
            <p style={{ fontSize: '0.875rem', color: '#71717a', lineHeight: 1.6, margin: 0 }}>{desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section
      id="how-it-works"
      style={{
        padding: '6rem 1.5rem',
        backgroundColor: '#131528',
        borderTop: '1px solid #2E3058',
        borderBottom: '1px solid #2E3058',
      }}
    >
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: '#fafafa', margin: '0 0 1rem' }}>
            Up and running in minutes
          </h2>
          <p style={{ color: '#71717a', fontSize: '1.1rem', margin: 0 }}>
            No infrastructure to provision. No Docker to learn.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2rem',
          }}
        >
          {STEPS.map(({ n, title, desc }) => (
            <div key={n} style={{ position: 'relative' }}>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  color: '#4f46e5',
                  fontWeight: 700,
                  marginBottom: '0.75rem',
                  letterSpacing: '0.1em',
                }}
              >
                {n}
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fafafa', margin: '0 0 0.5rem' }}>{title}</h3>
              <p style={{ fontSize: '0.9rem', color: '#71717a', lineHeight: 1.6, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Packs() {
  const tagColors: Record<string, string> = {
    Dev: '#4f46e5',
    Productivity: '#0891b2',
    Finance: '#059669',
    Engineering: '#7c3aed',
    Content: '#b45309',
    Ops: '#be123c',
    Scale: '#0369a1',
  }

  return (
    <section style={{ padding: '6rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: '#fafafa', margin: '0 0 1rem' }}>
          Curated skill packs
        </h2>
        <p style={{ color: '#71717a', fontSize: '1.1rem', margin: 0 }}>
          Install a pack and your agent is operational in seconds.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1rem',
        }}
      >
        {PACKS.map(({ name, skills, desc, tag }) => (
          <div
            key={name}
            style={{
              border: '1px solid #2E3058',
              borderRadius: '10px',
              padding: '1.25rem',
              backgroundColor: '#181A32',
              transition: 'border-color 0.15s, background-color 0.15s',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement
              el.style.borderColor = '#3A3D68'
              el.style.backgroundColor = '#1C1E38'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement
              el.style.borderColor = '#2E3058'
              el.style.backgroundColor = '#181A32'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.625rem' }}>
              <span style={{ fontWeight: 700, color: '#fafafa', fontSize: '0.95rem' }}>{name}</span>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  padding: '0.2rem 0.5rem',
                  borderRadius: '100px',
                  backgroundColor: `${tagColors[tag] ?? '#4f46e5'}22`,
                  color: tagColors[tag] ?? '#4f46e5',
                  border: `1px solid ${tagColors[tag] ?? '#4f46e5'}44`,
                  whiteSpace: 'nowrap',
                }}
              >
                {tag}
              </span>
            </div>
            <p style={{ fontSize: '0.825rem', color: '#71717a', lineHeight: 1.55, margin: '0 0 0.75rem' }}>{desc}</p>
            <div style={{ fontSize: '0.75rem', color: '#52525b', fontFamily: 'var(--font-mono)' }}>
              {skills} skills
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

const RELEASE_TARGET = new Date('2026-05-22T07:00:00.000Z')

function Download() {
  const [timeLeft, setTimeLeft] = useState(() => Math.max(0, RELEASE_TARGET.getTime() - Date.now()))

  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(Math.max(0, RELEASE_TARGET.getTime() - Date.now()))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const hours   = Math.floor(timeLeft / 3_600_000)
  const minutes = Math.floor((timeLeft % 3_600_000) / 60_000)
  const seconds = Math.floor((timeLeft % 60_000) / 1_000)
  const pad = (n: number) => String(n).padStart(2, '0')
  const done = timeLeft === 0

  return (
    <section
      id="download"
      style={{
        padding: '6rem 1.5rem',
        backgroundColor: '#131528',
        borderTop: '1px solid #2E3058',
      }}
    >
      <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.3rem 0.875rem',
            borderRadius: '100px',
            border: '1px solid #2E3058',
            backgroundColor: '#181A32',
            fontSize: '0.8rem',
            color: '#a1a1aa',
            marginBottom: '1.5rem',
          }}
        >
          Desktop App
        </div>

        <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: '#fafafa', margin: '0 0 1rem' }}>
          {done ? 'Vigil Desktop is live' : 'Launching soon'}
        </h2>
        <p style={{ color: '#71717a', fontSize: '1rem', lineHeight: 1.6, margin: '0 0 2.5rem' }}>
          {done
            ? 'Download the native app with visual editor, tray integration, and auto-updates.'
            : 'Native app with visual editor, tray integration, and auto-updates.'}
        </p>

        {!done && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
            {[
              { label: 'HRS',  value: pad(hours) },
              { label: 'MIN',  value: pad(minutes) },
              { label: 'SEC',  value: pad(seconds) },
            ].map(({ label, value }, i) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'clamp(2.5rem, 8vw, 4rem)',
                      fontWeight: 700,
                      color: '#fafafa',
                      lineHeight: 1,
                      letterSpacing: '-0.02em',
                      backgroundColor: '#181A32',
                      border: '1px solid #2E3058',
                      borderRadius: '8px',
                      padding: '0.75rem 1.25rem',
                      minWidth: '5rem',
                    }}
                  >
                    {value}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#52525b', marginTop: '0.5rem', letterSpacing: '0.1em' }}>
                    {label}
                  </div>
                </div>
                {i < 2 && (
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', color: '#2E3058', marginBottom: '1.2rem' }}>:</div>
                )}
              </div>
            ))}
          </div>
        )}

        <a
          href={`https://github.com/${GITHUB_REPO}/releases`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: '0.8rem', color: '#52525b', textDecoration: 'none' }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#a1a1aa')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#52525b')}
        >
          {done ? 'View releases on GitHub →' : 'Follow releases on GitHub'}
        </a>
      </div>
    </section>
  )
}

// ── Token ─────────────────────────────────────────────────────────────────────

function Token() {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    if (!TOKEN_CA) return
    navigator.clipboard.writeText(TOKEN_CA)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section
      id="token"
      style={{
        padding: '6rem 1.5rem',
        borderTop: '1px solid #2E3058',
        borderBottom: '1px solid #2E3058',
        backgroundColor: '#131528',
      }}
    >
      <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.3rem 0.875rem',
            borderRadius: '100px',
            border: '1px solid #2E3058',
            backgroundColor: '#181A32',
            fontSize: '0.8rem',
            color: '#a1a1aa',
            marginBottom: '1.5rem',
          }}
        >
          <span style={{ color: '#34d399', fontSize: '0.65rem' }}>●</span>
          $VIGIL Token
        </div>

        <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: '#fafafa', margin: '0 0 1rem', letterSpacing: '-0.02em' }}>
          Own a piece of the network
        </h2>
        {/* Contract address */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            backgroundColor: '#0F1124',
            border: '1px solid #2E3058',
            borderRadius: '8px',
            padding: '0.875rem 1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ textAlign: 'left', minWidth: 0 }}>
            <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: '#52525b', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              Contract Address
            </div>
            <div
              style={{
                fontSize: '0.8rem',
                fontFamily: 'var(--font-mono)',
                color: TOKEN_CA ? '#a1a1aa' : '#52525b',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {TOKEN_CA ?? 'Coming soon'}
            </div>
          </div>
          <button
            onClick={copy}
            disabled={!TOKEN_CA}
            style={{
              flexShrink: 0,
              padding: '0.375rem 0.75rem',
              borderRadius: '5px',
              border: '1px solid #2E3058',
              backgroundColor: TOKEN_CA ? '#181A32' : 'transparent',
              color: copied ? '#34d399' : '#71717a',
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
              cursor: TOKEN_CA ? 'pointer' : 'default',
              transition: 'all 0.15s',
              opacity: TOKEN_CA ? 1 : 0.4,
            }}
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        {/* Buy button */}
        {BANKR_URL ? (
          <a
            href={BANKR_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 2rem',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.95rem',
              textDecoration: 'none',
              boxShadow: '0 0 30px rgba(79,70,229,0.3)',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.85')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')}
          >
            Buy on Bankr
          </a>
        ) : (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 2rem',
              borderRadius: '8px',
              border: '1px solid #2E3058',
              color: '#52525b',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'default',
            }}
          >
            Buy on Bankr — Coming soon
          </div>
        )}

        {/* How to buy */}
        <div style={{ marginTop: '3.5rem', textAlign: 'left' }}>
          <p style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4f46e5', marginBottom: '1.5rem', textAlign: 'center' }}>
            How to buy on Base
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {[
              {
                n: '01',
                title: 'Get a Web3 wallet',
                body: 'Download Coinbase Wallet, MetaMask, or Rainbow. Coinbase Wallet has native Base support and is the easiest starting point.',
              },
              {
                n: '02',
                title: 'Add ETH to Base',
                body: 'Buy ETH on Coinbase and withdraw directly to your Base wallet address, or bridge existing ETH using bridge.base.org.',
              },
              {
                n: '03',
                title: 'Swap for $VIGIL',
                body: 'Open Bankr or Uniswap on Base, paste the contract address above, and swap your ETH for $VIGIL. Always verify the CA before swapping.',
              },
            ].map(({ n, title, body }, i, arr) => (
              <div
                key={n}
                style={{
                  display: 'flex',
                  gap: '1.25rem',
                  padding: '1.25rem 1.5rem',
                  backgroundColor: '#0F1124',
                  border: '1px solid #2E3058',
                  borderBottom: i < arr.length - 1 ? 'none' : '1px solid #2E3058',
                  borderRadius: i === 0 ? '10px 10px 0 0' : i === arr.length - 1 ? '0 0 10px 10px' : '0',
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#4f46e5', fontWeight: 700, letterSpacing: '0.08em', paddingTop: '2px', flexShrink: 0 }}>{n}</div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fafafa', marginBottom: '0.3rem' }}>{title}</div>
                  <div style={{ fontSize: '0.825rem', color: '#71717a', lineHeight: 1.6 }}>{body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Socials */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '2.5rem' }}>
          {SOCIALS.map(({ label, href }) =>
            href ? (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '0.825rem', color: '#52525b', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#a1a1aa')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#52525b')}
              >
                {label}
              </a>
            ) : (
              <span key={label} style={{ fontSize: '0.825rem', color: '#3a3a4a', cursor: 'default' }}>
                {label}
              </span>
            )
          )}
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer
      style={{
        padding: '2.5rem 1.5rem',
        backgroundColor: '#0F1124',
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
          <span style={{ fontSize: '0.875rem', color: '#52525b' }}>
            Vigil · Open source, MIT license
          </span>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { label: 'X / Twitter', href: 'https://x.com/NightWatch_0' },
            { label: 'GitHub', href: `https://github.com/${GITHUB_REPO}` },
            { label: 'Docs', href: `https://github.com/${GITHUB_REPO}#readme` },
            { label: 'Issues', href: `https://github.com/${GITHUB_REPO}/issues` },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '0.825rem',
                color: '#52525b',
                textDecoration: 'none',
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#a1a1aa')}
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

const LANDING_FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"

export default function LandingPage() {
  return (
    <div style={{ fontFamily: LANDING_FONT }}>
      <Nav />
      <main>
        <Hero />
        <Stats />
        <TokenBar />
        <Features />
        <HowItWorks />
        <Packs />
        <Token />
        <Download />
      </main>
      <Footer />
    </div>
  )
}
