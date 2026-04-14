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

/* ── 프롬프트 분석 ── */

const analyzePrompt = (text: string) => ({
  isHeavy: /많이|폭발|소모|전체|과다|다 읽|모든/i.test(text),
  isLight: /적게|절약|압축|효율|최소/i.test(text),
  hasPreprocess: /ast|전처리|구조|파싱|변환|필터/i.test(text),
});

/* ── 파이프라인 박스 ── */

const PipelineBox: React.FC<{
  icon: string;
  label: string;
  accent: string;
  frame: number;
  delay: number;
  compact?: boolean;
}> = ({ icon, label, accent, frame, delay, compact }) => {
  const opacity = interpolate(frame, [delay, delay + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(frame, [delay, delay + 10], [0.8, 1], {
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
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        padding: compact ? "10px 16px" : "14px 22px",
        borderRadius: compact ? 14 : 18,
        background: "#222222",
        minWidth: compact ? 80 : 110,
      }}
    >
      <span style={{ fontSize: compact ? 28 : 36, lineHeight: 1 }}>{icon}</span>
      <span
        style={{
          fontSize: compact ? 16 : 20,
          fontFamily: "'Paperlogy 7 Bold', 'Paperlogy', sans-serif",
          color: accent,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
    </div>
  );
};

/* ── 화살표 커넥터 ── */

const PipelineArrow: React.FC<{
  accent: string;
  frame: number;
  delay: number;
  thick?: boolean;
}> = ({ accent, frame, delay, thick }) => {
  const progress = interpolate(frame, [delay, delay + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        opacity: progress,
        width: thick ? 64 : 48,
      }}
    >
      <div
        style={{
          flex: 1,
          height: thick ? 5 : 3,
          borderRadius: 999,
          background: `${accent}88`,
          transformOrigin: "left center",
          transform: `scaleX(${progress})`,
        }}
      />
      <div
        style={{
          width: 0,
          height: 0,
          borderTop: `${thick ? 8 : 6}px solid transparent`,
          borderBottom: `${thick ? 8 : 6}px solid transparent`,
          borderLeft: `${thick ? 12 : 10}px solid ${accent}88`,
          flexShrink: 0,
        }}
      />
    </div>
  );
};

/* ── 토큰 도트 그리드 ── */

const TokenDots: React.FC<{
  count: number;
  accent: string;
  frame: number;
  startFrame: number;
  columns: number;
}> = ({ count, accent, frame, startFrame, columns }) => {
  const rows = Math.ceil(count / columns);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} style={{ display: "flex", gap: 8 }}>
          {Array.from(
            { length: Math.min(columns, count - r * columns) },
            (_, c) => {
              const idx = r * columns + c;
              const d = startFrame + idx * 1.5;
              const op = interpolate(frame, [d, d + 6], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              const s = interpolate(frame, [d, d + 6], [0.3, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.out(Easing.cubic),
              });
              return (
                <div
                  key={c}
                  style={{
                    opacity: op,
                    transform: `scale(${s})`,
                    width: 18,
                    height: 18,
                    borderRadius: 999,
                    background: accent,
                  }}
                />
              );
            },
          )}
        </div>
      ))}
    </div>
  );
};

/* ── 소모 바 ── */

