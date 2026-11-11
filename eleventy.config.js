export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/**/*.html");
  eleventyConfig.setTemplateFormats(["njk", "md"]);

  return {
    dir: { input: "src", output: "_site" },
  };
}
