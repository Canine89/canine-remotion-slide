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
  npm run slides:preview -- /absolute/or/relative/file.md
  npm run slides:render -- /absolute/or/relative/file.md [slides|shorts|both] [output-prefix]
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
