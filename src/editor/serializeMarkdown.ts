import { SlideData, ThemeDirective } from "../slides/types";

/**
 * SlideData[] → 마크다운 문자열.
 * parseSlideMarkdown()의 정확한 역변환.
 */
export function serializeSlidesToMarkdown(
  slides: SlideData[],
  globalTheme: ThemeDirective,
): string {
  const header = `---\ntheme: ${globalTheme}\n---`;
  const blocks = slides.map(serializeSlide);
  return header + "\n\n" + blocks.join("\n\n---\n\n") + "\n";
}

function serializeHeading(badge: string, title: string, badgeVariant?: 0 | 1): string {
  const variant = badgeVariant !== undefined && badgeVariant !== 0 ? `{${badgeVariant}}` : "";
  if (badge) {
    return `# [${badge}]${variant} ${title}`;
  }
  return `# ${title}`;
}

function serializeSlide(slide: SlideData): string {
  const lines: string[] = [];
  const heading = serializeHeading(slide.badge, getTitle(slide), slide.badgeVariant);
  lines.push(heading);

  switch (slide.type) {
    case "title":
      if (slide.subtitle) {
        lines.push("");
        lines.push(slide.subtitle);
      }
      break;

    case "title-image":
      if (slide.subtitle) {
        lines.push("");
        lines.push(slide.subtitle);
      }
      if (slide.image) {
        lines.push("");
        lines.push(`![](${slide.image})`);
      }
      break;

    case "title-tags":
      if (slide.subtitle) {
        lines.push("");
        lines.push(slide.subtitle);
      }
      const tags = slide.tags
        .map((t) => t.text.trim())
        .filter(Boolean);
      if (tags.length > 0) {
        lines.push("");
        lines.push(`> ${tags.join(", ")}`);
      }
      break;

    case "title-bullets":
      lines.push("");
      for (const b of slide.bullets) {
        lines.push(`- ${b}`);
      }
      break;

    case "split":
      if (slide.image) {
        lines.push("");
        lines.push(`![](${slide.image})`);
      }
      lines.push("");
      for (const b of slide.bullets) {
        lines.push(`- ${b}`);
      }
      break;

    case "stat":
      lines.push("");
      for (const s of slide.stats) {
        const visual = s.visual ? ` [${s.visual.type}:${s.visual.ratio}]` : "";
        lines.push(`$ ${s.value}${visual}`);
        if (s.label) {
          lines.push(s.label);
        }
        lines.push("");
      }
      // 마지막 빈 줄 제거
      while (lines.length > 0 && lines[lines.length - 1] === "") {
        lines.pop();
      }
      break;

    case "quote":
      lines.push("");
      lines.push(`"" ${slide.quote}`);
      if (slide.attribution) {
        lines.push(`— ${slide.attribution}`);
      }
      break;

    case "steps":
      lines.push("");
      slide.steps.forEach((s, i) => {
        lines.push(`${i + 1}. ${s}`);
      });
      break;

    case "compare":
      lines.push("");
      for (const col of slide.columns) {
        lines.push(`|| ${col.heading}`);
        for (const b of col.bullets) {
          lines.push(`- ${b}`);
        }
        lines.push("");
      }
      while (lines.length > 0 && lines[lines.length - 1] === "") {
        lines.pop();
      }
      break;

    case "evolution-flow": {
      lines.push("");
      // from
      const fromLabel = formatEvolutionLabel(slide.fromBadge, slide.fromTitle);
      lines.push(`<< ${fromLabel}`);
      if (slide.fromImage) {
        lines.push(`![](${slide.fromImage})`);
      }
      for (const b of slide.fromBullets) {
        lines.push(`- ${b}`);
      }
      lines.push("");
      // steps
      if (slide.steps.length > 0) {
        lines.push(`== 변환 과정`);
        for (const s of slide.steps) {
          lines.push(`- ${s}`);
        }
        lines.push("");
      }
      // to
      const toLabel = formatEvolutionLabel(slide.toBadge, slide.toTitle);
      lines.push(`>> ${toLabel}`);
      if (slide.toImage) {
        lines.push(`![](${slide.toImage})`);
      }
      for (const b of slide.toBullets) {
        lines.push(`- ${b}`);
      }
      break;
    }

    case "abstract-scene":
      lines.push("");
      if (slide.prompts && slide.prompts.length > 0) {
        for (const p of slide.prompts) {
          lines.push(`~ "${p.text}"`);
        }
      }
      for (const s of slide.scenes) {
        if (s.label) {
          lines.push(`- [${s.label}] ${s.copy}`);
        } else {
          lines.push(`- ${s.copy}`);
        }
      }
      break;
  }

  return lines.join("\n");
}

function getTitle(slide: SlideData): string {
  return (slide as any).title ?? "";
}

function formatEvolutionLabel(badge?: string, title?: string): string {
  if (badge && title) return `[${badge}] ${title}`;
  if (badge) return `[${badge}]`;
  if (title) return title;
  return "";
}
