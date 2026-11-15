# Proposed portfolio CI/CD

Plan only. No Actions workflows, branch rules, environment protections or Pages
deployment settings have been activated. Review this after the redesign direction
is approved. Keep the current production release until the release gate is ready.

## 1. Clean and establish a baseline

Remove the known malicious setup files from remote main through a dedicated
reviewed PR. Preserve the pre-redesign visual rollback tag, but never restore its
unsafe tooling. Revoke the migration telemetry credential separately. Check
repository access, existing integrations, Actions permissions and Pages settings.

## 2. Develop PR checks

Run on pull_request targeting develop and main. Use read-only permissions,
short-lived jobs, timeouts and concurrency cancellation for superseded commits.
Do not use pull_request_target to execute PR code; no secrets in PR tests.
Pin external actions to reviewed full commit SHAs and tools to lockfile versions.

Required jobs:

- Static checks: node scripts/check-site.cjs; HTML/JSON-LD validity, local links,
  publication feeds and obvious sensitive/unsafe files. Don't execute repo hooks.
- Browser checks: mobile/desktop layout, keyboard, disclosures, menu focus,
  reduced motion and no-JavaScript behavior. axe checks plus documented manual
  accessibility review; browser automation does not certify WCAG compliance.
- Lighthouse: homepage and changed representative pages; three mobile runs and
  desktop, recorded conditions and median. Initial budgets: Performance >=90,
  other categories 100; warn/investigate >5-point performance regression. Recheck
  CI baselines because Windows localhost results won't match runners exactly.
- Security: secret scanning, reviewed dependency vulnerability checks and workflow
  linting. Add CodeQL if meaningful supported application JS scope warrants it;
  don't claim an empty scan protects a static site. Triage findings explicitly.
- Artifacts: HTML/JSON Lighthouse reports and screenshots, short retention (7 days),
  no private transcripts or credentials. Docs-only PRs skip browser jobs while
  stable required-check job names still report success/N/A with an explanation.

Record content freshness, typography/contrast, privacy, real claim evidence and
manual review in the PR template; these cannot all be honestly automated.

## 3. Main approval and deployment

Require a separate develop -> main PR, successful checks, resolved conversations,
no force pushes/deletions, and no routine administrator bypass. Check that the
release head is develop. Preserve feature branches after merge.

GitHub doesn't allow PR authors to approve their own PRs. Current CLI operations
use yogeshwaran-c, the owner. To require the owner's actual PR approval, release
PRs need a distinct narrowly scoped automation identity (or another author), with
the owner as reviewer. Do not configure an impossible self-approval requirement.

As a deployment gate, configure a production environment with the owner as
required reviewer and main as the allowed deployment branch. Explicitly decide
self-review/bypass settings based on who initiates the run; verify the gate in a
dry run. An environment approval is separate from a PR review.

Switch Pages from legacy branch publication to GitHub Actions only after the
protected environment works. Build a public-site allowlist artifact (HTML, CSS,
fonts with licenses, blog, resume, OG assets, CNAME, robots, sitemap, RSS and
llms.txt); exclude internal docs, local folders, security notes and credentials.
Grant pages:write and id-token:write only to the protected deployment job, using
GitHub's Pages actions. Do not deploy from a PR event or a feature branch.

After the approved release: dated tag/release, Pages smoke checks and production
performance check. Test the rollback procedure in docs/REDESIGN_ROLLBACK.md.

## 4. Restore using the same pipeline

Make rollback a supported action in the trusted deployment workflow, using the
same production environment, owner approval, deployment concurrency and smoke
checks. Never bypass protections with a direct manual upload.

- Before the first redesign release, capture the public-site-only baseline from
  v2026.11.15. Exclude malicious hooks and internal configuration. Store a release
  manifest with source commit, artifact digest and packaging workflow revision.
- Retain versioned public deployment bundles with releases, separately from the
  7-day disposable test reports. Don't rely solely on expiring Actions artifacts.
- An emergency restore accepts a published allowlisted release identifier, verifies
  artifact identity/digest and presents the target commit for owner approval.
  Reuse the archived public bundle; do not execute code/hooks from an old ref or
  interpolate an arbitrary ref into a privileged shell command.
- If a bundle is missing, rebuild public files with current trusted packaging and
  security rules, validate them, and require approval. Do not claim byte-identical
  recovery when external resources or packaging have changed.
- Serialize release and restore deployments together, so an older waiting release
  cannot silently overwrite a restore. Explicitly cancel superseded pending runs.
- A redeploy restores production only; repository main is unchanged. Follow it
  with the revert PR through develop -> main to reconcile source and production.
- The normal durable rollback is the revert PR itself: it runs quality/security
  CI and the same approved production deployment. Record both restore and follow-up
  SHAs, verify the intended site and publish new rollback release notes.

## Acceptance before enabling

Demonstrate a failing fixture blocks the required check, a clean PR passes,
an unapproved deployment waits, only the owner can approve the configured gate,
and an approved main release deploys the intended artifact. Remove test fixtures
and record the exact rules/action revisions. Never use a production release as
the first test of approval enforcement.

References:
- [GitHub PR reviews](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/about-pull-request-reviews)
- [Deployment environments](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments)
