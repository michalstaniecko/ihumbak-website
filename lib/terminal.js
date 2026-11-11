// Terminal chrome derived from a page URL: the prompt path, breadcrumb and `cd` navigation.

export const ORIGIN = "https://ihumbak.website";

// "/cv-drawer/help/" -> ["cv-drawer", "help"]. The home page and 404 page sit at "~".
export function segments(url) {
  if (url === "/404.html") return [];
  return url.split("/").filter(Boolean);
}

// "/cv-drawer/help/" -> "~/portfolio/cv-drawer/help"
export function terminalPath(url) {
  const parts = segments(url);
  return parts.length ? `~/portfolio/${parts.join("/")}` : "~";
}

// The prompt followed by a command, e.g. `michal@ihumbak:~/portfolio/cv-drawer$ ls`.
// `command` is HTML.
export function prompt(url, command) {
  return `<span class="ps">michal@ihumbak</span>:<span class="path">${terminalPath(url)}</span>$ ${command}`;
}

// The breadcrumb after `~/portfolio/`: one link per URL segment, the last one is the page itself.
export function breadcrumb(url) {
  const parts = segments(url);
  return parts.map((label, i) => ({
    label,
    href: `/${parts.slice(0, i + 1).join("/")}/`,
    current: i === parts.length - 1,
  }));
}

// The closing `cd ..` and `cd ~` lines of a page below the home page.
export function backLinks(url) {
  const parts = segments(url);
  if (!parts.length) return [];
  const links = [];
  if (parts.length > 1) {
    const parent = parts.at(-2);
    links.push({ href: `/${parts.slice(0, -1).join("/")}/`, command: "cd ..", comment: `back to ${parent}` });
  }
  links.push({ href: "/", command: "cd ~", comment: "back to home" });
  return links;
}

export function escapeHtml(text) {
  return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// A link that leaves the site: opens in a new tab and carries the ↗ marker.
// `labelHtml` is HTML; it defaults to the URL without scheme and trailing slash.
export function externalLink(href, labelHtml = escapeHtml(href.replace(/^https?:\/\//, "").replace(/\/$/, ""))) {
  return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener">${labelHtml} <span aria-hidden="true">↗</span></a>`;
}

export function isExternal(href) {
  return /^https?:\/\//.test(href);
}

// The `ls portfolio/` listing: one line per App, then per Client project, with the
// one-line summaries aligned in a column after the longest name.
export function portfolioLines(apps, projects) {
  const entries = [...apps, ...projects];
  const width = Math.max(...entries.map((entry) => entry.slug.length + 1)) + 2;
  return entries.map(
    (entry) =>
      `<p><a href="/${entry.slug}/">${entry.slug}/</a>${" ".repeat(width - entry.slug.length - 1)}<span class="muted">${escapeHtml(entry.summary)}</span></p>`,
  );
}

// The lines of an App page's `## Documents` section: the slug, padded to `width`
// so the labels line up with the page's other columns, then a link labelled from the App data.
export function documentLines(app, width) {
  return app.documents.map(
    (document) =>
      `${document.slug.padEnd(width)}<a href="/${app.slug}/${document.slug}/">${escapeHtml(document.label)}</a>`,
  );
}
