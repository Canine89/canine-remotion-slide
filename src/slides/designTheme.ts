import { DesignThemeConfig, ThemeColors } from "./themes";
import { Theme } from "./types";

const THEME_NAMES: Theme[] = [
  "dark",
  "blue",
  "orange",
  "yellow",
  "black",
  "parchment",
  "figma",
];

const THEME_COLOR_KEYS: (keyof ThemeColors)[] = [
  "bg",
  "title",
  "text",
  "accent",
  "badgeDefaultVariant",
  "fontHeading",
  "fontBody",
  "fontLabel",
  "fontWeightHeading",
  "fontWeightBody",
  "fontWeightLabel",
  "bodyLetterSpacing",
  "bodyLineHeight",
  "badgeRadius",
  "badgeFontSize",
  "badgeLetterSpacing",
  "titleLetterSpacing",
  "titleLineHeight",
  "titleTextStroke",
  "titleTextShadow",
  "bulletMarker",
];

const toNumber = (value: string) => {
  const parsed = Number(value.trim());
  return Number.isFinite(parsed) ? parsed : undefined;
};

const normalizeScalar = (rawValue: string) => {
  const value = rawValue.trim().replace(/^["']|["']$/g, "");
  const numeric = toNumber(value);
  return numeric ?? value;
};

const normalizeBadgeVariant = (value: unknown): 0 | 1 | undefined => {
  if (value === 0 || value === 1) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = toNumber(value);
    return parsed === 0 || parsed === 1 ? parsed : undefined;
  }
  return undefined;
};

const getReadableTextColor = (hex: string) => {
  const normalized = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return "#0f0f0f";
  }

  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

  return luminance < 0.55 ? "#fafafa" : "#0f0f0f";
};

const parseLooseObject = (input: string): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

  for (const line of input.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const match = trimmed.match(/^([A-Za-z0-9_.-]+)\s*:\s*(.+)$/);
    if (!match) {
      continue;
    }

    result[match[1]] = normalizeScalar(match[2]);
  }

  return result;
};

const parseStructuredBlock = (raw: string): DesignThemeConfig | null => {
  const blockMatch = raw.match(/```(?:theme|theme-overrides?|json|yaml|yml)\s*\n([\s\S]*?)```/i);
  if (!blockMatch) {
    return null;
  }

  const block = blockMatch[1].trim();
  if (!block) {
    return null;
  }

  try {
    return JSON.parse(block) as DesignThemeConfig;
  } catch {
    const loose = parseLooseObject(block);
    const normalized: DesignThemeConfig = { default: {}, themes: {} };

    for (const [key, value] of Object.entries(loose)) {
      if (key.startsWith("default.")) {
        const themeKey = key.slice("default.".length) as keyof ThemeColors;
        normalized.default![themeKey] = value as never;
        continue;
      }

      const [maybeTheme, ...rest] = key.split(".");
      if (THEME_NAMES.includes(maybeTheme as Theme) && rest.length > 0) {
        const themeName = maybeTheme as Theme;
        const themeKey = rest.join(".") as keyof ThemeColors;
        normalized.themes![themeName] ??= {};
        normalized.themes![themeName]![themeKey] = value as never;
      }
    }

    const hasDefault = normalized.default && Object.keys(normalized.default).length > 0;
    const hasThemes = normalized.themes && Object.keys(normalized.themes).length > 0;
    return hasDefault || hasThemes ? normalized : null;
  }
};

const extractFirstMatch = (raw: string, pattern: RegExp) => {
  const match = raw.match(pattern);
  return match?.[1]?.trim();
};

const detectFigmaHeuristics = (raw: string): Partial<ThemeColors> => {
  if (!/figma/i.test(raw)) {
    return {};
  }

  return {
    fontHeading: "figmaSans Fallback, 'SF Pro Display', system-ui, sans-serif",
    fontBody: "figmaSans Fallback, 'SF Pro Display', system-ui, sans-serif",
    fontLabel: "figmaMono Fallback, 'SF Mono', Menlo, monospace",
    fontWeightHeading: 400,
    fontWeightBody: 330,
    fontWeightLabel: 400,
    bodyLetterSpacing: "0px",
    bodyLineHeight: 1.5,
    badgeRadius: 50,
    badgeFontSize: 30,
    badgeLetterSpacing: "0.54px",
    titleLetterSpacing: extractFirstMatch(raw, /letter-spacing\s*[^\d-]*(-?\d+(?:\.\d+)?px)/i) ?? "-1.72px",
    titleLineHeight: toNumber(extractFirstMatch(raw, /line-height\s*[^\d]*([0-9.]+)/i) ?? "") ?? 1,
    titleTextStroke: /dashed 2px/i.test(raw) ? "0px transparent" : undefined,
    titleTextShadow: "none",
    bulletMarker: /strictly black-and-white|monochrome/i.test(raw) ? "—" : "•",
  };
};

