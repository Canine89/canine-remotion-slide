import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { ThemeColors } from "../themes";

interface Props {
  items: string[];
  color?: string;
  fontSize?: number;
  startFrame?: number;
  theme?: ThemeColors;
}

export const BulletList: React.FC<Props> = ({
  items,
  color = "#E0E0E0",
  fontSize = 55,
  startFrame = 35,
  theme,
}) => {
  const frame = useCurrentFrame();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {items.map((item, i) => {
        const itemStart = startFrame + i * 8;

        const opacity = interpolate(frame, [itemStart, itemStart + 12], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
        });

        const translateY = interpolate(
          frame,
          [itemStart, itemStart + 12],
          [15, 0],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          }
        );

        return (
          <div
            key={i}
            style={{
              opacity,
              transform: `translateY(${translateY}px)`,
              color,
              fontSize,
              fontFamily: theme?.fontBody ?? "'Paperlogy 5 Medium', 'Paperlogy', sans-serif",
              fontWeight: theme?.fontWeightBody ?? 500,
              lineHeight: theme?.bodyLineHeight ?? 1.5,
              letterSpacing: theme?.bodyLetterSpacing ?? "0px",
              wordBreak: "keep-all",
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
            }}
          >
            <span style={{ flexShrink: 0 }}>{theme?.bulletMarker ?? "•"}</span>
            <span>{item}</span>
          </div>
        );
      })}
    </div>
  );
};
