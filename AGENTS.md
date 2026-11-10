## Agent skills

### Issue tracker

Issues are tracked in GitHub Issues (`michalstaniecko/ihumbak-website`) via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## Git workflow

Push directly to `main`. The branch protection rule ("changes must be made through a pull request") is meant for outside contributors, since the repo is public; the owner's account bypasses it on purpose. The "Bypassed rule violations" message on push is expected, not an error.
