import React from "react";
import { AbsoluteFill } from "remotion";
import { ThemeColors } from "../themes";
import { Badge } from "../components/Badge";
import { SlideTitle } from "../components/SlideTitle";
import { BulletList } from "../components/BulletList";

interface Props {
  badge: string;
  badgeBg: string;
  badgeText: string;
  title: string;
  bullets: string[];
  theme: ThemeColors;
}

export const TitleBulletsSlide: React.FC<Props> = ({
  badge,
  badgeBg,
  badgeText,
  title,
  bullets,
  theme,
}) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.bg,
        justifyContent: "center",
        alignItems: "center",
        padding: "60px 50px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          maxWidth: 1600,
        }}
      >
        <Badge text={badge} bgColor={badgeBg} textColor={badgeText} theme={theme} />
        <SlideTitle text={title} color={theme.title} theme={theme} />
        <div style={{ marginTop: 16 }}>
          <BulletList items={bullets} color={theme.text} theme={theme} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
