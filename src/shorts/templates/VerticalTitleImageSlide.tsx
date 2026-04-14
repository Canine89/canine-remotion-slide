import React from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  interpolate,
  Easing,
} from "remotion";
import { ThemeColors } from "../../slides/themes";
import { Badge } from "../../slides/components/Badge";
import { SlideTitle } from "../../slides/components/SlideTitle";
import { SHORTS } from "../constants";

interface Props {
  badge: string;
  badgeBg: string;
  badgeText: string;
  title: string;
  subtitle?: string;
  image: string;
  theme: ThemeColors;
}

export const VerticalTitleImageSlide: React.FC<Props> = ({
  badge,
  badgeBg,
  badgeText,
  title,
  subtitle,
  image,
  theme,
}) => {
  const frame = useCurrentFrame();

  const subtitleOpacity = interpolate(frame, [28, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const imageOpacity = interpolate(frame, [25, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const imageScale = interpolate(frame, [25, 40], [0.95, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.bg,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "80px 60px",
        gap: 32,
      }}
    >
      <Badge text={badge} bgColor={badgeBg} textColor={badgeText} theme={theme} />
      <SlideTitle text={title} color={theme.title} fontSize={SHORTS.FONT.TITLE} theme={theme} />
      {subtitle && (
        <div
          style={{
            opacity: subtitleOpacity,
            color: theme.text,
            fontSize: SHORTS.FONT.SUBTITLE,
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
      <div
        style={{
          opacity: imageOpacity,
          transform: `scale(${imageScale})`,
          marginTop: 16,
        }}
      >
        <Img
          src={staticFile(image)}
          style={{
            maxWidth: 800,
            maxHeight: 600,
            borderRadius: 12,
            objectFit: "contain",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
