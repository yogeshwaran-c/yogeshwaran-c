# Minimal portfolio CI/CD

Two workflows, no website build framework or runtime packages. Lighthouse is the
only development dependency, pinned in package-lock.json. The security guard is
deliberately narrow; GitHub native secret scanning/push protection supplement it.

## Before deployment

Portfolio quality runs for PRs into develop/main and pushes to develop. The same
workflow is called again by production deployment, not assumed to have run earlier.
It checks page structure/local links, tracked-file safety, action SHA pins,
positive/negative guard fixtures, dependency audit and Lighthouse budgets. It then
packages public files and checks their digests and local links. Reports last 7 days.
Manual content truth, visual review and full WCAG testing remain in the PR checklist.

Lighthouse budgets: mobile median of 3 runs >=90, desktop >=90, other automated
categories 100 on home/latest post. Runner variability is reported, not hidden.

## Release and owner approval

Feature -> develop PR, then develop -> main release PR. Preserve branches. Main
requires the successful quality check; release direction is checked. The owner
merges the release PR as approval to change main. Owner-authored PRs cannot also
receive an owner's native PR review, so a separate review count is not required.
Do not describe this as an enforced independent review.

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
npm run audit:lighthouse
```

Packaging requires a fresh dist/public output. A historical test can use a separate
output name: node scripts/package-site.cjs v2026.11.15 public-rollback-check, then
node scripts/check-public.cjs public-rollback-check.

Native GitHub protections/settings must be verified separately from workflow code.
Do not claim the gate is active merely because this file exists.
