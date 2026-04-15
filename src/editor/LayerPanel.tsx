import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useEditor } from "./useEditorStore";

const PPTX_LABELS: Record<string, string> = {
  badge: "뱃지",
  title: "제목",
  subtitle: "부제",
  "bullet-list": "불릿 리스트",
  "bullet-item": "불릿 항목",
  "tag-list": "태그 그룹",
  tag: "태그",
  image: "이미지",
  quote: "인용문",
  attribution: "출처",
  "stat-group": "통계 그룹",
  "stat-item": "통계 항목",
  "step-item": "단계 항목",
  "compare-col": "비교 컬럼",
  "compare-heading": "컬럼 제목",
  "flow-side": "흐름 영역",
};

function labelForKey(key: string): string {
  const base = key.replace(/-\d+$/, "");
  return PPTX_LABELS[base] ?? key;
}

/**
 * 현재 슬라이드의 data-pptx 오브젝트를 탐색하여 레이어 순서를 표시.
 * 드래그로 순서 변경, 맨 앞/맨 뒤 버튼 제공.
 */
export const LayerPanel: React.FC<{
  slideContainerRef: React.RefObject<HTMLDivElement | null>;
  selectedKey: string | null;
}> = ({ slideContainerRef, selectedKey }) => {
  const { state, dispatch } = useEditor();
  const [detectedKeys, setDetectedKeys] = useState<string[]>([]);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dropIdx, setDropIdx] = useState<number | null>(null);

  const slideIndex = state.selectedIndex;
  const savedOrder = state.layerOrders[slideIndex];

  // DOM에서 data-pptx 요소 키를 수집
  useEffect(() => {
    const container = slideContainerRef.current;
    if (!container) return;
    const timer = setTimeout(() => {
      const els = container.querySelectorAll("[data-pptx]");
      const keys: string[] = [];
      const seen = new Set<string>();
      for (const el of els) {
        const pptx = el.getAttribute("data-pptx") ?? "unknown";
        const parent = el.parentElement;
        let key = pptx;
        if (parent) {
          const siblings = Array.from(parent.querySelectorAll(`[data-pptx="${pptx}"]`));
          if (siblings.length > 1) key = `${pptx}-${siblings.indexOf(el as Element)}`;
        }
        if (!seen.has(key)) { seen.add(key); keys.push(key); }
      }
      setDetectedKeys(keys);
    }, 100);
    return () => clearTimeout(timer);
  }, [slideContainerRef, state.slides, slideIndex]);

  // 레이어 순서: 저장된 순서가 있으면 사용, 없으면 DOM 순서
  const layerOrder = useMemo(() => {
    if (!savedOrder || savedOrder.length === 0) return detectedKeys;
    // 저장된 순서에 없는 새 키 추가, 삭제된 키 제거
    const result = savedOrder.filter(k => detectedKeys.includes(k));
    for (const k of detectedKeys) {
      if (!result.includes(k)) result.push(k);
    }
    return result;
  }, [savedOrder, detectedKeys]);

  // 순서 저장
  const setOrder = useCallback((order: string[]) => {
    dispatch({ type: "SET_LAYER_ORDER", slideIndex, order });
  }, [dispatch, slideIndex]);

  // 맨 앞으로
  const bringToFront = useCallback((key: string) => {
    const next = layerOrder.filter(k => k !== key);
    next.push(key);
    setOrder(next);
  }, [layerOrder, setOrder]);

  // 맨 뒤로
  const sendToBack = useCallback((key: string) => {
    const next = layerOrder.filter(k => k !== key);
    next.unshift(key);
    setOrder(next);
  }, [layerOrder, setOrder]);

  // 한 단계 위로
  const moveUp = useCallback((key: string) => {
    const idx = layerOrder.indexOf(key);
    if (idx < 0 || idx >= layerOrder.length - 1) return;
    const next = [...layerOrder];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    setOrder(next);
  }, [layerOrder, setOrder]);

  // 한 단계 아래로
  const moveDown = useCallback((key: string) => {
    const idx = layerOrder.indexOf(key);
    if (idx <= 0) return;
    const next = [...layerOrder];
    [next[idx], next[idx - 1]] = [next[idx - 1], next[idx]];
    setOrder(next);
  }, [layerOrder, setOrder]);

  // DnD
  const handleDragStart = useCallback((e: React.DragEvent, idx: number) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(idx));
    setDragIdx(idx);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDropIdx(idx);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, toIdx: number) => {
    e.preventDefault();
    const fromIdx = Number(e.dataTransfer.getData("text/plain"));
    if (fromIdx !== toIdx) {
      const next = [...layerOrder];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      setOrder(next);
    }
    setDragIdx(null);
    setDropIdx(null);
  }, [layerOrder, setOrder]);

  if (layerOrder.length === 0) return null;

  // 표시: 위(앞) → 아래(뒤) — 배열의 마지막이 맨 앞
  const displayed = [...layerOrder].reverse();

  return (
    <div style={{ marginTop: 8 }}>
      <div style={headerStyle}>LAYERS</div>
      <div style={listStyle}>
        {displayed.map((key, di) => {
          const realIdx = layerOrder.length - 1 - di;
          const isSelected = key === selectedKey;
          return (
            <div
              key={key}
              draggable
              onDragStart={e => handleDragStart(e, realIdx)}
              onDragOver={e => handleDragOver(e, realIdx)}
              onDrop={e => handleDrop(e, realIdx)}
              onDragEnd={() => { setDragIdx(null); setDropIdx(null); }}
              style={{
                ...itemStyle,
                ...(isSelected ? itemSelectedStyle : {}),
                ...(dragIdx === realIdx ? { opacity: 0.4 } : {}),
                ...(dropIdx === realIdx && dragIdx !== realIdx ? { borderTopColor: "#4a9eff" } : {}),
              }}
            >
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {labelForKey(key)}
              </span>
              <div style={btnGroupStyle}>
                <button type="button" style={smallBtnStyle} onClick={() => moveUp(key)} title="위로">&#9650;</button>
                <button type="button" style={smallBtnStyle} onClick={() => moveDown(key)} title="아래로">&#9660;</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const headerStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, letterSpacing: "0.5px",
  color: "rgba(255,255,255,0.6)", textTransform: "uppercase",
  marginBottom: 6,
};

const listStyle: React.CSSProperties = {
  display: "flex", flexDirection: "column", gap: 2,
};

const itemStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 6,
  padding: "5px 8px", borderRadius: 4,
  fontSize: 11, color: "rgba(255,255,255,0.7)",
  fontFamily: "system-ui, sans-serif",
  cursor: "grab", borderTop: "2px solid transparent",
  background: "rgba(255,255,255,0.04)",
};

const itemSelectedStyle: React.CSSProperties = {
  background: "rgba(74,158,255,0.15)",
  color: "#fff",
};

const btnGroupStyle: React.CSSProperties = {
  display: "flex", gap: 2, flexShrink: 0,
};

const smallBtnStyle: React.CSSProperties = {
  border: 0, background: "rgba(255,255,255,0.08)",
  color: "rgba(255,255,255,0.5)", borderRadius: 3,
  width: 18, height: 18, fontSize: 8, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
  padding: 0,
};
