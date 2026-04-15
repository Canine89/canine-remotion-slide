import { useCallback, useEffect, useRef, useState } from "react";

// ── Types ──

export interface ObjectOffset { x: number; y: number }
export interface SnapLine { axis: "x" | "y"; pos: number }
export type InteractionMode = "idle" | "selected" | "editing";
export interface ContextMenuState { key: string; x: number; y: number }

export interface DragVisuals {
  selectedKey: string | null;
  mode: InteractionMode;
  snapLines: SnapLine[];
  selectionRect: DOMRect | null;
  contextMenu: ContextMenuState | null;
}

interface Rect {
  left: number; top: number; right: number; bottom: number;
  cx: number; cy: number; width: number; height: number;
}

const SNAP_THRESHOLD = 8;
const DRAG_DEAD_ZONE = 4;

// ── 유틸 ──

function getElementKey(el: HTMLElement): string {
  const pptx = el.getAttribute("data-pptx") ?? "unknown";
  const parent = el.parentElement;
  if (parent) {
    const siblings = Array.from(parent.querySelectorAll(`[data-pptx="${pptx}"]`));
    if (siblings.length > 1) return `${pptx}-${siblings.indexOf(el)}`;
  }
  return pptx;
}

function findPptxAncestor(el: HTMLElement | null): HTMLElement | null {
  let cur = el;
  while (cur) {
    if (cur.hasAttribute("data-pptx")) return cur;
    cur = cur.parentElement;
  }
  return null;
}

function toSlideCoords(clientX: number, clientY: number, container: HTMLElement, scale: number) {
  const r = container.getBoundingClientRect();
  return { x: (clientX - r.left) / scale, y: (clientY - r.top) / scale };
}

function getSlideRect(el: HTMLElement, container: HTMLElement, scale: number): Rect {
  const sr = container.getBoundingClientRect();
  const er = el.getBoundingClientRect();
  const left = (er.left - sr.left) / scale;
  const top = (er.top - sr.top) / scale;
  const w = er.width / scale;
  const h = er.height / scale;
  return { left, top, right: left + w, bottom: top + h, cx: left + w / 2, cy: top + h / 2, width: w, height: h };
}

function collectOtherRects(container: HTMLElement, scale: number, excludeEl: HTMLElement): Rect[] {
  const rects: Rect[] = [];
  for (const el of container.querySelectorAll("[data-pptx]")) {
    if (el === excludeEl || excludeEl.contains(el) || el.contains(excludeEl)) continue;
    rects.push(getSlideRect(el as HTMLElement, container, scale));
  }
  rects.push({ left: 0, top: 0, right: 1920, bottom: 1080, cx: 960, cy: 540, width: 1920, height: 1080 });
  return rects;
}

function calcSnap(dragged: Rect, others: Rect[]): { lines: SnapLine[]; dx: number; dy: number } {
  const lines: SnapLine[] = [];
  let dx = 0, dy = 0, bx = SNAP_THRESHOLD + 1, by = SNAP_THRESHOLD + 1;
  for (const o of others) {
    for (const [a, b] of [
      [dragged.left, o.left], [dragged.right, o.right], [dragged.cx, o.cx],
      [dragged.left, o.right], [dragged.right, o.left],
    ] as [number, number][]) {
      const d = Math.abs(a - b);
      if (d < SNAP_THRESHOLD && d < bx) {
        bx = d; dx = b - a;
        const i = lines.findIndex(l => l.axis === "x");
        if (i >= 0) lines.splice(i, 1);
        lines.push({ axis: "x", pos: b });
      }
    }
    for (const [a, b] of [
      [dragged.top, o.top], [dragged.bottom, o.bottom], [dragged.cy, o.cy],
      [dragged.top, o.bottom], [dragged.bottom, o.top],
    ] as [number, number][]) {
      const d = Math.abs(a - b);
      if (d < SNAP_THRESHOLD && d < by) {
        by = d; dy = b - a;
        const i = lines.findIndex(l => l.axis === "y");
        if (i >= 0) lines.splice(i, 1);
        lines.push({ axis: "y", pos: b });
      }
    }
  }
  return { lines, dx, dy };
}

function focusEditable(el: HTMLElement) {
  if (el.isContentEditable) { el.focus(); return; }
  const c = el.querySelector("[contenteditable=true]") as HTMLElement | null;
  c?.focus();
}

function readSelectionRect(el: HTMLElement | null, container: HTMLElement | null, scale: number): DOMRect | null {
  if (!el || !container) return null;
  const r = getSlideRect(el, container, scale);
  return new DOMRect(r.left, r.top, r.width, r.height);
}

