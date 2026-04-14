import React from "react";
import { AbsoluteFill, staticFile } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { SlideData, SLIDE_DEFAULTS } from "./types";
import { SlideRenderer } from "./SlideRenderer";

interface Props {
  slides: SlideData[];
}

export const Presentation: React.FC<Props> = ({ slides }) => {
  const hasMascot = true;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      <TransitionSeries>
        {slides.map((slideData, index) => {
          const duration = slideData.duration || SLIDE_DEFAULTS.DURATION;
          const elements: React.ReactNode[] = [];

          // 트랜지션 (첫 슬라이드 제외)
          if (index > 0) {
            elements.push(
              <TransitionSeries.Transition
                key={`transition-${index}`}
                presentation={fade()}
                timing={linearTiming({
                  durationInFrames: SLIDE_DEFAULTS.TRANSITION,
                })}
              />
            );
          }

          // 슬라이드
          elements.push(
            <TransitionSeries.Sequence
              key={`slide-${index}`}
              durationInFrames={duration}
            >
              <SlideRenderer slide={slideData} />
            </TransitionSeries.Sequence>
          );

          return elements;
        })}
      </TransitionSeries>

      {/* 마스코트 / 로고 — 전 슬라이드 공통 오버레이 */}
      <div
        style={{
          position: "absolute",
          bottom: 32,
          right: 40,
          width: 72,
          height: 72,
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
              fontSize: 11,
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
