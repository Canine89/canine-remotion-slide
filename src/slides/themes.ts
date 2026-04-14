import { buildDesignThemeConfig } from "./designTheme";
import { Theme, ThemeDirective } from "./types";

export interface BadgeStyle {
  bg: string;
  text: string;
}

export interface ThemeColors {
  bg: string;
  title: string;
  text: string;
  accent: string;
  badge: [BadgeStyle, BadgeStyle];
  badgeDefaultVariant?: 0 | 1;
  fontHeading?: string;
  fontBody?: string;
  fontLabel?: string;
  fontWeightHeading?: number;
  fontWeightBody?: number;
  fontWeightLabel?: number;
  bodyLetterSpacing?: string;
  bodyLineHeight?: number;
  badgeRadius?: number;
  badgeFontSize?: number;
  badgeLetterSpacing?: string;
  titleLetterSpacing?: string;
  titleLineHeight?: number;
  titleTextStroke?: string;
  titleTextShadow?: string;
  bulletMarker?: string;
}

export interface DesignThemeConfig {
  baseTheme?: Theme;
  default?: Partial<ThemeColors>;
  themes?: Partial<Record<Theme, Partial<ThemeColors>>>;
}

const DEFAULT_HEADING_FONT = "'Paperlogy 8 ExtraBold', 'Paperlogy', sans-serif";
const DEFAULT_BODY_FONT = "'Paperlogy 5 Medium', 'Paperlogy', sans-serif";
const DEFAULT_LABEL_FONT = "'Paperlogy 8 ExtraBold', 'Paperlogy', sans-serif";

const THEMES: Record<Theme, ThemeColors> = {
  dark: {
    bg: "#2D2D2D",
    title: "#FFFFFF",
    text: "#E0E0E0",
    accent: "#FFFFFF",
    badge: [
      { bg: "#1A1A1A", text: "#FFFFFF" },     // 1: 검정 바탕 흰 글씨
      { bg: "#1A1A1A", text: "#FFFFFF" },     // 2: 검정 바탕 흰 글씨
    ],
    badgeDefaultVariant: 0,
    fontHeading: DEFAULT_HEADING_FONT,
    fontBody: DEFAULT_BODY_FONT,
    fontLabel: DEFAULT_LABEL_FONT,
    fontWeightHeading: 800,
    fontWeightBody: 500,
    fontWeightLabel: 800,
    bodyLetterSpacing: "0px",
    bodyLineHeight: 1.5,
    badgeRadius: 999,
    badgeFontSize: 42,
    badgeLetterSpacing: "0.5px",
    titleLetterSpacing: "0px",
    titleLineHeight: 1.25,
    titleTextStroke: "1.5px rgba(0,0,0,0.15)",
    titleTextShadow: "2px 2px 0px rgba(0,0,0,0.15), 4px 4px 8px rgba(0,0,0,0.1)",
    bulletMarker: "•",
  },
  blue: {
    bg: "#2196F3",
    title: "#000000",
    text: "#1A1A1A",
    accent: "#FFFFFF",
    badge: [
      { bg: "#1A1A1A", text: "#FFFFFF" },     // 1: 검정 바탕 흰 글씨
      { bg: "#1565C0", text: "#FFFFFF" },     // 2: 진파랑 바탕 흰 글씨
    ],
    badgeDefaultVariant: 0,
    fontHeading: DEFAULT_HEADING_FONT,
    fontBody: DEFAULT_BODY_FONT,
    fontLabel: DEFAULT_LABEL_FONT,
    fontWeightHeading: 800,
    fontWeightBody: 500,
    fontWeightLabel: 800,
    bodyLetterSpacing: "0px",
    bodyLineHeight: 1.5,
    badgeRadius: 999,
    badgeFontSize: 42,
    badgeLetterSpacing: "0.5px",
    titleLetterSpacing: "0px",
    titleLineHeight: 1.25,
    titleTextStroke: "1.5px rgba(0,0,0,0.15)",
    titleTextShadow: "2px 2px 0px rgba(0,0,0,0.15), 4px 4px 8px rgba(0,0,0,0.1)",
    bulletMarker: "•",
  },
  orange: {
    bg: "#E8734A",
    title: "#FFFFFF",
    text: "#FFF5F0",
    accent: "#FFFFFF",
    badge: [
      { bg: "#1A1A1A", text: "#FFFFFF" },     // 1: 검정 바탕 흰 글씨
      { bg: "#C4532A", text: "#FFFFFF" },     // 2: 진주황 바탕 흰 글씨
    ],
    badgeDefaultVariant: 0,
    fontHeading: DEFAULT_HEADING_FONT,
    fontBody: DEFAULT_BODY_FONT,
    fontLabel: DEFAULT_LABEL_FONT,
    fontWeightHeading: 800,
    fontWeightBody: 500,
    fontWeightLabel: 800,
    bodyLetterSpacing: "0px",
    bodyLineHeight: 1.5,
    badgeRadius: 999,
    badgeFontSize: 42,
    badgeLetterSpacing: "0.5px",
    titleLetterSpacing: "0px",
    titleLineHeight: 1.25,
    titleTextStroke: "1.5px rgba(0,0,0,0.15)",
    titleTextShadow: "2px 2px 0px rgba(0,0,0,0.15), 4px 4px 8px rgba(0,0,0,0.1)",
    bulletMarker: "•",
  },
  yellow: {
    bg: "#F5E94B",
    title: "#111111",
    text: "#1F1F1F",
    accent: "#000000",
    badge: [
      { bg: "#000000", text: "#FAFF69" },     // 1: 블랙 바탕 네온 옐로 글씨
      { bg: "#333333", text: "#FFFFFF" },     // 2: 다크그레이 바탕 화이트 글씨
    ],
    badgeDefaultVariant: 0,
    fontHeading: DEFAULT_HEADING_FONT,
    fontBody: DEFAULT_BODY_FONT,
    fontLabel: DEFAULT_LABEL_FONT,
    fontWeightHeading: 800,
    fontWeightBody: 500,
    fontWeightLabel: 800,
    bodyLetterSpacing: "0px",
    bodyLineHeight: 1.5,
    badgeRadius: 999,
    badgeFontSize: 42,
    badgeLetterSpacing: "0.5px",
    titleLetterSpacing: "0px",
    titleLineHeight: 1.25,
    titleTextStroke: "1.5px rgba(255,255,255,0.22)",
    titleTextShadow: "2px 2px 0px rgba(255,255,255,0.16), 0 10px 18px rgba(0,0,0,0.12)",
    bulletMarker: "•",
  },
  black: {
    bg: "#000000",
    title: "#FFFFFF",
    text: "#CCCCCC",
    accent: "#FAFF69",
    badge: [
      { bg: "#FAFF69", text: "#000000" },     // 1: 네온 바탕 검정 글씨
      { bg: "#333333", text: "#FFFFFF" },     // 2: 진회색 바탕 흰 글씨
    ],
    badgeDefaultVariant: 0,
    fontHeading: DEFAULT_HEADING_FONT,
    fontBody: DEFAULT_BODY_FONT,
    fontLabel: DEFAULT_LABEL_FONT,
    fontWeightHeading: 800,
    fontWeightBody: 500,
    fontWeightLabel: 800,
    bodyLetterSpacing: "0px",
    bodyLineHeight: 1.5,
    badgeRadius: 999,
    badgeFontSize: 42,
    badgeLetterSpacing: "0.5px",
    titleLetterSpacing: "0px",
    titleLineHeight: 1.25,
    titleTextStroke: "1.5px rgba(0,0,0,0.15)",
    titleTextShadow: "2px 2px 0px rgba(0,0,0,0.15), 4px 4px 8px rgba(0,0,0,0.1)",
    bulletMarker: "•",
  },
  parchment: {
    bg: "#F5F4ED",
    title: "#141413",
    text: "#5E5D59",
    accent: "#C96442",
    badge: [
      { bg: "#141413", text: "#FAF9F5" },     // 1: 니어블랙 바탕 아이보리 글씨
      { bg: "#C96442", text: "#FAF9F5" },     // 2: 테라코타 바탕 아이보리 글씨
    ],
    badgeDefaultVariant: 0,
    fontHeading: DEFAULT_HEADING_FONT,
    fontBody: DEFAULT_BODY_FONT,
    fontLabel: DEFAULT_LABEL_FONT,
    fontWeightHeading: 800,
    fontWeightBody: 500,
    fontWeightLabel: 800,
    bodyLetterSpacing: "0px",
    bodyLineHeight: 1.5,
    badgeRadius: 999,
    badgeFontSize: 42,
    badgeLetterSpacing: "0.5px",
    titleLetterSpacing: "0px",
    titleLineHeight: 1.25,
    titleTextStroke: "1.5px rgba(0,0,0,0.08)",
    titleTextShadow: "2px 2px 0px rgba(255,255,255,0.12), 4px 4px 10px rgba(0,0,0,0.06)",
    bulletMarker: "•",
  },
  figma: {
    bg: "#FFFFFF",
    title: "#000000",
    text: "#000000",
    accent: "#000000",
    badge: [
      { bg: "#000000", text: "#FFFFFF" },     // 1: 블랙 바탕 화이트 글씨
      { bg: "#000000", text: "#FFFFFF" },     // 2: 동일 (모노크롬)
    ],
    badgeDefaultVariant: 0,
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
    titleLetterSpacing: "-1.72px",
    titleLineHeight: 1,
    titleTextStroke: "0px transparent",
    titleTextShadow: "none",
    bulletMarker: "—",
  },
};