const detectGenericHeuristics = (raw: string): Partial<ThemeColors> => {
  const titleLetterSpacing = extractFirstMatch(raw, /Display[\s\S]{0,120}?Letter Spacing\s*\|\s*([^\|\n]+)/i)
    ?? extractFirstMatch(raw, /title letter-spacing\s*:\s*([^\n]+)/i);
  const titleLineHeight = extractFirstMatch(raw, /Display[\s\S]{0,120}?Line Height\s*\|\s*([^\|\n]+)/i)
    ?? extractFirstMatch(raw, /title line-height\s*:\s*([^\n]+)/i);
  const bodyLetterSpacing = extractFirstMatch(raw, /Body[\s\S]{0,160}?Letter Spacing\s*\|\s*([^\|\n]+)/i)
    ?? extractFirstMatch(raw, /body letter-spacing\s*:\s*([^\n]+)/i);
  const bodyLineHeight = extractFirstMatch(raw, /Body[\s\S]{0,160}?Line Height\s*\|\s*([^\|\n]+)/i)
    ?? extractFirstMatch(raw, /body line-height\s*:\s*([^\n]+)/i);
  const badgeRadius = extractFirstMatch(raw, /(?:pill|radius)\s*\(?([0-9]+)px\)?/i);
  const fontFamily =
    extractFirstMatch(raw, /Primary\*?\*?:?\s*`([^`]+)`/i)
    ?? extractFirstMatch(raw, /font family\s*:\s*`?([^\n`]+)`?/i);

  const next: Partial<ThemeColors> = {};
  if (fontFamily) {
    next.fontHeading = fontFamily;
    next.fontBody = fontFamily;
  }
  if (titleLetterSpacing) {
    next.titleLetterSpacing = titleLetterSpacing.replace(/\s+/g, " ").trim();
  }
  if (titleLineHeight) {
    const lineHeight = toNumber(titleLineHeight.replace(/[^\d.]/g, ""));
    if (lineHeight !== undefined) {
      next.titleLineHeight = lineHeight;
    }
  }
  if (bodyLetterSpacing) {
    next.bodyLetterSpacing = bodyLetterSpacing.replace(/\s+/g, " ").trim();
  }
  if (bodyLineHeight) {
    const lineHeight = toNumber(bodyLineHeight.replace(/[^\d.]/g, ""));
    if (lineHeight !== undefined) {
      next.bodyLineHeight = lineHeight;
    }
  }
  if (badgeRadius) {
    const radius = toNumber(badgeRadius);
    if (radius !== undefined) {
      next.badgeRadius = radius;
    }
  }

  return next;
};

const detectColorHeuristics = (raw: string): Partial<ThemeColors> => {
  const brandSection = raw.match(/###\s+Brand[\s\S]*?(?=\n###|\n##|$)/i)?.[0] ?? raw;
  const brandColors = Array.from(brandSection.matchAll(/`(#[0-9a-fA-F]{6})`/g)).map((match) => match[1]);
  const accent = brandColors[0];
  const accentAlt = brandColors[1];

  if (!accent) {
    return {};
  }

  const next: Partial<ThemeColors> = {
    accent,
    badge: [
      {},
      {
        bg: accent,
        text: getReadableTextColor(accent),
      },
    ] as ThemeColors["badge"],
  };

  if (/identity marker|brand accent/i.test(raw)) {
    next.badgeDefaultVariant = 1;
  }

  if (accentAlt && /link/i.test(brandSection)) {
    next.accent = accentAlt;
  }

  return next;
};

const sanitizeThemeOverride = (theme: Partial<ThemeColors> | undefined) => {
  if (!theme) {
    return undefined;
  }

  const next: Partial<ThemeColors> = {};
  for (const key of THEME_COLOR_KEYS) {
    const value = theme[key];
    if (value !== undefined) {
      (next as Record<string, unknown>)[key] = value;
    }
  }

  if (Array.isArray(theme.badge)) {
    next.badge = theme.badge as ThemeColors["badge"];
  }

  return Object.keys(next).length > 0 ? next : undefined;
};

const mergeThemeOverride = (
  base: Partial<ThemeColors> | undefined,
  override: Partial<ThemeColors> | undefined
) => {
  return sanitizeThemeOverride({
    ...(base ?? {}),
    ...(override ?? {}),
    badgeDefaultVariant:
      normalizeBadgeVariant(override?.badgeDefaultVariant)
      ?? normalizeBadgeVariant(base?.badgeDefaultVariant),
    badge: override?.badge ?? base?.badge,
  });
};

const parseGeneratedTheme = (raw: string | null | undefined): DesignThemeConfig | null => {
  if (!raw?.trim()) {
    return null;
  }

  try {
    return JSON.parse(raw) as DesignThemeConfig;
  } catch {
    return parseStructuredBlock(raw);
  }
};

export const buildDesignThemeConfig = ({
  designRaw,
  generatedRaw,
}: {
  designRaw?: string | null;
  generatedRaw?: string | null;
}): DesignThemeConfig => {
  const raw = designRaw?.trim() ? designRaw : null;
  const structured = raw ? parseStructuredBlock(raw) : null;
  const inferred = raw
    ? {
        ...detectGenericHeuristics(raw),
        ...detectFigmaHeuristics(raw),
        ...detectColorHeuristics(raw),
      }
    : {};
  const generated = parseGeneratedTheme(generatedRaw);

  const baseTheme =
    generated?.baseTheme
    ?? structured?.baseTheme;

  const defaultTheme = mergeThemeOverride(
    mergeThemeOverride(inferred, structured?.default),
    generated?.default
  );

  const themeNames = new Set<Theme>([
    ...Object.keys(structured?.themes ?? {}) as Theme[],
    ...Object.keys(generated?.themes ?? {}) as Theme[],
  ]);

  const themes = Object.fromEntries(
    Array.from(themeNames).flatMap((themeName) => {
      const merged = mergeThemeOverride(
        structured?.themes?.[themeName],
        generated?.themes?.[themeName]
      );
      return merged ? [[themeName, merged]] : [];
    })
  ) as DesignThemeConfig["themes"];

  return {
    baseTheme,
    default: defaultTheme,
    themes,
  };
};
