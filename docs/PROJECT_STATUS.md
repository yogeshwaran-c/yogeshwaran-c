# Verified project state

Snapshot verified 2026-11-16. Recheck live data and repository settings before
relying on it for a later release; this is a dated record, not a live monitor.

## Laptop and assistant context

- Node.js, npm, GitHub CLI and Git author identity configured. SSH host
  github-secondary authenticates as yogeshwaran-c with a passphrase-protected key.
  Windows SSH Agent starts automatically; GitHub CLI uses Windows keyring.
- Reviewed Claude writing guidance and project memory imported on this laptop.
  No old credentials, corporate telemetry settings or executable agents restored.
- Codex reads AGENTS.md -> CLAUDE.md and ASSISTANT_CONTEXT.md. Keep confirmed
  preferences in tracked docs; Claude project memory points back to these files.
- Blog target is the 16th in Asia/Kolkata. There is no automatic blog publication.
  Weekly CI maintenance is separate from the writing cadence.

## Production and releases

- Redesign v6 shipped through feature PR #79 and release PR #80. CI/CD and active
  branch security cleanup shipped through #81, #83 and release PR #82.
- Owner approved deployment run
  [43748291450](https://github.com/yogeshwaran-c/yogeshwaran-c/actions/runs/43748291450).
  It completed successfully, including source-identity/homepage/resume verification.
- Live deployment.json confirms source
  97bb008a84a7287bf9e9d422ef17f57d9d28d3d9 (release input HEAD).
- Tags preserved: v2026.11.15 = pre-redesign appearance;
  v2026.11.15-2 = redesign v6; v2026.11.16 = CI/CD setup with the same public
  redesign files. All 43 public file digests matched before the CI/CD release.

## Rules and workflows

- Feature -> develop PR -> separate develop -> main PR. Never delete feature
  branches after merge; release tags are protected against rewriting/deletion.
- Quality runs on PR creation/updates, not standalone branch pushes or duplicate
  develop-push runs. Internal docs skip browser/Lighthouse; production forces full
  checks. Weekly maintenance reviews external links and dependencies.
- Main requires owner/code-owner approval for collaborators. On this personal
  repository, the owner/Admin has a PR-only exception to the review rule.
  Required CI and PR flow are separate rules without that exception.
- Deploy and restore both require owner approval in github-pages, main only,
  administrator bypass disabled. Do not approve production for the user without
  explicit authorization. No separate release bot is installed.
- See DEPLOYMENT.md for checks and the exact restore control. Restoring a release
  changes the deployed site, not Git history or main source.
- Restore packaging validated locally for the old tag, excluding historical
  tooling. No production workflow_dispatch restore was observed as of this check;
  do not describe it as end-to-end production-tested.

## Content and remaining work

- Modules Built stat replaced with 7 published articles. Keep that count in sync
  after actual HTML publication; the November Markdown post remains an outline.
- OSS evidence on 2026-11-15: 237 merged PRs across the stated external-repository
  scope. Public conservative total remains 230+; Swagger UI corrected to 3.
- Resume wording updated to since 2022; PDF regenerated and links use v13.
- All five known malicious startup files are absent from active main and develop.
  Historical Git objects/tags retain them; never check out/execute old hooks or
  restore the entire historical repository. Public deploy/restore excludes them.
- Revocation of the migration telemetry credential and old-laptop incident review
  remain unverified owner actions. Case-study evidence, full manual WCAG review,
  PDF visual review and Search Console/Bing account state are not newly certified.
