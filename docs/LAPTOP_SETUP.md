# Windows laptop setup

Verified on 2026-11-15: Node.js 26.13.1, npm 11.20.0, GitHub CLI 2.104.0,
global Git identity, and passphrase-protected SSH authentication as yogeshwaran-c.
Windows SSH Agent is running with automatic startup. The portfolio origin now
uses github-secondary. GitHub CLI browser authorization is verified as
yogeshwaran-c with credentials in the Windows keyring and ADMIN access to the
portfolio repository. Migration repository visibility was verified PRIVATE.

## Tools

Run in PowerShell, then reopen the terminal:

```powershell
winget install --id GitHub.cli --exact
winget install --id OpenJS.NodeJS.LTS --exact
gh auth login --hostname github.com --git-protocol ssh --web
```

For SSH, generate a dedicated passphrase-protected key when prompted:

```powershell
ssh-keygen -t ed25519 -C 'ycyogesh183@gmail.com' -f "$env:USERPROFILE/.ssh/id_ed25519_github_secondary"
```

Upload only the `.pub` file to the yogeshwaran-c GitHub account's SSH keys.
Never copy the private key into this repository. Add this host entry to
`~/.ssh/config` (preserving any existing entries):

```sshconfig
Host github-secondary
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_github_secondary
    IdentitiesOnly yes
```

Verify GitHub's host fingerprint against its official SSH documentation before
accepting the first connection. Then verify the greeting names yogeshwaran-c:

```powershell
ssh -T git@github-secondary
gh auth status
git remote set-url origin git@github-secondary:yogeshwaran-c/yogeshwaran-c.git
git fetch origin
```

GitHub's successful SSH greeting exits with status 1 because shell access is disabled.
Change the remote only after authentication succeeds. Repo-local author identity
is Yogeshwaran C / ycyogesh183@gmail.com as specified in CLAUDE.md.

## Preview and generated assets

This is a static HTML/CSS/JavaScript site with no application build/runtime
dependencies. package.json now provides development-only CI tools. See DEPLOYMENT.md
for local commands. Use npm.cmd in PowerShell if npm.ps1 is blocked by execution
policy; do not weaken that policy just to run npm.

Quality tests use installed Chrome via playwright-core. Asset regeneration commands
in CLAUDE.md may additionally need the Playwright CLI/browser installation. Inspect
generated images/PDFs before committing. Keep previews bound to 127.0.0.1 and serve
only public output. package:site packages committed Git blobs, not uncommitted edits.
`node generate-sitemap.js` regenerates the sitemap; review its diff before committing.

## Portable context

AGENTS.md directs Codex to CLAUDE.md and docs/ASSISTANT_CONTEXT.md. Keep confirmed
preferences there. Reviewed old-laptop Claude memory was imported to this laptop's
project-memory directory; current-state notes point to tracked PROJECT_STATUS.md.
Do not import corporate settings, broad old permission grants or credentials.

GitHub Actions now has weekly link/dependency maintenance. Blog publication is
not scheduled automatically; the monthly target is the 16th in India.
November's post was only an outline at migration; it was published on 2026-11-16
(v2026.11.16-2).

Defender identified the old setup.js and startup configurations as Trojans. All
five known payload/launch files were removed from active main/develop in the CI/CD
release. Never re-enable those hooks or restore the complete historical tree.
Historical Git objects/tags retain them, excluded from deploy/restore artifacts.
The old machine's execution state and migration-credential revocation remain
unverified. Machine-local permission settings are not portable project memory.
