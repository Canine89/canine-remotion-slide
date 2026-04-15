import React from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  interpolate,
  Easing,
} from "remotion";
import { ThemeColors } from "../themes";
import { Badge } from "../components/Badge";
import { SlideTitle } from "../components/SlideTitle";
import { ImagePlaceholder } from "../components/ImagePlaceholder";
import { InlineEditable } from "../components/InlineEditable";

interface Props {
  badge: string;
  badgeBg: string;
  badgeText: string;
  title: string;
  subtitle?: string;
  image: string;
  theme: ThemeColors;
  editable?: boolean;
  onFieldEdit?: (field: string, value: unknown, subIndex?: number) => void;
}

export const TitleImageSlide: React.FC<Props> = ({
  badge,
  badgeBg,
  badgeText,
  title,
  subtitle,
  image,
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

  const imageOpacity = interpolate(frame, [20, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const imageTranslateY = interpolate(frame, [20, 35], [30, 0], {
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
        padding: "56px 80px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          maxWidth: 1600,
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
                marginTop: 4,
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
                marginTop: 4,
              }}
            >
              {subtitle}
            </div>
          )
        )}

        <div
          data-pptx="image"
          style={{
            opacity: imageOpacity,
            transform: `translateY(${imageTranslateY}px)`,
            marginTop: 12,
          }}
        >
          {image ? (
            <Img
              src={staticFile(image)}
              style={{
                maxWidth: 720,
                maxHeight: 420,
                borderRadius: 12,
                objectFit: "contain",
              }}
            />
          ) : (
            <ImagePlaceholder
              width={720}
              height={420}
              borderRadius={12}
              theme={theme}
            />
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
