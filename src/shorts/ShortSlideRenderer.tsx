import React from "react";
import { SlideData } from "../slides/types";
import { getTheme } from "../slides/themes";
import { VerticalTitleImageSlide } from "./templates/VerticalTitleImageSlide";
import { VerticalTitleTagsSlide } from "./templates/VerticalTitleTagsSlide";
import { VerticalTitleBulletsSlide } from "./templates/VerticalTitleBulletsSlide";
import { VerticalSplitSlide } from "./templates/VerticalSplitSlide";
import { VerticalAbstractSceneSlide } from "./templates/VerticalAbstractSceneSlide";

interface Props {
  slide: SlideData;
}

export const ShortSlideRenderer: React.FC<Props> = ({ slide }) => {
  const theme = getTheme(slide.theme);
  const bv = slide.badgeVariant ?? theme.badgeDefaultVariant ?? 0;
  const badgeBg = theme.badge[bv].bg;
  const badgeText = theme.badge[bv].text;

  switch (slide.type) {
    case "title-image":
      return (
        <VerticalTitleImageSlide
          badge={slide.badge}
          title={slide.title}
          subtitle={slide.subtitle}
          image={slide.image}
          theme={theme}
          badgeBg={badgeBg}
          badgeText={badgeText}
        />
      );
    case "title-tags":
      return (
        <VerticalTitleTagsSlide
          badge={slide.badge}
          title={slide.title}
          subtitle={slide.subtitle}
          tags={slide.tags}
          theme={theme}
          badgeBg={badgeBg}
          badgeText={badgeText}
        />
      );
    case "title-bullets":
      return (
        <VerticalTitleBulletsSlide
          badge={slide.badge}
          title={slide.title}
          bullets={slide.bullets}
          theme={theme}
          badgeBg={badgeBg}
          badgeText={badgeText}
        />
      );
    case "split":
      return (
        <VerticalSplitSlide
          badge={slide.badge}
          title={slide.title}
          image={slide.image}
          bullets={slide.bullets}
          theme={theme}
          badgeBg={badgeBg}
          badgeText={badgeText}
        />
      );
    case "abstract-scene":
      return (
        <VerticalAbstractSceneSlide
          badge={slide.badge}
          title={slide.title}
          direction={slide.direction}
          prompts={slide.prompts}
          scenes={slide.scenes}
          theme={theme}
          badgeBg={badgeBg}
          badgeText={badgeText}
        />
      );
  }
};
