# Changelog — Week of 2026-05-20

*Window: 2026-05-13 → 2026-05-20 · Sources: besley1600/vigil=ok*

## besley1600/vigil

> **Highlights:** Major milestone: Vigil transitions from open-source MIT to proprietary licensing, launches native Electron desktop app with feature tiers, and debuts Vigil v2 dashboard with chains orchestration, alert center, and memory/brain views. This is a foundational release for commercial deployment.

### ⚠️ Breaking

- License changed from MIT to proprietary/commercial — use restrictions now apply. ([c708035](https://github.com/besley1600/vigil/commit/c708035942be482046bdb0f9f3926b3af3087a5c))

### Added

- **Vigil v2 Dashboard**: Complete redesign with chain orchestration UI, alert center, memory/brain views, quality/cost monitoring, floating dispatch panel, and keyboard-first navigation. ([e11fa39](https://github.com/besley1600/vigil/commit/e11fa398f1868f1763a5cb73c94eb7d143239a05))
- **Electron Desktop App**: Native macOS/Windows/Linux wrapper with system tray, auto-updater, loading/setup screens, and DMG/NSIS/AppImage builds. ([c5837ce](https://github.com/besley1600/vigil/commit/c5837ce01772f3511df8b20604988928c8c10a91))
- **Tiered Feature System**: Free/Pro/Enterprise tiers control feature access (free=keyboard+dispatch, pro=+alerts+quality+costs, enterprise=all). ([c5837ce](https://github.com/besley1600/vigil/commit/c5837ce01772f3511df8b20604988928c8c10a91))
- **Gateway Fee Ledger**: Track skill run fees (default 8% of API cost) per deployment. ([c5837ce](https://github.com/besley1600/vigil/commit/c5837ce01772f3511df8b20604988928c8c10a91))
- **Electron UI Modernization**: Gradient design, glassmorphism effects, branded icons, and Vigil logo across all app screens. ([10a6cf5](https://github.com/besley1600/vigil/commit/10a6cf56f24b1c7b5a4f29ecab8d9064e96ea3f5))
- **Test Coverage**: Add tests for Electron, gateway API, and feature tier system. ([a3bccb3](https://github.com/besley1600/vigil/commit/a3bccb31c4fbc180dfc891766875f0e40ba0c77d))

### Changed

- **Project Rebrand**: Complete rebrand across entire codebase (workflows, package names, docs, scripts, commit history). ([fea3ce2](https://github.com/besley1600/vigil/commit/fea3ce26052edcf105f32712d9e52a83d47b7d8e))
- **README Redesign**: Rewritten as sales pitch emphasizing automation, use cases, and self-healing; added testimonials and cost transparency. ([e58074a](https://github.com/besley1600/vigil/commit/e58074ace5d223e2056f071b28469cc4e474cd32))

### Fixed

- Ethereum provider now exposed through preload for wagmi in Electron (contextIsolation workaround). ([7020a1d](https://github.com/besley1600/vigil/commit/7020a1dd2ac6767e18ed0d59048ad1d674a08f48))
- Wallet provider detection and error handling — shows helpful status when MetaMask or other providers unavailable. ([27f65ca](https://github.com/besley1600/vigil/commit/27f65ca7bca64d35c5d05f7266323084cf76cc9a))
- External links (GitHub, etc) now open in system browser instead of app webview. ([cf91dc7](https://github.com/besley1600/vigil/commit/cf91dc7b3b1a31c2fe681b945888db7e8a390456))
- Mouse interaction and port conflict handling — Electron app no longer blocks interactions and gracefully handles port reuse. ([de20221](https://github.com/besley1600/vigil/commit/de2022122f78b430d3188d136b4a874796653ee9))
- Native OS window frame with standard controls (traffic lights, minimize, maximize, close) on macOS. ([12ecc2e](https://github.com/besley1600/vigil/commit/12ecc2e5e673517fc96b88651c4a54bfac4ff7ee))
- Vigil logo now displays instead of emoji on app screens. ([ec7a732](https://github.com/besley1600/vigil/commit/ec7a7328cd1c246972e057cd5ea7c6c53e97fcb9))

*Internal: 16 commits hidden (refactor/CI/chore). Electron window-frame iteration (10+ commits) collapsed.*

---

## Summary

**Major release week** — three flagship features ship simultaneously:

1. **Commercial launch** (license change) signals intent to monetize
2. **Desktop app** enables native deployment and offline use
3. **v2 Dashboard** and **tiered features** unlock freemium model

The desktop app solves a long-standing gap (Vigil as CLI/web only), while v2 dashboard consolidates years of feature growth into a unified UX. Feature tiers let free users experiment with core dispatch/keyboard, while pro/enterprise unlock observability (costs, quality, chains). Gateway fee ledger enables transparent consumption tracking for future billing.

One caveat: heavy iteration on window chrome/titlebar (10+ commits in 2 hours) suggests UX polish was tight against the deadline; monitor for window management issues across platforms in early adopter reports.
