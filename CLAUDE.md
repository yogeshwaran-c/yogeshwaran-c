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
gh pr merge <N> --merge --delete-branch
```

The `--base develop` flag is required. `gh pr create` defaults to `main` — don't let it.

### Release flow (periodic, when ready to ship to production)

```bash
gh pr create --base main --head develop --title "Release: ..." --body "..."
gh pr merge <N> --merge
```

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
- Open source contribution counts live in three places (README.md, index.html, resume/*) — all three must update together when counts change.

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
- See `BLOG_GUIDE.md` for the monthly writing system.
