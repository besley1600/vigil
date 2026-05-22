'use client'

import { useState } from 'react'
import type { Skill, Run } from '../lib/types'
import { MODELS, BANKR_EXTRA_MODELS } from '../lib/constants'
import { displayName } from '../lib/utils'
import { features } from '../lib/features'
import { AlertCenter } from './AlertCenter'

type View = 'hq' | 'activity' | 'analytics' | 'chains' | 'memory' | 'token' | 'contribute' | 'settings'

interface TopNavProps {
  view: View
  setView: (v: View) => void
  selectedSkill: Skill | null
  runs: Run[]
  repo: string
  model: string
  gateway: 'direct' | 'bankr'
  availableRepos?: string[]
  onSwitchRepo?: (repo: string) => void
  authStatus: { authenticated: boolean } | null
  authLoading: boolean
  pulling: boolean
  syncing: boolean
  hasChanges: boolean
  behind: number
  onSetupAuth: () => void
  onUpdateModel: (m: string) => void
  onShowImport: () => void
  onPull: () => void
  onSync: () => void
}

function buildTabs(chainsEnabled: boolean, memoryEnabled: boolean, tokenEnabled: boolean): { id: View; label: string; badge?: string }[] {
  const tabs: { id: View; label: string; badge?: string }[] = [
    { id: 'hq',        label: 'HQ' },
    { id: 'activity',  label: 'Activity' },
    { id: 'analytics', label: 'Analytics' },
  ]
  if (chainsEnabled) tabs.push({ id: 'chains', label: 'Chains' })
  if (memoryEnabled) tabs.push({ id: 'memory', label: 'Memory' })
  if (tokenEnabled)  tabs.push({ id: 'token',  label: 'Token' })
  tabs.push({ id: 'contribute', label: 'Contribute' })
  tabs.push({ id: 'settings', label: 'Settings' })
  return tabs
}

