import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { ThemeColors } from "../themes";

interface Props {
  text: string;
  bgColor?: string;
  textColor?: string;
  fontFamily?: string;
  fontSize?: number;
  borderRadius?: number;
  letterSpacing?: string;
  fontWeight?: number;
  theme?: ThemeColors;
}

export const Badge: React.FC<Props> = ({
  text,
  bgColor = "#1A1A1A",
  textColor = "#FFFFFF",
  fontFamily = "'Paperlogy 8 ExtraBold', 'Paperlogy', sans-serif",
  fontSize = 42,
  borderRadius = 999,
  letterSpacing = "0.5px",
  fontWeight = 800,
  theme,
}) => {
  const frame = useCurrentFrame();

  // 위에서 떨어지며 등장 + 살짝 바운스
  const opacity = interpolate(frame, [3, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const translateY = interpolate(frame, [3, 12, 16, 19], [-40, 4, -2, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const scale = interpolate(frame, [3, 12, 16, 19], [0.7, 1.05, 0.98, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      data-pptx="badge"
      style={{
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        display: "inline-block",
        padding: "10px 28px",
        borderRadius: theme?.badgeRadius ?? borderRadius,
        backgroundColor: bgColor,
        color: textColor,
        fontSize: theme?.badgeFontSize ?? fontSize,
        fontFamily: theme?.fontLabel ?? fontFamily,
        fontWeight: theme?.fontWeightLabel ?? fontWeight,
        letterSpacing: theme?.badgeLetterSpacing ?? letterSpacing,
      }}
    >
      {text}
    </div>
  );
};
