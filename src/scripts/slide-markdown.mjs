import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "../..");

const [, , action = "use", ...args] = process.argv;

const usage = `
Usage:
  npm run slides:use -- /absolute/or/relative/file.md
  npm run slides:present -- /absolute/or/relative/file.md
  npm run slides:edit -- /absolute/or/relative/file.md
  npm run slides:preview -- /absolute/or/relative/file.md
  npm run slides:render -- /absolute/or/relative/file.md [slides|shorts|both] [output-prefix]
  npm run slides:pdf -- /absolute/or/relative/file.md [output.pdf]
`.trim();

const run = async () => {
  const sourceArg = args[0];
  if (!sourceArg) {
    console.error(usage);
    process.exit(1);
  }

  const sourcePath = path.resolve(process.cwd(), sourceArg);
  const sourceStat = await fs.stat(sourcePath).catch(() => null);
  if (!sourceStat || !sourceStat.isFile()) {
    console.error(`Markdown file not found: ${sourcePath}`);
    process.exit(1);
  }

  console.log(`Using markdown:  ${sourcePath}`);
  await warnIfDesignThemeNeedsGeneration(sourcePath);

  if (action === "use") {
    return;
  }

  if (action === "preview") {
    await spawnAndWait("npx", ["remotion", "preview", "src/index.ts"], sourcePath);
    return;
  }

  if (action === "present") {
    await killPortProcess(4000);
    await spawnAndWait("npx", ["vite", "--config", "src/presenter/vite.config.ts"], sourcePath);
    return;
  }

  if (action === "edit") {
    await killPortProcess(4000);
    await spawnAndWait("npx", ["vite", "--config", "src/editor/vite.config.ts"], sourcePath);
    return;
  }

  if (action === "render") {
    const target = (args[1] ?? "both").toLowerCase();
    if (!["slides", "shorts", "both"].includes(target)) {
      console.error(`Unknown render target: ${target}`);
      console.error(usage);
      process.exit(1);
    }

    const outputPrefix = args[2]
      ? path.resolve(process.cwd(), args[2])
      : path.join(
          repoRoot,
          "out",
          path.basename(sourcePath, path.extname(sourcePath)),
          path.basename(sourcePath, path.extname(sourcePath))
        );
    await fs.mkdir(path.dirname(outputPrefix), { recursive: true });

    const slideOutput = `${outputPrefix}-slides.mp4`;
    const shortOutput = `${outputPrefix}-shorts.mp4`;

    if (target === "slides" || target === "both") {
      await spawnAndWait("npx", [
        "remotion",
        "render",
        "src/index.ts",
        "Slides-Markdown",
        slideOutput,
      ], sourcePath);
      console.log(`Rendered slides: ${slideOutput}`);
    }

    if (target === "shorts" || target === "both") {
      await spawnAndWait("npx", [
        "remotion",
        "render",
        "src/index.ts",
        "Shorts-Markdown",
        shortOutput,
      ], sourcePath);
      console.log(`Rendered shorts: ${shortOutput}`);
    }
    return;
  }

  if (action === "pdf") {
    const markdownRaw = await fs.readFile(sourcePath, "utf8");
    const fmMatch = markdownRaw.match(/^---\s*\n[\s\S]*?\n---\s*\n([\s\S]*)$/);
    const body = fmMatch ? fmMatch[1] : markdownRaw;
    const slideBlocks = body.split(/\n---\s*\n/).filter((b) => b.trim());
    const slideCount = slideBlocks.length;

    if (slideCount === 0) {
      console.error("No slides found in markdown.");
      process.exit(1);
    }

    const DURATION = 150;
    const TRANSITION = 15;
    const SETTLED_OFFSET = 90;

    const tmpDir = path.join(repoRoot, "out", ".pdf-tmp");
    await fs.mkdir(tmpDir, { recursive: true });

    console.log(`Rendering ${slideCount} slides as PNG...`);
    const pngPaths = [];
    for (let i = 0; i < slideCount; i++) {
      let startFrame = 0;
      for (let j = 0; j < i; j++) {
        startFrame += DURATION - TRANSITION;
      }
      const frame = startFrame + Math.min(SETTLED_OFFSET, DURATION - 1);
      const outPath = path.join(tmpDir, `slide-${String(i).padStart(3, "0")}.png`);

      console.log(`  [${i + 1}/${slideCount}] frame ${frame} → ${path.basename(outPath)}`);
      await spawnAndWait("npx", [
        "remotion", "still", "src/index.ts", "Slides-Markdown",
        outPath, `--frame=${frame}`,
      ], sourcePath);

      pngPaths.push(outPath);
    }

    console.log("Combining PNGs into PDF...");
    const { PDFDocument } = await import("pdf-lib");
    const pdfDoc = await PDFDocument.create();

    for (const pngPath of pngPaths) {
      const pngBytes = await fs.readFile(pngPath);
      const pngImage = await pdfDoc.embedPng(pngBytes);
      const page = pdfDoc.addPage([1920, 1080]);
      page.drawImage(pngImage, { x: 0, y: 0, width: 1920, height: 1080 });
    }

    const pdfBytes = await pdfDoc.save();
    const baseName = path.basename(sourcePath, path.extname(sourcePath));
    const outputPath = args[1]
      ? path.resolve(process.cwd(), args[1])
      : path.join(repoRoot, "out", baseName, `${baseName}.pdf`);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, pdfBytes);

    // cleanup
    for (const p of pngPaths) await fs.unlink(p).catch(() => {});
    await fs.rmdir(tmpDir).catch(() => {});

    console.log(`PDF exported: ${outputPath}`);
    return;
  }

  console.error(`Unknown action: ${action}`);
  console.error(usage);
  process.exit(1);
};

const warnIfDesignThemeNeedsGeneration = async (sourcePath) => {
  const markdownRaw = await fs.readFile(sourcePath, "utf8");
  if (!/^---\s*\n[\s\S]*?\ntheme:\s*DESIGN\.md\s*[\s\S]*?\n---/m.test(markdownRaw)) {
    return;
  }

  const topicDir = path.dirname(sourcePath);
  const designPath = path.join(topicDir, "DESIGN.md");
  const generatedThemePath = path.join(topicDir, "THEME.generated.json");

  const [designStat, generatedStat] = await Promise.all([
    fs.stat(designPath).catch(() => null),
    fs.stat(generatedThemePath).catch(() => null),
  ]);

  if (designStat && !generatedStat) {
    console.warn(
      `Warning: ${path.relative(repoRoot, generatedThemePath)} is missing. ` +
      `theme: DESIGN.md will fall back to runtime inference until an agent generates the concrete theme artifact.`
    );
  }
};

const killPortProcess = (port) =>
  new Promise((resolve) => {
    const isWin = process.platform === "win32";
    const script = isWin
      ? `for /f "tokens=5" %a in ('netstat -ano ^| findstr :${port} ^| findstr LISTENING') do taskkill /PID %a /F`
      : `lsof -ti :${port} | xargs kill 2>/dev/null`;

    const child = spawn(script, { shell: true, stdio: "ignore" });
    child.on("exit", () => resolve());
    child.on("error", () => resolve());
  });

const spawnAndWait = (command, commandArgs, sourcePath) =>
  new Promise((resolve, reject) => {
    const fullCommand = [command, ...commandArgs].join(" ");
    const child = spawn(fullCommand, {
      cwd: repoRoot,
      stdio: "inherit",
      shell: true,
      env: {
        ...process.env,
        SLIDE_MARKDOWN_FILE: sourcePath,
      },
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${command} exited with code ${code ?? "unknown"}`));
    });

    child.on("error", reject);
  });

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
