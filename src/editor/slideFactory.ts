import { SlideData } from "../slides/types";

/**
 * 각 슬라이드 타입의 기본 SlideData를 생성한다.
 */
export function createSlide(type: SlideData["type"]): SlideData {
  switch (type) {
    case "title":
      return { type: "title", badge: "TITLE", title: "새 슬라이드" };
    case "title-image":
      return { type: "title-image", badge: "IMAGE", title: "새 슬라이드", image: "" };
    case "title-tags":
      return {
        type: "title-tags",
        badge: "TAGS",
        title: "새 슬라이드",
        tags: [{ text: "태그1" }, { text: "태그2" }],
      };
    case "title-bullets":
      return {
        type: "title-bullets",
        badge: "LIST",
        title: "새 슬라이드",
        bullets: ["첫 번째 항목", "두 번째 항목"],
      };
    case "split":
      return {
        type: "split",
        badge: "SPLIT",
        title: "새 슬라이드",
        bullets: ["첫 번째 항목"],
      };
    case "stat":
      return {
        type: "stat",
        badge: "STAT",
        title: "새 슬라이드",
        stats: [{ value: "100", label: "항목" }],
      };
    case "quote":
      return {
        type: "quote",
        badge: "QUOTE",
        title: "인용",
        quote: "여기에 인용구를 입력하세요",
      };
    case "steps":
      return {
        type: "steps",
        badge: "STEPS",
        title: "새 슬라이드",
        steps: ["1단계", "2단계", "3단계"],
      };
    case "compare":
      return {
        type: "compare",
        badge: "VS",
        title: "비교",
        columns: [
          { heading: "A", bullets: ["항목 1"] },
          { heading: "B", bullets: ["항목 1"] },
        ],
      };
    case "evolution-flow":
      return {
        type: "evolution-flow",
        badge: "FLOW",
        title: "변화 흐름",
        fromBullets: ["이전 상태"],
        steps: [],
        toBullets: ["이후 상태"],
      };
    case "abstract-scene":
      return {
        type: "abstract-scene",
        badge: "SCENE",
        title: "새 씬",
        direction: "",
        scenes: [{ copy: "내용" }],
      };
  }
}

export const SLIDE_TYPE_LABELS: Record<SlideData["type"], string> = {
  title: "타이틀",
  "title-image": "타이틀 + 이미지",
  "title-tags": "타이틀 + 태그",
  "title-bullets": "타이틀 + 불릿",
  split: "분할 (이미지 + 불릿)",
  stat: "통계",
  quote: "인용구",
  steps: "단계",
  compare: "비교",
  "evolution-flow": "변화 흐름",
  "abstract-scene": "추상 씬",
};