export function TopNav({
  view,
  setView,
  selectedSkill,
  runs,
  repo,
  model,
  gateway,
  availableRepos = [],
  onSwitchRepo,
  authStatus,
  authLoading,
  pulling,
  syncing,
  hasChanges,
  behind,
  onSetupAuth,
  onUpdateModel,
  onShowImport,
  onPull,
  onSync,
}: TopNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const modelOptions = gateway === 'bankr' ? [...MODELS, ...BANKR_EXTRA_MODELS] : MODELS
  const tabs = buildTabs(features.CHAINS, features.MEMORY, features.TOKEN)

  return (
    <header className="h-14 border-b border-[rgba(255,255,255,0.07)] bg-[#0E1022] flex items-center shrink-0 relative">
      {/* Left: logo + optional breadcrumb */}
      <div className="flex items-center gap-3 px-5 shrink-0 w-56">
        <svg width="13" height="13" viewBox="0 0 13 13" xmlns="http://www.w3.org/2000/svg" className="shrink-0 select-none" aria-hidden="true">
          <rect x="2.5" y="2.5" width="8" height="8" fill="none" stroke="#06B6D4" strokeWidth="1.3" transform="rotate(45 6.5 6.5)" style={{filter:'drop-shadow(0 0 3px rgba(6,182,212,0.7))'}}/>
          <circle cx="6.5" cy="6.5" r="1.2" fill="#ffffff"/>
        </svg>
        {selectedSkill ? (
          <span className="text-xs font-mono text-primary-70 tracking-wide">
            <span className="text-primary-40">HQ</span>
            <span className="text-primary-40 mx-1.5">›</span>
            <span className="text-primary-70">{displayName(selectedSkill.name)}</span>
          </span>
        ) : (
          <span className="font-display text-lg text-primary-100 leading-none">VIGIL</span>
        )}
      </div>

      {/* Center: nav tabs - hidden on mobile */}
      <nav className="hidden md:flex flex-1 items-center justify-center h-full gap-1">
        {tabs.map(tab => {
          const active = view === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={[
                'px-4 py-0 text-xs font-mono uppercase tracking-[1.5px] h-full flex items-center border-b-2 transition-colors',
                active
                  ? 'text-eva-orange border-eva-orange'
                  : 'text-primary-50 border-transparent hover:text-primary-70',
              ].join(' ')}
            >
              {tab.label}
              {tab.badge && (
                <span className="ml-1.5 text-[8px] font-mono px-1 py-px bg-eva-orange/20 text-eva-orange uppercase tracking-[1px] leading-none">
                  {tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Right: toolbar - hidden on mobile */}
      <div className="hidden md:flex items-center gap-2 px-5 shrink-0">
        {gateway === 'bankr' && (
          <span className="text-[10px] font-mono px-2 py-0.5 bg-eva-orange/15 text-eva-orange uppercase tracking-[1px]">
            BANKR
          </span>
        )}

        {authStatus && !authStatus.authenticated && (
          <button
            onClick={onSetupAuth}
            disabled={authLoading}
            className="bg-eva-orange text-white text-[10px] px-3 py-1.5 font-mono uppercase tracking-[1px] hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {authLoading ? '...' : 'Auth'}
          </button>
        )}

        <select
          value={model}
          onChange={(e) => onUpdateModel(e.target.value)}
          className="bg-eva-white text-primary-70 text-[10px] px-2 py-1.5 border border-[rgba(255,255,255,0.1)] outline-none cursor-pointer font-mono"
        >
          {modelOptions.map(m => (
            <option key={m.id} value={m.id}>{m.label}</option>
          ))}
        </select>

        <button
          onClick={onShowImport}
          className="bg-eva-orange text-white text-[10px] px-3 py-1.5 font-mono uppercase tracking-[1px] hover:opacity-90 transition-opacity"
        >
          + Install
        </button>

        {availableRepos.length > 1 && onSwitchRepo ? (
          <select
            value={repo}
            onChange={(e) => onSwitchRepo(e.target.value)}
            className="bg-eva-white text-primary-70 text-[10px] px-2 py-1.5 border border-[rgba(255,255,255,0.1)] outline-none cursor-pointer font-mono max-w-[160px]"
            title="Switch repository"
          >
            {availableRepos.map(r => (
              <option key={r} value={r}>{r.split('/')[1] ?? r}</option>
            ))}
          </select>
        ) : repo ? (
          <a
            href={`https://github.com/${repo}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-primary-50 font-mono border border-[rgba(255,255,255,0.1)] px-3 py-1.5 hover:border-eva-orange hover:text-eva-orange transition-colors"
          >
            {repo.split('/')[1] ?? 'GitHub'}
          </a>
        ) : null}

        <button
          onClick={onPull}
          disabled={pulling}
          className="relative text-[10px] font-mono text-primary-50 border border-[rgba(255,255,255,0.1)] px-3 py-1.5 hover:border-[rgba(255,255,255,0.25)] transition-colors disabled:opacity-50"
        >
          {behind > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-eva-orange" />
          )}
          {pulling ? '...' : 'Pull'}
        </button>

        <button
          onClick={onSync}
          disabled={syncing || !hasChanges}
          className="relative text-[10px] font-mono text-primary-50 border border-[rgba(255,255,255,0.1)] px-3 py-1.5 hover:border-[rgba(255,255,255,0.25)] transition-colors disabled:opacity-50"
        >
          {hasChanges && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-eva-green" />
          )}
          {syncing ? '...' : 'Push'}
        </button>

        {features.ALERTS && <AlertCenter runs={runs} />}
      </div>

      {/* Mobile: hamburger button - hidden on desktop */}
      <button
        className="md:hidden ml-auto mr-4 flex flex-col justify-center gap-1.5 p-1.5 hover:opacity-70 transition-opacity"
        onClick={() => setMobileMenuOpen(o => !o)}
        aria-label="Menu"
      >
        <span className="w-5 h-px bg-primary-70 transition-all" />
        <span className="w-5 h-px bg-primary-70 transition-all" />
        <span className="w-5 h-px bg-primary-70 transition-all" />
      </button>

      {/* Mobile: dropdown menu - hidden on desktop */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Dropdown panel */}
          <div className="md:hidden absolute top-14 left-0 right-0 bg-[#0E1022] border-b border-[rgba(255,255,255,0.07)] z-50 max-h-[calc(100vh-56px)] overflow-y-auto">
            {/* Navigation tabs */}
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setView(tab.id)
                  setMobileMenuOpen(false)
                }}
                className={`w-full px-5 py-3 text-xs font-mono uppercase tracking-[1.5px] text-left border-b border-[rgba(255,255,255,0.05)] transition-colors ${
                  view === tab.id
                    ? 'text-eva-orange bg-[rgba(99,102,241,0.08)]'
                    : 'text-primary-50 hover:text-primary-70'
                }`}
              >
                {tab.label}
              </button>
            ))}
            {/* Actions */}
            <div className="flex flex-col gap-2 px-4 py-3 border-t border-[rgba(255,255,255,0.05)]">
              {gateway === 'bankr' && (
                <span className="text-[10px] font-mono px-2 py-0.5 bg-eva-orange/15 text-eva-orange uppercase tracking-[1px]">
                  BANKR
                </span>
              )}
              <select
                value={model}
                onChange={(e) => onUpdateModel(e.target.value)}
                className="bg-eva-white text-primary-70 text-[10px] px-2 py-1.5 border border-[rgba(255,255,255,0.1)] outline-none cursor-pointer font-mono"
              >
                {modelOptions.map(m => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
              <button
                onClick={onShowImport}
                className="bg-eva-orange text-white text-[10px] px-3 py-1.5 font-mono uppercase tracking-[1px] hover:opacity-90 transition-opacity text-left"
              >
                + Install
              </button>
              {repo && (
                <a
                  href={`https://github.com/${repo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-primary-50 font-mono border border-[rgba(255,255,255,0.1)] px-3 py-1.5 hover:border-eva-orange hover:text-eva-orange transition-colors text-center"
                >
                  GitHub
                </a>
              )}
              <button
                onClick={onPull}
                disabled={pulling}
                className="relative text-[10px] font-mono text-primary-50 border border-[rgba(255,255,255,0.1)] px-3 py-1.5 hover:border-[rgba(255,255,255,0.25)] transition-colors disabled:opacity-50 text-left"
              >
                {behind > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-eva-orange" />
                )}
                {pulling ? '...' : 'Pull'}
              </button>
              <button
                onClick={onSync}
                disabled={syncing || !hasChanges}
                className="relative text-[10px] font-mono text-primary-50 border border-[rgba(255,255,255,0.1)] px-3 py-1.5 hover:border-[rgba(255,255,255,0.25)] transition-colors disabled:opacity-50 text-left"
              >
                {hasChanges && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-eva-green" />
                )}
                {syncing ? '...' : 'Push'}
              </button>
            </div>
          </div>
        </>
      )}
    </header>
  )
}
