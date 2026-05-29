'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Skill, Run, Secret, SkillOutput } from '../../../lib/types'
import { MODELS } from '../../../lib/constants'
import { features } from '../../../lib/features'
import { apiFetch } from '../../../lib/apiFetch'
import VigilCursor from '../../../components/ui/VigilCursor'
import { LoadingScreen } from '../../../components/LoadingScreen'
import { ErrorScreen } from '../../../components/ErrorScreen'
import { TopNav } from '../../../components/TopNav'
import { SkillGrid } from '../../../components/SkillGrid'
import { SlideOver } from '../../../components/SlideOver'
import { StatusTicker } from '../../../components/StatusTicker'
import { ActivityView } from '../../../components/ActivityView'
import { AnalyticsView } from '../../../components/AnalyticsView'
import { ChainsView } from '../../../components/ChainsView'
import { MemoryView } from '../../../components/MemoryView'
import { SecretsPanel } from '../../../components/SecretsPanel'
import { ImportModal } from '../../../components/ImportModal'
import { AuthModal } from '../../../components/AuthModal'
import { FloatingDispatch } from '../../../components/FloatingDispatch'
import { KeyboardShortcuts } from '../../../components/KeyboardShortcuts'
import { ContributeView } from '../../../components/ContributeView'

type View = 'hq' | 'activity' | 'analytics' | 'chains' | 'memory' | 'contribute' | 'settings'

