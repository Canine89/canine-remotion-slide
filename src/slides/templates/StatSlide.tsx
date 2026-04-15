import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { ThemeColors } from "../themes";
import { Badge } from "../components/Badge";
import { SlideTitle } from "../components/SlideTitle";
import { InlineEditable } from "../components/InlineEditable";

interface StatVisual {
  type: "bar" | "ring";
  ratio: number;
}

interface Props {
  badge: string;
  badgeBg: string;
  badgeText: string;
  title: string;
  stats: { value: string; label: string; visual?: StatVisual }[];
  theme: ThemeColors;
  editable?: boolean;
  onFieldEdit?: (field: string, value: unknown, subIndex?: number) => void;
}

const isLightColor = (hex: string): boolean => {
  const c = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(c)) return false;
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 > 0.55;
};

const BAR_WIDTH = 280;
const BAR_HEIGHT = 14;
const RING_SIZE = 100;
const RING_STROKE = 10;

const StatBar: React.FC<{
  ratio: number;
  frame: number;
  delay: number;
  accent: string;
  light: boolean;
}> = ({ ratio, frame, delay, accent, light }) => {
  const fillDelay = delay + 18;
  const fillWidth = interpolate(frame, [fillDelay, fillDelay + 25], [0, (ratio / 100) * BAR_WIDTH], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div style={{ marginTop: 16 }}>
      <svg width={BAR_WIDTH} height={BAR_HEIGHT} viewBox={`0 0 ${BAR_WIDTH} ${BAR_HEIGHT}`}>
        <rect
          x="0" y="0"
          width={BAR_WIDTH} height={BAR_HEIGHT}
          rx={BAR_HEIGHT / 2}
          fill={light ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.1)"}
        />
        <rect
          x="0" y="0"
          width={fillWidth} height={BAR_HEIGHT}
          rx={BAR_HEIGHT / 2}
          fill={accent}
        />
      </svg>
    </div>
  );
};

const StatRing: React.FC<{
  ratio: number;
  frame: number;
  delay: number;
  accent: string;
  light: boolean;
}> = ({ ratio, frame, delay, accent, light }) => {
  const r = (RING_SIZE - RING_STROKE) / 2;
  const circumference = 2 * Math.PI * r;
  const fillDelay = delay + 18;
  const progress = interpolate(frame, [fillDelay, fillDelay + 30], [0, ratio / 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const dashOffset = circumference * (1 - progress);

  return (
    <div style={{ marginTop: 12 }}>
      <svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}>
        <circle
          cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={r}
          fill="none"
          stroke={light ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.1)"}
          strokeWidth={RING_STROKE}
        />
        <circle
          cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={r}
          fill="none"
          stroke={accent}
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
        />
      </svg>
    </div>
  );
};

export const StatSlide: React.FC<Props> = ({
  badge,
  badgeBg,
  badgeText,
  title,
  stats,
  theme,
  editable,
  onFieldEdit,
}) => {
  const frame = useCurrentFrame();
  const light = isLightColor(theme.bg);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.bg,
        justifyContent: "center",
        alignItems: "center",
        padding: "56px 80px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 28,
          maxWidth: 1600,
          width: "100%",
        }}
      >
        <Badge text={badge} bgColor={badgeBg} textColor={badgeText} theme={theme} editable={editable} onTextChange={(v) => onFieldEdit?.("badge", v)} />
        <SlideTitle text={title} color={theme.title} theme={theme} editable={editable} onTextChange={(v) => onFieldEdit?.("title", v)} />

        <div
          data-pptx="stat-group"
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 80,
            marginTop: 40,
            width: "100%",
          }}
        >
          {stats.map((stat, i) => {
            const delay = 25 + i * 10;
            const opacity = interpolate(frame, [delay, delay + 15], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            });
            const translateY = interpolate(frame, [delay, delay + 15], [30, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            });

            return (
              <div
                key={i}
                data-pptx="stat-item"
                style={{
                  opacity,
                  transform: `translateY(${translateY}px)`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12,
                  flex: 1,
                }}
              >
                {editable ? (
                  <InlineEditable
                    value={stat.value}
                    onChange={(value) => onFieldEdit?.("stats.value", value, i)}
                    style={{
                      color: theme.accent,
                      fontFamily: theme.fontHeading,
                      fontWeight: theme.fontWeightHeading ?? 800,
                      fontSize: 120,
                      lineHeight: 1,
                      letterSpacing: theme.titleLetterSpacing ?? "0px",
                      outline: "none",
                      cursor: "text",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      color: theme.accent,
                      fontFamily: theme.fontHeading,
                      fontWeight: theme.fontWeightHeading ?? 800,
                      fontSize: 120,
                      lineHeight: 1,
                      letterSpacing: theme.titleLetterSpacing ?? "0px",
                    }}
                  >
                    {stat.value}
                  </div>
                )}
                {stat.label && (
                  editable ? (
                    <InlineEditable
                      value={stat.label}
                      onChange={(value) => onFieldEdit?.("stats.label", value, i)}
                      multiline
                      style={{
                        color: theme.text,
                        fontFamily: theme.fontBody,
                        fontWeight: theme.fontWeightBody ?? 500,
                        fontSize: 38,
                        lineHeight: 1.4,
                        textAlign: "center",
                        wordBreak: "keep-all",
                        outline: "none",
                        cursor: "text",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        color: theme.text,
                        fontFamily: theme.fontBody,
                        fontWeight: theme.fontWeightBody ?? 500,
                        fontSize: 38,
                        lineHeight: 1.4,
                        textAlign: "center",
                        wordBreak: "keep-all",
                      }}
                    >
                      {stat.label}
                    </div>
                  )
                )}
                {stat.visual?.type === "bar" && (
                  <StatBar
                    ratio={stat.visual.ratio}
                    frame={frame}
                    delay={delay}
                    accent={theme.accent}
                    light={light}
                  />
                )}
                {stat.visual?.type === "ring" && (
                  <StatRing
                    ratio={stat.visual.ratio}
                    frame={frame}
                    delay={delay}
                    accent={theme.accent}
                    light={light}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