const ConsumptionBar: React.FC<{
  percent: number;
  accent: string;
  frame: number;
  startFrame: number;
  label: string;
}> = ({ percent, accent, frame, startFrame, label }) => {
  const barProgress = interpolate(frame, [startFrame, startFrame + 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const labelOpacity = interpolate(frame, [startFrame + 8, startFrame + 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div
        style={{
          height: 14,
          borderRadius: 999,
          background: "#222222",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: "100%",
            borderRadius: 999,
            background: accent,
            transformOrigin: "left center",
            transform: `scaleX(${barProgress})`,
          }}
        />
      </div>
      <span
        style={{
          opacity: labelOpacity,
          fontSize: 18,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          color: `${accent}cc`,
        }}
      >
        {label}
      </span>
    </div>
  );
};

/* ── VS 라벨 ── */

const VsDivider: React.FC<{ frame: number; horizontal?: boolean }> = ({ frame, horizontal }) => {
  const opacity = interpolate(frame, [30, 42], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(frame, [30, 42], [0.6, 1], {
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
        flexDirection: horizontal ? "row" : "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      <div
        style={{
          width: horizontal ? 120 : 2,
          height: horizontal ? 2 : 80,
          background: "#333333",
        }}
      />
      <span
        style={{
          fontSize: horizontal ? 22 : 28,
          fontFamily: "'Paperlogy 8 ExtraBold', 'Paperlogy', sans-serif",
          color: "#888888",
          letterSpacing: 2,
        }}
      >
        VS
      </span>
      <div
        style={{
          width: horizontal ? 120 : 2,
          height: horizontal ? 2 : 80,
          background: "#333333",
        }}
      />
    </div>
  );
};

/* ── 패널 ── */

const FlowPanel: React.FC<{
  frame: number;
  fps: number;
  label: string;
  copy: string;
  accent: string;
  isHeavy: boolean;
  hasPreprocess: boolean;
  tokenCount: number;
  align: "left" | "right";
  compact?: boolean;
  isDarkBg?: boolean;
}> = ({ frame, fps, label, copy, accent, isHeavy, hasPreprocess, tokenCount, align, compact, isDarkBg = true }) => {
  const baseDelay = align === "left" ? 20 : 24;
  const panelOpacity = interpolate(frame, [baseDelay, baseDelay + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const panelTranslateY = interpolate(frame, [baseDelay, baseDelay + 14], [40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const copyOpacity = interpolate(frame, [baseDelay + 38, baseDelay + 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const copyTranslateY = interpolate(frame, [baseDelay + 38, baseDelay + 50], [12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const pipeDelay = baseDelay + 10;
  const tokenStartFrame = baseDelay + 24;
  const barStartFrame = baseDelay + 40;
  const barPercent = isHeavy ? 92 : 34;
  const tokenCols = isHeavy ? 8 : 4;

  return (
    <div
      style={{
        opacity: panelOpacity,
        transform: `translateY(${panelTranslateY}px)`,
        borderRadius: compact ? 24 : 32,
        background: isDarkBg ? "#1A1A1A" : "#0A0A0A",
        padding: compact ? "18px 22px" : "24px 28px",
        display: "flex",
        flexDirection: "column",
        gap: compact ? 10 : 16,
      }}
    >
      {/* 라벨 */}
      <div
        style={{
          display: "inline-flex",
          alignSelf: "flex-start",
          alignItems: "center",
          gap: 8,
          padding: compact ? "6px 12px" : "8px 16px",
          borderRadius: 999,
          background: "#333333",
          color: accent,
          fontSize: compact ? 20 : 24,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontWeight: 700,
        }}
      >
        {label}
      </div>

      {/* 파이프라인 흐름 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "8px 0",
        }}
      >
        <PipelineBox icon="📄" label="Raw" accent={accent} frame={frame} delay={pipeDelay} compact={compact} />
        <PipelineArrow accent={accent} frame={frame} delay={pipeDelay + 6} thick={isHeavy} />
        {hasPreprocess && (
          <>
            <PipelineBox icon="⚙️" label="AST" accent={accent} frame={frame} delay={pipeDelay + 10} compact={compact} />
            <PipelineArrow accent={accent} frame={frame} delay={pipeDelay + 16} />
          </>
        )}
        <PipelineBox icon="🤖" label="Agent" accent={accent} frame={frame} delay={hasPreprocess ? pipeDelay + 20 : pipeDelay + 10} compact={compact} />
      </div>

      {/* 토큰 시각화 */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 16 }}>
        <TokenDots
          count={tokenCount}
          accent={accent}
          frame={frame}
          startFrame={tokenStartFrame}
          columns={tokenCols}
        />
        <span
          style={{
            opacity: interpolate(frame, [tokenStartFrame + 10, tokenStartFrame + 20], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            fontSize: 16,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            color: `${accent}99`,
          }}
        >
          {tokenCount} tokens
        </span>
      </div>

      {/* 카피 텍스트 */}
      <div
        style={{
          opacity: copyOpacity,
          transform: `translateY(${copyTranslateY}px)`,
          color: "rgba(255,255,255,0.94)",
          fontSize: compact ? 24 : 30,
          fontFamily: "'Paperlogy 7 Bold', 'Paperlogy', sans-serif",
          lineHeight: 1.3,
          wordBreak: "keep-all",
        }}
      >
        {copy}
      </div>

      {/* 소모 바 */}
      <ConsumptionBar
        percent={barPercent}
        accent={accent}
        frame={frame}
        startFrame={barStartFrame}
        label={isHeavy ? "토큰 소모 높음" : "토큰 소모 낮음"}
      />
    </div>
  );
};

/* ── 메인 씬 ── */

export const ComparisonFlowScene: React.FC<SceneProps> = ({
  badge,
  badgeBg,
  badgeText,
  title,
  direction,
  prompts,
  scenes,
  theme,
  layout,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const isVertical = layout === "vertical";
  const isDarkBg = /^#[0-3]/i.test(theme.bg);

  const promptList =
    prompts && prompts.length > 0
      ? prompts
      : direction
        ? direction
            .split(/\s*,\s*/)
            .map((text) => ({ text: text.trim() }))
            .filter((p) => p.text)
        : [];

  const panelData = scenes.slice(0, 2).map((scene, i) => {
    const prompt = promptList[i]?.text || "";
    const analysis = analyzePrompt(prompt);
    const accent = analysis.isHeavy
      ? "#FF8A65"
      : analysis.isLight || analysis.hasPreprocess
        ? "#6EF3A5"
        : i === 0
          ? "#FF8A65"
          : "#6EF3A5";
    const tokenCount = analysis.isHeavy
      ? (isVertical ? 12 : 24)
      : analysis.isLight || analysis.hasPreprocess
        ? (isVertical ? 4 : 6)
        : (isVertical ? 8 : 12);
    return { scene, analysis, accent, tokenCount };
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.bg,
        justifyContent: "center",
        alignItems: "center",
        padding: isVertical ? "60px 40px" : "48px 52px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: isVertical ? 960 : 1660,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: isVertical ? 16 : 22,
        }}
      >
        <Badge text={badge} bgColor={badgeBg} textColor={badgeText} theme={theme} />
        <SlideTitle text={title} color={theme.title} fontSize={isVertical ? 64 : 96} theme={theme} />

        <div
          style={{
            width: "100%",
            display: isVertical ? "flex" : "grid",
            ...(isVertical
              ? { flexDirection: "column" as const, alignItems: "center" as const, gap: 10 }
              : { gridTemplateColumns: "1fr 72px 1fr", alignItems: "center" as const, gap: 14 }),
            marginTop: 6,
          }}
        >
          {panelData[0] && (
            <FlowPanel
              frame={frame}
              fps={fps}
              label={panelData[0].scene.label || "SCENE A"}
              copy={panelData[0].scene.copy}
              accent={panelData[0].accent}
              isHeavy={panelData[0].analysis.isHeavy}
              hasPreprocess={panelData[0].analysis.hasPreprocess}
              tokenCount={panelData[0].tokenCount}
              align="left"
              compact={isVertical}
              isDarkBg={isDarkBg}
            />
          )}

          <VsDivider frame={frame} horizontal={isVertical} />

          {panelData[1] && (
            <FlowPanel
              frame={frame}
              fps={fps}
              label={panelData[1].scene.label || "SCENE B"}
              copy={panelData[1].scene.copy}
              accent={panelData[1].accent}
              isHeavy={panelData[1].analysis.isHeavy}
              hasPreprocess={panelData[1].analysis.hasPreprocess}
              tokenCount={panelData[1].tokenCount}
              align="right"
              compact={isVertical}
              isDarkBg={isDarkBg}
            />
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
