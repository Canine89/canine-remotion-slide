import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { ThemeColors } from "../themes";
import { InlineEditable } from "./InlineEditable";

interface Props {
  items: string[];
  color?: string;
  fontSize?: number;
  startFrame?: number;
  theme?: ThemeColors;
  editable?: boolean;
  onItemChange?: (index: number, value: string) => void;
  onItemAdd?: (afterIndex: number) => void;
  onItemDelete?: (index: number) => void;
}

export const BulletList: React.FC<Props> = ({
  items,
  color = "#E0E0E0",
  fontSize = 55,
  startFrame = 35,
  theme,
  editable,
  onItemChange,
  onItemAdd,
  onItemDelete,
}) => {
  const frame = useCurrentFrame();

  return (
    <div data-pptx="bullet-list" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {items.map((item, i) => (
        <BulletItem
          key={i}
          index={i}
          text={item}
          frame={frame}
          startFrame={startFrame + i * 8}
          color={color}
          fontSize={fontSize}
          theme={theme}
          editable={editable}
          onItemChange={onItemChange}
          onItemAdd={onItemAdd}
          onItemDelete={onItemDelete}
        />
      ))}
    </div>
  );
};

const BulletItem: React.FC<{
  index: number;
  text: string;
  frame: number;
  startFrame: number;
  color: string;
  fontSize: number;
  theme?: ThemeColors;
  editable?: boolean;
  onItemChange?: (index: number, value: string) => void;
  onItemAdd?: (afterIndex: number) => void;
  onItemDelete?: (index: number) => void;
}> = ({
  index,
  text,
  frame,
  startFrame: itemStart,
  color,
  fontSize,
  theme,
  editable,
  onItemChange,
  onItemAdd,
  onItemDelete,
}) => {
  const opacity = interpolate(frame, [itemStart, itemStart + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const translateY = interpolate(frame, [itemStart, itemStart + 12], [15, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      data-pptx="bullet-item"
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
      {editable ? (
        <InlineEditable
          as="span"
          value={text}
          onChange={(value) => onItemChange?.(index, value)}
          onEditorKeyDown={(e, currentValue) => {
            if (e.key === "Enter") {
              e.preventDefault();
              (e.currentTarget as HTMLElement).blur();
              onItemAdd?.(index);
              return true;
            }
            if (e.key === "Backspace" && currentValue === "") {
              e.preventDefault();
              onItemDelete?.(index);
              return true;
            }
            return false;
          }}
          style={{
            flex: 1,
            outline: "none",
            cursor: "text",
          }}
          multiline
        />
      ) : (
        <span style={{ flex: 1 }}>{text}</span>
      )}
    </div>
  );
};
