import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { Tag } from "../types";
import { ThemeColors } from "../themes";
import { InlineEditable } from "./InlineEditable";

interface Props {
  tags: Tag[];
  startFrame?: number;
  theme?: ThemeColors;
  editable?: boolean;
  onTagChange?: (index: number, value: string) => void;
}

export const TagList: React.FC<Props> = ({
  tags,
  startFrame = 40,
  theme,
  editable,
  onTagChange,
}) => {
  const frame = useCurrentFrame();

  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
      {tags.map((tag, i) => (
        <TagItem
          key={i}
          index={i}
          tag={tag}
          frame={frame}
          itemStart={startFrame + i * 6}
          theme={theme}
          editable={editable}
          onTagChange={onTagChange}
        />
      ))}
    </div>
  );
};

const TagItem: React.FC<{
  index: number;
  tag: Tag;
  frame: number;
  itemStart: number;
  theme?: ThemeColors;
  editable?: boolean;
  onTagChange?: (index: number, value: string) => void;
}> = ({ index, tag, frame, itemStart, theme, editable, onTagChange }) => {
  const opacity = interpolate(frame, [itemStart, itemStart + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const scale = interpolate(frame, [itemStart, itemStart + 10], [0.85, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      data-pptx="tag"
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
      {editable ? (
        <InlineEditable
          as="span"
          value={tag.text}
          onChange={(value) => onTagChange?.(index, value)}
          style={{
            outline: "none",
            cursor: "text",
          }}
        />
      ) : (
        <span>{tag.text}</span>
      )}
    </div>
  );
};
