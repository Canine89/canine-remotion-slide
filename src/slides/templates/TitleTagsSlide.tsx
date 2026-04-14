import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { ThemeColors } from "../themes";
import { Tag } from "../types";
import { Badge } from "../components/Badge";
import { SlideTitle } from "../components/SlideTitle";
import { TagList } from "../components/TagList";

interface Props {
  badge: string;
  badgeBg: string;
  badgeText: string;
  title: string;
  subtitle?: string;
  tags: Tag[];
  theme: ThemeColors;
}

export const TitleTagsSlide: React.FC<Props> = ({
  badge,
  badgeBg,
  badgeText,
  title,
  subtitle,
  tags,
  theme,
}) => {
  const frame = useCurrentFrame();

  const subtitleOpacity = interpolate(frame, [28, 40], [0, 1], {
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
        padding: "60px 50px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
        }}
      >
        <Badge text={badge} bgColor={badgeBg} textColor={badgeText} theme={theme} />
        <SlideTitle text={title} color={theme.title} theme={theme} />
        {subtitle && (
          <div
            style={{
              opacity: subtitleOpacity,
              color: theme.text,
              fontSize: 55,
              fontFamily: theme.fontBody,
              fontWeight: theme.fontWeightBody,
              lineHeight: theme.bodyLineHeight ?? 1.5,
              letterSpacing: theme.bodyLetterSpacing ?? "0px",
              textAlign: "center",
              whiteSpace: "pre-line",
              wordBreak: "keep-all",
            }}
          >
            {subtitle}
          </div>
        )}
        <div style={{ marginTop: 20 }}>
          <TagList tags={tags} theme={theme} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
