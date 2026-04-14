// @ts-nocheck
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";

const getMarkdownPath = () =>
  process.env.SLIDE_MARKDOWN_FILE
    ? path.resolve(process.cwd(), process.env.SLIDE_MARKDOWN_FILE)
    : path.resolve(process.cwd(), "markdowns/graphifyinfo/graphifyinfo.md");

const rewriteMarkdownAssetPaths = (raw: string, markdownPath: string) => {
  const repoRoot = process.cwd();
  const topicRel = path.relative(repoRoot, path.dirname(markdownPath));
  return raw.replace(
    /!\[([^\]]*)\]\(([^/][^)]+)\)/g,
    (_, alt, src) => `![${alt}](${topicRel}/${src})`
  );
};

const getMarkdownRaw = () => {
  const markdownPath = getMarkdownPath();
  const raw = fs.readFileSync(markdownPath, "utf8");
  return rewriteMarkdownAssetPaths(raw, markdownPath);
};

const getDesignRaw = () => {
  const markdownPath = getMarkdownPath();
  const designPath = path.join(path.dirname(markdownPath), "DESIGN.md");
  return fs.existsSync(designPath) ? fs.readFileSync(designPath, "utf8") : "";
};

const getGeneratedThemeRaw = () => {
  const markdownPath = getMarkdownPath();
  const themePath = path.join(path.dirname(markdownPath), "THEME.generated.json");
  return fs.existsSync(themePath) ? fs.readFileSync(themePath, "utf8") : "";
};

export default defineConfig({
  root: "src/presenter",
  publicDir: "../..",
  define: {
    __SLIDE_MARKDOWN_RAW__: JSON.stringify(getMarkdownRaw()),
    __SLIDE_DESIGN_RAW__: JSON.stringify(getDesignRaw()),
    __SLIDE_GENERATED_THEME_RAW__: JSON.stringify(getGeneratedThemeRaw()),
  },
  server: {
    port: 4000,
  },
});
