import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Badge } from "../components/Badge";
import { SlideTitle } from "../components/SlideTitle";
import { findSceneComponent } from "../scenes/registry";
import { SceneProps } from "../scenes/SceneProps";

const fallbackPrompt = "추상 장면을 구성할 프롬프트가 필요합니다.";

const splitPromptText = (direction: string) =>
  direction
    .split(/\s*,\s*/)
    .map((text) => text.trim())
    .filter(Boolean);

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

const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
};

const buildPromptList = (direction: string, prompts?: SceneProps["prompts"]) => {
  if (prompts && prompts.length > 0) {
    return prompts.map((item) => item.text.trim()).filter(Boolean);
  }

  const parsed = splitPromptText(direction);
  return parsed.length > 0 ? parsed : [fallbackPrompt];
};

const buildSceneList = (
  scenes: SceneProps["scenes"],
  promptTexts: string[],
): SceneProps["scenes"] => {
  if (scenes.length > 0) {
    return scenes.filter((item) => item.copy.trim());
  }

  return promptTexts.slice(0, 3).map((text) => ({ copy: text }));
};

const deriveMotif = (promptTexts: string[]) => {
  const text = promptTexts.join(" ");
  if (/흐름|flow|전환|move|이어|sequence|timeline|path/i.test(text)) return "stream";
  if (/구조|grid|system|compose|architecture|stack/i.test(text)) return "grid";
  return "orbit";
};

const deriveVariant = (promptTexts: string[], sceneCount: number) => {
  return hashString(`${promptTexts.join("|")}:${sceneCount}`) % 3;
};

type Palette = {
  stage: string;
  stageAlt: string;
  ink: string;
  subInk: string;
  accents: [string, string, string];
};

const buildPalette = (theme: SceneProps["theme"]): Palette => {
  const lightBg = isLightColor(theme.bg);

  if (lightBg) {
    return {
      stage: "#181514",
      stageAlt: "#2A221E",
      ink: "#FFF8F2",
      subInk: "#F0D6C8",
      accents: ["#FFD7C2", "#F5C06E", "#FFF1D9"],
    };
  }

  return {
    stage: "#151515",
    stageAlt: "#202020",
    ink: "#FFFFFF",
    subInk: "#D6D6D6",
    accents: [theme.accent, "#8FD3FF", "#F6C177"],
  };
};

const reveal = (frame: number, start: number, duration: number, from = 26) => ({
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

export const AbstractSceneSlide: React.FC<SceneProps> = (props) => {
  const { badge, badgeBg, badgeText, title, direction, prompts, scenes = [], theme, layout } = props;
  const frame = useCurrentFrame();

  const CustomScene = findSceneComponent(direction);
  if (CustomScene) {
    return <CustomScene {...props} />;
  }

  const promptTexts = buildPromptList(direction, prompts);
  const sceneList = buildSceneList(scenes, promptTexts).slice(0, 3);
  const isVertical = layout === "vertical";
  const palette = buildPalette(theme);
  const motif = deriveMotif(promptTexts);
  const variant = deriveVariant(promptTexts, sceneList.length);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.bg,
        justifyContent: "center",
        alignItems: "center",
        padding: isVertical ? "70px 42px" : "56px 56px",
      }}
    >
      <AmbientShape frame={frame} color={palette.accents[0]} top={isVertical ? 170 : 116} left={isVertical ? 24 : 48} size={isVertical ? 108 : 146} round />
      <AmbientShape frame={frame} color={palette.accents[1]} top={isVertical ? 320 : 186} right={isVertical ? 26 : 90} size={isVertical ? 92 : 120} />

      <div
        style={{
          width: "100%",
          maxWidth: isVertical ? 920 : 1660,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: isVertical ? 18 : 24,
          zIndex: 1,
        }}
      >
        <Badge text={badge} bgColor={badgeBg} textColor={badgeText} theme={theme} />
        <SlideTitle text={title} color={theme.title} fontSize={isVertical ? 78 : 108} theme={theme} />

        {variant === 0 ? (
          <SpotlightLayout frame={frame} scenes={sceneList} palette={palette} motif={motif} isVertical={isVertical} />
        ) : variant === 1 ? (
          <RibbonLayout frame={frame} scenes={sceneList} palette={palette} motif={motif} isVertical={isVertical} />
        ) : (
          <StackLayout frame={frame} scenes={sceneList} palette={palette} motif={motif} isVertical={isVertical} />
        )}
      </div>
    </AbsoluteFill>
  );
};