// ── Hook ──

export function useObjectDrag(
  containerRef: React.RefObject<HTMLDivElement | null>,
  scale: number,
  offsets: Record<string, ObjectOffset>,
  onOffsetChange: (key: string, offset: ObjectOffset) => void,
  layerOrder?: string[],
  onDeleteSelected?: (key: string) => void,
) {
  // 렌더링에 필요한 시각 상태만 useState
  const [visuals, setVisuals] = useState<DragVisuals>({
    selectedKey: null, mode: "idle",
    snapLines: [], selectionRect: null, contextMenu: null,
  });

  // 드래그 중 변하는 값은 ref (리렌더 없이 DOM 직접 조작)
  const dragging = useRef(false);
  const dragEl = useRef<HTMLElement | null>(null);
  const dragKey = useRef<string | null>(null);
  const dragOrigin = useRef({ mx: 0, my: 0, ox: 0, oy: 0 });
  const didMove = useRef(false);

  // 최신 offsets를 ref로 유지 (클로저 stale 방지)
  const offsetsRef = useRef(offsets);
  offsetsRef.current = offsets;
  const scaleRef = useRef(scale);
  scaleRef.current = scale;

  // ── 오프셋 + z-index DOM 적용 (드래그 중 건너뜀) ──
  useEffect(() => {
    if (dragging.current) return;
    const c = containerRef.current;
    if (!c) return;
    for (const el of c.querySelectorAll("[data-pptx]")) {
      const h = el as HTMLElement;
      const key = getElementKey(h);
      const off = offsets[key];
      h.style.transform = off && (off.x || off.y) ? `translate(${off.x}px, ${off.y}px)` : "";
      if (layerOrder && layerOrder.length > 0) {
        const zi = layerOrder.indexOf(key);
        h.style.zIndex = zi >= 0 ? String(zi + 1) : "";
        if (zi >= 0) h.style.position = "relative";
      }
    }
  });

  // 선택 rect 재계산
  const refreshSelectionRect = useCallback(() => {
    const el = dragEl.current;
    const rect = readSelectionRect(el, containerRef.current, scaleRef.current);
    setVisuals(v => ({ ...v, selectionRect: rect }));
  }, [containerRef]);

  // offsets 변경 후 선택 rect 갱신
  useEffect(() => { refreshSelectionRect(); }, [offsets, refreshSelectionRect]);

  // ── 선택 해제 ──
  const deselect = useCallback(() => {
    dragging.current = false;
    dragEl.current = null;
    dragKey.current = null;
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    setVisuals({ selectedKey: null, mode: "idle", snapLines: [], selectionRect: null, contextMenu: null });
  }, []);

  // ── PointerDown (좌클릭만) ──
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // 우클릭/중간 클릭 무시
    if (e.button !== 0) return;
    const c = containerRef.current;
    if (!c) return;

    // 컨텍스트 메뉴 열려있으면 닫기
    setVisuals(v => v.contextMenu ? { ...v, contextMenu: null } : v);

    const target = e.target as HTMLElement;

    // 편집 모드에서 같은 요소 내부 클릭 → 커서 이동 허용
    if (visuals.mode === "editing" && dragEl.current?.contains(target)) return;

    const pptxEl = findPptxAncestor(target);
    if (!pptxEl) { deselect(); return; }

    e.preventDefault();
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();

    const key = getElementKey(pptxEl);
    const off = offsetsRef.current[key] ?? { x: 0, y: 0 };
    const slide = toSlideCoords(e.clientX, e.clientY, c, scaleRef.current);

    // ref 업데이트 (리렌더 없이)
    dragging.current = true;
    dragEl.current = pptxEl;
    dragKey.current = key;
    dragOrigin.current = { mx: slide.x, my: slide.y, ox: off.x, oy: off.y };
    didMove.current = false;

    // 시각 업데이트
    const rect = readSelectionRect(pptxEl, c, scaleRef.current);
    setVisuals({ selectedKey: key, mode: "selected", snapLines: [], selectionRect: rect, contextMenu: null });
  }, [containerRef, visuals.mode, deselect]);

  // ── PointerMove ──
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current || !dragEl.current) return;
    const c = containerRef.current;
    if (!c) return;

    const s = scaleRef.current;
    const slide = toSlideCoords(e.clientX, e.clientY, c, s);
    const dx = slide.x - dragOrigin.current.mx;
    const dy = slide.y - dragOrigin.current.my;

    if (!didMove.current && Math.abs(dx) < DRAG_DEAD_ZONE && Math.abs(dy) < DRAG_DEAD_ZONE) return;
    didMove.current = true;

    let nx = dragOrigin.current.ox + dx;
    let ny = dragOrigin.current.oy + dy;

    // 임시 적용 → rect 계산 → 스냅
    const el = dragEl.current;
    el.style.transform = `translate(${nx}px, ${ny}px)`;
    const dRect = getSlideRect(el, c, s);
    const others = collectOtherRects(c, s, el);
    const snap = calcSnap(dRect, others);
    nx += snap.dx;
    ny += snap.dy;
    el.style.transform = `translate(${nx}px, ${ny}px)`;

    // 선택 rect + 스냅 라인 업데이트
    setVisuals(v => ({
      ...v,
      snapLines: snap.lines,
      selectionRect: new DOMRect(dRect.left + snap.dx, dRect.top + snap.dy, dRect.width, dRect.height),
    }));
  }, [containerRef]);

  // ── PointerUp ──
  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragging.current || !dragEl.current) return;
    if (e.button !== 0) return;
    const c = containerRef.current;
    if (!c) return;

    if (didMove.current) {
      const s = scaleRef.current;
      const slide = toSlideCoords(e.clientX, e.clientY, c, s);
      let nx = dragOrigin.current.ox + (slide.x - dragOrigin.current.mx);
      let ny = dragOrigin.current.oy + (slide.y - dragOrigin.current.my);

      const el = dragEl.current;
      el.style.transform = `translate(${nx}px, ${ny}px)`;
      const dRect = getSlideRect(el, c, s);
      const others = collectOtherRects(c, s, el);
      const snap = calcSnap(dRect, others);
      nx += snap.dx;
      ny += snap.dy;
      el.style.transform = `translate(${nx}px, ${ny}px)`;

      onOffsetChange(dragKey.current!, { x: nx, y: ny });
    }

    // 드래그 종료, 선택 유지
    dragging.current = false;
    const rect = readSelectionRect(dragEl.current, c, scaleRef.current);
    setVisuals(v => ({ ...v, snapLines: [], selectionRect: rect }));
  }, [containerRef, onOffsetChange]);

  // ── DoubleClick → 텍스트 편집 ──
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    const pptxEl = findPptxAncestor(e.target as HTMLElement);
    if (!pptxEl) return;
    const key = getElementKey(pptxEl);
    dragEl.current = pptxEl;
    dragKey.current = key;
    dragging.current = false;
    setVisuals(v => ({ ...v, selectedKey: key, mode: "editing", contextMenu: null }));
    focusEditable(pptxEl);
  }, []);

  // ── 우클릭 → 컨텍스트 메뉴 ──
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    // 진행 중인 드래그 취소
    dragging.current = false;
    didMove.current = false;

    const pptxEl = findPptxAncestor(e.target as HTMLElement);
    if (!pptxEl) { setVisuals(v => ({ ...v, contextMenu: null })); return; }

    const key = getElementKey(pptxEl);
    dragEl.current = pptxEl;
    dragKey.current = key;

    const c = containerRef.current;
    const rect = readSelectionRect(pptxEl, c, scaleRef.current);
    setVisuals({
      selectedKey: key, mode: "selected",
      snapLines: [], selectionRect: rect,
      contextMenu: { key, x: e.clientX, y: e.clientY },
    });
  }, [containerRef]);

  const closeContextMenu = useCallback(() => {
    setVisuals(v => ({ ...v, contextMenu: null }));
  }, []);

  // ── Escape 단계 전환 + Delete 삭제 ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (visuals.mode === "editing") {
          if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
          setVisuals(v => ({ ...v, mode: "selected" }));
        } else if (visuals.mode === "selected") {
          deselect();
        }
        return;
      }

      // Delete/Backspace — 선택 모드에서만 (편집 모드에서는 텍스트 삭제에 사용)
      if ((e.key === "Delete" || e.key === "Backspace") && visuals.mode === "selected" && visuals.selectedKey) {
        e.preventDefault();
        const key = visuals.selectedKey;
        deselect();
        onDeleteSelected?.(key);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [visuals.mode, visuals.selectedKey, deselect, onDeleteSelected]);

  // 외부 호환 — state 형태로 노출
  const state: DragVisuals & { isDragging: boolean } = {
    ...visuals,
    isDragging: false, // 렌더링용으로는 항상 false (드래그 상태는 ref)
  };

  return { state: visuals, handlePointerDown, handlePointerMove, handlePointerUp, handleDoubleClick, handleContextMenu, closeContextMenu };
}
