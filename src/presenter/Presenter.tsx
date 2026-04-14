import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Player, PlayerRef } from "@remotion/player";
import { SlideData } from "../slides/types";
import { Presentation } from "../slides/Presentation";
import { SLIDE_DEFAULTS } from "../slides/types";
import { slides as importedSlides } from "../data/data.vite";

const STORAGE_KEY = "markdown-presenter-slide-index";
const AUTO_PAUSE_BUFFER_MS = 300; // 애니메이션 완료 후 여유
const CONTINUOUS_SLIDE_DURATION = SLIDE_DEFAULTS.FPS * 60 * 60; // 1 hour in presenter

const clampIndex = (index: number, slides: SlideData[]) => {
  if (slides.length === 0) return 0;
  return Math.max(0, Math.min(index, slides.length - 1));
};

const readStoredIndex = () => {
  const value = window.sessionStorage.getItem(STORAGE_KEY);
  if (value === null) return 0;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getSlideTimings = (slides: SlideData[]) => {
  const startFrames: number[] = [];
  let totalFrames = 0;

  for (let i = 0; i < slides.length; i++) {
    startFrames.push(totalFrames);
    const duration = slides[i].duration ?? SLIDE_DEFAULTS.DURATION;
    totalFrames += duration - (i < slides.length - 1 ? SLIDE_DEFAULTS.TRANSITION : 0);
  }

  return { startFrames, totalFrames };
};

const getSettledFrameOffset = (slide: SlideData) => {
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
            ? slide.direction.split(/\s*,\s*/).map((text) => ({ text: text.trim() })).filter((item) => item.text)
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

const isContinuousSlide = (slide: SlideData | undefined) => {
  return slide?.type === "evolution-flow" || slide?.type === "steps" || slide?.type === "stat";
};

const getPresenterSlides = (slides: SlideData[]) => {
  return slides.map((slide) =>
    isContinuousSlide(slide)
      ? { ...slide, duration: Math.max(slide.duration ?? 0, CONTINUOUS_SLIDE_DURATION) }
      : slide
  );
};

const tokenCountForTiming = (text: string) => {
  const lengthScore = Math.max(4, Math.min(16, Math.ceil(text.length / 7)));
  if (/많이|폭발|다 읽|전체|과다|소모/i.test(text)) return lengthScore + 8;
  if (/적게|절약|압축|ast|구조|뼈대/i.test(text)) return Math.max(4, lengthScore - 3);
  return lengthScore;
};

const tokenCountForPromptForTiming = (prompts: { text: string }[]) => {
  return Math.max(...prompts.map((prompt) => tokenCountForTiming(prompt.text)), 1);
};

const PresentationPlayer: React.FC<{ slides: SlideData[] }> = ({ slides }) => {
  return <Presentation slides={slides} />;
};

export const Presenter: React.FC = () => {
  const playerRef = useRef<PlayerRef>(null);
  const pauseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialLoad = useRef(true);
  const currentSlideRef = useRef(0);
  const skipEffect = useRef(false);
  const slides = useMemo(() => getPresenterSlides(importedSlides), []);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(() => {
    const idx = clampIndex(readStoredIndex(), slides);
    currentSlideRef.current = idx;
    return idx;
  });
  const { startFrames, totalFrames } = useMemo(() => getSlideTimings(slides), [slides]);

  useEffect(() => {
    window.sessionStorage.setItem(STORAGE_KEY, String(currentSlide));
  }, [currentSlide]);

  const goToSlide = useCallback((index: number) => {
    if (slides.length === 0) return;

    const player = playerRef.current;
    const nextSlide = clampIndex(index, slides);
    const rawStart = startFrames[nextSlide] ?? 0;
    const isBackward = nextSlide < currentSlideRef.current;
    const transitionSkip = isBackward && nextSlide > 0 ? SLIDE_DEFAULTS.TRANSITION : 0;
    const startFrame = rawStart + transitionSkip;
    const slideData = slides[nextSlide];
    const slideDuration = slideData?.duration ?? SLIDE_DEFAULTS.DURATION;
    const settledOffset = getSettledFrameOffset(slideData);
    const settledFrame = rawStart + Math.min(settledOffset, slideDuration - 1);
    const continuous = isContinuousSlide(slideData);

    skipEffect.current = true;
    setCurrentSlide(nextSlide);
    currentSlideRef.current = nextSlide;

    if (!player) return;

    if (pauseTimer.current) clearTimeout(pauseTimer.current);

    if (initialLoad.current) {
      initialLoad.current = false;
      if (continuous) {
        player.seekTo(startFrame);
        player.play();
      } else {
        player.seekTo(settledFrame);
        player.pause();
      }
      setIsPlayerReady(true);
      return;
    }

    player.seekTo(startFrame);
    player.play();
    if (continuous) {
      setIsPlayerReady(true);
      return;
    }

    const effectiveOffset = Math.max(0, settledOffset - transitionSkip);
    const animationMs = (effectiveOffset / SLIDE_DEFAULTS.FPS) * 1000 + AUTO_PAUSE_BUFFER_MS;
    pauseTimer.current = setTimeout(() => {
      player.pause();
      player.seekTo(settledFrame);
      setIsPlayerReady(true);
    }, animationMs);
  }, [slides, startFrames]);

  useEffect(() => {
    if (slides.length === 0) return;
    if (skipEffect.current) {
      skipEffect.current = false;
      return;
    }
    goToSlide(currentSlide);
    return () => {
      if (pauseTimer.current) clearTimeout(pauseTimer.current);
    };
  }, [currentSlide, goToSlide, slides.length]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "f" || event.key === "F" || event.key === "ㄹ") {
        event.preventDefault();
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          document.documentElement.requestFullscreen();
        }
      }
      if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") {
        event.preventDefault();
        goToSlide(currentSlide + 1);
      }
      if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        goToSlide(currentSlide - 1);
      }
      if (event.key === "Home") {
        event.preventDefault();
        goToSlide(0);
      }
      if (event.key === "End") {
        event.preventDefault();
        goToSlide(Math.max(0, slides.length - 1));
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [currentSlide, goToSlide, slides.length]);

  if (slides.length === 0) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        No slides found
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#050505",
        display: "grid",
        placeItems: "center",
      }}
    >
      <div
        style={{
          width: "min(100vw, calc(100vh * 16 / 9))",
          aspectRatio: "16 / 9",
          position: "relative",
          overflow: "hidden",
          background: "#000",
        }}
      >
        <Player
          ref={playerRef}
          component={PresentationPlayer}
          inputProps={{ slides }}
          durationInFrames={totalFrames}
          compositionWidth={1920}
          compositionHeight={1080}
          fps={SLIDE_DEFAULTS.FPS}
          controls={false}
          autoPlay={false}
          initialFrame={
            isContinuousSlide(slides[currentSlide])
              ? (startFrames[currentSlide] ?? 0)
              : (startFrames[currentSlide] ?? 0) +
                Math.min(
                  getSettledFrameOffset(slides[currentSlide]),
                  (slides[currentSlide]?.duration ?? SLIDE_DEFAULTS.DURATION) - 1
                )
          }
          acknowledgeRemotionLicense
          style={{
            width: "100%",
            height: "100%",
            opacity: isPlayerReady ? 1 : 0,
            transition: "opacity 120ms ease-out",
          }}
        />
      </div>

      <div
        style={{
          position: "fixed",
          bottom: 18,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 10,
          alignItems: "center",
          padding: "10px 14px",
          borderRadius: 999,
          background: "rgba(12, 12, 12, 0.75)",
          color: "rgba(255,255,255,0.9)",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 12,
          backdropFilter: "blur(10px)",
        }}
      >
        <button
          type="button"
          onClick={() => goToSlide(currentSlide - 1)}
          style={buttonStyle}
        >
          Prev
        </button>
        <span>
          {currentSlide + 1} / {slides.length}
        </span>
        <button
          type="button"
          onClick={() => goToSlide(currentSlide + 1)}
          style={buttonStyle}
        >
          Next
        </button>
      </div>
    </div>
  );
};

const buttonStyle: React.CSSProperties = {
  border: 0,
  borderRadius: 999,
  padding: "8px 12px",
  background: "rgba(255,255,255,0.12)",
  color: "#fff",
  cursor: "pointer",
};
