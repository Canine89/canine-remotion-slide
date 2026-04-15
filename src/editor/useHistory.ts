import { useCallback, useMemo, useRef } from "react";
import { SlideData } from "../slides/types";
import { ObjectOffset } from "./useEditorStore";

const MAX_HISTORY = 50;

export interface Snapshot {
  slides: SlideData[];
  offsets: Record<number, Record<string, ObjectOffset>>;
  layerOrders: Record<number, string[]>;
  sizes: Record<number, Record<string, { w: number; h: number }>>;
}

interface HistoryState {
  past: Snapshot[];
  future: Snapshot[];
}

function cloneSnapshot(snapshot: Snapshot): Snapshot {
  return {
    slides: snapshot.slides.map((slide) => structuredClone(slide)),
    offsets: Object.fromEntries(
      Object.entries(snapshot.offsets).map(([index, slideOffsets]) => [
        Number(index),
        Object.fromEntries(
          Object.entries(slideOffsets).map(([key, offset]) => [key, { ...offset }]),
        ),
      ]),
    ),
    layerOrders: Object.fromEntries(
      Object.entries(snapshot.layerOrders).map(([index, order]) => [Number(index), [...order]]),
    ),
    sizes: Object.fromEntries(
      Object.entries(snapshot.sizes).map(([index, slideSizes]) => [
        Number(index),
        Object.fromEntries(
          Object.entries(slideSizes).map(([key, size]) => [key, { ...size }]),
        ),
      ]),
    ),
  };
}

/**
 * slides + offsets 스냅샷 기반 undo/redo 히스토리.
 */
export function useHistory() {
  const history = useRef<HistoryState>({ past: [], future: [] });

  const pushSnapshot = useCallback((snapshot: Snapshot) => {
    const h = history.current;
    h.past.push(cloneSnapshot(snapshot));
    if (h.past.length > MAX_HISTORY) h.past.shift();
    h.future = [];
  }, []);

  const undo = useCallback(
    (current: Snapshot): Snapshot | null => {
      const h = history.current;
      if (h.past.length === 0) return null;
      const prev = h.past.pop()!;
      h.future.push(cloneSnapshot(current));
      return cloneSnapshot(prev);
    },
    [],
  );

  const redo = useCallback(
    (current: Snapshot): Snapshot | null => {
      const h = history.current;
      if (h.future.length === 0) return null;
      const next = h.future.pop()!;
      h.past.push(cloneSnapshot(current));
      return cloneSnapshot(next);
    },
    [],
  );

  const canUndo = useCallback(() => history.current.past.length > 0, []);
  const canRedo = useCallback(() => history.current.future.length > 0, []);

  const reset = useCallback(() => {
    history.current = { past: [], future: [] };
  }, []);

  // 안정적인 참조 반환 — 매 렌더마다 새 객체 생성 방지
  return useMemo(
    () => ({ pushSnapshot, undo, redo, canUndo, canRedo, reset }),
    [pushSnapshot, undo, redo, canUndo, canRedo, reset],
  );
}
