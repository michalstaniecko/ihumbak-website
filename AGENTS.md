## Site

Eleventy generates the static site from `src/` into `_site/` (ignored by git). See ADR-0001. The Docker image builds `_site/` in a Node stage and serves it with nginx, so deploying is still `docker compose up --build`. No client-side JavaScript except the 404 page's script.

- `npm start`: dev server with live reload at http://localhost:8080
- `npm run build`: build `_site/`
- `npm test`: build, then check `_site/` against `test/snapshots/` and the invariants in `test/invariants.test.js`
- `npm run test:update`: accept a deliberate change to the output by rewriting `test/snapshots/`; review the snapshot diff before committing
- `node test/diff-snapshots.js`: show what changed against the snapshots

Layout of `src/`:

- `_data/apps.json`, `_data/projects.json`: one entry per App and Client project. They drive the Portfolio, the `ls` listing on App pages and App documents, and an App page's Documents section.
- `_includes/layouts/base.njk`: the layout of every page: head, prompt path, breadcrumb, `ls` listing, `cat` line, `cd` navigation and cursor, all derived from the page URL. Helpers are in `lib/terminal.js`.
- `style.css`: the shared stylesheet. A page adds its own styles with `styles:` in front matter (see `404.njk`).
- `<app>/index.njk`, `<project>/index.njk`: App pages and Client project pages, hand-written HTML bodies with front matter `title` and `description` (and optional `ogDescription`). Shortcodes: `{% prompt "cmd" %}`, `{% ext "https://…" %}` for an external link, `{% documents app, 14 %}`, `{% portfolio apps, projects %}`.
- `<app>/<document>.md`: App documents in Markdown, rendered by `lib/markdown.js`. Only inline Markdown is rendered; lines, list markers and blank lines are shown as written. `##`/`###` or a `---` line starts a new block, `$ cmd` is a prompt line, and text before the first block joins the title block. Front matter: `title`, `description`, optional `updated` and `updatedLabel` (default "Last updated").

To add an App document: write `src/<app>/<document>.md` and add `{ "slug", "label" }` to that App's `documents` in `apps.json`. To add an App or Client project: add its entry to the data file and write `src/<slug>/index.njk`. Then `npm test` and `npm run test:update` for the new pages.

## Agent skills

### Issue tracker

Issues are tracked in GitHub Issues (`michalstaniecko/ihumbak-website`) via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## Git workflow

Push directly to `main`. The branch protection rule ("changes must be made through a pull request") is meant for outside contributors, since the repo is public; the owner's account bypasses it on purpose. The "Bypassed rule violations" message on push is expected, not an error.
