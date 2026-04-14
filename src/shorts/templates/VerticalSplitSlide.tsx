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
import { BulletList } from "../../slides/components/BulletList";
import { SHORTS } from "../constants";

interface Props {
  badge: string;
  badgeBg: string;
  badgeText: string;
  title?: string;
  image?: string;
  bullets: string[];
  theme: ThemeColors;
}

export const VerticalSplitSlide: React.FC<Props> = ({
  badge,
  badgeBg,
  badgeText,
  title,
  image,
  bullets,
  theme,
}) => {
  const frame = useCurrentFrame();

  const imageOpacity = interpolate(frame, [10, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const imageScale = interpolate(frame, [10, 25], [0.95, 1], {
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
        padding: "60px 60px",
      }}
    >
      {/* 뱃지 — 상단 고정 */}
      <div style={{ marginBottom: 40 }}>
        <Badge text={badge} bgColor={badgeBg} textColor={badgeText} theme={theme} />
      </div>

      {/* 타이틀 + 이미지 + 불릿을 밀착 그룹 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
        }}
      >
        {/* 타이틀 — 이미지에 밀착 */}
        {title && (
          <div style={{ marginBottom: 20 }}>
            <SlideTitle text={title} color={theme.title} fontSize={SHORTS.FONT.TITLE} theme={theme} />
          </div>
        )}

        {/* 이미지 또는 플레이스홀더 */}
        <div
          style={{
            opacity: imageOpacity,
            transform: `scale(${imageScale})`,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {image ? (
            <Img
              src={staticFile(image)}
              style={{
                maxWidth: 900,
                maxHeight: 600,
                borderRadius: 12,
                objectFit: "contain",
                boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
              }}
            />
          ) : (
            <div
              style={{
                width: 900,
                height: 500,
                borderRadius: 12,
                border: "3px dashed rgba(255,255,255,0.3)",
                backgroundColor: "rgba(255,255,255,0.05)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "rgba(255,255,255,0.25)",
                fontSize: 28,
                fontFamily: theme.fontBody,
              }}
            >
              IMAGE
            </div>
          )}
        </div>

        {/* 불릿 — 이미지에 밀착 */}
        <div style={{ marginTop: 20 }}>
          <BulletList items={bullets} color={theme.text} fontSize={SHORTS.FONT.BULLET} startFrame={25} theme={theme} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
