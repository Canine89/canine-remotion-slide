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
  editable?: boolean;
  onFieldEdit?: (field: string, value: unknown, subIndex?: number) => void;
}

export const TitleBulletsSlide: React.FC<Props> = ({
  badge,
  badgeBg,
  badgeText,
  title,
  bullets,
  theme,
  editable,
  onFieldEdit,
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
        <Badge text={badge} bgColor={badgeBg} textColor={badgeText} theme={theme} editable={editable} onTextChange={(v) => onFieldEdit?.("badge", v)} />
        <SlideTitle text={title} color={theme.title} theme={theme} editable={editable} onTextChange={(v) => onFieldEdit?.("title", v)} />
        <div style={{ marginTop: 16 }}>
          <BulletList items={bullets} color={theme.text} theme={theme} editable={editable} onItemChange={(i, v) => onFieldEdit?.("bullets", v, i)} onItemAdd={(i) => { /* handled via onFieldEdit */ }} onItemDelete={(i) => { /* handled via onFieldEdit */ }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
