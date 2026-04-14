import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { ThemeColors } from "../themes";
import { Badge } from "../components/Badge";
import { SlideTitle } from "../components/SlideTitle";
import { BulletList } from "../components/BulletList";

interface Props {
  badge: string;
  badgeBg: string;
  badgeText: string;
  title: string;
  columns: { heading: string; bullets: string[] }[];
  theme: ThemeColors;
}

export const CompareSlide: React.FC<Props> = ({
  badge,
  badgeBg,
  badgeText,
  title,
  columns,
  theme,
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.bg,
        justifyContent: "center",
        alignItems: "center",
        padding: "56px 60px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          maxWidth: 1700,
          width: "100%",
        }}
      >
        <Badge text={badge} bgColor={badgeBg} textColor={badgeText} theme={theme} />
        <SlideTitle text={title} color={theme.title} theme={theme} />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
            gap: 36,
            marginTop: 28,
            width: "100%",
          }}
        >
          {columns.map((col, i) => {
            const delay = 25 + i * 8;
            const opacity = interpolate(frame, [delay, delay + 14], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            });
            const translateY = interpolate(frame, [delay, delay + 14], [25, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            });

            return (
              <div
                key={i}
                style={{
                  opacity,
                  transform: `translateY(${translateY}px)`,
                  display: "flex",
                  flexDirection: "column",
                  gap: 18,
                }}
              >
                <div
                  style={{
                    color: theme.accent,
                    fontFamily: theme.fontHeading,
                    fontWeight: theme.fontWeightHeading ?? 800,
                    fontSize: 48,
                    lineHeight: 1.2,
                    wordBreak: "keep-all",
                    paddingBottom: 10,
                    borderBottom: `3px solid ${theme.accent}`,
                  }}
                >
                  {col.heading}
                </div>
                <BulletList
                  items={col.bullets}
                  color={theme.text}
                  fontSize={38}
                  startFrame={delay + 10}
                  theme={theme}
                />
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
