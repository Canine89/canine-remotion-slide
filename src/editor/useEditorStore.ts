import React, { createContext, useContext, useReducer, useMemo } from "react";
import { SlideData, ThemeDirective } from "../slides/types";
import { NormalizedEditorState } from "./documentState";

// ── State ──

export interface ObjectOffset {
  x: number;
  y: number;
}

export interface EditorState {
  slides: SlideData[];
  selectedIndex: number;
  globalTheme: ThemeDirective;
  isDirty: boolean;
  isLoading: boolean;
  isSaving: boolean;
  isReloading: boolean;
  markdownPath: string;
  revision: string;
  /** 슬라이드별 오브젝트 오프셋: slideIndex → elementKey → {x, y} */
  offsets: Record<number, Record<string, ObjectOffset>>;
  /** 슬라이드별 오브젝트 z-index 순서 (뒤→앞): slideIndex → key[] */
  layerOrders: Record<number, string[]>;
  /** 슬라이드별 이미지 크기 오버라이드: slideIndex → key → {w, h} */
  sizes: Record<number, Record<string, { w: number; h: number }>>;
}

const initialState: EditorState = {
  slides: [],
  selectedIndex: 0,
  globalTheme: "dark",
  isDirty: false,
  isLoading: true,
  isSaving: false,
  isReloading: false,
  markdownPath: "",
  revision: "",
  offsets: {},
  layerOrders: {},
  sizes: {},
};

// ── Actions ──

export type EditorAction =
  | { type: "LOAD_START"; reloading?: boolean }
  | { type: "LOAD_SUCCESS"; slides: SlideData[]; theme: ThemeDirective; path: string; revision: string; editorState: NormalizedEditorState; selectedIndex?: number }
  | { type: "SAVE_START" }
  | { type: "SAVE_SUCCESS"; slides: SlideData[]; theme: ThemeDirective; path: string; revision: string; editorState: NormalizedEditorState; selectedIndex?: number }
  | { type: "SAVE_ERROR" }
  | { type: "UPDATE_FIELD"; index: number; field: string; value: unknown; subIndex?: number }
  | { type: "SELECT"; index: number }
  | { type: "ADD_SLIDE"; afterIndex: number; slide: SlideData }
  | { type: "DELETE_SLIDE"; index: number }
  | { type: "DUPLICATE_SLIDE"; index: number }
  | { type: "REORDER"; from: number; to: number }
  | { type: "CHANGE_THEME"; theme: ThemeDirective }
  | { type: "REPLACE_SLIDES"; slides: SlideData[] }
  | { type: "SET_OFFSET"; slideIndex: number; key: string; offset: ObjectOffset }
  | { type: "SET_LAYER_ORDER"; slideIndex: number; order: string[] }
  | { type: "SET_SIZE"; slideIndex: number; key: string; size: { w: number; h: number } }
  | { type: "CLEAR_OBJECT_STATE"; slideIndex: number; keyPrefix: string }
  | { type: "RESTORE_SNAPSHOT"; slides: SlideData[]; offsets: Record<number, Record<string, ObjectOffset>>; layerOrders: Record<number, string[]>; sizes: Record<number, Record<string, { w: number; h: number }>> }
  | { type: "MARK_CLEAN" };

// ── Reducer ──

