# Redesign v6: release and rollback

Before-redesign production baseline verified 2026-11-15:

- Release tag: `v2026.11.15`
- Main commit: `4d7ec2334b5f40255de9c596eda429138292bb5f`
- GitHub Pages latest build: built at that same commit.
- This was the live site before the full redesign, with compact testimonial rows.

Keep the tag and `feature/portfolio-redesign-v6` permanently. Do not force-push
main or develop, reset published history, or delete feature branches.

## Release

Feature PR targets develop. Release is a separate develop -> main PR. The user
must approve production deployment. The owner can merge their own passing PR
without self-review; collaborators require owner/code-owner approval on main.
The review exception does not bypass CI. Both review and deployment policies are
configured; see DEPLOYMENT.md and PROJECT_STATUS.md for dated verification.

Redesign deployed as v2026.11.15-2: feature merge
ec2564d11b29c4327fb77d8ea2cb3e1e6c97f11f, release merge
bf32788ddc299e987d861d0f1ab2eb2cf084125e. The minimal CI/CD restore procedure is
documented in DEPLOYMENT.md. CI/CD release v2026.11.16 is deployed at source
97bb008a84a7287bf9e9d422ef17f57d9d28d3d9; activation run 43748291450 succeeded.

## Restore the old appearance after release

1. Create `feature/revert-portfolio-redesign-v6` from current develop.
2. Use v2026.11.15 as a reference for the public appearance. Restore/adapt the
   presentation on that feature branch while keeping current CI/security files,
   truthful content and accessibility fixes. Do not blindly revert the entire v6
   feature merge: it introduced shared tooling/docs that the current pipeline uses.
3. Compare public pages/assets with the baseline. Keep later facts and fixes unless
   the user explicitly wants historical content too. The old version's motion and
   Lighthouse results may not meet current budgets; preserve the desired appearance
   while meeting current quality requirements for a durable rollback.
4. Preview locally, apply the quality checklist and create a PR to develop.
5. Merge through the usual flow, then create the develop -> main rollback release
   PR for the user's approval. Verify production and publish a new dated tag.

Do not restore the entire baseline tree. The baseline contains the malicious
startup files discovered during laptop setup. Keep security remediations,
credentials, tooling and repository protections intact during a visual rollback.
The rollback target is the previous public portfolio, not unsafe local hooks.

For an immediate live restore, use Actions -> Publish or restore portfolio -> Run
workflow on main. Enter v2026.11.15 for the old appearance or v2026.11.15-2 for
redesign v6, run it and approve github-pages. Leave the release field empty to
publish current main. The workflow validates current code and the selected public
payload; it does not certify historical content against every new quality budget.

The installed minimal workflow rebuilds public files from preserved Git blobs
using current trusted packaging, not retained build bundles or old executable
scripts. Restore changes production, not main history. Follow with the durable
PR process when source needs reconciliation. Historical external fonts/scripts
can change independently. Packaging is tested; a live restore has not been observed
as of 2026-11-16. See DEPLOYMENT.md for the exact mechanism and remaining limits.
