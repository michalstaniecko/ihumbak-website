import { backLinks, breadcrumb, externalLink, prompt } from "./lib/terminal.js";

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/style.css");
  // App documents not yet converted to Markdown.
  eleventyConfig.addPassthroughCopy("src/**/*.html");
  eleventyConfig.addGlobalData("layout", "layouts/base.njk");
  eleventyConfig.setTemplateFormats(["njk", "md"]);

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