const SpotlightLayout: React.FC<{
  frame: number;
  scenes: SceneProps["scenes"];
  palette: Palette;
  motif: string;
  isVertical: boolean;
}> = ({ frame, scenes, palette, motif, isVertical }) => {
  const [primary, ...rest] = scenes;

  return (
    <div
      style={{
        width: "100%",
        display: "grid",
        gridTemplateColumns: isVertical ? "1fr" : "1.12fr 0.88fr",
        gap: isVertical ? 18 : 22,
        alignItems: "stretch",
        marginTop: 10,
      }}
    >
      <CopyPanel
        frame={frame}
        start={24}
        copy={primary?.copy ?? ""}
        label={primary?.label}
        palette={palette}
        accent={palette.accents[0]}
        large
      >
        <VisualStage frame={frame} motif={motif} palette={palette} compact={isVertical} />
      </CopyPanel>

      <div
        style={{
          display: "grid",
          gridTemplateRows: isVertical ? undefined : `repeat(${Math.max(rest.length, 1)}, minmax(0, 1fr))`,
          gridTemplateColumns: isVertical ? "1fr" : undefined,
          gap: 16,
        }}
      >
        {rest.length > 0
          ? rest.map((scene, index) => (
              <CopyPanel
                key={`${scene.copy}-${index}`}
                frame={frame}
                start={32 + index * 6}
                copy={scene.copy}
                label={scene.label}
                palette={palette}
                accent={palette.accents[(index + 1) % 3]}
              />
            ))
          : (
            <VisualOnlyPanel frame={frame} palette={palette} motif={motif} />
          )}
      </div>
    </div>
  );
};

const RibbonLayout: React.FC<{
  frame: number;
  scenes: SceneProps["scenes"];
  palette: Palette;
  motif: string;
  isVertical: boolean;
}> = ({ frame, scenes, palette, motif, isVertical }) => {
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 18,
        marginTop: 12,
      }}
    >
      <VisualOnlyPanel frame={frame} palette={palette} motif={motif} tall={!isVertical} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isVertical ? "1fr" : `repeat(${Math.min(Math.max(scenes.length, 1), 3)}, minmax(0, 1fr))`,
          gap: 16,
        }}
      >
        {scenes.map((scene, index) => (
          <CopyPanel
            key={`${scene.copy}-${index}`}
            frame={frame}
            start={30 + index * 5}
            copy={scene.copy}
            label={scene.label}
            palette={palette}
            accent={palette.accents[index % 3]}
            large={index === 0}
          />
        ))}
      </div>
    </div>
  );
};

const StackLayout: React.FC<{
  frame: number;
  scenes: SceneProps["scenes"];
  palette: Palette;
  motif: string;
  isVertical: boolean;
}> = ({ frame, scenes, palette, motif, isVertical }) => {
  return (
    <div
      style={{
        width: "100%",
        display: "grid",
        gridTemplateColumns: isVertical ? "1fr" : "0.92fr 1.08fr",
        gap: 20,
        alignItems: "stretch",
        marginTop: 10,
      }}
    >
      <VisualOnlyPanel frame={frame} palette={palette} motif={motif} tall />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: scenes.length >= 3 && !isVertical ? "1fr 1fr" : "1fr",
          gap: 16,
          alignContent: "start",
        }}
      >
        {scenes.map((scene, index) => (
          <CopyPanel
            key={`${scene.copy}-${index}`}
            frame={frame}
            start={26 + index * 6}
            copy={scene.copy}
            label={scene.label}
            palette={palette}
            accent={palette.accents[index % 3]}
            large={index === 0 && scenes.length === 1}
          />
        ))}
      </div>
    </div>
  );
};

const CopyPanel: React.FC<{
  frame: number;
  start: number;
  copy: string;
  label?: string;
  palette: Palette;
  accent: string;
  large?: boolean;
  children?: React.ReactNode;
}> = ({ frame, start, copy, label, palette, accent, large, children }) => {
  const show = reveal(frame, start, 12, 24);

  return (
    <div
      style={{
        opacity: show.opacity,
        transform: `translateY(${show.translateY}px)`,
        backgroundColor: palette.stage,
        borderRadius: 32,
        padding: large ? "26px 26px 24px" : "22px 22px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        minHeight: large ? 300 : 220,
      }}
    >
      {label ? (
        <div
          style={{
            alignSelf: "flex-start",
            padding: "6px 12px",
            borderRadius: 999,
            backgroundColor: accent,
            color: palette.stage,
            fontSize: 16,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontWeight: 700,
            textTransform: "uppercase",
          }}
        >
          {label}
        </div>
      ) : null}

      <div
        style={{
          color: palette.ink,
          fontSize: large ? 44 : 34,
          fontFamily: "'Paperlogy 8 ExtraBold', 'Paperlogy', sans-serif",
          lineHeight: 1.3,
          wordBreak: "keep-all",
        }}
      >
        {copy}
      </div>

      {children ? children : null}

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: "auto" }}>
        <div style={{ width: "100%", height: 10, borderRadius: 999, backgroundColor: accent }} />
        <div style={{ width: "72%", height: 10, borderRadius: 999, backgroundColor: palette.subInk }} />
      </div>
    </div>
  );
};

