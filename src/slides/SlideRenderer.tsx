import React from "react";
import { SlideData } from "./types";
import { getTheme } from "./themes";
import { TitleSlide } from "./templates/TitleSlide";
import { TitleImageSlide } from "./templates/TitleImageSlide";
import { StatSlide } from "./templates/StatSlide";
import { QuoteSlide } from "./templates/QuoteSlide";
import { StepsSlide } from "./templates/StepsSlide";
import { CompareSlide } from "./templates/CompareSlide";
import { TitleTagsSlide } from "./templates/TitleTagsSlide";
import { TitleBulletsSlide } from "./templates/TitleBulletsSlide";
import { SplitSlide } from "./templates/SplitSlide";
import { AbstractSceneSlide } from "./templates/AbstractSceneSlide";
import { EvolutionFlowSlide } from "./templates/EvolutionFlowSlide";

interface Props {
  slide: SlideData;
}

export const SlideRenderer: React.FC<Props> = ({ slide }) => {
  const theme = getTheme(slide.theme);
  const bv = slide.badgeVariant ?? theme.badgeDefaultVariant ?? 0;
  const badgeBg = theme.badge[bv].bg;
  const badgeText = theme.badge[bv].text;

  switch (slide.type) {
    case "title":
      return (
        <TitleSlide
          badge={slide.badge}
          title={slide.title}
          subtitle={slide.subtitle}
          theme={theme}
          badgeBg={badgeBg}
          badgeText={badgeText}
        />
      );
    case "title-image":
      return (
        <TitleImageSlide
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
        <TitleTagsSlide
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
        <TitleBulletsSlide
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
        <SplitSlide
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
        <AbstractSceneSlide
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
    case "stat":
      return (
        <StatSlide
          badge={slide.badge}
          title={slide.title}
          stats={slide.stats}
          theme={theme}
          badgeBg={badgeBg}
          badgeText={badgeText}
        />
      );
    case "quote":
      return (
        <QuoteSlide
          badge={slide.badge}
          title={slide.title}
          quote={slide.quote}
          attribution={slide.attribution}
          theme={theme}
          badgeBg={badgeBg}
          badgeText={badgeText}
        />
      );
    case "steps":
      return (
        <StepsSlide
          badge={slide.badge}
          title={slide.title}
          steps={slide.steps}
          theme={theme}
          badgeBg={badgeBg}
          badgeText={badgeText}
        />
      );
    case "compare":
      return (
        <CompareSlide
          badge={slide.badge}
          title={slide.title}
          columns={slide.columns}
          theme={theme}
          badgeBg={badgeBg}
          badgeText={badgeText}
        />
      );
    case "evolution-flow":
      return (
        <EvolutionFlowSlide
          badge={slide.badge}
          title={slide.title}
          fromBadge={slide.fromBadge}
          fromTitle={slide.fromTitle}
          fromImage={slide.fromImage}
          fromBullets={slide.fromBullets}
          toBadge={slide.toBadge}
          toTitle={slide.toTitle}
          toImage={slide.toImage}
          toBullets={slide.toBullets}
          theme={theme}
          badgeBg={badgeBg}
          badgeText={badgeText}
        />
      );
  }
};