function updateSlideField(
  slide: SlideData,
  field: string,
  value: unknown,
  subIndex?: number,
): SlideData {
  // columns.bullets → compound value: { colIndex, bulletIndex, value }
  if (field === "columns.bullets" && slide.type === "compare") {
    const { colIndex, bulletIndex, value: val } = value as { colIndex: number; bulletIndex: number; value: string };
    const columns = [...slide.columns];
    const col = { ...columns[colIndex], bullets: [...columns[colIndex].bullets] };
    col.bullets[bulletIndex] = val;
    columns[colIndex] = col;
    return { ...slide, columns } as SlideData;
  }
  if (field === "columns.bullets.add" && slide.type === "compare") {
    const { colIndex, afterIndex } = value as { colIndex: number; afterIndex: number };
    const columns = [...slide.columns];
    const col = { ...columns[colIndex], bullets: [...columns[colIndex].bullets] };
    col.bullets.splice(afterIndex + 1, 0, "");
    columns[colIndex] = col;
    return { ...slide, columns } as SlideData;
  }
  if (field === "columns.bullets.delete" && slide.type === "compare") {
    const { colIndex, bulletIndex } = value as { colIndex: number; bulletIndex: number };
    const columns = [...slide.columns];
    const col = { ...columns[colIndex], bullets: [...columns[colIndex].bullets] };
    if (col.bullets.length > 1) col.bullets.splice(bulletIndex, 1);
    columns[colIndex] = col;
    return { ...slide, columns } as SlideData;
  }
  // columns.heading → columns[subIndex].heading
  if (field === "columns.heading" && slide.type === "compare" && subIndex !== undefined) {
    const columns = [...slide.columns];
    columns[subIndex] = { ...columns[subIndex], heading: value as string };
    return { ...slide, columns } as SlideData;
  }

  // 배열 필드의 특정 인덱스 업데이트
  if (subIndex !== undefined) {
    const arr = (slide as any)[field];
    if (Array.isArray(arr)) {
      const next = [...arr];
      next[subIndex] = value;
      return { ...slide, [field]: next } as SlideData;
    }
    // 중첩 필드: "stats.value" → stats[subIndex].value
    const dotIdx = field.indexOf(".");
    if (dotIdx !== -1) {
      const arrField = field.slice(0, dotIdx);
      const innerField = field.slice(dotIdx + 1);
      const arr2 = (slide as any)[arrField];
      if (Array.isArray(arr2)) {
        const next = [...arr2];
        next[subIndex] = { ...next[subIndex], [innerField]: value };
        return { ...slide, [arrField]: next } as SlideData;
      }
    }
  }
  return { ...slide, [field]: value } as SlideData;
}

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "LOAD_START":
      return {
        ...state,
        isLoading: !action.reloading,
        isReloading: Boolean(action.reloading),
      };

    case "LOAD_SUCCESS":
    case "SAVE_SUCCESS":
      {
        const selectedIndex = Math.max(
          0,
          Math.min(action.selectedIndex ?? state.selectedIndex, Math.max(action.slides.length - 1, 0)),
        );

      return {
        ...state,
        slides: action.slides,
        globalTheme: action.theme,
        markdownPath: action.path,
        revision: action.revision,
        selectedIndex,
        isDirty: false,
        isLoading: false,
        isSaving: false,
        isReloading: false,
        offsets: action.editorState.offsets,
        layerOrders: action.editorState.layerOrders,
        sizes: action.editorState.sizes,
      };
      }

    case "SAVE_START":
      return {
        ...state,
        isSaving: true,
      };

    case "SAVE_ERROR":
      return {
        ...state,
        isSaving: false,
        isLoading: false,
        isReloading: false,
      };

    case "UPDATE_FIELD": {
      const slides = [...state.slides];
      slides[action.index] = updateSlideField(
        slides[action.index],
        action.field,
        action.value,
        action.subIndex,
      );
      return { ...state, slides, isDirty: true };
    }

    case "SELECT":
      return {
        ...state,
        selectedIndex: Math.max(0, Math.min(action.index, state.slides.length - 1)),
      };

    case "ADD_SLIDE": {
      const slides = [...state.slides];
      slides.splice(action.afterIndex + 1, 0, action.slide);
      return {
        ...state,
        slides,
        selectedIndex: action.afterIndex + 1,
        isDirty: true,
      };
    }

    case "DELETE_SLIDE": {
      if (state.slides.length <= 1) return state;
      const slides = state.slides.filter((_, i) => i !== action.index);
      const selectedIndex = Math.min(state.selectedIndex, slides.length - 1);
      return { ...state, slides, selectedIndex, isDirty: true };
    }

    case "DUPLICATE_SLIDE": {
      const slides = [...state.slides];
      const copy = { ...slides[action.index] };
      slides.splice(action.index + 1, 0, copy);
      return {
        ...state,
        slides,
        selectedIndex: action.index + 1,
        isDirty: true,
      };
    }

    case "REORDER": {
      const slides = [...state.slides];
      const [moved] = slides.splice(action.from, 1);
      slides.splice(action.to, 0, moved);
      const selectedIndex =
        state.selectedIndex === action.from
          ? action.to
          : state.selectedIndex;
      return { ...state, slides, selectedIndex, isDirty: true };
    }

    case "CHANGE_THEME": {
      // 기존 글로벌 테마를 쓰던 슬라이드를 새 테마로 교체
      const oldTheme = state.globalTheme;
      const slides = state.slides.map((s) =>
        s.theme === oldTheme || s.theme === undefined
          ? { ...s, theme: action.theme } as SlideData
          : s,
      );
      return { ...state, slides, globalTheme: action.theme, isDirty: true };
    }

    case "REPLACE_SLIDES":
      return { ...state, slides: action.slides, isDirty: true };

    case "SET_OFFSET": {
      const slideOffsets = { ...(state.offsets[action.slideIndex] ?? {}) };
      slideOffsets[action.key] = action.offset;
      return {
        ...state,
        offsets: { ...state.offsets, [action.slideIndex]: slideOffsets },
        isDirty: true,
      };
    }

    case "SET_LAYER_ORDER": {
      return {
        ...state,
        layerOrders: { ...state.layerOrders, [action.slideIndex]: action.order },
        isDirty: true,
      };
    }

    case "SET_SIZE": {
      const slideSizes = { ...(state.sizes[action.slideIndex] ?? {}) };
      slideSizes[action.key] = action.size;
      return { ...state, sizes: { ...state.sizes, [action.slideIndex]: slideSizes }, isDirty: true };
    }

    case "CLEAR_OBJECT_STATE": {
      const nextOffsets = { ...state.offsets };
      const nextSizes = { ...state.sizes };
      const nextLayerOrders = { ...state.layerOrders };

      const offsetEntries = { ...(nextOffsets[action.slideIndex] ?? {}) };
      for (const key of Object.keys(offsetEntries)) {
        if (key.startsWith(action.keyPrefix)) delete offsetEntries[key];
      }
      if (Object.keys(offsetEntries).length > 0) nextOffsets[action.slideIndex] = offsetEntries;
      else delete nextOffsets[action.slideIndex];

      const sizeEntries = { ...(nextSizes[action.slideIndex] ?? {}) };
      for (const key of Object.keys(sizeEntries)) {
        if (key.startsWith(action.keyPrefix)) delete sizeEntries[key];
      }
      if (Object.keys(sizeEntries).length > 0) nextSizes[action.slideIndex] = sizeEntries;
      else delete nextSizes[action.slideIndex];

      const orderEntries = (nextLayerOrders[action.slideIndex] ?? []).filter(
        (key) => !key.startsWith(action.keyPrefix),
      );
      if (orderEntries.length > 0) nextLayerOrders[action.slideIndex] = orderEntries;
      else delete nextLayerOrders[action.slideIndex];

      return {
        ...state,
        offsets: nextOffsets,
        sizes: nextSizes,
        layerOrders: nextLayerOrders,
        isDirty: true,
      };
    }

    case "RESTORE_SNAPSHOT":
      return { ...state, slides: action.slides, offsets: action.offsets, layerOrders: action.layerOrders, sizes: action.sizes ?? {}, isDirty: true };

    case "MARK_CLEAN":
      return { ...state, isDirty: false };

    default:
      return state;
  }
}

// ── Context ──

interface EditorContextValue {
  state: EditorState;
  dispatch: React.Dispatch<EditorAction>;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(editorReducer, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state, dispatch]);
  return React.createElement(EditorContext.Provider, { value }, children);
};

export function useEditor() {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditor must be inside EditorProvider");
  return ctx;
}

export function useEditorState() {
  return useEditor().state;
}

export function useEditorDispatch() {
  return useEditor().dispatch;
}
