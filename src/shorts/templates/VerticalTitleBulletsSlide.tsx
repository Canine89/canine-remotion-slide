import React from "react";
import { AbsoluteFill } from "remotion";
import { ThemeColors } from "../../slides/themes";
import { Badge } from "../../slides/components/Badge";
import { SlideTitle } from "../../slides/components/SlideTitle";
import { BulletList } from "../../slides/components/BulletList";
import { SHORTS } from "../constants";

interface Props {
  badge: string;
  badgeBg: string;
  badgeText: string;
  title: string;
  bullets: string[];
  theme: ThemeColors;
}

export const VerticalTitleBulletsSlide: React.FC<Props> = ({
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
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "80px 60px",
        gap: 28,
      }}
    >
      <Badge text={badge} bgColor={badgeBg} textColor={badgeText} theme={theme} />
      <SlideTitle text={title} color={theme.title} fontSize={SHORTS.FONT.TITLE} theme={theme} />
      <div style={{ marginTop: 16 }}>
        <BulletList items={bullets} color={theme.text} fontSize={SHORTS.FONT.BULLET} theme={theme} />
      </div>
    </AbsoluteFill>
  );
};
