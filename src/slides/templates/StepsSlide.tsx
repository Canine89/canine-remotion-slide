import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { ThemeColors } from "../themes";
import { Badge } from "../components/Badge";
import { SlideTitle } from "../components/SlideTitle";

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
  steps: string[];
  theme: ThemeColors;
}

const CIRCLE_SIZE = 52;
const ROW_HEIGHT = 80;
const COL_GAP = 60;
const LINE_LENGTH = 50;

export const StepsSlide: React.FC<Props> = ({
  badge,
  badgeBg,
  badgeText,
  title,
  steps,
  theme,
}) => {
  const frame = useCurrentFrame();
  const light = isLightColor(theme.bg);
  const lineStroke = light ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.7)";
  const lineBase = light ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.1)";
  const dashOffset = -((frame * 2.0) % 80);

  const half = Math.ceil(steps.length / 2);
  const leftCol = steps.slice(0, half);
  const rightCol = steps.slice(half);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.bg,
        justifyContent: "center",
        alignItems: "center",
        padding: "56px 70px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          maxWidth: 1600,
          width: "100%",
        }}
      >
        <Badge text={badge} bgColor={badgeBg} textColor={badgeText} theme={theme} />
        <SlideTitle text={title} color={theme.title} theme={theme} />

        <div
          style={{
            display: "flex",
            gap: COL_GAP,
            marginTop: 28,
            width: "100%",
            justifyContent: "center",
          }}
        >
          {/* 왼쪽 열 */}
          <div style={{ flex: 1, maxWidth: 680 }}>
            {leftCol.map((step, i) => (
              <StepRow
                key={i}
                index={i}
                step={step}
                isLast={i === leftCol.length - 1}
                showLine={i < leftCol.length - 1 || rightCol.length > 0}
                frame={frame}
                theme={theme}
                light={light}
                lineStroke={lineStroke}
                lineBase={lineBase}
                dashOffset={dashOffset}
              />
            ))}
          </div>

          {/* 오른쪽 열 */}
          {rightCol.length > 0 && (
            <div style={{ flex: 1, maxWidth: 680 }}>
              {rightCol.map((step, i) => (
                <StepRow
                  key={i}
                  index={half + i}
                  step={step}
                  isLast={i === rightCol.length - 1}
                  showLine={i < rightCol.length - 1}
                  showTopLine={i === 0}
                  frame={frame}
                  theme={theme}
                  light={light}
                  lineStroke={lineStroke}
                  lineBase={lineBase}
                  dashOffset={dashOffset}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const StepRow: React.FC<{
  index: number;
  step: string;
  isLast: boolean;
  showLine: boolean;
  showTopLine?: boolean;
  frame: number;
  theme: ThemeColors;
  light: boolean;
  lineStroke: string;
  lineBase: string;
  dashOffset: number;
}> = ({ index, step, isLast, showLine, showTopLine, frame, theme, light, lineStroke, lineBase, dashOffset }) => {
  const delay = 26 + index * 6;
  const opacity = interpolate(frame, [delay, delay + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const translateY = interpolate(frame, [delay, delay + 10], [16, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const lineDelay = delay + 6;
  const lineScale = interpolate(frame, [lineDelay, lineDelay + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const flowOpacity = interpolate(frame, [lineDelay + 4, lineDelay + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
      }}
    >
      {/* 상단 연결선 (오른쪽 열 첫 번째 아이템) */}
      {showTopLine && (() => {
        const topLineDelay = 26 + index * 6 - 4;
        const topLineScale = interpolate(frame, [topLineDelay, topLineDelay + 10], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
        });
        const topFlowOpacity = interpolate(frame, [topLineDelay + 4, topLineDelay + 12], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
        });
        return (
          <div style={{ width: CIRCLE_SIZE, display: "flex", justifyContent: "center", height: LINE_LENGTH }}>
            <svg viewBox={`0 0 6 ${LINE_LENGTH}`} width="6" height={LINE_LENGTH}
              style={{ transform: `scaleY(${topLineScale})`, transformOrigin: "bottom center" }}>
              <line x1="3" y1="0" x2="3" y2={LINE_LENGTH} stroke={lineBase} strokeWidth="3" strokeLinecap="round" />
              <line x1="3" y1="0" x2="3" y2={LINE_LENGTH} stroke={lineStroke} strokeWidth="3" strokeLinecap="round"
                strokeDasharray="10 10" strokeDashoffset={dashOffset} opacity={topFlowOpacity} />
            </svg>
          </div>
        );
      })()}

      {/* 번호 + 텍스트 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          height: CIRCLE_SIZE,
        }}
      >
        <div
          style={{
            width: CIRCLE_SIZE,
            height: CIRCLE_SIZE,
            borderRadius: "50%",
            backgroundColor: theme.accent,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: light ? "#ffffff" : "#000000",
            fontFamily: theme.fontHeading,
            fontWeight: theme.fontWeightHeading ?? 800,
            fontSize: 26,
            flexShrink: 0,
          }}
        >
          {index + 1}
        </div>
        <div
          style={{
            color: theme.text,
            fontFamily: theme.fontBody,
            fontWeight: theme.fontWeightBody ?? 500,
            fontSize: 40,
            lineHeight: 1.3,
            wordBreak: "keep-all",
          }}
        >
          {step}
        </div>
      </div>

      {/* 연결선 (dashed 애니메이션) */}
      {showLine && (
        <div
          style={{
            width: CIRCLE_SIZE,
            display: "flex",
            justifyContent: "center",
            height: LINE_LENGTH,
          }}
        >
          <svg
            viewBox={`0 0 6 ${LINE_LENGTH}`}
            width="6"
            height={LINE_LENGTH}
            style={{
              transform: `scaleY(${lineScale})`,
              transformOrigin: "top center",
              overflow: "visible",
            }}
          >
            <line
              x1="3" y1="0" x2="3" y2={LINE_LENGTH}
              stroke={lineBase}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <line
              x1="3" y1="0" x2="3" y2={LINE_LENGTH}
              stroke={lineStroke}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="10 10"
              strokeDashoffset={dashOffset}
              opacity={flowOpacity}
            />
          </svg>
        </div>
      )}
    </div>
  );
};
