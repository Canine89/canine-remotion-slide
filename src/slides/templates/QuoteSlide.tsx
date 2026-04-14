import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { ThemeColors } from "../themes";
import { Badge } from "../components/Badge";

interface Props {
  badge: string;
  badgeBg: string;
  badgeText: string;
  title: string;
  quote: string;
  attribution?: string;
  theme: ThemeColors;
}

export const QuoteSlide: React.FC<Props> = ({
  badge,
  badgeBg,
  badgeText,
  title,
  quote,
  attribution,
  theme,
}) => {
  const frame = useCurrentFrame();

  const quoteOpacity = interpolate(frame, [18, 32], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const quoteTranslateY = interpolate(frame, [18, 32], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const attrOpacity = interpolate(frame, [35, 48], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const markOpacity = interpolate(frame, [10, 22], [0, 0.15], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.bg,
        justifyContent: "center",
        alignItems: "center",
        padding: "60px 100px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          maxWidth: 1400,
          position: "relative",
        }}
      >
        <Badge text={badge} bgColor={badgeBg} textColor={badgeText} theme={theme} />

        {/* 큰따옴표 장식 */}
        <div
          style={{
            position: "absolute",
            top: 50,
            left: -20,
            fontSize: 300,
            fontFamily: "Georgia, serif",
            color: theme.accent,
            opacity: markOpacity,
            lineHeight: 1,
            userSelect: "none",
          }}
        >
          {"\u201C"}
        </div>

        <div
          style={{
            opacity: quoteOpacity,
            transform: `translateY(${quoteTranslateY}px)`,
            color: theme.title,
            fontFamily: theme.fontHeading,
            fontWeight: theme.fontWeightHeading ?? 800,
            fontSize: 72,
            lineHeight: 1.3,
            letterSpacing: theme.titleLetterSpacing ?? "0px",
            textAlign: "center",
            wordBreak: "keep-all",
            whiteSpace: "pre-line",
            marginTop: 24,
          }}
        >
          {quote}
        </div>

        {attribution && (
          <div
            style={{
              opacity: attrOpacity,
              color: theme.text,
              fontFamily: theme.fontBody,
              fontWeight: theme.fontWeightBody ?? 500,
              fontSize: 40,
              lineHeight: 1.4,
              marginTop: 20,
            }}
          >
            — {attribution}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
