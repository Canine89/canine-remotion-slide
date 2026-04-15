import React, { useCallback, useMemo, useRef, useState } from "react";
import { SlideData } from "../slides/types";
import { getSettledFrameOffset } from "../slides/getSettledFrameOffset";
import { StaticSlideFrame } from "./StaticSlideFrame";
import { useEditor } from "./useEditorStore";
import { createSlide, SLIDE_TYPE_LABELS } from "./slideFactory";

const SLIDE_W = 1920;
const SLIDE_H = 1080;
const INDEX_W = 24;
const GAP = 8;
const PAD_L = 12;
const PAD_R = 18;
const MIN_SIDEBAR_W = 200;
const MAX_SIDEBAR_W = 440;
const DEFAULT_SIDEBAR_W = 260;

function commitActiveEditable() {
  if (
    document.activeElement instanceof HTMLElement &&
    document.activeElement.isContentEditable
  ) {
    document.activeElement.blur();
  }
}

function hasActiveEditable() {
  return (
    document.activeElement instanceof HTMLElement &&
    document.activeElement.isContentEditable
  );
}

export const EditorSidebar: React.FC = () => {
  const { state, dispatch } = useEditor();
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_W);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<number | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    index: number;
    x: number;
    y: number;
  } | null>(null);
  const resizing = useRef(false);

  // 썸네일 크기를 사이드바 폭에서 계산
  const thumbW = sidebarWidth - PAD_L - PAD_R - INDEX_W - GAP;
  const thumbH = Math.round((thumbW / 16) * 9);
  const thumbScale = thumbW / SLIDE_W;

  // ── Resize Handle ──
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    resizing.current = true;
    const startX = e.clientX;
    const startW = sidebarWidth;

    const onMove = (ev: MouseEvent) => {
      if (!resizing.current) return;
      const newW = Math.max(MIN_SIDEBAR_W, Math.min(MAX_SIDEBAR_W, startW + ev.clientX - startX));
      setSidebarWidth(newW);
    };
    const onUp = () => {
      resizing.current = false;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, [sidebarWidth]);

  const handleSelect = useCallback(
    (index: number) => dispatch({ type: "SELECT", index }),
    [dispatch],
  );

  const handleSelectPointerDown = useCallback(
    (e: React.MouseEvent, index: number) => {
      if (!hasActiveEditable()) return;
      e.preventDefault();
      commitActiveEditable();
      window.setTimeout(() => {
        dispatch({ type: "SELECT", index });
      }, 0);
    },
    [dispatch],
  );

  // ── Drag & Drop ──
  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
    setDragIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTarget(index);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, toIndex: number) => {
      e.preventDefault();
      const fromIndex = Number(e.dataTransfer.getData("text/plain"));
      if (fromIndex !== toIndex) {
        dispatch({ type: "REORDER", from: fromIndex, to: toIndex });
      }
      setDragIndex(null);
      setDropTarget(null);
    },
    [dispatch],
  );

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
    setDropTarget(null);
  }, []);

  // ── Context Menu ──
  const handleContextMenu = useCallback(
    (e: React.MouseEvent, index: number) => {
      e.preventDefault();
      setContextMenu({ index, x: e.clientX, y: e.clientY });
    },
    [],
  );

  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  const handleDuplicate = useCallback(
    (index: number) => {
      dispatch({ type: "DUPLICATE_SLIDE", index });
      setContextMenu(null);
    },
    [dispatch],
  );

  const handleDelete = useCallback(
    (index: number) => {
      if (state.slides.length <= 1) return;
      dispatch({ type: "DELETE_SLIDE", index });
      setContextMenu(null);
    },
    [dispatch, state.slides.length],
  );

  const handleAddSlide = useCallback(
    (type: SlideData["type"]) => {
      dispatch({
        type: "ADD_SLIDE",
        afterIndex: state.selectedIndex,
        slide: createSlide(type),
      });
      setShowAddMenu(false);
    },
    [dispatch, state.selectedIndex],
  );

  return (
    <div
      style={{ ...sidebarStyle, width: sidebarWidth, minWidth: sidebarWidth }}
      onClick={closeContextMenu}
    >
      <div style={headerStyle}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.5px" }}>
          SLIDES
        </span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
          {state.slides.length}
        </span>
      </div>

      <div style={listStyle}>
        {state.slides.map((slide, i) => (
          <div
            key={i}
            onMouseDown={(e) => handleSelectPointerDown(e, i)}
            onClick={() => handleSelect(i)}
            onContextMenu={(e) => handleContextMenu(e, i)}
            draggable
            onDragStart={(e) => handleDragStart(e, i)}
            onDragOver={(e) => handleDragOver(e, i)}
            onDrop={(e) => handleDrop(e, i)}
            onDragEnd={handleDragEnd}
            style={{
              ...thumbContainerStyle,
              ...(dragIndex === i ? { opacity: 0.4 } : {}),
              ...(dropTarget === i && dragIndex !== i
                ? { borderTopColor: "#4a9eff" }
                : {}),
            }}
          >
            <div style={{
              ...indexStyle,
              color: i === state.selectedIndex ? "rgba(74,158,255,0.8)" : "rgba(255,255,255,0.35)",
            }}>{i + 1}</div>
            <div
              style={{
                width: thumbW,
                height: thumbH,
                borderRadius: 6,
                overflow: "hidden",
                position: "relative",
                pointerEvents: "none",
                flexShrink: 0,
                outline: i === state.selectedIndex
                  ? "2.5px solid rgba(74, 158, 255, 0.7)"
                  : "1px solid rgba(255,255,255,0.06)",
                outlineOffset: 0,
              }}
            >
              <div
                style={{
                  width: SLIDE_W,
                  height: SLIDE_H,
                  transform: `scale(${thumbScale})`,
                  transformOrigin: "top left",
                }}
              >
                <StaticSlideFrame slide={slide} frame={getSettledFrameOffset(slide)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 슬라이드 추가 버튼 */}
      <div style={footerStyle}>
        <div style={{ position: "relative" }}>
          <button
            type="button"
            onMouseDown={commitActiveEditable}
            onClick={() => setShowAddMenu(!showAddMenu)}
            style={addBtnStyle}
          >
            + 슬라이드 추가
          </button>
          {showAddMenu && (
            <div style={addMenuStyle}>
              {(
                Object.entries(SLIDE_TYPE_LABELS) as [
                  SlideData["type"],
                  string,
                ][]
              ).map(([type, label]) => (
                <button
                  key={type}
                  type="button"
                  onMouseDown={commitActiveEditable}
                  onClick={() => handleAddSlide(type)}
                  style={addMenuItemStyle}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 컨텍스트 메뉴 */}
      {contextMenu && (
        <div
          style={{
            position: "fixed",
            top: contextMenu.y,
            left: contextMenu.x,
            zIndex: 1000,
            background: "#222",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 8,
            padding: 4,
            minWidth: 140,
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onMouseDown={commitActiveEditable}
            style={ctxMenuItemStyle}
            onClick={() => handleDuplicate(contextMenu.index)}
          >
            복제
          </button>
          <button
            type="button"
            onMouseDown={commitActiveEditable}
            style={{
              ...ctxMenuItemStyle,
              color:
                state.slides.length <= 1
                  ? "rgba(255,255,255,0.2)"
                  : "#f87171",
            }}
            onClick={() => handleDelete(contextMenu.index)}
            disabled={state.slides.length <= 1}
          >
            삭제
          </button>
        </div>
      )}

      {/* 리사이즈 핸들 */}
      <div
        onMouseDown={handleResizeStart}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: 5,
          cursor: "col-resize",
          zIndex: 10,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background =
            "rgba(74,158,255,0.3)";
        }}
        onMouseLeave={(e) => {
          if (!resizing.current) {
            (e.currentTarget as HTMLElement).style.background = "transparent";
          }
        }}
      />
    </div>
  );
};

// ── Styles ──

const sidebarStyle: React.CSSProperties = {
  position: "relative",
  background: "#111111",
  borderRight: "1px solid rgba(255,255,255,0.08)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  userSelect: "none",
};

const headerStyle: React.CSSProperties = {
  padding: `14px ${PAD_L}px 10px ${PAD_L}px`,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  color: "rgba(255,255,255,0.6)",
  fontFamily: "system-ui, sans-serif",
  textTransform: "uppercase",
};

const listStyle: React.CSSProperties = {
  flex: 1,
  overflowY: "auto",
  padding: `0 ${PAD_R}px ${PAD_L}px ${PAD_L}px`,
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const thumbContainerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: GAP,
  padding: 4,
  borderRadius: 6,
  cursor: "pointer",
  borderTop: "2px solid transparent",
  transition: "background 100ms ease",
};

// selectedStyle은 이제 thumbDiv에 inline으로 적용

const indexStyle: React.CSSProperties = {
  width: INDEX_W,
  textAlign: "center",
  fontSize: 11,
  color: "rgba(255,255,255,0.35)",
  fontFamily: "ui-monospace, monospace",
  flexShrink: 0,
};

const footerStyle: React.CSSProperties = {
  padding: `8px ${PAD_R}px 12px ${PAD_L}px`,
  borderTop: "1px solid rgba(255,255,255,0.06)",
};

const addBtnStyle: React.CSSProperties = {
  width: "100%",
  border: "1px dashed rgba(255,255,255,0.2)",
  background: "transparent",
  color: "rgba(255,255,255,0.5)",
  padding: "8px 0",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 12,
  fontFamily: "system-ui, sans-serif",
};

const addMenuStyle: React.CSSProperties = {
  position: "absolute",
  bottom: "100%",
  left: 0,
  right: 0,
  marginBottom: 4,
  background: "#222",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8,
  padding: 4,
  maxHeight: 300,
  overflowY: "auto",
  boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
  zIndex: 100,
};

const addMenuItemStyle: React.CSSProperties = {
  width: "100%",
  border: 0,
  background: "transparent",
  color: "rgba(255,255,255,0.8)",
  padding: "8px 12px",
  borderRadius: 4,
  cursor: "pointer",
  fontSize: 12,
  fontFamily: "system-ui, sans-serif",
  textAlign: "left",
};

const ctxMenuItemStyle: React.CSSProperties = {
  width: "100%",
  border: 0,
  background: "transparent",
  color: "rgba(255,255,255,0.8)",
  padding: "8px 12px",
  borderRadius: 4,
  cursor: "pointer",
  fontSize: 13,
  fontFamily: "system-ui, sans-serif",
  textAlign: "left",
};
