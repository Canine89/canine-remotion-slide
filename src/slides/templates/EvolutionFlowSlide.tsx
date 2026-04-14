import React, { useRef, useLayoutEffect, useState, useCallback } from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { ThemeColors } from "../themes";
import { Badge } from "../components/Badge";
import { SlideTitle } from "../components/SlideTitle";
import { BulletList } from "../components/BulletList";
import { ImagePlaceholder } from "../components/ImagePlaceholder";

const isLightColor = (hex: string): boolean => {
  const c = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(c)) return false;
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 > 0.55;
};

interface Props {
  badge: string;
  badgeBg: string;
  badgeText: string;
  title: string;
  fromBadge?: string;
  fromTitle?: string;
  fromImage?: string;
  fromBullets: string[];
  toBadge?: string;
  toTitle?: string;
  toImage?: string;
  toBullets: string[];
  theme: ThemeColors;
}

const reveal = (frame: number, start: number, end: number, fromX: number) => ({
  opacity: interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  }),
  translateX: interpolate(frame, [start, end], [fromX, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  }),
});

export const EvolutionFlowSlide: React.FC<Props> = ({
  badge,
  badgeBg,
  badgeText,
  title,
  fromBadge,
  fromTitle,
  fromImage,
  fromBullets,
  toBadge,
  toTitle,
  toImage,
  toBullets,
  theme,
}) => {
  const frame = useCurrentFrame();
  const gridRef = useRef<HTMLDivElement>(null);
  const leftBadgeRef = useRef<HTMLDivElement>(null);
  const rightBadgeRef = useRef<HTMLDivElement>(null);
  const [arrow, setArrow] = useState<{ x1: number; x2: number; y: number } | null>(null);

  const measure = useCallback(() => {
    const grid = gridRef.current;
    const lb = leftBadgeRef.current;
    const rb = rightBadgeRef.current;
    if (!grid || !lb || !rb) return;

    // offsetLeft/offsetTop/offsetWidth는 transform에 영향 받지 않음
    const getOffsetTo = (el: HTMLElement, ancestor: HTMLElement) => {
      let x = 0, y = 0;
      let cur: HTMLElement | null = el;
      while (cur && cur !== ancestor) {
        x += cur.offsetLeft;
        y += cur.offsetTop;
        cur = cur.offsetParent as HTMLElement | null;
      }
      return { x, y, w: el.offsetWidth, h: el.offsetHeight };
    };

    const lb2 = getOffsetTo(lb, grid);
    const rb2 = getOffsetTo(rb, grid);

    setArrow({
      x1: lb2.x + lb2.w,
      x2: rb2.x,
      y: lb2.y + lb2.h / 2,
    });
  }, []);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  const leftReveal = reveal(frame, 8, 22, -40);
  const centerReveal = reveal(frame, 22, 38, 0);
  const rightReveal = reveal(frame, 36, 52, 40);
  const lineScale = interpolate(frame, [24, 42], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const flowOpacity = interpolate(frame, [30, 42], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const dashOffset = -((frame * 2.4) % 120);
  const isLightBg = isLightColor(theme.bg);
  const arrowStroke = isLightBg ? "rgba(0,0,0,0.72)" : "rgba(255,255,255,0.88)";
  const arrowBase = isLightBg ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.18)";

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.bg,
        padding: "56px 52px",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1660,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 22,
        }}
      >
        <Badge text={badge} bgColor={badgeBg} textColor={badgeText} theme={theme} />
        <SlideTitle text={title} color={theme.title} theme={theme} />

        {/* 2열 콘텐츠 (배지 포함) + 화살표 오버레이 */}
        <div
          ref={gridRef}
          style={{
            width: "100%",
            position: "relative",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 60,
            alignItems: "start",
            marginTop: 28,
          }}
        >
          <FlowSide
            badge={fromBadge}
            badgeRef={leftBadgeRef}
            title={fromTitle}
            image={fromImage}
            bullets={fromBullets}
            titleColor={theme.title}
            textColor={theme.text}
            theme={theme}
            align="left"
            style={{
              opacity: leftReveal.opacity,
              transform: `translateX(${leftReveal.translateX}px)`,
            }}
          />

          <FlowSide
            badge={toBadge}
            badgeRef={rightBadgeRef}
            title={toTitle}
            image={toImage}
            bullets={toBullets}
            titleColor={theme.title}
            textColor={theme.text}
            theme={theme}
            align="right"
            style={{
              opacity: rightReveal.opacity,
              transform: `translateX(${rightReveal.translateX}px)`,
            }}
          />

          {/* 화살표 오버레이 — 배지 위치 측정 기반 */}
          {arrow && (() => {
            const pad = 10;
            const headLen = 28;
            const x1 = arrow.x1 + pad;
            const tip = arrow.x2 - pad;
            const lineEnd = tip - headLen;
            return (
              <svg
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: arrow.y + 30,
                  pointerEvents: "none",
                  overflow: "visible",
                  opacity: centerReveal.opacity,
                }}
              >
                <line
                  x1={x1} y1={arrow.y} x2={lineEnd} y2={arrow.y}
                  stroke={arrowBase}
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <line
                  x1={x1} y1={arrow.y} x2={lineEnd} y2={arrow.y}
                  stroke={arrowStroke}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="18 18"
                  strokeDashoffset={dashOffset}
                  opacity={flowOpacity}
                />
                <polygon
                  points={`${lineEnd},${arrow.y - 11} ${tip},${arrow.y} ${lineEnd},${arrow.y + 11}`}
                  fill={arrowStroke}
                  opacity={Math.max(flowOpacity, 0.82)}
                />
              </svg>
            );
          })()}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const FlowSide: React.FC<{
  badge?: string;
  badgeRef?: React.RefObject<HTMLDivElement | null>;
  title?: string;
  image?: string;
  bullets: string[];
  titleColor: string;
  textColor: string;
  theme: ThemeColors;
  align: "left" | "right";
  style: React.CSSProperties;
}> = ({ badge, badgeRef, title, image, bullets, titleColor, textColor, theme, align, style }) => {
  return (
    <div
      style={{
        ...style,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        gap: 18,
      }}
    >
      {badge ? (
        <div style={{ display: "flex", justifyContent: "flex-start" }}>
          <div ref={badgeRef} style={{ display: "inline-flex" }}>
            <Badge
              text={badge}
              bgColor={theme.badge[1]?.bg ?? theme.badge[0].bg}
              textColor={theme.badge[1]?.text ?? theme.badge[0].text}
              theme={theme}
            />
          </div>
        </div>
      ) : null}

      {title ? (
        <div
          style={{
            color: titleColor,
            fontFamily: theme.fontHeading,
            fontWeight: theme.fontWeightHeading ?? 800,
            fontSize: 48,
            lineHeight: 1.15,
            wordBreak: "keep-all",
            textAlign: "left",
          }}
        >
          {title}
        </div>
      ) : null}

      {image ? (
        <Img
          src={staticFile(image)}
          style={{
            width: "100%",
            maxHeight: 220,
            objectFit: "contain",
            borderRadius: 18,
          }}
        />
      ) : null}
      {!image && bullets.length === 0 && (
        <ImagePlaceholder
          width="100%"
          height={180}
          borderRadius={18}
          theme={theme}
        />
      )}

      <BulletList
        items={bullets}
        color={textColor}
        fontSize={38}
        startFrame={20}
        theme={theme}
      />
    </div>
  );
};
