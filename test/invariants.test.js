// Rules that hold for the built site regardless of content.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ORIGIN, pages } from "./site.js";

const readData = (name) => JSON.parse(readFileSync(new URL(`../src/_data/${name}.json`, import.meta.url), "utf8"));
const apps = readData("apps");
const projects = readData("projects");
const site = pages();
const page = (url) => site.find((candidate) => candidate.url === url);
const hrefs = (element) => element.querySelectorAll("a").map((a) => a.getAttribute("href"));

test("the Portfolio links to every App and Client project", () => {
  const portfolio = page("/").doc.querySelector("#portfolio");
  const expected = [...apps, ...projects].map((entry) => `/${entry.slug}/`);
  assert.deepEqual(hrefs(portfolio).sort(), expected.sort());
});

test("every internal link resolves to a built page", () => {
  const urls = new Set(site.map((candidate) => candidate.url));
  for (const { url, doc } of site) {
    for (const href of hrefs(doc)) {
      if (/^(https?:|mailto:)/.test(href)) continue;
      const target = href === "/#portfolio" ? "/" : href;
      assert.ok(urls.has(target), `${url} links to ${href}, which is not a page`);
    }
  }
  assert.ok(page("/").doc.querySelector("#portfolio"), "the home page has no #portfolio anchor");
});

// 404 is served at any missing URL and is noindex, so it has no canonical.
test("every page except 404 has a canonical link equal to its URL", () => {
  for (const { url, doc } of site) {
    if (url === "/404.html") continue;
    const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute("href");
    assert.equal(canonical, ORIGIN + url, `canonical of ${url}`);
  }
});

test("no page except 404 contains a script", () => {
  for (const { url, doc } of site) {
    if (url === "/404.html") continue;
    assert.equal(doc.querySelectorAll("script").length, 0, `${url} contains a <script>`);
  }
});

test("every external link opens in a new tab and is marked as external", () => {
  for (const { url, doc } of site) {
    for (const a of doc.querySelectorAll("a")) {
      if (!/^https?:/.test(a.getAttribute("href"))) continue;
      const where = `${url}: ${a.getAttribute("href")}`;
      assert.equal(a.getAttribute("target"), "_blank", where);
      assert.equal(a.getAttribute("rel"), "noopener", where);
      assert.equal(a.querySelector('span[aria-hidden="true"]')?.text, "↗", where);
    }
  }
});

for (const app of apps) {
  const appUrls = [`/${app.slug}/`, ...app.documents.map((document) => `/${app.slug}/${document.slug}/`)];

  test(`every page of ${app.name} lists exactly its App documents, marking the current page`, () => {
    for (const url of appUrls) {
      const nav = page(url)?.doc.querySelector(`nav[aria-label="${app.name} pages"]`);
      assert.ok(nav, `${url} has no ls listing`);
      const links = nav.querySelectorAll("a");
      assert.deepEqual(links.map((a) => a.getAttribute("href")), appUrls, url);
      assert.deepEqual(
        links.filter((a) => a.getAttribute("aria-current") === "page").map((a) => a.getAttribute("href")),
        [url],
        url,
      );
    }
  });

  test(`the ${app.name} App page links to each of its App documents under Documents`, () => {
    const documents = page(`/${app.slug}/`).doc
      .querySelectorAll(".block")
      .find((block) => block.querySelector("h2")?.text === "## Documents");
    assert.ok(documents, "no ## Documents section");
    assert.deepEqual(hrefs(documents), appUrls.slice(1));
  });
}
