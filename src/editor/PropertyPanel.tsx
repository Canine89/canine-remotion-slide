import React, { useCallback } from "react";
import { SlideData, ThemeDirective } from "../slides/types";
import { useEditor } from "./useEditorStore";
import { SLIDE_TYPE_LABELS, createSlide } from "./slideFactory";

const THEMES: ThemeDirective[] = ["dark", "blue", "orange", "yellow", "black", "parchment", "figma"];

export const PropertyPanel: React.FC = () => {
  const { state, dispatch } = useEditor();
  const slide = state.slides[state.selectedIndex];

  const handleThemeChange = useCallback(
    (theme: ThemeDirective) => dispatch({ type: "CHANGE_THEME", theme }),
    [dispatch],
  );

  const handleSlideThemeChange = useCallback(
    (theme: ThemeDirective | undefined) => {
      dispatch({
        type: "UPDATE_FIELD",
        index: state.selectedIndex,
        field: "theme",
        value: theme,
      });
    },
    [dispatch, state.selectedIndex],
  );

  const handleTypeChange = useCallback(
    (newType: SlideData["type"]) => {
      if (!slide || slide.type === newType) return;
      const newSlide = createSlide(newType);
      // 가능하면 기존 badge, title 유지
      (newSlide as any).badge = slide.badge;
      if ("title" in slide) (newSlide as any).title = (slide as any).title;
      const slides = [...state.slides];
      slides[state.selectedIndex] = newSlide;
      dispatch({ type: "REPLACE_SLIDES", slides });
    },
    [dispatch, slide, state.slides, state.selectedIndex],
  );

  const handleBadgeVariantChange = useCallback(
    (variant: 0 | 1) => {
      dispatch({
        type: "UPDATE_FIELD",
        index: state.selectedIndex,
        field: "badgeVariant",
        value: variant,
      });
    },
    [dispatch, state.selectedIndex],
  );

  if (!slide) return null;

  return (
    <div style={panelStyle}>
      <div style={headerStyle}>PROPERTIES</div>

      {/* 글로벌 테마 */}
      <Section label="글로벌 테마">
        <select
          value={state.globalTheme}
          onChange={(e) => handleThemeChange(e.target.value as ThemeDirective)}
          style={selectStyle}
        >
          {THEMES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
          <option value="DESIGN.md">DESIGN.md</option>
        </select>
      </Section>

      {/* 슬라이드 개별 테마 */}
      <Section label="슬라이드 테마">
        <select
          value={slide.theme ?? ""}
          onChange={(e) =>
            handleSlideThemeChange(
              e.target.value === "" ? undefined : (e.target.value as ThemeDirective),
            )
          }
          style={selectStyle}
        >
          <option value="">(글로벌 테마 사용)</option>
          {THEMES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
          <option value="DESIGN.md">DESIGN.md</option>
        </select>
      </Section>

      {/* 슬라이드 타입 */}
      <Section label="슬라이드 타입">
        <select
          value={slide.type}
          onChange={(e) => handleTypeChange(e.target.value as SlideData["type"])}
          style={selectStyle}
        >
          {(Object.entries(SLIDE_TYPE_LABELS) as [SlideData["type"], string][]).map(
            ([type, label]) => (
              <option key={type} value={type}>{label}</option>
            ),
          )}
        </select>
      </Section>

      {/* 뱃지 변형 */}
      <Section label="뱃지 스타일">
        <div style={{ display: "flex", gap: 4 }}>
          {([0, 1] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => handleBadgeVariantChange(v)}
              style={{
                ...variantBtnStyle,
                ...(slide.badgeVariant === v || (slide.badgeVariant === undefined && v === 0)
                  ? variantBtnActiveStyle
                  : {}),
              }}
            >
              Variant {v}
            </button>
          ))}
        </div>
      </Section>

      {/* 타입별 추가 속성 */}
      {slide.type === "stat" && (
        <Section label="통계 시각화">
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
            마크다운에서 $ value [bar:ratio] 형식으로 설정
          </div>
        </Section>
      )}

      {(slide.type === "title-image" || slide.type === "split") && (
        <Section label="이미지">
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
            Ctrl+V 붙여넣기 또는 파일 드래그앤드롭으로 추가
          </div>
        </Section>
      )}
    </div>
  );
};

const Section: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div style={{ marginBottom: 16 }}>
    <div style={labelStyle}>{label}</div>
    {children}
  </div>
);

// ── Styles ──

const panelStyle: React.CSSProperties = {
  // 부모(rightPanelStyle)가 감싸므로 자체 크기/배경 없음
};

const headerStyle: React.CSSProperties = {
  padding: "14px 0 10px",
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.5px",
  color: "rgba(255,255,255,0.6)",
  textTransform: "uppercase",
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  color: "rgba(255,255,255,0.45)",
  marginBottom: 6,
};

const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "6px 8px",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 6,
  background: "#1a1a1a",
  color: "#fff",
  fontSize: 12,
  fontFamily: "system-ui, sans-serif",
  outline: "none",
};

const inputStyle: React.CSSProperties = {
  ...selectStyle,
};

const variantBtnStyle: React.CSSProperties = {
  flex: 1,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "#1a1a1a",
  color: "rgba(255,255,255,0.6)",
  padding: "6px 8px",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 11,
  fontFamily: "system-ui, sans-serif",
};

const variantBtnActiveStyle: React.CSSProperties = {
  background: "rgba(74,158,255,0.2)",
  borderColor: "rgba(74,158,255,0.5)",
  color: "#fff",
};
