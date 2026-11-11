// Renders an App document written in Markdown into the terminal layout.
//
// The page shows Markdown source as a terminal would print it, so only inline syntax
// (bold, code, links) is turned into HTML. Lines, blank lines, list markers and
// indentation are kept as written and shown pre-formatted.
//
// Block structure:
// - `#`, `##` or `###` at the start of a line starts a new block with that heading,
//   shown with its `#` markers.
// - `---` on its own line starts a new block without a heading.
// - A line starting with `$ ` is a prompt line: `$ ls links/`.
// - Text before the first heading or `---` joins the title block, after the title and date.
// Blank lines at the start and end of a block are ignored.
import markdownIt from "markdown-it";
import { escapeHtml, isExternal, prompt } from "./terminal.js";

const md = markdownIt({ html: false, linkify: false, typographer: false });

const openLinks = [];
md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const external = isExternal(tokens[idx].attrGet("href"));
  openLinks.push(external);
  if (external) {
    tokens[idx].attrSet("target", "_blank");
    tokens[idx].attrSet("rel", "noopener");
  }
  return self.renderToken(tokens, idx, options);
};
md.renderer.rules.link_close = (tokens, idx, options, env, self) => {
  const marker = openLinks.pop() ? ' <span aria-hidden="true">↗</span>' : "";
  return marker + self.renderToken(tokens, idx, options);
};

const HEADING = /^(#{1,3}) (.*)$/;
const BREAK = /^---\s*$/;
const PROMPT = /^\$ (.*)$/;

// `data` is the page data: title, optional updated / updatedLabel, and page.url.
export function renderAppDocument(source, data) {
  const blocks = [{ heading: null, lines: [] }];
  for (const line of source.replace(/\r\n?/g, "\n").split("\n")) {
    const heading = line.match(HEADING);
    if (heading) blocks.push({ heading: { level: heading[1].length, text: line }, lines: [] });
    else if (BREAK.test(line)) blocks.push({ heading: null, lines: [] });
    else blocks.at(-1).lines.push(line);
  }

  const [lead, ...rest] = blocks;
  const title = [`<h1># ${escapeHtml(data.title)}</h1>`];
  if (data.updated) {
    title.push(`<p class="muted">${escapeHtml(data.updatedLabel ?? "Last updated")}: ${escapeHtml(data.updated)}</p>`);
  }
  const rendered = [renderBlock([...title, ...renderLines(lead.lines, data)])];
  for (const block of rest) {
    const parts = block.heading ? [renderHeading(block.heading)] : [];
    parts.push(...renderLines(block.lines, data));
    if (parts.length) rendered.push(renderBlock(parts));
  }
  return rendered.join("\n\n") + "\n";
}

function renderBlock(parts) {
  return `  <div class="block">\n${parts.map((part) => `    ${part}`).join("\n")}\n  </div>`;
}

function renderHeading({ level, text }) {
  return `<h${level}>${renderInline(text)}</h${level}>`;
}

// Prompt lines become their own paragraphs; runs of other lines become one paragraph each.
function renderLines(lines, data) {
  const trimmed = trimBlankLines(lines);
  const paragraphs = [];
  let text = [];
  const flush = () => {
    if (text.length) paragraphs.push(`<p>${text.map(renderInline).join("\n")}</p>`);
    text = [];
  };
  for (const line of trimmed) {
    const command = line.match(PROMPT);
    if (command) {
      flush();
      paragraphs.push(`<p>${prompt(data.page.url, escapeHtml(command[1]))}</p>`);
    } else {
      text.push(line);
    }
  }
  flush();
  return paragraphs;
}

function trimBlankLines(lines) {
  let start = 0;
  let end = lines.length;
  while (start < end && lines[start].trim() === "") start++;
  while (end > start && lines[end - 1].trim() === "") end--;
  return lines.slice(start, end);
}

// One line of inline Markdown. Rendering line by line keeps leading spaces,
// which markdown-it would otherwise strip from continuation lines.
function renderInline(line) {
  return md.renderInline(line);
}
