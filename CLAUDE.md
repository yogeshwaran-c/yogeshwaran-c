# CLAUDE.md — Project Conventions

## Branching & Merging

**Always create a feature branch before making changes. Never commit or merge directly on `main`. Every merge goes through a GitHub Pull Request.**

Required flow:

1. `git checkout -b feature/<slug>`
2. Make changes, commit
3. `git push origin feature/<slug>`
4. `gh pr create --title "..." --body "..."` — open a PR to `main`
5. `gh pr merge <number> --merge` — merge via the PR (NOT `git merge` on the command line)

Branch naming: `feature/<descriptive-slug>` or `feature/portfolio-redesign-v<N>` for continued redesign work.

Why: every change has a reviewable PR artifact on GitHub, `main`'s history is tied to PR numbers, rollback of a logical unit is trivial.

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
