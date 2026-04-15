// @ts-nocheck
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import { serializeSlidesToMarkdown } from "./serializeMarkdown";
import {
  EMPTY_EDITOR_DOCUMENT_STATE,
} from "./documentState";
import { parseSlideMarkdown } from "../slides/parseMarkdown";

const getMarkdownPath = () =>
  process.env.SLIDE_MARKDOWN_FILE
    ? path.resolve(process.cwd(), process.env.SLIDE_MARKDOWN_FILE)
    : path.resolve(process.cwd(), "markdowns/graphifyinfo/graphifyinfo.md");

const rewriteMarkdownAssetPaths = (raw: string, markdownPath: string) => {
  const repoRoot = process.cwd();
  const topicRel = path.relative(repoRoot, path.dirname(markdownPath));
  return raw.replace(
    /!\[([^\]]*)\]\(([^/][^)]+)\)/g,
    (_, alt, src) => {
      // 이미 전체 경로면 건너뜀
      if (src.startsWith(topicRel + "/")) return `![${alt}](${src})`;
      return `![${alt}](${topicRel}/${src})`;
    },
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
  const themePath = path.join(
    path.dirname(markdownPath),
    "THEME.generated.json",
  );
  return fs.existsSync(themePath) ? fs.readFileSync(themePath, "utf8") : "";
};

const getEditorStatePath = () => {
  const markdownPath = getMarkdownPath();
  const markdownDir = path.dirname(markdownPath);
  const basename = path.basename(markdownPath, path.extname(markdownPath));
  return path.join(markdownDir, `${basename}.editor.json`);
};

const getMarkdownDir = () => path.dirname(getMarkdownPath());

const TOPIC_MEDIA_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".svg",
  ".mp4",
  ".mov",
  ".webm",
]);

const resolveTopicAssetPath = (assetPath) => {
  if (typeof assetPath !== "string" || assetPath.trim() === "") return null;
  const normalized = assetPath.replace(/\\/g, "/");
  const markdownDir = getMarkdownDir();
  const candidate = normalized.includes("/")
    ? path.resolve(process.cwd(), normalized)
    : path.resolve(markdownDir, normalized);
  const relativeToTopic = path.relative(markdownDir, candidate);
  if (relativeToTopic.startsWith("..") || path.isAbsolute(relativeToTopic)) return null;
  const ext = path.extname(candidate).toLowerCase();
  if (!TOPIC_MEDIA_EXTENSIONS.has(ext)) return null;
  return candidate;
};

const extractReferencedTopicAssets = (markdown, markdownPath) => {
  const markdownDir = path.dirname(markdownPath);
  const refs = new Set();
  const regex = /!\[[^\]]*\]\(([^)]+)\)/g;
  for (const match of markdown.matchAll(regex)) {
    const assetPath = resolveTopicAssetPath(match[1]);
    if (!assetPath) continue;
    refs.add(path.resolve(assetPath));
  }
  return { refs, markdownDir };
};

