// Helpers for tests that inspect the built site in _site/.
import { readFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { parse } from "node-html-parser";

export const SITE_DIR = new URL("../_site/", import.meta.url).pathname;
export const ORIGIN = "https://ihumbak.website";

export function listFiles(dir) {
  return readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile() && !entry.name.startsWith("."))
    .map((entry) => relative(dir, join(entry.parentPath, entry.name)).split(sep).join("/"))
    .sort();
}

// Public URL of a built HTML file: "cv-drawer/help/index.html" -> "/cv-drawer/help/".
export function urlOf(file) {
  return "/" + file.replace(/(^|\/)index\.html$/, "$1");
}

export function pages() {
  return listFiles(SITE_DIR)
    .filter((file) => file.endsWith(".html"))
    .map((file) => {
      const html = readFileSync(join(SITE_DIR, file), "utf8");
      return { file, url: urlOf(file), html, doc: parseHtml(html) };
    });
}

export function parseHtml(html) {
  return parse(html, { comment: false, blockTextElements: { script: true, style: true } });
}

// Elements whose whitespace-only children are source formatting, not content.
// Everything else (p, h1-h3, a, span...) is rendered with white-space: pre-wrap or inline,
// so its whitespace is kept exactly.
const LAYOUT_ELEMENTS = new Set(["html", "head", "body", "main", "nav", "div"]);

// Elements that start on a new line in the canonical form, to keep snapshot diffs readable.
const BLOCK_ELEMENTS = new Set([...LAYOUT_ELEMENTS, "p", "h1", "h2", "h3", "title", "meta", "link", "style", "script"]);
const VOID_ELEMENTS = new Set(["meta", "link", "br", "img", "input"]);

// Canonical form of an HTML document for snapshot comparison: entities decoded,
// formatting whitespace between block elements dropped, script and style whitespace collapsed.
export function normaliseHtml(html) {
  const doctype = /^\s*<!doctype html>/i.test(html) ? "<!doctype html>\n" : "";
  return doctype + serialise(parseHtml(html.replace(/^\s*<!doctype html>/i, "")), null).trim();
}

function serialise(node, parentTag) {
  if (node.nodeType === 3) {
    const text = node.text;
    if (parentTag === "script" || parentTag === "style") return collapse(text);
    if (LAYOUT_ELEMENTS.has(parentTag) && text.trim() === "") return "";
    return text;
  }
  const tag = node.rawTagName?.toLowerCase() ?? null;
  const inner = node.childNodes.map((child) => serialise(child, tag)).join("");
  if (!tag) return inner;
  const attrs = Object.entries(node.attributes)
    .map(([name, value]) => ` ${name}="${value}"`)
    .join("");
  const open = `${BLOCK_ELEMENTS.has(tag) ? "\n" : ""}<${tag}${attrs}>`;
  return VOID_ELEMENTS.has(tag) ? open : `${open}${inner}</${tag}>`;
}

export function normaliseCss(css) {
  return collapse(css);
}

function collapse(text) {
  return text.replace(/\s+/g, " ").trim();
}
