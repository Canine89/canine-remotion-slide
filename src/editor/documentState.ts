import { ObjectOffset } from "./useEditorStore";

export interface SlideEditorState {
  offsets?: Record<string, ObjectOffset>;
  sizes?: Record<string, { w: number; h: number }>;
  layerOrder?: string[];
}

export interface EditorDocumentState {
  version: 1;
  slides: SlideEditorState[];
}

export interface NormalizedEditorState {
  offsets: Record<number, Record<string, ObjectOffset>>;
  sizes: Record<number, Record<string, { w: number; h: number }>>;
  layerOrders: Record<number, string[]>;
}

export interface EditorDocumentPayload {
  markdown: string;
  path: string;
  editorState: EditorDocumentState;
  revision: string;
}

export const EMPTY_EDITOR_DOCUMENT_STATE: EditorDocumentState = {
  version: 1,
  slides: [],
};

export function normalizeEditorDocumentState(
  editorState: EditorDocumentState | null | undefined,
  slideCount: number,
): NormalizedEditorState {
  const slides = Array.isArray(editorState?.slides) ? editorState!.slides : [];
  const offsets: NormalizedEditorState["offsets"] = {};
  const sizes: NormalizedEditorState["sizes"] = {};
  const layerOrders: NormalizedEditorState["layerOrders"] = {};

  for (let index = 0; index < slideCount; index += 1) {
    const slide = slides[index];
    if (slide?.offsets && Object.keys(slide.offsets).length > 0) {
      offsets[index] = slide.offsets;
    }
    if (slide?.sizes && Object.keys(slide.sizes).length > 0) {
      sizes[index] = slide.sizes;
    }
    if (slide?.layerOrder && slide.layerOrder.length > 0) {
      layerOrders[index] = slide.layerOrder;
    }
  }

  return { offsets, sizes, layerOrders };
}

export function serializeEditorDocumentState(input: {
  slideCount: number;
  offsets: Record<number, Record<string, ObjectOffset>>;
  sizes: Record<number, Record<string, { w: number; h: number }>>;
  layerOrders: Record<number, string[]>;
}): EditorDocumentState {
  const slides: SlideEditorState[] = [];

  for (let index = 0; index < input.slideCount; index += 1) {
    slides.push({
      offsets: input.offsets[index] ?? {},
      sizes: input.sizes[index] ?? {},
      layerOrder: input.layerOrders[index] ?? [],
    });
  }

  return {
    version: 1,
    slides,
  };
}
