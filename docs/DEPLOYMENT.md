# Minimal portfolio CI/CD

Two workflows, no website build framework or runtime packages. Lighthouse and
playwright-core are development-only tools pinned in package-lock.json. The
browser driver uses installed Chrome, without a downloaded browser suite. The security guard is
deliberately narrow; GitHub native secret scanning/push protection supplement it.

## Before deployment

Portfolio quality runs for PRs into develop/main, including updates to an open PR.
A branch push without an open PR and a merge into develop do not trigger a
separate duplicate quality run. The same
workflow is called again by production deployment, not assumed to have run earlier.
It checks page structure/local links, tracked-file safety, action SHA pins,
positive/negative guard fixtures, dependency audit, browser smoke tests and Lighthouse budgets. It then
packages public files and checks their digests and local links. Reports last 7 days.
Manual content truth, visual review and full WCAG testing remain in the PR checklist.

Internal docs-only PRs skip browser/Lighthouse while static/security/package checks
still run and the required check remains present. Rendered content, dependency and
workflow changes run the full suite. Pre-deployment calls explicitly force full
checks even for a docs-only release. Browser reports include desktop/mobile screenshots.
Sunday maintenance runs static/dependency checks and external-link review. Confirmed
404/410 responses fail that scheduled run; timeouts/403/429 are recorded for human
review. Scheduled failures notify through the owner's GitHub notification settings;
they do not retroactively withdraw an already deployed site.

Lighthouse budgets: mobile median of 3 runs >=90, desktop >=90, other automated
categories 100 on home/latest post. Runner variability is reported, not hidden.

## Release and owner approval

Feature -> develop PR, then develop -> main release PR. Preserve branches. Main
requires the successful quality check; release direction is checked. A separate
main-review rule requires one approval and code-owner review from yogeshwaran-c.
On this personal-account repository, the owner/admin has a PR-only exception to
that review rule, so the owner can merge their own PR without self-review. Other
collaborators must obtain owner approval. Stale reviews are dismissed on new pushes.
The exception does not apply to the separate required-CI, PR, force-push or deletion
rules. Everyone still uses a PR and passing checks. Review this role mapping if
the repository is ever transferred to an organization.

After main changes, the deploy workflow repeats CI, packages an allowlist of public
assets, then waits for yogeshwaran-c in the github-pages environment before it can
deploy. Self-review must be allowed because this is a single-owner repository;
that permits the owner to click approval, not automatic approval by workflows.
Agents must not approve that job on the owner's behalf without explicit consent.

Packaging excludes .github, assistant configuration, internal docs, scripts,
node_modules, templates and unpublished Markdown drafts. Historical files are
read with git show, never checked out or executed. deployment.json records the
source commit and per-file SHA-256 digests in the public deployment.

## Restore in the same setup

Actions -> Publish or restore portfolio -> Run workflow, choose branch main and
enter a published dated release tag, e.g. v2026.11.15 for the old appearance or
v2026.11.15-2 for redesign v6. Leave release empty to publish current main.

The workflow validates the tag's format, confirms a non-draft GitHub Release,
requires its commit to be an ancestor of trusted main, and packages only the public
blobs using current trusted code. It validates the payload and uses the same owner
approval, deployment concurrency and live smoke check. An invalid tag fails closed.
Post-deployment verification checks deployment.json against the approved source
commit, then confirms the homepage and resume respond; it does not accept a 200
response from an older cached deployment as success.

This minimal restoration rebuilds public files from preserved Git history; it does
not require stored release bundles or execute old setup scripts. External fonts/CDN
scripts in old releases may change independently, so it is not a promise of a fully
byte-identical network experience. The historical main landmark/accessibility debt
is not silently changed in a visual restore; the owner approves the chosen baseline.

Current-main CI remains a prerequisite for restore too. If current-main CI is broken,
fix it through a PR rather than bypassing the gate. A restore changes the deployed
site only: follow with a revert PR through develop/main so source and production
agree. See REDESIGN_ROLLBACK.md. New pending deployments cancel older runs, so review
the target source in the run summary before approval.

## Local checks

Use Node 26 and Chrome:

```text
npm ci --ignore-scripts
npm run check
npm audit --audit-level=high
npm run package:site
node scripts/check-public.cjs
npm run test:browser
npm run audit:lighthouse
```

Packaging requires a fresh dist/public output. A historical test can use a separate
output name: node scripts/package-site.cjs v2026.11.15 public-rollback-check, then
node scripts/check-public.cjs public-rollback-check.

Native GitHub protections/settings must be verified separately from workflow code.
Do not claim the gate is active merely because this file exists.

Verified repository configuration before this release: required Quality and security
check and PRs on develop/main; deletion/force-push blocked; release tags protected;
Actions token read-only by default and workflow review approval disabled. Native
secret scanning/push protection are enabled. github-pages requires yogeshwaran-c
approval, accepts main only and disallows administrator bypass. Pages source is
workflow. The existing site remains served until an approved Actions deployment.

Activation verified 2026-11-16: run 43748291450 completed after owner approval.
The production source matched 97bb008a84a7287bf9e9d422ef17f57d9d28d3d9, and the
homepage/resume smoke checks passed. The waiting-for-first-approval state above
describes setup history, not a currently pending deployment. PROJECT_STATUS.md
records the dated live snapshot.

Main's separate owner-review rule and CODEOWNERS provide review protection for
collaborators while keeping the owner exemption. Develop retains the existing
PR/check requirements without a redundant self-review requirement.

On Windows PowerShell with script execution disabled, use npm.cmd instead of npm;
do not relax execution policy just to run npm. Open a fresh terminal after tools
are installed so their PATH entries are available.
