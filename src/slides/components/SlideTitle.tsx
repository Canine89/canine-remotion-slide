import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { ThemeColors } from "../themes";
import { InlineEditable } from "./InlineEditable";

interface Props {
  text: string;
  color?: string;
  fontSize?: number;
  theme?: ThemeColors;
  editable?: boolean;
  onTextChange?: (value: string) => void;
}

export const SlideTitle: React.FC<Props> = ({
  text,
  color = "#FFFFFF",
  fontSize = 125,
  theme,
  editable,
  onTextChange,
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [15, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const translateY = interpolate(frame, [15, 30], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const style: React.CSSProperties = {
    opacity,
    transform: `translateY(${translateY}px)`,
    color,
    fontSize,
    fontFamily: theme?.fontHeading ?? "'Paperlogy 8 ExtraBold', 'Paperlogy', sans-serif",
    fontWeight: theme?.fontWeightHeading ?? 800,
    lineHeight: theme?.titleLineHeight ?? 1.25,
    letterSpacing: theme?.titleLetterSpacing ?? "0px",
    WebkitTextStroke: theme?.titleTextStroke ?? "1.5px rgba(0,0,0,0.15)",
    textShadow:
      theme?.titleTextShadow ??
      "2px 2px 0px rgba(0,0,0,0.15), 4px 4px 8px rgba(0,0,0,0.1)",
    whiteSpace: "pre-line",
    wordBreak: "keep-all",
    textAlign: "center",
    outline: "none",
    cursor: editable ? "text" : undefined,
  };

  if (!editable) {
    return (
      <div data-pptx="title" style={style}>
        {text}
      </div>
    );
  }

  return (
    <InlineEditable
      value={text}
      onChange={onTextChange}
      data-pptx="title"
      style={style}
      multiline
    />
  );
};
