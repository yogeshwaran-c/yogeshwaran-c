# CI/CD validation evidence

Feature PR: #81 (`feature/portfolio-cicd` -> develop). This is deployment tooling
and active-branch security remediation; the public portfolio appearance is unchanged.

- Local static checks: 10 published HTML pages, local href/src/anchors, JSON-LD,
  sitemap/RSS/listing consistency. Passed.
- Browser smoke: Chrome on 1440/768/390/320px; no clipping/overflow, full-height
  hero, keyboard disclosures, menu Escape/focus return, reduced motion, no-JS
  navigation/content, XML feed parsing, resume PDF and contact link. Passed.
- Local negative fixtures: known unsafe path, unpinned action, broken local link,
  bad/missing Lighthouse scores fail their respective guards. Passed.
- Change-scope fixtures: internal docs skip rendered audits; blog/dependency/
  workflow changes request them. Pre-deployment explicitly forces full audits.
- Dependency audit after adding the browser driver: zero reported vulnerabilities.
- Weekly external-link checker: 28 URLs checked, zero broken, zero needing review.
- GitHub expanded clean suite run 43745134296: passed all required steps.
- Controlled negative run 43745439221 at ec3cc1590f33ea9a65af4443e69131177d06f748:
  failed with `index.html: missing /ci-intentionally-missing-page.html`.
  GitHub showed PR #81 BLOCKED. Fixture removed before merge; never published.
- Restore packaging locally tested against v2026.11.15: 36 public files,
  digests/links verified; unsafe historical configuration excluded. Invalid ref
  rejected. Restoration is not claimed as an end-to-end production test yet.

Native repository configuration verified through GitHub API:

- Required PR + `Quality and security` check on main/develop; force push/deletion
  blocked; merge commits enabled, branch deletion after merge disabled.
- Release v* tags protected against deletion/rewriting.
- Default Actions token read-only; workflow PR review approval disabled.
- Native secret scanning and push protection enabled.
- github-pages requires yogeshwaran-c, main-only branch policy, admin bypass false.
  Self-review allowed intentionally for the single-owner deployment approval.
- Pages source set to workflow. Existing public site remains available.

Activation verified 2026-11-16: #81 and follow-up #83 merged into develop; release
#82 merged into main under the configured owner review exception after CI passed.
Run 43748291450 repeated full CI and packaging, visibly waited for the owner in
github-pages, then completed successfully after the user's approval. Live
deployment.json confirms source 97bb008a84a7287bf9e9d422ef17f57d9d28d3d9. The live
homepage/resume/source checks passed. No agent approved the production gate.

The main-review rule requires collaborator approval from the owner/code owner;
only the personal-repository owner/Admin can bypass the review rule through a PR.
The separate CI rule has no bypass actors. CODEOWNERS has no GitHub validation
errors. The review exception does not grant a CI exemption.

One later Lighthouse attempt (43747376651) failed its mobile median with a slow
CPU warning. Failure evidence remains available; a single bounded retry passed
without changing the >=90 budget. Public website files were unchanged.

Live restore is not claimed as end-to-end tested: no production workflow_dispatch
restore run was observed. Telemetry-credential revocation on the old migration and
old-laptop incident review remain outside what these checks can establish.
