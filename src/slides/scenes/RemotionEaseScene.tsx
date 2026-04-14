import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Badge } from "../components/Badge";
import { SlideTitle } from "../components/SlideTitle";
import { SceneProps } from "./SceneProps";

const isLightColor = (hex: string) => {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized.split("").map((char) => char + char).join("")
      : normalized;
  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62;
};

const reveal = (frame: number, start: number, duration: number, from = 24) => ({
  opacity: interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }),
  translateY: interpolate(frame, [start, start + duration], [from, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  }),
});

export const RemotionEaseScene: React.FC<SceneProps> = ({
  badge,
  badgeBg,
  badgeText,
  title,
  scenes,
  theme,
  layout,
}) => {
  const frame = useCurrentFrame();
  const isVertical = layout === "vertical";
  const lightBg = isLightColor(theme.bg);
  const stageBg = lightBg ? "#181514" : "#171717";
  const stageAlt = lightBg ? "#2A221E" : "#232323";
  const ink = lightBg ? "#FFF7F1" : "#FFFFFF";
  const subInk = lightBg ? "#F2D9CB" : "#D5D5D5";
  const motionA = lightBg ? "#FFD9C4" : theme.accent;
  const motionB = lightBg ? "#F7C16E" : "#7FC8FF";
  const motionC = lightBg ? "#FFF1E7" : "#F6E7A1";
  const copyA = scenes[0]?.copy ?? "영상처럼 부드러운 흐름을 슬라이드에 바로 옮길 수 있다";
  const copyB = scenes[1]?.copy ?? "테마 전환도 빠르게 시도하면서 톤을 조정할 수 있다";
  const shellReveal = reveal(frame, 22, 14, 28);
  const cardReveal = reveal(frame, 34, 14, 30);
  const stackReveal = reveal(frame, 40, 14, 26);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.bg,
        justifyContent: "center",
        alignItems: "center",
        padding: isVertical ? "72px 42px" : "56px 56px",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: isVertical ? 18 : 44,
          top: isVertical ? 220 : 180,
          width: isVertical ? 120 : 164,
          height: isVertical ? 120 : 164,
          borderRadius: 999,
          backgroundColor: lightBg ? "#F08C65" : "#1E2D3B",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: isVertical ? 22 : 78,
          top: isVertical ? 180 : 126,
          width: isVertical ? 94 : 126,
          height: isVertical ? 94 : 126,
          borderRadius: 36,
          backgroundColor: lightBg ? "#D8673C" : "#2B3F52",
          transform: `rotate(${interpolate(frame, [0, 36], [-10, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          })}deg)`,
        }}
      />

      <div
        style={{
          width: "100%",
          maxWidth: isVertical ? 920 : 1660,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: isVertical ? 18 : 24,
        }}
      >
        <Badge text={badge} bgColor={badgeBg} textColor={badgeText} theme={theme} />
        <SlideTitle
          text={title}
          color={theme.title}
          fontSize={isVertical ? 78 : 108}
          theme={theme}
        />

        <div
          style={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: isVertical ? "1fr" : "1.12fr 0.88fr",
            gap: isVertical ? 18 : 24,
            alignItems: "stretch",
            marginTop: 10,
          }}
        >
          <div
            style={{
              opacity: shellReveal.opacity,
              transform: `translateY(${shellReveal.translateY}px)`,
              minHeight: isVertical ? 420 : 470,
              backgroundColor: stageBg,
              borderRadius: 36,
              padding: isVertical ? "28px 24px" : "34px 34px 30px",
              display: "grid",
              gridTemplateRows: "1fr auto",
              gap: 24,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isVertical ? "1fr" : "1fr 1fr",
                gap: 20,
                alignItems: "stretch",
              }}
            >
              <CopyCard
                frame={frame}
                start={30}
                title="애니메이션"
                copy={copyA}
                bg={stageAlt}
                ink={ink}
                subInk={subInk}
                accent={motionA}
                mode="motion"
                accents={[motionC, motionB, motionA, ink]}
              />
              <CopyCard
                frame={frame}
                start={36}
                title="테마"
                copy={copyB}
                bg={stageAlt}
                ink={ink}
                subInk={subInk}
                accent={motionB}
                mode="theme"
                accents={[motionA, motionB, "#0B0B0B"]}
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
              }}
            >
              {[motionA, motionB, motionC].map((color, index) => (
                <div
                  key={index}
                  style={{
                    width: index === 0 ? 132 : 88,
                    height: 12,
                    borderRadius: 999,
                    backgroundColor: color,
                    opacity: index === 2 ? 0.7 : 1,
                  }}
                />
              ))}
            </div>
          </div>

          <div
            style={{
              opacity: stackReveal.opacity,
              transform: `translateY(${stackReveal.translateY}px)`,
              display: "grid",
              gridTemplateRows: isVertical ? "repeat(3, 150px)" : "repeat(3, minmax(0, 1fr))",
              gap: 16,
            }}
          >
            <ThemeCard
              title="Theme Switch"
              subtitle="orange"
              bg={lightBg ? "#141414" : "#20262C"}
              accent={motionA}
              ink="#FFF8F2"
            />
            <ThemeCard
              title="Theme Switch"
              subtitle="blue"
              bg={lightBg ? "#22354A" : "#20354B"}
              accent={motionB}
              ink="#F7FBFF"
            />
            <ThemeCard
              title="Theme Switch"
              subtitle="black"
              bg="#0B0B0B"
              accent={motionC}
              ink="#FFFDEA"
            />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const CopyCard: React.FC<{
  frame: number;
  start: number;
  title: string;
  copy: string;
  bg: string;
  ink: string;
  subInk: string;
  accent: string;
  mode: "motion" | "theme";
  accents: string[];
}> = ({ frame, start, title, copy, bg, ink, subInk, accent, mode, accents }) => {
  const show = reveal(frame, start, 12, 22);

  return (
    <div
      style={{
        opacity: show.opacity,
        transform: `translateY(${show.translateY}px)`,
        backgroundColor: bg,
        borderRadius: 26,
        padding: "20px 20px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div
        style={{
          color: accent,
          fontSize: 18,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {title}
      </div>
      <div
        style={{
          color: ink,
          fontSize: 38,
          fontFamily: "'Paperlogy 8 ExtraBold', 'Paperlogy', sans-serif",
          lineHeight: 1.35,
          wordBreak: "keep-all",
        }}
      >
        {copy}
      </div>
      <div
        style={{
          marginTop: 4,
          minHeight: 120,
          borderRadius: 24,
          backgroundColor: "#1B1B1B",
          padding: "18px 18px 16px",
          display: "flex",
          alignItems: mode === "motion" ? "flex-end" : "stretch",
          gap: 12,
        }}
      >
        {mode === "motion" ? (
          [54, 94, 134, 172].map((height, index) => (
            <div
              key={index}
              style={{
                width: 28,
                height,
                borderRadius: 999,
                backgroundColor: accents[index],
              }}
            />
          ))
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12, width: "100%" }}>
            {["orange", "blue", "black"].map((name, index) => (
              <div
                key={name}
                style={{
                  borderRadius: 18,
                  backgroundColor: accents[index],
                  color: index === 2 ? "#FFFDEA" : ink,
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "flex-start",
                  padding: "14px 12px",
                  fontSize: 22,
                  fontFamily: "'Paperlogy 8 ExtraBold', 'Paperlogy', sans-serif",
                }}
              >
                {name}
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: "auto" }}>
        <div style={{ width: "100%", height: 10, borderRadius: 999, backgroundColor: accent }} />
        <div style={{ width: "72%", height: 10, borderRadius: 999, backgroundColor: `${subInk}88` }} />
      </div>
    </div>
  );
};

const ThemeCard: React.FC<{
  title: string;
  subtitle: string;
  bg: string;
  accent: string;
  ink: string;
}> = ({ title, subtitle, bg, accent, ink }) => {
  return (
    <div
      style={{
        backgroundColor: bg,
        borderRadius: 28,
        padding: "22px 22px 20px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 18,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div
          style={{
            color: accent,
            fontSize: 16,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {title}
        </div>
        <div
          style={{
            color: ink,
            fontSize: 34,
            fontFamily: "'Paperlogy 8 ExtraBold', 'Paperlogy', sans-serif",
            lineHeight: 1,
          }}
        >
          {subtitle}
        </div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        {[accent, ink, "#FFFFFF"].map((color, index) => (
          <div
            key={index}
            style={{
              width: 28,
              height: 28,
              borderRadius: 999,
              backgroundColor: color,
              opacity: index === 2 ? 0.2 : 1,
            }}
          />
        ))}
      </div>
    </div>
  );
};
