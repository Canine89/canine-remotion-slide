import { AbstractSceneItem, SlideData, ThemeDirective } from "./types";

interface ParsedFrontmatter {
  theme?: ThemeDirective;
}

const BULLET_PREFIX = /^[-*•–—]\s+(.+)$/;
const ABSTRACT_PROMPT_PREFIX = /^~\s+(.+)$/;
const ABSTRACT_LABEL_PREFIX = /^\[([^\]]+)\]\s+(.+)$/;
const EVOLUTION_SECTION_PREFIX = /^(<<|==|>>)\s*(.*)$/;
const STAT_PREFIX = /^\$\s+(.+)$/;
const QUOTE_PREFIX = /^""\s+(.+)$/;
const ATTRIBUTION_PREFIX = /^[—–-]{1,2}\s+(.+)$/;
const NUMBERED_STEP_PREFIX = /^\d+\.\s+(.+)$/;
const COMPARE_COLUMN_PREFIX = /^\|\|\s+(.+)$/;

function parseFrontmatter(raw: string): {
  frontmatter: ParsedFrontmatter;
  body: string;
} {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: raw };

  const fm: ParsedFrontmatter = {};
  for (const line of match[1].split("\n")) {
    const kv = line.match(/^(\w+):\s*(.+)$/);
    if (kv && kv[1] === "theme") {
      fm.theme = kv[2].trim() as ThemeDirective;
    }
  }
  return { frontmatter: fm, body: match[2] };
}

function parseHeading(line: string): {
  badge: string;
  title: string;
  badgeVariant?: 0 | 1;
  isAbstract: boolean;
} {
  const text = line.replace(/^#+\s*/, "").trim();
  const isAbstract = text.includes("[[추상]]");
  const normalizedText = text.replace(/\[\[추상\]\]\s*/g, "").trim();
  let badgeVariant: 0 | 1 | undefined;

  // [뱃지]{1} 처리
  const variantMatch = normalizedText.match(/\{(\d)\}/);
  if (variantMatch) {
    badgeVariant = parseInt(variantMatch[1]) as 0 | 1;
  }
  const cleaned = normalizedText.replace(/\{\d\}/, "").trim();

  // # [뱃지] 타이틀 또는 # 타이틀 [뱃지]
  const match = cleaned.match(/^\[([^\]]+)\]\s*(.+)$/) ||
                cleaned.match(/^(.+?)\s*\[([^\]]+)\]$/);

  if (match) {
    // 첫 번째 패턴: [뱃지] 타이틀
    if (cleaned.match(/^\[/)) {
      return { badge: match[1], title: match[2], badgeVariant, isAbstract };
    }
    // 두 번째 패턴: 타이틀 [뱃지]
    return { badge: match[2], title: match[1], badgeVariant, isAbstract };
  }

  return { badge: "", title: cleaned, badgeVariant, isAbstract };
}

function parseEvolutionSectionLabel(raw: string): {
  badge?: string;
  title?: string;
} {
  const text = raw.trim();
  if (!text) return {};

  const leadingBadge = text.match(/^\[([^\]]+)\]\s*(.+)?$/);
  if (leadingBadge) {
    return {
      badge: leadingBadge[1].trim(),
      title: leadingBadge[2]?.trim() || undefined,
    };
  }

  const trailingBadge = text.match(/^(.+?)\s*\[([^\]]+)\]$/);
  if (trailingBadge) {
    return {
      title: trailingBadge[1].trim(),
      badge: trailingBadge[2].trim(),
    };
  }

  return { title: text };
}

