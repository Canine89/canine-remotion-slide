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
import { BulletList } from "../components/BulletList";
import { ImagePlaceholder } from "../components/ImagePlaceholder";

interface Props {
  badge: string;
  badgeBg: string;
  badgeText: string;
  title?: string;
  image?: string;
  bullets: string[];
  theme: ThemeColors;
  editable?: boolean;
  onFieldEdit?: (field: string, value: unknown, subIndex?: number) => void;
}

export const SplitSlide: React.FC<Props> = ({
  badge,
  badgeBg,
  badgeText,
  title,
  image,
  bullets,
  theme,
  editable,
  onFieldEdit,
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
        padding: "60px 50px",
        flexDirection: "column",
      }}
    >
      {/* 상단: 뱃지 + 타이틀 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          marginBottom: 40,
        }}
      >
        <Badge text={badge} bgColor={badgeBg} textColor={badgeText} theme={theme} editable={editable} onTextChange={(v) => onFieldEdit?.("badge", v)} />
        {title && <SlideTitle text={title} color={theme.title} theme={theme} editable={editable} onTextChange={(v) => onFieldEdit?.("title", v)} />}
      </div>

      {/* 2단 분할 */}
      <div
        style={{
          display: "flex",
          flex: 1,
          gap: 60,
          alignItems: "center",
        }}
      >
        {/* 좌측: 이미지 또는 플레이스홀더 */}
        <div
          data-pptx="image"
          style={{
            flex: 1,
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
                maxWidth: "100%",
                maxHeight: 520,
                borderRadius: 12,
                objectFit: "contain",
                boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
              }}
            />
          ) : (
            <ImagePlaceholder
              width="100%"
              height={420}
              borderRadius={12}
              theme={theme}
            />
          )}
        </div>

        {/* 우측: 불릿 */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <BulletList items={bullets} color={theme.text} fontSize={55} startFrame={25} theme={theme} editable={editable} onItemChange={(i, v) => onFieldEdit?.("bullets", v, i)} onItemAdd={(i) => { /* handled via onFieldEdit */ }} onItemDelete={(i) => { /* handled via onFieldEdit */ }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
