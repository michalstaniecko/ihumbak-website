---
status: accepted
---

# Eleventy build step instead of hand-written HTML

The site had grown to 11 hand-written pages that each repeated the same `<head>`, inline CSS, terminal chrome (prompt with a hard-coded path, breadcrumb, `ls ..`, `cd ..`) and the list of an App's App documents, so adding an App document meant editing every sibling page. We decided to generate the site with Eleventy in a multi-stage Docker build (`node` builds `_site/`, `nginx` serves it), because the site is fully static and needs only layouts, Markdown and data files, which Eleventy provides without shipping any client-side JavaScript.

## Considered Options

- **Nuxt**: rejected. It brings Vue and a client runtime, and nothing on the site is interactive. It suits teams already working in Vue, not a small static portfolio.
- **Astro**: rejected for now. It earns its weight with components, type safety or hundreds of pages, none of which apply. Worth revisiting if the site gains interactive components.
- **nginx SSI**: rejected. It could share the header and footer, but not render Markdown or generate navigation from data, and it ties templates to server config.
- **Own build script**: rejected. It would end up reimplementing layouts, Markdown and data loading.

## Consequences

- The repo is no longer servable as-is: sources move to `src/`, and `_site/` is a build output kept out of git.
- The migration is a pure refactor: URLs, canonicals and the visual output stay the same, verified by diffing the generated `_site/` against the current files.
- Each App and Client project becomes a data entry (name, slug, one-line summary and, for an App, its App documents). The Portfolio, `ls ..` listings and breadcrumbs are generated from these entries, so an App's list of App documents lives only in its data.
- App documents are written in Markdown and rendered into the terminal layout.
- CSS moves from inline `<style>` blocks to one shared `/style.css`. Only page-specific styles stay inline.
