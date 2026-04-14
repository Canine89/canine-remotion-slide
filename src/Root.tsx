import React from "react";
import { Composition } from "remotion";
import { Presentation } from "./slides/Presentation";
import { ShortPresentation } from "./shorts/ShortPresentation";
import { SLIDE_DEFAULTS, SlideData } from "./slides/types";
import { SHORTS } from "./shorts/constants";

// --- 가로형 프로젝트별 data import ---
import { slides as markdownSlides } from "./data/data";

// --- 세로형 프로젝트별 data import ---
import { shortSlides as markdownShorts } from "./shorts-data/data";

// --- 프로젝트 등록 ---
const slideProjects: { id: string; slides: SlideData[] }[] = [
  { id: "Markdown", slides: markdownSlides },
];

const shortProjects: { id: string; slides: SlideData[] }[] = [
  { id: "Markdown", slides: markdownShorts },
];

function calcFrames(
  slides: SlideData[],
  duration: number,
  transition: number
) {
  return slides.reduce(
    (sum, s, i) => sum + (s.duration || duration) - (i > 0 ? transition : 0),
    0
  );
}

export const Root: React.FC = () => {
  return (
    <>
      {/* 가로형 슬라이드 — 프로젝트별 */}
      {slideProjects.map(({ id, slides }) => (
        <Composition
          key={`slides-${id}`}
          id={`Slides-${id}`}
          component={() => <Presentation slides={slides} />}
          durationInFrames={calcFrames(
            slides,
            SLIDE_DEFAULTS.DURATION,
            SLIDE_DEFAULTS.TRANSITION
          )}
          fps={SLIDE_DEFAULTS.FPS}
          width={1920}
          height={1080}
        />
      ))}

      {/* 세로형 쇼츠 — 프로젝트별 */}
      {shortProjects.map(({ id, slides }) => (
        <Composition
          key={`shorts-${id}`}
          id={`Shorts-${id}`}
          component={() => <ShortPresentation slides={slides} />}
          durationInFrames={calcFrames(
            slides,
            SHORTS.SLIDE_DURATION,
            SHORTS.TRANSITION_DURATION
          )}
          fps={SHORTS.FPS}
          width={SHORTS.WIDTH}
          height={SHORTS.HEIGHT}
        />
      ))}
    </>
  );
};
