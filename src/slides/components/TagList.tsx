import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { Tag } from "../types";
import { ThemeColors } from "../themes";

interface Props {
  tags: Tag[];
  startFrame?: number;
  theme?: ThemeColors;
}

export const TagList: React.FC<Props> = ({ tags, startFrame = 40, theme }) => {
  const frame = useCurrentFrame();

  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
      {tags.map((tag, i) => {
        const itemStart = startFrame + i * 6;

        const opacity = interpolate(
          frame,
          [itemStart, itemStart + 10],
          [0, 1],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          }
        );

        const scale = interpolate(
          frame,
          [itemStart, itemStart + 10],
          [0.85, 1],
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
              transform: `scale(${scale})`,
              display: "inline-block",
              padding: "10px 24px",
              borderRadius: 8,
              backgroundColor: tag.color || "#1A1A1A",
              color: "#FFFFFF",
              fontSize: 47,
              fontFamily: theme?.fontLabel ?? "'Paperlogy 8 ExtraBold', 'Paperlogy', sans-serif",
              fontWeight: theme?.fontWeightLabel ?? 800,
            }}
          >
            {tag.text}
          </div>
        );
      })}
    </div>
  );
};
