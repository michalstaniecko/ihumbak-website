import { renderAppDocument } from "./lib/markdown.js";
import { backLinks, breadcrumb, externalLink, prompt } from "./lib/terminal.js";

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

  return {
    dir: { input: "src", output: "_site" },
    markdownTemplateEngine: false,
    htmlTemplateEngine: "njk",
  };
}