const syncTopicAssetsWithMarkdown = (markdown, markdownPath) => {
  const { refs, markdownDir } = extractReferencedTopicAssets(markdown, markdownPath);
  const deleted = [];

  for (const entry of fs.readdirSync(markdownDir, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const filePath = path.join(markdownDir, entry.name);
    const ext = path.extname(entry.name).toLowerCase();
    if (!TOPIC_MEDIA_EXTENSIONS.has(ext)) continue;
    if (refs.has(path.resolve(filePath))) continue;
    fs.unlinkSync(filePath);
    deleted.push(filePath);
  }

  return deleted;
};

const readEditorState = () => {
  const editorStatePath = getEditorStatePath();
  if (!fs.existsSync(editorStatePath)) return EMPTY_EDITOR_DOCUMENT_STATE;

  try {
    const parsed = JSON.parse(fs.readFileSync(editorStatePath, "utf8"));
    if (parsed && parsed.version === 1 && Array.isArray(parsed.slides)) {
      return parsed;
    }
  } catch (error) {
    console.warn(`Failed to read editor state from ${editorStatePath}:`, error);
  }

  return EMPTY_EDITOR_DOCUMENT_STATE;
};

const buildRevision = () => {
  const markdownPath = getMarkdownPath();
  const editorStatePath = getEditorStatePath();
  const markdownStat = fs.statSync(markdownPath);
  const editorStateStat = fs.existsSync(editorStatePath)
    ? fs.statSync(editorStatePath)
    : null;
  return `${markdownStat.mtimeMs}:${editorStateStat?.mtimeMs ?? 0}`;
};

const getThemeDirective = (markdown) => {
  const match = markdown.match(/^---[\s\S]*?theme:\s*(\S+)[\s\S]*?---/);
  return match?.[1] ?? "dark";
};

const sanitizeBadgeForFilename = (badge, fallback = "slide") => {
  const safe = String(badge ?? "")
    .replace(/[^a-zA-Z0-9가-힣_-]/g, "")
    .slice(0, 20);
  return safe || fallback;
};

const buildSlideAssetFilename = (slideIndex, badge, slotIndex, ext) => {
  const num = String(slideIndex + 1).padStart(2, "0");
  const topic = sanitizeBadgeForFilename(badge, "slide");
  const letter = String.fromCharCode(97 + slotIndex);
  return `${num}-${topic}-${letter}${ext}`;
};

const normalizeSlideAssets = (markdown, markdownPath) => {
  const slides = parseSlideMarkdown(markdown);
  const globalTheme = getThemeDirective(markdown);
  const markdownDir = path.dirname(markdownPath);
  const touchedTargets = new Set();

  const normalizeAsset = (assetPath, slideIndex, badge, slotIndex) => {
    if (!assetPath) return assetPath;
    const sourcePath = resolveTopicAssetPath(assetPath);
    if (!sourcePath || !fs.existsSync(sourcePath)) return assetPath;

    const ext = path.extname(sourcePath).toLowerCase();
    const filename = buildSlideAssetFilename(slideIndex, badge, slotIndex, ext);
    const targetPath = path.join(markdownDir, filename);
    touchedTargets.add(path.resolve(targetPath));

    if (path.resolve(sourcePath) !== path.resolve(targetPath)) {
      fs.copyFileSync(sourcePath, targetPath);
    }

    return filename;
  };

  slides.forEach((slide, slideIndex) => {
    const badge = slide.badge;
    let slotIndex = 0;

    if ((slide.type === "title-image" || slide.type === "split") && slide.image) {
      slide.image = normalizeAsset(slide.image, slideIndex, badge, slotIndex);
      slotIndex += 1;
    }

    if (slide.type === "evolution-flow") {
      if (slide.fromImage) {
        slide.fromImage = normalizeAsset(slide.fromImage, slideIndex, badge, slotIndex);
        slotIndex += 1;
      }
      if (slide.toImage) {
        slide.toImage = normalizeAsset(slide.toImage, slideIndex, badge, slotIndex);
        slotIndex += 1;
      }
    }
  });

  const normalizedMarkdown = serializeSlidesToMarkdown(slides, globalTheme);
  return {
    markdown: normalizedMarkdown,
    touchedTargets,
  };
};

const ensureCanonicalDocument = (markdownPath) => {
  const originalMarkdown = fs.readFileSync(markdownPath, "utf8");
  const normalized = normalizeSlideAssets(originalMarkdown, markdownPath);
  syncTopicAssetsWithMarkdown(normalized.markdown, markdownPath);

  if (normalized.markdown !== originalMarkdown) {
    fs.writeFileSync(markdownPath, normalized.markdown, "utf8");
  }

  return normalized.markdown;
};

const readDocumentPayload = () => {
  const markdownPath = getMarkdownPath();
  const markdown = ensureCanonicalDocument(markdownPath);
  return {
    markdown,
    path: markdownPath,
    editorState: readEditorState(),
    revision: buildRevision(),
  };
};

// ── Vite plugin: 마크다운 저장/읽기 REST API ──

function slideApiPlugin() {
  return {
    name: "slide-api",
    configureServer(server) {
      const eventClients = new Set<any>();
      let lastRevision = buildRevision();

      const broadcastDocumentChanged = () => {
        const payload = JSON.stringify({ type: "editor-document-changed" });
        for (const client of eventClients) {
          client.write(`event: editor-document-changed\n`);
          client.write(`data: ${payload}\n\n`);
        }
      };

      const syncAndBroadcastIfChanged = () => {
        const nextRevision = buildRevision();
        if (nextRevision === lastRevision) return;
        lastRevision = nextRevision;
        broadcastDocumentChanged();
      };

      fs.watchFile(getMarkdownPath(), { interval: 250 }, syncAndBroadcastIfChanged);
      fs.watchFile(getEditorStatePath(), { interval: 250 }, syncAndBroadcastIfChanged);

      server.httpServer?.on("close", () => {
        fs.unwatchFile(getMarkdownPath(), syncAndBroadcastIfChanged);
        fs.unwatchFile(getEditorStatePath(), syncAndBroadcastIfChanged);
        eventClients.clear();
      });

      server.middlewares.use("/api/slides/events", (req, res) => {
        if (req.method !== "GET") {
          res.statusCode = 405;
          res.end("Method not allowed");
          return;
        }

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.write("\n");
        eventClients.add(res);

        req.on("close", () => {
          eventClients.delete(res);
        });
      });

      server.middlewares.use("/api/slides/document", (req, res) => {
        const markdownPath = getMarkdownPath();
        const editorStatePath = getEditorStatePath();

        if (req.method === "GET") {
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(readDocumentPayload()));
          return;
        }

        if (req.method === "PUT") {
          let body = "";
          req.on("data", (chunk) => (body += chunk));
          req.on("end", () => {
            try {
              const {
                markdown,
                editorState,
              } = JSON.parse(body);
              const normalized = normalizeSlideAssets(markdown, markdownPath);

              fs.writeFileSync(markdownPath, normalized.markdown, "utf8");
              fs.writeFileSync(
                editorStatePath,
                JSON.stringify(
                  editorState && editorState.version === 1
                    ? editorState
                    : EMPTY_EDITOR_DOCUMENT_STATE,
                  null,
                  2,
                ) + "\n",
                "utf8",
              );
              syncTopicAssetsWithMarkdown(normalized.markdown, markdownPath);

              lastRevision = buildRevision();
              const payload = readDocumentPayload();
              broadcastDocumentChanged();
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify(payload));
            } catch (err) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: String(err) }));
            }
          });
          return;
        }

        res.statusCode = 405;
        res.end("Method not allowed");
      });

      server.middlewares.use("/api/delete-image", (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end("Method not allowed");
          return;
        }

        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", () => {
          try {
            const { path: assetPath } = JSON.parse(body);
            const filePath = resolveTopicAssetPath(assetPath);

            if (!filePath) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: "Invalid image path" }));
              return;
            }

            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
              syncAndBroadcastIfChanged();
            }

            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: true }));
          } catch (err) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: String(err) }));
          }
        });
      });

      // 이미지 업로드 API
      server.middlewares.use("/api/upload-image", (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end("Method not allowed");
          return;
        }

        const markdownPath = getMarkdownPath();
        const markdownDir = path.dirname(markdownPath);
        const chunks = [];

        req.on("data", (chunk) => chunks.push(chunk));
        req.on("end", () => {
          try {
            const buf = Buffer.concat(chunks);
            // multipart boundary 파싱
            const contentType = req.headers["content-type"] || "";
            const boundaryMatch = contentType.match(/boundary=(.+)/);
            if (!boundaryMatch) {
              // raw binary with filename header
              const filename = req.headers["x-filename"] || `image-${Date.now()}.png`;
              const filePath = path.join(markdownDir, filename);
              fs.writeFileSync(filePath, buf);
              const repoRoot = process.cwd();
              const relPath = path.relative(repoRoot, filePath);
              syncAndBroadcastIfChanged();
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ path: relPath, filename }));
              return;
            }

            // simple multipart parse
            const boundary = boundaryMatch[1];
            const parts = buf.toString("binary").split("--" + boundary);
            for (const part of parts) {
              const headerEnd = part.indexOf("\r\n\r\n");
              if (headerEnd < 0) continue;
              const headers = part.slice(0, headerEnd);
              const fnMatch = headers.match(/filename="([^"]+)"/);
              if (!fnMatch) continue;

              const ext = path.extname(fnMatch[1]) || ".png";
              const filename = `image-${Date.now()}${ext}`;
              const body = part.slice(headerEnd + 4, part.lastIndexOf("\r\n"));
              const filePath = path.join(markdownDir, filename);
              fs.writeFileSync(filePath, body, "binary");

              const repoRoot = process.cwd();
              const relPath = path.relative(repoRoot, filePath);
              syncAndBroadcastIfChanged();
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ path: relPath, filename }));
              return;
            }
            res.statusCode = 400;
            res.end(JSON.stringify({ error: "No file found" }));
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: String(err) }));
          }
        });
      });
    },
  };
}

export default defineConfig({
  root: "src/editor",
  publicDir: "../..",
  define: {
    __SLIDE_MARKDOWN_RAW__: JSON.stringify(getMarkdownRaw()),
    __SLIDE_DESIGN_RAW__: JSON.stringify(getDesignRaw()),
    __SLIDE_GENERATED_THEME_RAW__: JSON.stringify(getGeneratedThemeRaw()),
    "__SLIDE_MARKDOWN_PATH__": JSON.stringify(getMarkdownPath()),
    "__SLIDE_EDITOR_STATE_PATH__": JSON.stringify(getEditorStatePath()),
  },
  plugins: [slideApiPlugin()],
  server: {
    port: 4000,
  },
});
