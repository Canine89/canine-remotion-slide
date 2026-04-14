import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { ThemeColors } from "../themes";
import { Badge } from "../components/Badge";
import { SlideTitle } from "../components/SlideTitle";
import { BulletList } from "../components/BulletList";
import { ImagePlaceholder } from "../components/ImagePlaceholder";

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
  fromBadge?: string;
  fromTitle?: string;
  fromImage?: string;
  fromBullets: string[];
  toBadge?: string;
  toTitle?: string;
  toImage?: string;
  toBullets: string[];
  theme: ThemeColors;
}

const reveal = (frame: number, start: number, end: number, fromX: number) => ({
  opacity: interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  }),
  translateX: interpolate(frame, [start, end], [fromX, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  }),
});

export const EvolutionFlowSlide: React.FC<Props> = ({
  badge,
  badgeBg,
  badgeText,
  title,
  fromBadge,
  fromTitle,
  fromImage,
  fromBullets,
  toBadge,
  toTitle,
  toImage,
  toBullets,
  theme,
}) => {
  const frame = useCurrentFrame();
  const leftReveal = reveal(frame, 8, 22, -40);
  const centerReveal = reveal(frame, 22, 38, 0);
  const rightReveal = reveal(frame, 36, 52, 40);
  const lineScale = interpolate(frame, [24, 42], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const flowOpacity = interpolate(frame, [30, 42], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const dashOffset = -((frame * 2.4) % 120);
  const isLightBg = isLightColor(theme.bg);
  const arrowStroke = isLightBg ? "rgba(0,0,0,0.72)" : "rgba(255,255,255,0.88)";
  const arrowBase = isLightBg ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.18)";

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.bg,
        padding: "56px 52px",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1660,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 22,
        }}
      >
        <Badge text={badge} bgColor={badgeBg} textColor={badgeText} theme={theme} />
        <SlideTitle text={title} color={theme.title} theme={theme} />

        <div
          style={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: "1fr 0.42fr 1fr",
            gap: 28,
            alignItems: "center",
            marginTop: 28,
            minHeight: 420,
          }}
        >
          <FlowSide
            badge={fromBadge}
            title={fromTitle}
            image={fromImage}
            bullets={fromBullets}
            titleColor={theme.title}
            textColor={theme.text}
            theme={theme}
            align="left"
            style={{
              opacity: leftReveal.opacity,
              transform: `translateX(${leftReveal.translateX}px)`,
            }}
          />

          <div
            style={{
              opacity: centerReveal.opacity,
              transform: `translateX(${centerReveal.translateX}px)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              alignSelf: "center",
              width: "100%",
              position: "relative",
            }}
          >
            <svg
              viewBox="0 0 320 40"
              style={{
                width: "100%",
                transform: `scaleX(${lineScale})`,
                transformOrigin: "left center",
                overflow: "visible",
              }}
            >
              <line
                x1="8"
                y1="20"
                x2="276"
                y2="20"
                stroke={arrowBase}
                strokeWidth="4"
                strokeLinecap="round"
              />
              <line
                x1="8"
                y1="20"
                x2="276"
                y2="20"
                stroke={arrowStroke}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="18 18"
                strokeDashoffset={dashOffset}
                opacity={flowOpacity}
              />
              <polygon
                points="276,9 308,20 276,31"
                fill={arrowStroke}
                opacity={Math.max(flowOpacity, 0.82)}
              />
            </svg>
          </div>

          <FlowSide
            badge={toBadge}
            title={toTitle}
            image={toImage}
            bullets={toBullets}
            titleColor={theme.title}
            textColor={theme.text}
            theme={theme}
            align="right"
            style={{
              opacity: rightReveal.opacity,
              transform: `translateX(${rightReveal.translateX}px)`,
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const FlowSide: React.FC<{
  badge?: string;
  title?: string;
  image?: string;
  bullets: string[];
  titleColor: string;
  textColor: string;
  theme: ThemeColors;
  align: "left" | "right";
  style: React.CSSProperties;
}> = ({ badge, title, image, bullets, titleColor, textColor, theme, align, style }) => {
  return (
    <div
      style={{
        ...style,
        minHeight: 420,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 18,
      }}
    >
      {badge ? (
        <div style={{ display: "flex", justifyContent: "flex-start" }}>
          <Badge
            text={badge}
            bgColor={theme.badge[1]?.bg ?? theme.badge[0].bg}
            textColor={theme.badge[1]?.text ?? theme.badge[0].text}
            theme={theme}
          />
        </div>
      ) : null}

      {title ? (
        <div
          style={{
            color: titleColor,
            fontFamily: theme.fontHeading,
            fontWeight: theme.fontWeightHeading ?? 800,
            fontSize: 48,
            lineHeight: 1.15,
            wordBreak: "keep-all",
            textAlign: "left",
          }}
        >
          {title}
        </div>
      ) : null}

      {image ? (
        <Img
          src={staticFile(image)}
          style={{
            width: "100%",
            maxHeight: 220,
            objectFit: "contain",
            borderRadius: 18,
          }}
        />
      ) : null}
      {!image && bullets.length === 0 && (
        <ImagePlaceholder
          width="100%"
          height={180}
          borderRadius={18}
          theme={theme}
        />
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
        }}
      >
        <div style={{ width: "min(100%, 520px)" }}>
          <BulletList
            items={bullets}
            color={textColor}
            fontSize={38}
            startFrame={20}
            theme={theme}
          />
        </div>
      </div>
    </div>
  );
};
