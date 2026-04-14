export type Theme = "dark" | "blue" | "orange" | "yellow" | "black" | "parchment" | "figma";
export type ThemeDirective = Theme | "DESIGN.md";

export type Tag = {
  text: string;
  color?: string;
};

export type AbstractPrompt = {
  text: string;
};

export type AbstractSceneItem = {
  label?: string;
  copy: string;
};

// badgeVariant 미지정 시 테마의 기본 배지 variant를 사용한다.
// 0 = 1번째 뱃지 색, 1 = 2번째 뱃지 색
export type SlideData =
  | {
      type: "title";
      badge: string;
      badgeVariant?: 0 | 1;
      title: string;
      subtitle?: string;
      theme?: ThemeDirective;
      duration?: number;
    }
  | {
      type: "title-image";
      badge: string;
      badgeVariant?: 0 | 1;
      title: string;
      subtitle?: string;
      image: string;
      theme?: ThemeDirective;
      duration?: number;
    }
  | {
      type: "title-tags";
      badge: string;
      badgeVariant?: 0 | 1;
      title: string;
      subtitle?: string;
      tags: Tag[];
      theme?: ThemeDirective;
      duration?: number;
    }
  | {
      type: "title-bullets";
      badge: string;
      badgeVariant?: 0 | 1;
      title: string;
      bullets: string[];
      theme?: ThemeDirective;
      duration?: number;
    }
  | {
      type: "split";
      badge: string;
      badgeVariant?: 0 | 1;
      title?: string;
      image?: string;
      bullets: string[];
      theme?: ThemeDirective;
      duration?: number;
    }
  | {
      type: "abstract-scene";
      badge: string;
      badgeVariant?: 0 | 1;
      title: string;
      direction: string;
      prompts?: AbstractPrompt[];
      scenes: AbstractSceneItem[];
      theme?: ThemeDirective;
      duration?: number;
    }
  | {
      type: "evolution-flow";
      badge: string;
      badgeVariant?: 0 | 1;
      title: string;
      fromBadge?: string;
      fromTitle?: string;
      fromImage?: string;
      fromBullets: string[];
      steps: string[];
      toBadge?: string;
      toTitle?: string;
      toImage?: string;
      toBullets: string[];
      theme?: ThemeDirective;
      duration?: number;
    };

export const SLIDE_DEFAULTS = {
  FPS: 30,
  DURATION: 150, // 5초
  TRANSITION: 15, // 0.5초
} as const;
