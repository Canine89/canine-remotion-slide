import React from "react";
import { AbsoluteFill, staticFile } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { SlideData } from "../slides/types";
import { ShortSlideRenderer } from "./ShortSlideRenderer";
import { SHORTS } from "./constants";

interface Props {
  slides: SlideData[];
}

export const ShortPresentation: React.FC<Props> = ({ slides }) => {
  const hasMascot = true;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      <TransitionSeries>
        {slides.map((slideData, index) => {
          const duration = slideData.duration || SHORTS.SLIDE_DURATION;
          const elements: React.ReactNode[] = [];

          if (index > 0) {
            elements.push(
              <TransitionSeries.Transition
                key={`transition-${index}`}
                presentation={fade()}
                timing={linearTiming({
                  durationInFrames: SHORTS.TRANSITION_DURATION,
                })}
              />
            );
          }

          elements.push(
            <TransitionSeries.Sequence
              key={`slide-${index}`}
              durationInFrames={duration}
            >
              <ShortSlideRenderer slide={slideData} />
            </TransitionSeries.Sequence>
          );

          return elements;
        })}
      </TransitionSeries>

      {/* 마스코트 / 로고 */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          right: 32,
          width: 64,
          height: 64,
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        {hasMascot ? (
          <img
            src={staticFile("assets/logo-bottom-right.png")}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              border: "2px dashed rgba(255,255,255,0.3)",
              backgroundColor: "rgba(255,255,255,0.05)",
              borderRadius: 8,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "rgba(255,255,255,0.2)",
              fontSize: 10,
              fontFamily: "'Paperlogy 5 Medium', 'Paperlogy', sans-serif",
            }}
          >
            LOGO
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
