import { Config } from "@remotion/cli/config";
import webpack from "webpack";
import fs from "node:fs";
import path from "node:path";

const getMarkdownPath = () => {
  if (!process.env.SLIDE_MARKDOWN_FILE) {
    throw new Error("SLIDE_MARKDOWN_FILE 환경변수가 필요합니다. npm run slides:present -- <path> 형태로 실행하세요.");
  }
  return path.resolve(process.cwd(), process.env.SLIDE_MARKDOWN_FILE);
};

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

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setPublicDir(".");
Config.overrideWebpackConfig((config) => {
  return {
    ...config,
    module: {
      ...config.module,
      rules: [
        ...(config.module?.rules ?? []),
        {
          test: /\.md$/,
          type: "asset/source",
        },
      ],
    },
    plugins: [
      ...(config.plugins ?? []),
      new webpack.DefinePlugin({
        __SLIDE_MARKDOWN_RAW__: JSON.stringify(getMarkdownRaw()),
        __SLIDE_DESIGN_RAW__: JSON.stringify(getDesignRaw()),
        __SLIDE_GENERATED_THEME_RAW__: JSON.stringify(getGeneratedThemeRaw()),
      }),
    ],
  };
});
