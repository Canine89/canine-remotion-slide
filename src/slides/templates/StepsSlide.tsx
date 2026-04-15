import React, { useLayoutEffect, useRef, useState } from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { ThemeColors } from "../themes";
import { Badge } from "../components/Badge";
import { SlideTitle } from "../components/SlideTitle";
import { InlineEditable } from "../components/InlineEditable";

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
  editable?: boolean;
  onFieldEdit?: (field: string, value: unknown, subIndex?: number) => void;
}

const CIRCLE_SIZE = 52;
const COL_GAP = 60;
const LINE_LENGTH = 50;

export const StepsSlide: React.FC<Props> = ({
  badge,
  badgeBg,
  badgeText,
  title,
  steps,
  theme,
  editable,
  onFieldEdit,
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
        <Badge text={badge} bgColor={badgeBg} textColor={badgeText} theme={theme} editable={editable} onTextChange={(v) => onFieldEdit?.("badge", v)} />
        <SlideTitle text={title} color={theme.title} theme={theme} editable={editable} onTextChange={(v) => onFieldEdit?.("title", v)} />

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
                editable={editable}
                onStepChange={(val) => onFieldEdit?.("steps", val, i)}
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
                  editable={editable}
                  onStepChange={(val) => onFieldEdit?.("steps", val, half + i)}
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
  editable?: boolean;
  onStepChange?: (value: string) => void;
}> = ({ index, step, isLast, showLine, showTopLine, frame, theme, light, lineStroke, lineBase, dashOffset, editable, onStepChange }) => {
  const textRef = useRef<HTMLDivElement>(null);
  const [textHeight, setTextHeight] = useState(CIRCLE_SIZE);
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
  const rowHeight = Math.max(CIRCLE_SIZE, textHeight);
  const connectorHeight = Math.max(LINE_LENGTH, rowHeight - CIRCLE_SIZE + LINE_LENGTH);

  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el) return;

    const measure = () => {
      setTextHeight(el.getBoundingClientRect().height);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [step]);

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
        data-pptx="step-item"
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 20,
          minHeight: rowHeight,
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
            marginTop: Math.max(0, (rowHeight - CIRCLE_SIZE) / 2),
          }}
        >
          {index + 1}
        </div>
        {editable ? (
          <div ref={textRef} style={{ flex: 1 }}>
            <InlineEditable
              value={step}
              onChange={onStepChange}
              multiline
              style={{
                color: theme.text,
                fontFamily: theme.fontBody,
                fontWeight: theme.fontWeightBody ?? 500,
                fontSize: 40,
                lineHeight: 1.3,
                wordBreak: "keep-all",
                whiteSpace: "pre-wrap",
                outline: "none",
                cursor: "text",
              }}
            />
          </div>
        ) : (
          <div
            ref={textRef}
            style={{
              flex: 1,
              color: theme.text,
              fontFamily: theme.fontBody,
              fontWeight: theme.fontWeightBody ?? 500,
              fontSize: 40,
              lineHeight: 1.3,
              wordBreak: "keep-all",
              whiteSpace: "pre-wrap",
            }}
          >
            {step}
          </div>
        )}
      </div>

      {/* 연결선 (dashed 애니메이션) */}
      {showLine && (
        <div
          style={{
            width: CIRCLE_SIZE,
            display: "flex",
            justifyContent: "center",
            height: connectorHeight,
          }}
        >
          <svg
            viewBox={`0 0 6 ${connectorHeight}`}
            width="6"
            height={connectorHeight}
            style={{
              transform: `scaleY(${lineScale})`,
              transformOrigin: "top center",
              overflow: "visible",
            }}
          >
            <line
              x1="3" y1="0" x2="3" y2={connectorHeight}
              stroke={lineBase}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <line
              x1="3" y1="0" x2="3" y2={connectorHeight}
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
