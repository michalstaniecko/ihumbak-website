import { renderAppDocument } from "./lib/markdown.js";
import { backLinks, breadcrumb, documentLines, externalLink, portfolioLines, prompt } from "./lib/terminal.js";

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/style.css");
  eleventyConfig.addGlobalData("layout", "layouts/base.njk");
  eleventyConfig.setTemplateFormats(["njk", "md"]);

  // App documents: Markdown rendered as terminal output, see lib/markdown.js.
  eleventyConfig.setLibrary("md", { render: renderAppDocument });

  eleventyConfig.addFilter("breadcrumb", breadcrumb);
  eleventyConfig.addFilter("backLinks", backLinks);

  // {% prompt "ls" %} -> the terminal prompt for the current page, followed by a command (HTML).
  eleventyConfig.addShortcode("prompt", function (command) {
    return prompt(this.page.url, command);
  });
  // {% ext "https://example.com/" %} or {% ext "https://example.com/", "label" %}
  eleventyConfig.addShortcode("ext", (href, label) => externalLink(href, label));
  // {% documents app, 14 %} -> the App's App documents, one per line, labels from column 14.
  eleventyConfig.addShortcode("documents", (app, width) => documentLines(app, width).join("\n"));
  // {% portfolio apps, projects %} -> the Portfolio listing on the home page.
  eleventyConfig.addShortcode("portfolio", (apps, projects) => portfolioLines(apps, projects).join("\n    "));

  return {
    dir: { input: "src", output: "_site" },
    markdownTemplateEngine: false,
    htmlTemplateEngine: "njk",
  };
}
