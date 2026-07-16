# CLAUDE.md — Project Conventions

## Branching & Merging — git-flow

**Three branch layers. Every change goes through a Pull Request. Never commit or merge directly on `main` or `develop`.**

- **`main`** — production. Only receives merges from `develop` via release PR.
- **`develop`** — integration. All feature PRs target this branch.
- **`feature/<slug>`** — work branches. Cut from `develop`, PR'd back into `develop`.

### Feature work flow

```bash
git checkout develop && git pull origin develop
git checkout -b feature/<slug>
# make changes, commit
git push -u origin feature/<slug>
gh pr create --base develop --title "..." --body "..."
gh pr merge <N> --merge
```

The `--base develop` flag is required. `gh pr create` defaults to `main` — don't let it.

**Never use `--delete-branch` on `gh pr merge`.** Feature branches stay around on origin after merge — they're cheap, they preserve history, and they're useful for cherry-picking or revisiting a prior change set.

### Release flow (periodic, when ready to ship to production)

```bash
gh pr create --base main --head develop --title "Release: ..." --body "..."
gh pr merge <N> --merge
```

**Only release user-facing changes to `main`.** Internal docs (`docs/**`, `CLAUDE.md`, `README.md`, the blog guide docs) don't need to reach `main` — they're not served to visitors. Doc-only PRs stop at `develop`. Bundle them into the next real release PR if you want them on `main` eventually, but don't cut a standalone release for docs.

### Branch naming

- `feature/portfolio-redesign-v<N>` for continued redesign arcs
- `feature/<descriptive-slug>` otherwise (e.g. `feature/blog-vscode-debug-console`)

### Why this matters

- `main` stays clean — only release-worthy merge commits
- `develop` accumulates day-to-day changes so they integrate together
- Every change has a PR artifact on GitHub (reviewable, linkable, rollbackable)

## Commits

- Never use `Co-Authored-By: Claude` or any AI attribution in commit messages. The commits are authored by the user.
- Write commit messages that describe the *why*, not just the *what*.
- Multi-line messages with a summary line + bullet points explaining the reasoning.

## Git Identity

- Author: `Yogeshwaran C`
- Email: `ycyogesh183@gmail.com` (local repo config)
- The secondary GitHub account uses SSH host alias `github-secondary`.

## Content Conventions

- The public-facing email is `yogeshwaran.chandrakasan@gmail.com` — use it in all user-facing places (portfolio, resume, README).
- Degree on resume: `B.Tech in Information Technology` / `Bachelor of Technology in Information Technology`.
- Experience start date: `Jul 2022` (not Oct 2022).
- Current role phrasing: "nearly 4 years of experience".
- Open source contribution counts (aggregate '**N**+ merged PRs' and per-repo counts) live in **eight** places — all eight must update together when counts change. Run `grep -R "<current-N>" .` before committing to catch any that this list forgets.
  1. `README.md` — 'N+ merged PRs' aggregate (2 places: bio bullet + Open Source Contributions intro), badge table (per-repo counts, ordered descending by merged count)
  2. `index.html` — `.oss-intro` copy ('N+ merged pull requests'), `.oss-grid` cards (per-repo counts, same descending order), `<meta property="og:image:alt">` tagline
  3. `index.html` — **animated hero stat counter**: `<span data-count="N">0</span>` inside the 'Merged PRs' stat tile. Easy to miss because it looks like a rendered `0`. It's the number the tile counts up to on page load.
  4. `index.html` — **Maruthu testimonial quote** (`<p class="testimonial-quote">`). Precedent (commit `512be38`, May 2026) is that this number gets refreshed during count sweeps.
  5. `resume/YOGESHWARAN_C_Resume.md` — aggregate + per-repo bullet list, ordered descending
  6. `resume/YOGESHWARAN_C_Resume.html` — same, in `<ul class="bullets">` under Open Source Contributions
  7. `og-template.html` — social preview: tagline + big stat block (2 spots). After editing, regenerate `og-image.png` at 1200×630: `npx playwright screenshot --viewport-size=1200,630 file://<abs-path-to-og-template.html> og-image.png`
  8. `linkedin-banner-template.html` — profile banner: tagline + big stat block (2 spots). After editing, regenerate `linkedin-banner.png` at 1584×396: `npx playwright screenshot --viewport-size=1584,396 file://<abs-path-to-linkedin-banner-template.html> linkedin-banner.png`
- After regenerating the resume PDF (see below), the `?v=N` cache-bust on the three resume links in `index.html` must also bump. Not a count concern but pairs with the same refresh flow.

## Theme (v3+)

- Primary dark bg: `#07080b` (v5 stats) / `#08090c` (v3 hero base)
- Accent cyan: `#00e5c8`
- Warm peach secondary: `#ff9e6d`
- Fonts: Outfit (display) + DM Sans (body) + JetBrains Mono (mono)

## Resume Files

- HTML source: `resume/YOGESHWARAN_C_Resume.html`
- Markdown source: `resume/YOGESHWARAN_C_Resume.md`
- PDF: regenerate with `npx playwright pdf --paper-format A4 "file:///<abs-path-to-html>" resume/YOGESHWARAN_C_Resume.pdf`
- After regenerating the PDF, bump the cache-bust query param (`?v=N`) on all resume links in `index.html` so browsers fetch the new file.

## Blog

- Posts live in `blog/<YYYY-MM>-<slug>.md` with front-matter (title, date, tags, canonical, pr).
- Canonical URL is `yogeshwaran.com/blog/<slug>`; cross-post to Hashnode/Dev.to with canonical pointing back.
- See `docs/BLOG_GUIDE.md` for the monthly writing system, `docs/BLOG_DISCIPLINE.md` for sustainable-blogging rules, and `docs/BLOG_PUBLISHING.md` for the canonical URL + cross-posting runbook.
