# Quick Start Guide

Get Vigil running in minutes.

## 1. Clone and Install

```bash
git clone <repo-url>
cd vigil
npm install

cd dashboard && npm install
cd ../electron && npm install
```

## 2. Build and Run

```bash
cd dashboard
npm run build

cd ../electron
npm run dev
```

## 3. Enable Skills

Open the dashboard at `http://localhost:5555`, authenticate with your GitHub token, then toggle on the skills you want. Changes sync to your repo and GitHub Actions handles execution.

```bash
# Browse available skills
./add-skill besley1600/vigil --list

# Install a community skill
./add-skill besley1600/vigil hacker-news-digest
```

---

## For Production Build

```bash
npm run build:mac     # macOS DMG
npm run build:win     # Windows installer
npm run build:linux   # Linux AppImage
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Dashboard won't start | Check `npm install` ran in both `dashboard/` and `electron/` |
| Agent not executing | Verify `ANTHROPIC_API_KEY` is set in repo secrets |
| Skills not running | Verify `ANTHROPIC_API_KEY` is set in repo secrets and skills are enabled in `vigil.yml` |

---

## Documentation

- **Contributing skills**: [docs/skill-economy.md](docs/skill-economy.md)
- **Electron app**: [electron/README.md](electron/README.md)
- **Skills catalog**: `./add-skill besley1600/vigil --list`
