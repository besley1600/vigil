---
name: Search Skill
description: Search the open agent skills ecosystem for skills that fill a real gap, evaluate them against quality criteria, and install promising ones via the native add-skill path
var: ""
tags: [dev]
---

> **${var}** — Optional search hint or gap description (e.g. `"email digest"`, `"on-chain alerts"`). If empty, derives gaps from `memory/MEMORY.md` and recent skill run history.

Today is ${today}. Read `memory/MEMORY.md` for current goals, active topics, and any noted skill gaps.
Read `memory/issues/INDEX.md` if it exists — open issues may hint at skills that would solve them.

## Overview

Searches GitHub for repos tagged `topic:vigil-skill` or containing "vigil skills" in their description. Evaluates candidates against a quality rubric. Installs skills that score above threshold and fill a real gap. Reports what was found and installed.

---

## Steps

### 1. Identify current gaps

Build the `GAPS` list from two sources:

**From MEMORY.md:** read any section mentioning skill gaps, missing capabilities, or "would be useful." Extract as 2–5 word phrases.

**From `${var}`:** if set, add it to GAPS as-is.

**From installed skills (self-assessment):** List the current skill directories under `skills/`. Note any categories with thin coverage:
- If no email/RSS/newsletter ingestion skill exists, add "email digest"
- If no external service monitoring skill exists for a tracked vertical, note it
- If MEMORY.md has active research topics with no dedicated fetch skill, note them

If `GAPS` ends up empty, use the default: look for any high-quality skill in the top search results.

### 2. Search GitHub for skill repos

Run searches via WebFetch on the GitHub API:

```
WebFetch: https://api.github.com/search/repositories?q=topic:vigil-skill&sort=stars&order=desc&per_page=30
```

Also search by description:
```
WebFetch: https://api.github.com/search/repositories?q=vigil+skills+in:description&sort=updated&order=desc&per_page=30
```

Also search by README content:
```
WebFetch: https://api.github.com/search/repositories?q=vigil+SKILL.md+in:readme&sort=stars&order=desc&per_page=20
```

Deduplicate by `full_name` (owner/repo). Collect up to 50 unique candidates.

### 3. Evaluate candidates

For each candidate repo, fetch its README and/or SKILL.md(s):

```
WebFetch: https://raw.githubusercontent.com/${owner}/${repo}/main/README.md
WebFetch: https://raw.githubusercontent.com/${owner}/${repo}/main/skills/*/SKILL.md  (browse skills/ dir if present)
```

Also note from the search API response:
- `stargazers_count` — star count
- `pushed_at` — last commit date
- `description` — repo description

Score each skill on the **quality rubric**:

| Criterion | Points |
|-----------|--------|
| Star count ≥ 10 | +3 |
| Star count ≥ 50 | +2 (additive) |
| Last commit within 90 days | +3 |
| Last commit within 30 days | +2 (additive) |
| SKILL.md exists and has `## Sandbox note` section | +3 |
| SKILL.md has numbered steps (not just prose) | +2 |
| SKILL.md has YAML frontmatter with `name`, `description`, `tags` | +2 |
| Fills a gap in current GAPS list | +5 |
| No obvious security red flags (no `curl | bash`, no `rm -rf`, no external IP exfiltration) | +3 (deduct 10 if fails) |
| License is open-source (MIT, Apache, UNLICENSED) | +1 |

**Minimum threshold to install: score ≥ 12.**

Disqualify if:
- SKILL.md is entirely absent or is a stub (< 20 lines)
- The skill contains instructions to modify `vigil.yml` directly
- The skill fetches or writes to paths outside the repo
- Last commit is older than 1 year

### 4. Select skills to install

From candidates above threshold, select up to 3 to install per run. Prioritize:
1. Highest gap-fill score (fills a GAPS item)
2. Then by total quality score

If zero candidates pass the threshold, log and stop:
```
### search-skill
- No skills above threshold found (${total_evaluated} evaluated)
```
Notify with the finding. Stop.

### 5. Install selected skills

For each selected skill, use the native add-skill path:

```bash
./add-skill ${owner}/${repo} ${skill_name}
```

If `./add-skill` does not exist or is not executable, fall back to:
```bash
gh repo clone ${owner}/${repo} /tmp/skill-source-${skill_name}
# Then copy the skill directory:
cp -r /tmp/skill-source-${skill_name}/skills/${skill_name} skills/${skill_name}/
```

After installation, verify the SKILL.md exists at `skills/${skill_name}/SKILL.md`. If not, log as install failure and skip.

### 6. Write report

Write to `articles/search-skill-${today}.md`:

```markdown
# Skill Search Report — ${today}

**Gaps identified:** ${gaps_list}
**Repos evaluated:** ${total_evaluated}
**Candidates above threshold:** ${above_threshold}
**Installed:** ${installed_count}

---

## Installed Skills

### ${skill_name}
- **Repo:** [${owner}/${repo}](https://github.com/${owner}/${repo})
- **Stars:** ${stars} | **Last commit:** ${last_commit_date}
- **Quality score:** ${score}/25
- **Gap filled:** ${gap_filled or "general enhancement"}
- **Description:** ${skill_description}

---

## Evaluated but not installed

| Skill | Repo | Score | Reason skipped |
|-------|------|-------|----------------|
| ${name} | ${owner}/${repo} | ${score} | Below threshold / disqualified |
...

## Gaps still open
${remaining_gaps or "none"}
```

### 7. Log and notify

Append to `memory/logs/${today}.md`:
```
### search-skill
- Gaps: ${gaps_list}
- Evaluated: ${total_evaluated} repos
- Installed: ${installed_count} (${installed_names})
- Report: articles/search-skill-${today}.md
```

```
./notify "*Search Skill — ${today}*

${installed_count} skill(s) installed | ${total_evaluated} repos evaluated

$(if installed > 0):
Installed:
$(for each: "- ${skill_name} from ${owner}/${repo} (score: ${score})")

$(if gaps_remaining > 0): Gaps still open: ${remaining_gaps}

Report: articles/search-skill-${today}.md"
```

If nothing was installed:
```
./notify "*Search Skill — ${today}* — ${total_evaluated} repos evaluated, none met threshold. Gaps open: ${gaps_list}"
```

---

## Required secrets

None — GitHub search API is public. The `gh` CLI handles auth for any repo operations.

---

## Sandbox note

GitHub Search API is public and accessible via WebFetch without auth. Raw file fetches from `raw.githubusercontent.com` are also public. The `./add-skill` script or `gh repo clone` handles authentication if needed. No curl with env-var headers required.

## Constraints

- Never install a skill that fails the security check (no `curl | bash`, no exfiltration patterns).
- Never install more than 3 skills per run — review is needed.
- Never modify `vigil.yml` — only copy skill directories. The operator adds skills to the schedule manually.
- Security check is mandatory — a low-quality skill that passes the threshold still gets disqualified if it has red flags.