export default function Dashboard() {
  const [view, setView] = useState<View>('hq')
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)

  const [skills, setSkills] = useState<Skill[]>([])
  const [runs, setRuns] = useState<Run[]>([])
  const [secrets, setSecrets] = useState<Secret[]>([])
  const [model, setModel] = useState('claude-sonnet-4-6')
  const [gateway, setGateway] = useState<'direct' | 'bankr'>('direct')
  const [repo, setRepo] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [busy, setBusy] = useState<Record<string, boolean>>({})
  const [toast, setToast] = useState('')
  const [hasChanges, setHasChanges] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [pulling, setPulling] = useState(false)
  const [behind, setBehind] = useState(0)
  const [feedKey, setFeedKey] = useState(0)

  const [outputs, setOutputs] = useState<SkillOutput[]>([])
  const [feedLoading, setFeedLoading] = useState(false)
  const [analyticsData, setAnalyticsData] = useState<Parameters<typeof AnalyticsView>[0]['analyticsData']>(null)
  const [chainBusy, setChainBusy] = useState<Record<string, boolean>>({})

  const [showImport, setShowImport] = useState(false)
  const [ghReady, setGhReady] = useState(true)
  const [authStatus, setAuthStatus] = useState<{ authenticated: boolean } | null>(null)
  const [authLoading, setAuthLoading] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [availableRepos, setAvailableRepos] = useState<string[]>([])
  const [showRepoSelect, setShowRepoSelect] = useState(false)
  const [needsGitHub, setNeedsGitHub] = useState(false)
  const [repoEnabled, setRepoEnabled] = useState<boolean | undefined>(undefined)

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const fetchData = useCallback(async () => {
    try {
      const [sr, rr, secr] = await Promise.all([apiFetch('/api/skills'), apiFetch('/api/runs'), apiFetch('/api/secrets')])
      if (sr.ok) {
        const d = await sr.json()
        setSkills(d.skills)
        if (d.model) setModel(d.model)
        if (d.gateway?.provider) setGateway(d.gateway.provider)
        if (d.repo) setRepo(d.repo)
        if (typeof d.repoEnabled === 'boolean') setRepoEnabled(d.repoEnabled)
        // No credentials at all (server env vars not set, no user token) → show Connect GitHub
        if (d.notSetup && !d.hasToken && !localStorage.getItem('gh_token')) setNeedsGitHub(true)
      }
      if (rr.ok) setRuns((await rr.json()).runs)
      if (secr.ok) { const d = await secr.json(); if (d.secrets) setSecrets(d.secrets); if (typeof d.ghReady === 'boolean') setGhReady(d.ghReady) }
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Failed to connect') }
    finally { setLoading(false) }
    try { const r = await apiFetch('/api/sync'); if (r.ok) { const d = await r.json(); setHasChanges(d.hasChanges); if (typeof d.behind === 'number') setBehind(d.behind) } } catch {}
    try { const r = await apiFetch('/api/auth'); if (r.ok) setAuthStatus(await r.json()) } catch {}
  }, [])

  const refreshRuns = useCallback(async () => {
    try { const r = await apiFetch('/api/runs'); if (r.ok) setRuns((await r.json()).runs) } catch {}
  }, [])

  useEffect(() => {
    document.body.classList.add('vigil-app')
    return () => { document.body.classList.remove('vigil-app') }
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ghToken = params.get('gh_token')
    const ghRepos = params.get('gh_repos')

    if (ghToken) {
      // Returning from GitHub OAuth — store credentials
      localStorage.setItem('gh_token', ghToken)
      const repoList = (ghRepos || '').split(',').filter(Boolean)
      localStorage.setItem('gh_repos', repoList.join(','))
      setAvailableRepos(repoList)
      window.history.replaceState({}, '', '/app')
      if (repoList.length === 1) {
        localStorage.setItem('gh_repo', repoList[0])
        fetchData()
      } else {
        setShowRepoSelect(true)
        setLoading(false)
      }
    } else {
      // Restore session from localStorage
      const storedRepos = localStorage.getItem('gh_repos')
      if (storedRepos) setAvailableRepos(storedRepos.split(',').filter(Boolean))
      fetchData()
    }
  }, [fetchData])
  useEffect(() => { const id = setInterval(refreshRuns, 10_000); return () => clearInterval(id) }, [refreshRuns])
  useEffect(() => {
    setFeedLoading(true)
    apiFetch('/api/outputs').then(r => r.ok ? r.json() : { outputs: [] }).then(d => setOutputs(d.outputs || [])).finally(() => setFeedLoading(false))
  }, [feedKey])

  const toggleSkill = async (n: string, en: boolean) => {
    setBusy(b => ({ ...b, [n]: true }))
    try {
      const r = await apiFetch('/api/skills', { method: 'PATCH', body: JSON.stringify({ name: n, enabled: en }) })
      if (r.ok) { setSkills(s => s.map(sk => sk.name === n ? { ...sk, enabled: en } : sk)); flash(`${n} ${en ? 'on duty' : 'off duty'}`); setHasChanges(true) }
    } finally { setBusy(b => ({ ...b, [n]: false })) }
  }

  const runSkill = async (n: string, v?: string, sm?: string) => {
    setBusy(b => ({ ...b, [`r-${n}`]: true }))
    try {
      const r = await apiFetch(`/api/skills/${n}/run`, { method: 'POST', body: JSON.stringify({ var: v || '', model: sm || model }) })
      if (r.ok) { flash(`${n} started`); for (const d of [2000, 5000, 10000]) setTimeout(refreshRuns, d) }
      else { const d = await r.json(); flash(d.error || 'Failed') }
    } finally { setBusy(b => ({ ...b, [`r-${n}`]: false })) }
  }

  const enableRepo = async () => {
    try {
      const r = await apiFetch('/api/skills', { method: 'PATCH', body: JSON.stringify({ repoEnabled: true }) })
      if (r.ok) { setRepoEnabled(true); flash('Repository activated — add ANTHROPIC_API_KEY to your repo secrets to run skills') }
    } catch {}
  }

  const updateSchedule = async (n: string, s: string) => {
    try {
      const r = await apiFetch('/api/skills', { method: 'PATCH', body: JSON.stringify({ name: n, schedule: s }) })
      if (r.ok) { setSkills(sk => sk.map(x => x.name === n ? { ...x, schedule: s } : x)); flash('Schedule updated'); setHasChanges(true) }
    } catch {}
  }

  const updateVar = async (n: string, v: string) => {
    try {
      const r = await apiFetch('/api/skills', { method: 'PATCH', body: JSON.stringify({ name: n, var: v }) })
      if (r.ok) { setSkills(s => s.map(x => x.name === n ? { ...x, var: v } : x)); flash('Brief updated'); setHasChanges(true) }
    } catch {}
  }

  const updateSkillModel = async (n: string, m: string) => {
    try {
      const r = await apiFetch('/api/skills', { method: 'PATCH', body: JSON.stringify({ name: n, skillModel: m }) })
      if (r.ok) { setSkills(s => s.map(x => x.name === n ? { ...x, model: m } : x)); flash('Model updated'); setHasChanges(true) }
    } catch {}
  }

  const updateModel = async (m: string) => {
    setModel(m)
    try { await apiFetch('/api/skills', { method: 'PATCH', body: JSON.stringify({ model: m }) }); flash(`Default: ${MODELS.find(x => x.id === m)?.label ?? m}`); setHasChanges(true) } catch {}
  }

  const deleteSkill = async (n: string) => {
    setBusy(b => ({ ...b, [`d-${n}`]: true }))
    try {
      const r = await apiFetch('/api/skills', { method: 'DELETE', body: JSON.stringify({ name: n }) })
      if (r.ok) { setSkills(s => s.filter(x => x.name !== n)); setSelectedSkill(null); flash(`${n} removed`); setHasChanges(true) }
    } finally { setBusy(b => ({ ...b, [`d-${n}`]: false })) }
  }

  const syncToGithub = async () => {
    setSyncing(true)
    try { const r = await apiFetch('/api/sync', { method: 'POST' }); if (r.ok) { flash('Synced'); setHasChanges(false) } } finally { setSyncing(false) }
  }

  const pullFromGithub = async () => {
    setPulling(true)
    try { const r = await apiFetch('/api/outputs', { method: 'POST' }); if (r.ok) { flash('Pulled'); setFeedKey(k => k + 1); fetchData() } } finally { setPulling(false) }
  }

  const runChain = async (name: string) => {
    setChainBusy(b => ({ ...b, [name]: true }))
    try {
      const r = await apiFetch(`/api/chains/${name}/run`, { method: 'POST' })
      const d = await r.json()
      if (r.ok) { flash(`Chain started: ${d.dispatched?.join(', ') || name}`); for (const delay of [2000, 5000]) setTimeout(refreshRuns, delay) }
      else flash(d.error || 'Chain failed to start')
    } finally { setChainBusy(b => ({ ...b, [name]: false })) }
  }

  const setupAuth = async (key?: string) => {
    setAuthLoading(true)
    try {
      const r = await apiFetch('/api/auth', { method: 'POST', body: JSON.stringify(key ? { key } : {}) })
      if (r.ok) { flash('Authenticated'); setAuthStatus({ authenticated: true }); setShowAuthModal(false); fetchData() }
      else { if (!key) setShowAuthModal(true); flash('Auth failed') }
    } finally { setAuthLoading(false) }
  }

  const saveSecret = async (n: string, value: string) => {
    setBusy(b => ({ ...b, [`sec-${n}`]: true }))
    try {
      const r = await apiFetch('/api/secrets', { method: 'POST', body: JSON.stringify({ name: n, value }) })
      if (r.ok) { setSecrets(s => { const e = s.some(x => x.name === n); if (e) return s.map(x => x.name === n ? { ...x, isSet: true } : x); return [...s, { name: n, group: 'Skill Keys', description: 'Custom', isSet: true }] }); flash(`${n} saved`) }
    } finally { setBusy(b => ({ ...b, [`sec-${n}`]: false })) }
  }

  const deleteSecret = async (n: string) => {
    setBusy(b => ({ ...b, [`sec-${n}`]: true }))
    try {
      const r = await apiFetch('/api/secrets', { method: 'DELETE', body: JSON.stringify({ name: n }) })
      if (r.ok) { setSecrets(s => s.map(x => x.name === n ? { ...x, isSet: false } : x)); flash(`${n} removed`) }
    } finally { setBusy(b => ({ ...b, [`sec-${n}`]: false })) }
  }

  const importSkill = async (files: Array<{ path: string; content: string }>, name?: string) => {
    const r = await apiFetch('/api/upload', { method: 'POST', body: JSON.stringify({ files, name }) })
    if (r.ok) { const d = await r.json(); flash(`${d.name} installed`); fetchData() }
  }

  const skill = selectedSkill ? skills.find(s => s.name === selectedSkill) || null : null
  const enabledCount = skills.filter(s => s.enabled).length
  const workingCount = runs.filter(r => r.status === 'in_progress').length
  const sortedSkillNames = [...skills].sort((a, b) => a.name.localeCompare(b.name)).map(s => s.name)

  if (loading) return <LoadingScreen />
  if (error) return <ErrorScreen error={error} />

  if (needsGitHub) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-eva-black text-primary-100">
        <div className="border border-[rgba(255,255,255,0.12)] bg-eva-white p-10 max-w-sm w-full text-center space-y-6">
          <svg width="18" height="18" viewBox="0 0 13 13" xmlns="http://www.w3.org/2000/svg" className="mx-auto" aria-hidden="true">
            <rect x="2.5" y="2.5" width="8" height="8" fill="none" stroke="#06B6D4" strokeWidth="1.3" transform="rotate(45 6.5 6.5)" style={{filter:'drop-shadow(0 0 3px rgba(6,182,212,0.7))'}}/>
            <circle cx="6.5" cy="6.5" r="1.2" fill="#ffffff"/>
          </svg>
          <div>
            <div className="font-display text-xl text-primary-100">Connect GitHub</div>
            <p className="text-[11px] font-mono text-primary-50 mt-2">Link your GitHub account to manage skills across your projects.</p>
          </div>
          <a
            href="/api/auth/github"
            className="block w-full py-2.5 bg-eva-orange hover:opacity-90 text-white text-xs font-mono uppercase tracking-[1px] transition-opacity"
          >
            Connect GitHub
          </a>
        </div>
      </div>
    )
  }

  if (showRepoSelect) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-eva-black text-primary-100">
        <div className="border border-[rgba(255,255,255,0.12)] bg-eva-white p-8 max-w-sm w-full space-y-4">
          <div className="text-xs font-mono tracking-widest uppercase text-primary-400">Select Repository</div>
          <p className="text-[11px] font-mono text-primary-50">Choose which repository to manage. Skills will run via GitHub Actions on the selected repo.</p>
          <div className="space-y-1 max-h-72 overflow-y-auto">
            {availableRepos.map(r => (
              <button
                key={r}
                className="w-full text-left px-3 py-2.5 text-xs font-mono text-primary-200 hover:bg-[rgba(255,255,255,0.06)] border border-transparent hover:border-[rgba(255,255,255,0.1)] transition-colors"
                onClick={() => {
                  localStorage.setItem('gh_repo', r)
                  setRepo(r)
                  setShowRepoSelect(false)
                  setLoading(true)
                  fetchData()
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-eva-black text-primary-100 overflow-hidden">
      <VigilCursor />

      {toast && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 bg-eva-white border border-[rgba(255,255,255,0.12)] text-primary-100 px-5 py-2.5 text-xs font-mono tracking-wide shadow-xl animate-slide-in-up">
          {toast}
        </div>
      )}

      <TopNav
        view={view}
        setView={(v) => { setView(v); setSelectedSkill(null) }}
        selectedSkill={skill}
        runs={runs}
        repo={repo} availableRepos={availableRepos}
        onSwitchRepo={(r) => { localStorage.setItem('gh_repo', r); setRepo(r); fetchData() }}
        model={model} gateway={gateway}
        authStatus={authStatus} authLoading={authLoading}
        onSetupAuth={() => setupAuth()}
        onUpdateModel={updateModel}
        onShowImport={() => setShowImport(true)}
      />

      <main className="flex-1 overflow-hidden min-h-0 bg-grid flex flex-col">
        {view === 'hq' && (
          <SkillGrid
            skills={skills} runs={runs} busy={busy}
            enabledCount={enabledCount} workingCount={workingCount}
            repoEnabled={repoEnabled}
            onEnableRepo={enableRepo}
            onSelect={(name) => setSelectedSkill(name)}
            onToggle={toggleSkill}
            onRun={runSkill}
            onShowImport={() => setShowImport(true)}
          />
        )}
        {view === 'activity' && (
          <div className="flex-1 overflow-y-auto">
            <ActivityView
              runs={runs} outputs={outputs} feedLoading={feedLoading}
              onRefresh={() => { fetchData(); setFeedKey(k => k + 1) }}
            />
          </div>
        )}
        {view === 'analytics' && (
          <div className="flex-1 overflow-y-auto">
            <AnalyticsView
              analyticsData={analyticsData}
              onFetchAnalytics={() => { if (!analyticsData) apiFetch('/api/analytics').then(r => r.ok ? r.json() : null).then(d => { if (d) setAnalyticsData(d) }) }}
            />
          </div>
        )}
        {view === 'chains' && features.CHAINS && (
          <div className="flex-1 overflow-y-auto">
            <ChainsView runs={runs} availableSkills={skills.map(s => s.name)} onRunChain={runChain} chainBusy={chainBusy} />
          </div>
        )}
        {view === 'memory' && features.MEMORY && (
          <div className="flex-1 overflow-y-auto">
            <MemoryView />
          </div>
        )}
{view === 'contribute' && (
          <div className="flex-1 overflow-y-auto">
            <ContributeView />
          </div>
        )}
        {view === 'settings' && (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto p-[var(--space-lg)] space-y-[var(--space-xl)]">
              <SecretsPanel secrets={secrets} busy={busy} ghReady={ghReady} onSave={saveSecret} onDelete={deleteSecret} />
            </div>
          </div>
        )}
      </main>

      <StatusTicker runs={runs} />

      {selectedSkill && skill && (
        <SlideOver
          skill={skill} runs={runs} model={model} gateway={gateway} busy={busy}
          onClose={() => setSelectedSkill(null)}
          onToggle={toggleSkill} onRun={runSkill} onDelete={deleteSkill}
          onUpdateSchedule={updateSchedule} onUpdateVar={updateVar} onUpdateModel={updateSkillModel}
          onViewRun={() => {}}
        />
      )}

      {showImport && <ImportModal onClose={() => setShowImport(false)} onImport={importSkill} />}
      {showAuthModal && <AuthModal loading={authLoading} onClose={() => setShowAuthModal(false)} onAuth={(key) => setupAuth(key)} />}

      {features.DISPATCH && <FloatingDispatch skills={skills} busy={busy} onRun={runSkill} />}

      {features.KEYBOARD && (
        <KeyboardShortcuts
          skills={sortedSkillNames}
          selectedSkill={selectedSkill}
          skillEnabled={skill?.enabled ?? false}
          onSelectSkill={(name) => { setSelectedSkill(name) }}
          onToggle={() => { if (skill) toggleSkill(skill.name, !skill.enabled) }}
          onRun={() => { if (skill) runSkill(skill.name, skill.var, skill.model) }}
        />
      )}
    </div>
  )
}