export function parseSlideMarkdown(raw: string): SlideData[] {
  const { frontmatter, body } = parseFrontmatter(raw);
  const theme = frontmatter.theme || "dark";

  const slideBlocks = body.split(/\n---\s*\n/).filter((b) => b.trim());
  const slides: SlideData[] = [];

  for (const block of slideBlocks) {
    const lines = block.trim().split("\n");
    let badge = "";
    let title = "";
    let badgeVariant: 0 | 1 | undefined;
    let subtitle = "";
    const bullets: string[] = [];
    const prompts: { text: string }[] = [];
    const scenes: AbstractSceneItem[] = [];
    const tags: { text: string; color?: string }[] = [];
    let image = "";
    let isAbstract = false;
    let direction = "";
    let hasEvolutionMarkers = false;
    let evolutionSection: "from" | "steps" | "to" | null = null;
    let fromBadge = "";
    let fromTitle = "";
    let fromImage = "";
    const fromBullets: string[] = [];
    const steps: string[] = [];
    let toBadge = "";
    let toTitle = "";
    let toImage = "";
    const toBullets: string[] = [];

    const statItems: { value: string; label: string; visual?: { type: "bar" | "ring"; ratio: number } }[] = [];
    let pendingStatValue = "";
    let pendingStatVisual: { type: "bar" | "ring"; ratio: number } | undefined;
    let quoteText = "";
    let attribution = "";
    const numberedSteps: string[] = [];
    const compareColumns: { heading: string; bullets: string[] }[] = [];
    let currentCompareColumn: { heading: string; bullets: string[] } | null = null;

    let headingDone = false;
    let collectingSubtitle = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        collectingSubtitle = false;
        if (pendingStatValue) {
          statItems.push({ value: pendingStatValue, label: "", visual: pendingStatVisual });
          pendingStatValue = "";
          pendingStatVisual = undefined;
        }
        continue;
      }

      // 헤딩
      if (trimmed.startsWith("#") && !headingDone) {
        const parsed = parseHeading(trimmed);
        badge = parsed.badge;
        title = parsed.title;
        badgeVariant = parsed.badgeVariant;
        isAbstract = parsed.isAbstract;
        headingDone = true;
        collectingSubtitle = true;
        continue;
      }

      const evolutionSectionMatch = trimmed.match(EVOLUTION_SECTION_PREFIX);
      if (evolutionSectionMatch) {
        collectingSubtitle = false;
        hasEvolutionMarkers = true;

        if (evolutionSectionMatch[1] === "<<") {
          evolutionSection = "from";
          const parsed = parseEvolutionSectionLabel(evolutionSectionMatch[2]);
          fromBadge = parsed.badge || "";
          fromTitle = parsed.title || "";
        } else if (evolutionSectionMatch[1] === "==") {
          evolutionSection = "steps";
        } else {
          evolutionSection = "to";
          const parsed = parseEvolutionSectionLabel(evolutionSectionMatch[2]);
          toBadge = parsed.badge || "";
          toTitle = parsed.title || "";
        }
        continue;
      }

      const abstractPromptMatch = trimmed.match(ABSTRACT_PROMPT_PREFIX);
      if (abstractPromptMatch) {
        collectingSubtitle = false;
        isAbstract = true;
        const promptText = abstractPromptMatch[1].trim().replace(/^"(.*)"$/, "$1");
        const splitPrompts = promptText
          .split(/\s*,\s*/)
          .map((text) => text.trim())
          .filter(Boolean);

        for (const text of splitPrompts.length > 0 ? splitPrompts : [promptText]) {
          prompts.push({ text });
        }

        direction = direction ? `${direction} ${promptText}` : promptText;
        continue;
      }

      // stat ($ 숫자 [visual])
      const statMatch = trimmed.match(STAT_PREFIX);
      if (statMatch) {
        collectingSubtitle = false;
        if (pendingStatValue) {
          statItems.push({ value: pendingStatValue, label: "", visual: pendingStatVisual });
        }
        let raw = statMatch[1].trim();
        pendingStatVisual = undefined;
        const visualMatch = raw.match(/\[(bar|ring)(?::(\d+))?\]\s*$/);
        if (visualMatch) {
          pendingStatVisual = {
            type: visualMatch[1] as "bar" | "ring",
            ratio: visualMatch[2] ? parseInt(visualMatch[2]) : 70,
          };
          raw = raw.replace(/\s*\[(bar|ring)(?::\d+)?\]\s*$/, "").trim();
        }
        pendingStatValue = raw;
        continue;
      }

      // stat label ($ 다음 줄)
      if (pendingStatValue) {
        statItems.push({ value: pendingStatValue, label: trimmed, visual: pendingStatVisual });
        pendingStatValue = "";
        pendingStatVisual = undefined;
        collectingSubtitle = false;
        continue;
      }

      // quote ("" 인용)
      const quoteMatch = trimmed.match(QUOTE_PREFIX);
      if (quoteMatch) {
        collectingSubtitle = false;
        quoteText = quoteMatch[1].trim();
        continue;
      }

      // attribution (— 출처)
      if (quoteText) {
        const attrMatch = trimmed.match(ATTRIBUTION_PREFIX);
        if (attrMatch) {
          collectingSubtitle = false;
          attribution = attrMatch[1].trim();
          continue;
        }
      }

      // compare (|| 컬럼)
      const compareMatch = trimmed.match(COMPARE_COLUMN_PREFIX);
      if (compareMatch) {
        collectingSubtitle = false;
        if (currentCompareColumn) {
          compareColumns.push(currentCompareColumn);
        }
        currentCompareColumn = { heading: compareMatch[1].trim(), bullets: [] };
        continue;
      }

      // compare 컬럼 내 불릿
      if (currentCompareColumn) {
        const compareBulletMatch = trimmed.match(BULLET_PREFIX);
        if (compareBulletMatch) {
          collectingSubtitle = false;
          currentCompareColumn.bullets.push(compareBulletMatch[1].trim());
          continue;
        }
      }

      // numbered steps (1. 2. 3.)
      const numberedMatch = trimmed.match(NUMBERED_STEP_PREFIX);
      if (numberedMatch) {
        collectingSubtitle = false;
        numberedSteps.push(numberedMatch[1].trim());
        continue;
      }

      // 불릿
      const bulletMatch = trimmed.match(BULLET_PREFIX);
      if (bulletMatch) {
        collectingSubtitle = false;
        const bulletText = bulletMatch[1].trim();
        if (hasEvolutionMarkers && evolutionSection) {
          if (evolutionSection === "from") {
            fromBullets.push(bulletText);
          } else if (evolutionSection === "steps") {
            steps.push(bulletText);
          } else {
            toBullets.push(bulletText);
          }
        } else if (isAbstract) {
          const labeled = bulletText.match(ABSTRACT_LABEL_PREFIX);
          if (labeled) {
            scenes.push({ label: labeled[1].trim(), copy: labeled[2].trim() });
          } else {
            scenes.push({ copy: bulletText });
          }
        } else {
          bullets.push(bulletText);
        }
        continue;
      }

      // 태그
      if (trimmed.startsWith("> ")) {
        collectingSubtitle = false;
        const tagText = trimmed.slice(2);
        for (const t of tagText.split(",")) {
          const tag = t.trim();
          if (!tag) continue;
          const accentMatch = tag.match(/^\*(.+)\*$/);
          if (accentMatch) {
            tags.push({ text: accentMatch[1] });
          } else {
            tags.push({ text: tag });
          }
        }
        continue;
      }

      // 이미지
      const imgMatch = trimmed.match(/^!\[.*\]\((.+)\)$/);
      if (imgMatch) {
        collectingSubtitle = false;
        if (hasEvolutionMarkers && evolutionSection) {
          if (evolutionSection === "from") {
            fromImage = imgMatch[1];
          } else if (evolutionSection === "to") {
            toImage = imgMatch[1];
          }
        } else {
          image = imgMatch[1];
        }
        continue;
      }

      if (hasEvolutionMarkers && evolutionSection) {
        collectingSubtitle = false;
        if (evolutionSection === "from") {
          if (!fromTitle) {
            const parsed = parseEvolutionSectionLabel(trimmed);
            fromBadge = parsed.badge || fromBadge;
            fromTitle = parsed.title || "";
          } else {
            fromBullets.push(trimmed);
          }
        } else if (evolutionSection === "steps") {
          steps.push(trimmed);
        } else {
          if (!toTitle) {
            const parsed = parseEvolutionSectionLabel(trimmed);
            toBadge = parsed.badge || toBadge;
            toTitle = parsed.title || "";
          } else {
            toBullets.push(trimmed);
          }
        }
        continue;
      }

      // 서브텍스트
      if (headingDone && collectingSubtitle) {
        subtitle += (subtitle ? "\n" : "") + trimmed;
      }
    }

    // flush
    if (pendingStatValue) {
      statItems.push({ value: pendingStatValue, label: "", visual: pendingStatVisual });
      pendingStatValue = "";
      pendingStatVisual = undefined;
    }
    if (currentCompareColumn) {
      compareColumns.push(currentCompareColumn);
      currentCompareColumn = null;
    }

    // 타입 자동 감지
    const base = { badge, badgeVariant, theme } as const;

    if (isAbstract) {
      slides.push({
        type: "abstract-scene",
        ...base,
        title,
        direction,
        prompts,
        scenes,
      });
    } else if (hasEvolutionMarkers) {
      slides.push({
        type: "evolution-flow",
        ...base,
        title,
        fromBadge: fromBadge || undefined,
        fromTitle: fromTitle || undefined,
        fromImage: fromImage || undefined,
        fromBullets,
        steps,
        toBadge: toBadge || undefined,
        toTitle: toTitle || undefined,
        toImage: toImage || undefined,
        toBullets,
      });
    } else if (statItems.length > 0) {
      slides.push({ type: "stat", ...base, title, stats: statItems });
    } else if (quoteText) {
      slides.push({ type: "quote", ...base, title, quote: quoteText, attribution: attribution || undefined });
    } else if (compareColumns.length > 0) {
      slides.push({ type: "compare", ...base, title, columns: compareColumns });
    } else if (numberedSteps.length > 0) {
      slides.push({ type: "steps", ...base, title, steps: numberedSteps });
    } else if (image && bullets.length > 0) {
      slides.push({ type: "split", ...base, title, image, bullets });
    } else if (image) {
      slides.push({ type: "title-image", ...base, title, image, subtitle: subtitle || undefined });
    } else if (tags.length > 0) {
      slides.push({ type: "title-tags", ...base, title, tags, subtitle: subtitle || undefined });
    } else if (bullets.length > 0) {
      slides.push({
        type: "title-bullets",
        ...base,
        title,
        bullets,
      });
    } else {
      slides.push({
        type: "title",
        ...base,
        title,
        subtitle: subtitle || undefined,
      });
    }
  }

  return slides;
}
