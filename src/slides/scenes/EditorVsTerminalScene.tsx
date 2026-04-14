import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SceneProps } from "./SceneProps";
import { Badge } from "../components/Badge";
import { SlideTitle } from "../components/SlideTitle";

/* ── 에디터 패널: GUI 코드 에디터 ── */

const EditorPanel: React.FC<{
  frame: number;
  accent: string;
  cardBg: string;
  compact?: boolean;
}> = ({ frame, accent, cardBg, compact }) => {
  const panelDelay = 22;
  const opacity = interpolate(frame, [panelDelay, panelDelay + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(frame, [panelDelay, panelDelay + 14], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const lines = [
    { indent: 0, text: "function analyze() {", color: "#90CAF9" },
    { indent: 1, text: 'const data = fetch("/api");', color: "#CE93D8" },
    { indent: 1, text: "return parse(data);", color: "#A5D6A7" },
    { indent: 0, text: "}", color: "#90CAF9" },
  ];

  const cursorOpacity = interpolate(
    frame % 30,
    [0, 15, 16, 30],
    [1, 1, 0, 0],
  );

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        flex: 1,
        borderRadius: compact ? 20 : 28,
        background: cardBg,
        padding: compact ? "16px 20px" : "24px 28px",
        display: "flex",
        flexDirection: "column",
        gap: compact ? 8 : 14,
      }}
    >
      {/* 탭바 */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <div
          style={{
            padding: compact ? "4px 12px" : "6px 16px",
            borderRadius: 8,
            background: "#1A1A1A",
            color: accent,
            fontSize: compact ? 14 : 18,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontWeight: 700,
          }}
        >
          app.ts
        </div>
        <div
          style={{
            padding: compact ? "4px 12px" : "6px 16px",
            borderRadius: 8,
            background: "rgba(255,255,255,0.05)",
            color: "rgba(255,255,255,0.3)",
            fontSize: compact ? 14 : 18,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          }}
        >
          utils.ts
        </div>
      </div>

      {/* 코드 라인 */}
      <div style={{ display: "flex", flexDirection: "column", gap: compact ? 4 : 6 }}>
        {lines.map((line, i) => {
          const lineDelay = panelDelay + 18 + i * 6;
          const lineOpacity = interpolate(frame, [lineDelay, lineDelay + 8], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={i}
              style={{
                opacity: lineOpacity,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span
                style={{
                  width: compact ? 20 : 28,
                  fontSize: compact ? 12 : 15,
                  color: "rgba(255,255,255,0.2)",
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  textAlign: "right",
                }}
              >
                {i + 1}
              </span>
              <span
                style={{
                  fontSize: compact ? 16 : 22,
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  color: line.color,
                  paddingLeft: line.indent * (compact ? 16 : 24),
                }}
              >
                {line.text}
                {i === 1 && (
                  <span
                    style={{
                      opacity: cursorOpacity,
                      display: "inline-block",
                      width: 2,
                      height: compact ? 16 : 22,
                      background: accent,
                      marginLeft: 2,
                      verticalAlign: "text-bottom",
                    }}
                  />
                )}
              </span>
            </div>
          );
        })}
      </div>

      {/* 하이라이트 표시 */}
      <div
        style={{
          opacity: interpolate(frame, [panelDelay + 50, panelDelay + 60], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          marginTop: compact ? 4 : 8,
          padding: compact ? "6px 12px" : "8px 16px",
          borderRadius: 8,
          background: "#1A1A1A",
          color: accent,
          fontSize: compact ? 14 : 18,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        }}
      >
        AI: 2행 수정 제안
      </div>
    </div>
  );
};

/* ── 터미널 패널: CLI 명령 ── */

const TerminalPanel: React.FC<{
  frame: number;
  accent: string;
  cardBg: string;
  compact?: boolean;
}> = ({ frame, accent, cardBg, compact }) => {
  const panelDelay = 26;
  const opacity = interpolate(frame, [panelDelay, panelDelay + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(frame, [panelDelay, panelDelay + 14], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const commands = [
    { prompt: "$", text: "claude \"analyze 함수 리팩토링해줘\"", delay: panelDelay + 18 },
    { prompt: ">", text: "3개 파일 수정 중...", delay: panelDelay + 30 },
    { prompt: ">", text: "app.ts, utils.ts, test.ts", delay: panelDelay + 38 },
    { prompt: "✓", text: "완료 — 3 files changed", delay: panelDelay + 48 },
  ];

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        flex: 1,
        borderRadius: compact ? 20 : 28,
        background: cardBg,
        padding: compact ? "16px 20px" : "24px 28px",
        display: "flex",
        flexDirection: "column",
        gap: compact ? 8 : 14,
      }}
    >
      {/* 타이틀바 */}
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <div style={{ width: 10, height: 10, borderRadius: 999, background: "#FF5F57" }} />
        <div style={{ width: 10, height: 10, borderRadius: 999, background: "#FEBC2E" }} />
        <div style={{ width: 10, height: 10, borderRadius: 999, background: "#28C840" }} />
        <span
          style={{
            marginLeft: 8,
            fontSize: compact ? 13 : 16,
            color: "rgba(255,255,255,0.4)",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          }}
        >
          Terminal
        </span>
      </div>

      {/* 명령어 라인 */}
      <div style={{ display: "flex", flexDirection: "column", gap: compact ? 6 : 10 }}>
        {commands.map((cmd, i) => {
          const lineOpacity = interpolate(frame, [cmd.delay, cmd.delay + 8], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const isSuccess = cmd.prompt === "✓";
          return (
            <div
              key={i}
              style={{
                opacity: lineOpacity,
                display: "flex",
                gap: 8,
                alignItems: "baseline",
              }}
            >
              <span
                style={{
                  fontSize: compact ? 16 : 20,
                  color: isSuccess ? "#4CAF50" : accent,
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {cmd.prompt}
              </span>
              <span
                style={{
                  fontSize: compact ? 15 : 20,
                  color: isSuccess ? "#A5D6A7" : "rgba(255,255,255,0.85)",
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                }}
              >
                {cmd.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ── VS 디바이더 ── */

const VsDivider: React.FC<{ frame: number; vertical?: boolean }> = ({ frame, vertical }) => {
  const opacity = interpolate(frame, [32, 44], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(frame, [32, 44], [0.6, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        display: "flex",
        flexDirection: vertical ? "row" : "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      <div
        style={{
          width: vertical ? 80 : 2,
          height: vertical ? 2 : 60,
          background: "#333333",
        }}
      />
      <span
        style={{
          fontSize: vertical ? 20 : 26,
          fontFamily: "'Paperlogy 8 ExtraBold', 'Paperlogy', sans-serif",
          color: "rgba(255,255,255,0.4)",
          letterSpacing: 2,
        }}
      >
        VS
      </span>
      <div
        style={{
          width: vertical ? 80 : 2,
          height: vertical ? 2 : 60,
          background: "#333333",
        }}
      />
    </div>
  );
};

/* ── 메인 씬 ── */

export const EditorVsTerminalScene: React.FC<SceneProps> = ({
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

  // 테마 bg 명도 판정: 어두운 배경이면 밝은 accent, 밝은 배경이면 어두운 accent
  const isDarkBg = /^#[0-3]/i.test(theme.bg);
  const leftAccent = isDarkBg ? "#64B5F6" : "#0D47A1";
  const rightAccent = isDarkBg ? "#81C784" : "#1B5E20";
  const cardBg = "#0A0A0A";

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.bg,
        justifyContent: "center",
        alignItems: "center",
        padding: isVertical ? "50px 36px" : "44px 52px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: isVertical ? 960 : 1700,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: isVertical ? 14 : 20,
        }}
      >
        <Badge text={badge} bgColor={badgeBg} textColor={badgeText} theme={theme} />
        <SlideTitle text={title} color={theme.title} fontSize={isVertical ? 60 : 92} theme={theme} />

        {/* 라벨 */}
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: isVertical ? "column" : "row",
            justifyContent: "center",
            gap: isVertical ? 6 : 0,
          }}
        >
          {!isVertical && (
            <div style={{ display: "flex", flex: 1, justifyContent: "center", gap: 20 }}>
              {scenes[0] && (
                <SceneLabel
                  frame={frame}
                  label={scenes[0].label || "SCENE A"}
                  copy={scenes[0].copy}
                  accent={leftAccent}
                  delay={16}
                />
              )}
            </div>
          )}
          {!isVertical && <div style={{ width: 72 }} />}
          {!isVertical && (
            <div style={{ display: "flex", flex: 1, justifyContent: "center", gap: 20 }}>
              {scenes[1] && (
                <SceneLabel
                  frame={frame}
                  label={scenes[1].label || "SCENE B"}
                  copy={scenes[1].copy}
                  accent={rightAccent}
                  delay={18}
                />
              )}
            </div>
          )}
        </div>

        {/* 패널 */}
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: isVertical ? "column" : "row",
            alignItems: "center",
            gap: isVertical ? 10 : 14,
          }}
        >
          {isVertical && scenes[0] && (
            <SceneLabel
              frame={frame}
              label={scenes[0].label || "SCENE A"}
              copy={scenes[0].copy}
              accent={leftAccent}
              delay={16}
            />
          )}
          <EditorPanel frame={frame} accent={leftAccent} cardBg={cardBg} compact={isVertical} />
          <VsDivider frame={frame} vertical={isVertical} />
          {isVertical && scenes[1] && (
            <SceneLabel
              frame={frame}
              label={scenes[1].label || "SCENE B"}
              copy={scenes[1].copy}
              accent={rightAccent}
              delay={18}
            />
          )}
          <TerminalPanel frame={frame} accent={rightAccent} cardBg={cardBg} compact={isVertical} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const SceneLabel: React.FC<{
  frame: number;
  label: string;
  copy: string;
  accent: string;
  delay: number;
}> = ({ frame, label, copy, accent, delay }) => {
  const opacity = interpolate(frame, [delay, delay + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ opacity, display: "flex", alignItems: "center", gap: 10 }}>
      <span
        style={{
          padding: "5px 14px",
          borderRadius: 999,
          background: "#0A0A0A",
          color: accent,
          fontSize: 20,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontWeight: 700,
        }}
      >
        {label}
      </span>
      <span
        style={{
          color: "#FFFFFF",
          fontSize: 22,
          fontFamily: "'Paperlogy 5 Medium', 'Paperlogy', sans-serif",
        }}
      >
        {copy}
      </span>
    </div>
  );
};
