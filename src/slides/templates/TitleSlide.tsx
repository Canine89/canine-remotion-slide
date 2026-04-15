import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { ThemeColors } from "../themes";
import { Badge } from "../components/Badge";
import { SlideTitle } from "../components/SlideTitle";
import { InlineEditable } from "../components/InlineEditable";

interface Props {
  badge: string;
  badgeBg: string;
  badgeText: string;
  title: string;
  subtitle?: string;
  theme: ThemeColors;
  editable?: boolean;
  onFieldEdit?: (field: string, value: unknown, subIndex?: number) => void;
}

export const TitleSlide: React.FC<Props> = ({
  badge,
  badgeBg,
  badgeText,
  title,
  subtitle,
  theme,
  editable,
  onFieldEdit,
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
        padding: "60px 80px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 28,
          maxWidth: 1500,
        }}
      >
        <Badge text={badge} bgColor={badgeBg} textColor={badgeText} theme={theme} editable={editable} onTextChange={(v) => onFieldEdit?.("badge", v)} />
        <SlideTitle text={title} color={theme.title} theme={theme} editable={editable} onTextChange={(v) => onFieldEdit?.("title", v)} />
        {subtitle && (
          editable ? (
            <InlineEditable
              value={subtitle}
              onChange={(value) => onFieldEdit?.("subtitle", value)}
              data-pptx="subtitle"
              multiline
              style={{
                opacity: subtitleOpacity,
                color: theme.text,
                fontSize: 55,
                fontFamily: theme.fontBody,
                fontWeight: theme.fontWeightBody,
                lineHeight: theme.bodyLineHeight ?? 1.5,
                letterSpacing: theme.bodyLetterSpacing ?? "0px",
                wordBreak: "keep-all",
                textAlign: "center",
                whiteSpace: "pre-line",
                marginTop: 8,
                outline: "none",
                cursor: "text",
              }}
            />
          ) : (
            <div
              data-pptx="subtitle"
              style={{
                opacity: subtitleOpacity,
                color: theme.text,
                fontSize: 55,
                fontFamily: theme.fontBody,
                fontWeight: theme.fontWeightBody,
                lineHeight: theme.bodyLineHeight ?? 1.5,
                letterSpacing: theme.bodyLetterSpacing ?? "0px",
                wordBreak: "keep-all",
                textAlign: "center",
                whiteSpace: "pre-line",
                marginTop: 8,
              }}
            >
              {subtitle}
            </div>
          )
        )}
      </div>
    </AbsoluteFill>
  );
};
