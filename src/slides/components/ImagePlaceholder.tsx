import React from "react";
import { ThemeColors } from "../themes";

const isLightBg = (hex: string): boolean => {
  const c = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(c)) return false;
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 > 0.55;
};

interface Props {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  theme: ThemeColors;
}

export const ImagePlaceholder: React.FC<Props> = ({
  width = "100%",
  height = 420,
  borderRadius = 18,
  theme,
}) => {
  const light = isLightBg(theme.bg);
  const fg = light ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)";
  const fgStrong = light ? "rgba(0,0,0,0.14)" : "rgba(255,255,255,0.14)";
  const accent = theme.accent;

  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: light ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.05)",
        border: `2px dashed ${fgStrong}`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <svg
        viewBox="0 0 280 200"
        style={{ width: "55%", maxHeight: "60%" }}
        fill="none"
      >
        {/* 배경 원 장식 */}
        <circle cx="210" cy="50" r="32" fill={fg} />
        <circle cx="210" cy="50" r="18" fill={fgStrong} />

        {/* 산 모양 */}
        <polygon
          points="40,160 120,70 170,120 200,90 260,160"
          fill={fgStrong}
        />
        <polygon
          points="40,160 100,100 140,140 140,160"
          fill={accent}
          opacity={0.25}
        />

        {/* 하단 라인 */}
        <rect x="30" y="168" width="230" height="3" rx="1.5" fill={fg} />
      </svg>
    </div>
  );
};
