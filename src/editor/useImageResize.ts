import { useCallback, useRef, useState } from "react";

export interface ResizeState {
  active: boolean;
  handle: string; // "nw" | "ne" | "sw" | "se"
  rect: DOMRect | null;
}

/**
 * 이미지 리사이즈 핸들 드래그.
 * Shift 누르면 비율 유지.
 */
export function useImageResize(
  containerRef: React.RefObject<HTMLDivElement | null>,
  scale: number,
  onSizeChange: (key: string, size: { w: number; h: number }) => void,
) {
  const [resizing, setResizing] = useState(false);
  const resizeRef = useRef<{
    key: string;
    handle: string;
    startX: number;
    startY: number;
    origW: number;
    origH: number;
    origLeft: number;
    origTop: number;
    el: HTMLElement;
    aspect: number;
  } | null>(null);

  const startResize = useCallback(
    (e: React.PointerEvent, handle: string, el: HTMLElement, key: string) => {
      e.preventDefault();
      e.stopPropagation();

      const w = el.offsetWidth;
      const h = el.offsetHeight;

      resizeRef.current = {
        key,
        handle,
        startX: e.clientX,
        startY: e.clientY,
        origW: w,
        origH: h,
        origLeft: el.offsetLeft,
        origTop: el.offsetTop,
        el,
        aspect: w / h,
      };
      setResizing(true);

      const onMove = (ev: PointerEvent) => {
        const r = resizeRef.current;
        if (!r) return;

        const dx = (ev.clientX - r.startX) / scale;
        const dy = (ev.clientY - r.startY) / scale;

        let newW = r.origW;
        let newH = r.origH;

        // 핸들 방향에 따라 크기 계산
        if (r.handle.includes("e")) newW = Math.max(40, r.origW + dx);
        if (r.handle.includes("w")) newW = Math.max(40, r.origW - dx);
        if (r.handle.includes("s")) newH = Math.max(40, r.origH + dy);
        if (r.handle.includes("n")) newH = Math.max(40, r.origH - dy);

        // Shift: 비율 유지
        if (ev.shiftKey) {
          if (r.handle === "se" || r.handle === "nw") {
            newH = newW / r.aspect;
          } else if (r.handle === "sw" || r.handle === "ne") {
            newH = newW / r.aspect;
          }
        }

        r.el.style.width = `${newW}px`;
        r.el.style.height = `${newH}px`;
        r.el.style.maxWidth = "none";
        r.el.style.maxHeight = "none";
      };

      const onUp = (ev: PointerEvent) => {
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);

        const r = resizeRef.current;
        if (r) {
          const finalW = r.el.offsetWidth;
          const finalH = r.el.offsetHeight;
          onSizeChange(r.key, { w: finalW, h: finalH });
        }
        resizeRef.current = null;
        setResizing(false);
      };

      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
    },
    [scale, onSizeChange],
  );

  return { resizing, startResize };
}