const mergeBadge = (
  baseBadge: [BadgeStyle, BadgeStyle],
  overrideBadge?: [Partial<BadgeStyle>, Partial<BadgeStyle>] | Partial<BadgeStyle>[]
): [BadgeStyle, BadgeStyle] => {
  if (!overrideBadge || overrideBadge.length === 0) {
    return baseBadge;
  }

  return [
    { ...baseBadge[0], ...(overrideBadge[0] ?? {}) },
    { ...baseBadge[1], ...(overrideBadge[1] ?? {}) },
  ];
};

const mergeThemeColors = (base: ThemeColors, override?: Partial<ThemeColors>): ThemeColors => {
  if (!override) {
    return base;
  }

  return {
    ...base,
    ...override,
    badge: mergeBadge(base.badge, override.badge),
  };
};

const DESIGN_THEME = buildDesignThemeConfig({
  designRaw: __SLIDE_DESIGN_RAW__,
  generatedRaw: __SLIDE_GENERATED_THEME_RAW__,
}) as DesignThemeConfig;

export const BASIC_THEMES: Theme[] = ["dark", "blue", "orange", "yellow", "black"];

const resolveDesignBaseTheme = (): Theme => DESIGN_THEME.baseTheme ?? "dark";

export const getTheme = (theme: ThemeDirective = "dark"): ThemeColors => {
  if (theme === "DESIGN.md") {
    const designBaseTheme = resolveDesignBaseTheme();
    const base = THEMES[designBaseTheme] ?? THEMES.dark;
    const withDefaultDesign = mergeThemeColors(base, DESIGN_THEME.default);
    return mergeThemeColors(withDefaultDesign, DESIGN_THEME.themes?.[designBaseTheme]);
  }

  return THEMES[theme] ?? THEMES.dark;
};