const VisualOnlyPanel: React.FC<{
  frame: number;
  palette: Palette;
  motif: string;
  tall?: boolean;
}> = ({ frame, palette, motif, tall }) => {
  const show = reveal(frame, 24, 12, 30);

  return (
    <div
      style={{
        opacity: show.opacity,
        transform: `translateY(${show.translateY}px)`,
        minHeight: tall ? 360 : 240,
        backgroundColor: palette.stageAlt,
        borderRadius: 34,
        padding: "24px",
        display: "flex",
      }}
    >
      <VisualStage frame={frame} motif={motif} palette={palette} compact={!tall} />
    </div>
  );
};

const VisualStage: React.FC<{
  frame: number;
  motif: string;
  palette: Palette;
  compact?: boolean;
}> = ({ frame, motif, palette, compact }) => {
  if (motif === "stream") {
    return (
      <div style={{ width: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 16 }}>
        {[0, 1, 2, 3].map((row) => (
          <div key={row} style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                style={{
                  opacity: interpolate(frame, [22 + row * 4 + index * 2, 36 + row * 4 + index * 2], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }),
                  width: `${index === 0 ? 28 : index === 1 ? 36 : 24}%`,
                  height: compact ? 16 : 20,
                  borderRadius: 999,
                  backgroundColor: palette.accents[(row + index) % 3],
                }}
              />
            ))}
          </div>
        ))}
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end", marginTop: "auto" }}>
          {[80, 124, 96, 154].map((height, index) => (
            <div
              key={index}
              style={{
                width: compact ? 20 : 24,
                height,
                borderRadius: 999,
                backgroundColor: [palette.accents[2], palette.accents[1], palette.ink, palette.accents[0]][index],
                transform: `scaleY(${interpolate(frame, [28 + index * 3, 42 + index * 3], [0.35, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.out(Easing.cubic),
                })})`,
                transformOrigin: "bottom center",
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (motif === "grid") {
    return (
      <div
        style={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gridTemplateRows: "repeat(3, minmax(0, 1fr))",
          gap: 12,
        }}
      >
        {Array.from({ length: 9 }).map((_, index) => (
          <div
            key={index}
            style={{
              opacity: interpolate(frame, [22 + index * 2, 36 + index * 2], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              borderRadius: index % 2 === 0 ? 26 : 18,
              backgroundColor:
                index % 4 === 0
                  ? palette.accents[0]
                  : index % 3 === 0
                    ? palette.accents[1]
                    : index % 2 === 0
                      ? palette.accents[2]
                      : palette.stage,
              minHeight: compact ? 52 : 72,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div style={{ width: "100%", position: "relative", minHeight: compact ? 180 : 260 }}>
      {[0, 1, 2, 3, 4].map((index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            left: `${10 + index * 16}%`,
            top: `${index % 2 === 0 ? 12 + index * 8 : 32 + index * 6}%`,
            width: compact ? 70 + index * 10 : 90 + index * 14,
            height: compact ? 70 + index * 10 : 90 + index * 14,
            borderRadius: index % 2 === 0 ? 999 : 28,
            backgroundColor: [palette.accents[0], palette.accents[1], palette.accents[2], palette.ink, palette.stage][index],
            opacity: interpolate(frame, [22 + index * 3, 38 + index * 3], [0, index === 4 ? 0.18 : 0.88], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        />
      ))}
    </div>
  );
};

const AmbientShape: React.FC<{
  frame: number;
  color: string;
  size: number;
  top?: number;
  left?: number;
  right?: number;
  round?: boolean;
}> = ({ frame, color, size, top, left, right, round }) => {
  return (
    <div
      style={{
        position: "absolute",
        top,
        left,
        right,
        width: size,
        height: size,
        borderRadius: round ? 999 : 34,
        backgroundColor: color,
        opacity: interpolate(frame, [0, 24], [0.12, 0.34], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        transform: `translateY(${interpolate(frame, [0, 30], [30, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
        })}px)`,
      }}
    />
  );
};
