import { SlideData } from "./types";

const tokenCountForTiming = (text: string) => {
  const lengthScore = Math.max(4, Math.min(16, Math.ceil(text.length / 7)));
  if (/많이|폭발|다 읽|전체|과다|소모/i.test(text)) return lengthScore + 8;
  if (/적게|절약|압축|ast|구조|뼈대/i.test(text)) return Math.max(4, lengthScore - 3);
  return lengthScore;
};

const tokenCountForPromptForTiming = (prompts: { text: string }[]) => {
  return Math.max(...prompts.map((prompt) => tokenCountForTiming(prompt.text)), 1);
};

export const getSettledFrameOffset = (slide: SlideData): number => {
  const titleDone = 36;
  const subtitleDone = 44;

  switch (slide.type) {
    case "title":
      return slide.subtitle ? subtitleDone : titleDone;
    case "stat": {
      const lastStatDone = 25 + (slide.stats.length - 1) * 10 + 15;
      return Math.max(titleDone, lastStatDone + 8);
    }
    case "quote":
      return slide.attribution ? 56 : 40;
    case "steps": {
      const lastStepDone = 28 + (slide.steps.length - 1) * 8 + 12;
      return Math.max(titleDone, lastStepDone + 8);
    }
    case "compare": {
      const lastColDone = 25 + (slide.columns.length - 1) * 8 + 14;
      const maxBullets = Math.max(...slide.columns.map((c) => c.bullets.length));
      const lastBulletDone = lastColDone + 10 + (maxBullets - 1) * 8 + 12;
      return Math.max(titleDone, lastBulletDone + 8);
    }
    case "title-bullets": {
      if (slide.bullets.length === 0) return titleDone;
      const lastBulletDone = 35 + (slide.bullets.length - 1) * 8 + 12;
      return Math.max(titleDone, lastBulletDone + 8);
    }
    case "title-tags": {
      const lastTagDone =
        slide.tags.length > 0 ? 40 + (slide.tags.length - 1) * 6 + 10 : 0;
      return Math.max(titleDone, subtitleDone, lastTagDone + 8);
    }
    case "title-image":
      return Math.max(titleDone, subtitleDone, 43);
    case "split": {
      const lastBulletDone =
        slide.bullets.length > 0 ? 25 + (slide.bullets.length - 1) * 8 + 12 : 0;
      return Math.max(titleDone, 33, lastBulletDone + 8);
    }
    case "abstract-scene": {
      const promptSource =
        slide.prompts && slide.prompts.length > 0
          ? slide.prompts
          : slide.direction
            ? slide.direction
                .split(/\s*,\s*/)
                .map((text) => ({ text: text.trim() }))
                .filter((item) => item.text)
            : [];
      const lastPromptDone =
        promptSource.length > 0 ? 34 + (tokenCountForPromptForTiming(promptSource) - 1) * 2 + 8 : 0;
      return Math.max(titleDone, 104, lastPromptDone + 36);
    }
    case "evolution-flow": {
      const lastStepDone =
        slide.steps.length > 0 ? 32 + (slide.steps.length - 1) * 8 + 12 : 0;
      const sideCount = Math.max(slide.fromBullets.length, slide.toBullets.length);
      const lastSideBulletDone = sideCount > 0 ? 20 + (sideCount - 1) * 8 + 12 : 0;
      return Math.max(titleDone, 52, lastStepDone + 14, lastSideBulletDone + 8);
    }
  }
};
