import React, { useCallback, useMemo, useRef, useEffect, useState } from "react";
import { SlideData, SLIDE_DEFAULTS } from "../slides/types";
import { getSettledFrameOffset } from "../slides/getSettledFrameOffset";
import { StaticSlideFrame } from "./StaticSlideFrame";
import { useEditor } from "./useEditorStore";
import { useObjectDrag } from "./useObjectDrag";
import { useImageInsert } from "./useImageInsert";
import { useImageResize } from "./useImageResize";
import { SnapGuides } from "./SnapGuides";

export const EditorCanvas: React.FC<{
  slideContainerRef?: React.RefObject<HTMLDivElement>;
  onSelectedKeyChange?: (key: string | null) => void;
}> = ({ slideContainerRef: externalSlideRef, onSelectedKeyChange }) => {
  const { state, dispatch } = useEditor();
  const containerRef = useRef<HTMLDivElement>(null);
  const internalSlideRef = useRef<HTMLDivElement>(null);
  const slideRef = externalSlideRef ?? internalSlideRef;
  const [scale, setScale] = useState(1);

  const slide = state.slides[state.selectedIndex];

  const settledFrame = useMemo(
    () => (slide ? getSettledFrameOffset(slide) : 0),
    [slide],
  );

  const currentOffsets = useMemo(
    () => state.offsets[state.selectedIndex] ?? {},
    [state.offsets, state.selectedIndex],
  );

  const currentLayerOrder = useMemo(
    () => state.layerOrders[state.selectedIndex] ?? [],
    [state.layerOrders, state.selectedIndex],
  );

  // 컨테이너 크기에 맞춰 슬라이드 스케일 조절
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateScale = () => {
      const rect = container.getBoundingClientRect();
      const scaleX = rect.width / 1920;
      const scaleY = rect.height / 1080;
      setScale(Math.min(scaleX, scaleY) * 0.92);
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const handleFieldEdit = useCallback(
    (field: string, value: unknown, subIndex?: number) => {
      dispatch({
        type: "UPDATE_FIELD",
        index: state.selectedIndex,
        field,
        value,
        subIndex,
      });
    },
    [dispatch, state.selectedIndex],
  );

  const handleOffsetChange = useCallback(
    (key: string, offset: { x: number; y: number }) => {
      dispatch({
        type: "SET_OFFSET",
        slideIndex: state.selectedIndex,
        key,
        offset,
      });
    },
    [dispatch, state.selectedIndex],
  );

  const maybeDeleteOrphanedImage = useCallback(async (imagePath: string, nextSlides: SlideData[]) => {
    const stillReferenced = nextSlides.some((slide) => {
      if ("image" in slide && slide.image === imagePath) return true;
      if (slide.type === "evolution-flow" && (slide.fromImage === imagePath || slide.toImage === imagePath)) {
        return true;
      }
      return false;
    });

    if (stillReferenced) return;

    try {
      await fetch("/api/delete-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: imagePath }),
      });
    } catch (error) {
      console.error("Failed to delete orphaned image:", error);
    }
  }, []);

  // 선택된 오브젝트 삭제
  const handleDeleteSelected = useCallback((key: string) => {
    const s = state.slides[state.selectedIndex];
    if (!s) return;
    if (key.startsWith("image") && (s.type === "title-image" || s.type === "split")) {
      const imagePath = s.image;
      const slides = [...state.slides];
      if (s.type === "title-image") {
        slides[state.selectedIndex] = {
          type: "title",
          badge: s.badge,
          badgeVariant: s.badgeVariant,
          title: s.title,
          subtitle: s.subtitle,
          theme: s.theme,
        };
      } else {
        slides[state.selectedIndex] = {
          type: "title-bullets",
          badge: s.badge,
          badgeVariant: s.badgeVariant,
          title: s.title ?? "",
          bullets: s.bullets,
          theme: s.theme,
        };
      }
      dispatch({ type: "REPLACE_SLIDES", slides });
      dispatch({ type: "CLEAR_OBJECT_STATE", slideIndex: state.selectedIndex, keyPrefix: "image" });
      if (imagePath) {
        void maybeDeleteOrphanedImage(imagePath, slides);
      }
    }
  }, [dispatch, maybeDeleteOrphanedImage, state.slides, state.selectedIndex]);

  const {
    state: dragState,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleDoubleClick,
    handleContextMenu,
    closeContextMenu,
  } = useObjectDrag(slideRef, scale, currentOffsets, handleOffsetChange, currentLayerOrder, handleDeleteSelected);

  // 이미지 크기 오버라이드
  const currentSizes = useMemo(
    () => state.sizes[state.selectedIndex] ?? {},
    [state.sizes, state.selectedIndex],
  );

  const handleSizeChange = useCallback(
    (key: string, size: { w: number; h: number }) => {
      dispatch({ type: "SET_SIZE", slideIndex: state.selectedIndex, key, size });
    },
    [dispatch, state.selectedIndex],
  );

  const { startResize } = useImageResize(slideRef, scale, handleSizeChange);

  // 이미지 크기 DOM 적용
  useEffect(() => {
    const c = slideRef.current;
    if (!c) return;
    for (const el of c.querySelectorAll("[data-pptx='image'] img, [data-pptx='image'] video")) {
      const parent = el.closest("[data-pptx='image']") as HTMLElement | null;
      if (!parent) continue;
      const key = parent.getAttribute("data-pptx") ?? "image";
      const sz = currentSizes[key];
      if (sz) {
        (el as HTMLElement).style.width = `${sz.w}px`;
        (el as HTMLElement).style.height = `${sz.h}px`;
        (el as HTMLElement).style.maxWidth = "none";
        (el as HTMLElement).style.maxHeight = "none";
      }
    }
  });

  // 이미지 붙여넣기/드래그앤드롭
  const handleImageInserted = useCallback(
    (relativePath: string) => {
      const slide = state.slides[state.selectedIndex];
      if (!slide) return;

      // 이미 image 필드가 있는 타입 → 교체
      if (slide.type === "title-image" || slide.type === "split") {
        dispatch({
          type: "UPDATE_FIELD",
          index: state.selectedIndex,
          field: "image",
          value: relativePath,
        });
        return;
      }

      // image 필드가 없는 타입 → title-image로 변환
      const newSlide: SlideData = {
        type: "title-image",
        badge: slide.badge,
        badgeVariant: slide.badgeVariant,
        title: (slide as any).title ?? "",
        subtitle: (slide as any).subtitle,
        image: relativePath,
        theme: slide.theme,
      };
      const slides = [...state.slides];
      slides[state.selectedIndex] = newSlide;
      dispatch({ type: "REPLACE_SLIDES", slides });
    },
    [dispatch, state.slides, state.selectedIndex],
  );

  const slideInfo = useMemo(() => {
    const s = state.slides[state.selectedIndex];
    const existingImages = s && "image" in s && (s as any).image ? 1 : 0;
    return {
      slideIndex: state.selectedIndex,
      badge: s?.badge ?? "",
      existingImageCount: existingImages,
    };
  }, [state.slides, state.selectedIndex]);

  useImageInsert(slideRef, handleImageInserted, slideInfo);

  // 선택된 요소가 이미지인지 확인
  const isImageSelected =
    dragState.selectedKeys.length === 1 &&
    (dragState.selectedKey?.startsWith("image") ?? false);

  // 리사이즈 핸들 시작
  const handleResizeStart = useCallback(
    (e: React.PointerEvent, handle: string) => {
      const c = slideRef.current;
      if (!c || !dragState.selectedKey || dragState.selectedKeys.length !== 1) return;
      const el = c.querySelector(`[data-pptx="image"]`) as HTMLElement | null;
      if (!el) return;
      // img 또는 video 자식을 찾아서 리사이즈
      const target = el.querySelector("img, video") as HTMLElement | null;
      if (target) {
        startResize(e, handle, target, dragState.selectedKey);
      }
    },
    [slideRef, dragState.selectedKey, dragState.selectedKeys.length, startResize],
  );

  // 레이어 순서 변경 핸들러
  const handleBringToFront = useCallback((key: string) => {
    const order = [...currentLayerOrder];
    // 현재 감지된 키가 없으면 DOM에서 수집
    if (order.length === 0) {
      const container = slideRef.current;
      if (container) {
        const seen = new Set<string>();
        for (const el of container.querySelectorAll("[data-pptx]")) {
          const pptx = el.getAttribute("data-pptx") ?? "unknown";
          const parent = el.parentElement;
          let k = pptx;
          if (parent) {
            const siblings = Array.from(parent.querySelectorAll(`[data-pptx="${pptx}"]`));
            if (siblings.length > 1) k = `${pptx}-${siblings.indexOf(el)}`;
          }
          if (!seen.has(k)) { seen.add(k); order.push(k); }
        }
      }
    }
    const next = order.filter(k => k !== key);
    next.push(key);
    dispatch({ type: "SET_LAYER_ORDER", slideIndex: state.selectedIndex, order: next });
    closeContextMenu();
  }, [currentLayerOrder, slideRef, dispatch, state.selectedIndex, closeContextMenu]);

  const handleSendToBack = useCallback((key: string) => {
    const order = [...currentLayerOrder];
    if (order.length === 0) {
      const container = slideRef.current;
      if (container) {
        const seen = new Set<string>();
        for (const el of container.querySelectorAll("[data-pptx]")) {
          const pptx = el.getAttribute("data-pptx") ?? "unknown";
          const parent = el.parentElement;
          let k = pptx;
          if (parent) {
            const siblings = Array.from(parent.querySelectorAll(`[data-pptx="${pptx}"]`));
            if (siblings.length > 1) k = `${pptx}-${siblings.indexOf(el)}`;
          }
          if (!seen.has(k)) { seen.add(k); order.push(k); }
        }
      }
    }
    const next = order.filter(k => k !== key);
    next.unshift(key);
    dispatch({ type: "SET_LAYER_ORDER", slideIndex: state.selectedIndex, order: next });
    closeContextMenu();
  }, [currentLayerOrder, slideRef, dispatch, state.selectedIndex, closeContextMenu]);

  // selectedKey 변경 알림
  useEffect(() => {
    onSelectedKeyChange?.(dragState.selectedKey);
  }, [dragState.selectedKey, onSelectedKeyChange]);

  if (!slide) {
    return (
      <div style={emptyStyle}>
        <span>No slide selected</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={containerStyle}>
      <div
        style={{
          width: 1920,
          height: 1080,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          borderRadius: 8,
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          position: "relative",
        }}
      >
        {/* 슬라이드 콘텐츠 */}
        <div
          ref={slideRef}
          style={{ width: 1920, height: 1080, position: "relative" }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onDoubleClick={handleDoubleClick}
          onContextMenu={handleContextMenu}
        >
          <StaticSlideFrame
            slide={slide}
            frame={settledFrame}
            editable
            onFieldEdit={handleFieldEdit}
            offsets={currentOffsets}
            sizes={currentSizes}
            layerOrder={currentLayerOrder}
          />

          {/* 스냅 가이드 + 선택 박스 */}
          <SnapGuides
            lines={dragState.snapLines}
            selectionRect={dragState.selectionRect}
            mode={dragState.mode}
            isImage={isImageSelected}
            selectionCount={dragState.selectedKeys.length}
            onResizeStart={handleResizeStart}
          />
        </div>
      </div>

      {/* 오브젝트 우클릭 컨텍스트 메뉴 */}
      {dragState.contextMenu && (
        <>
          {/* 배경 클릭으로 닫기 */}
          <div
            style={{ position: "fixed", inset: 0, zIndex: 9998 }}
            onClick={closeContextMenu}
            onContextMenu={(e) => { e.preventDefault(); closeContextMenu(); }}
          />
          <div
            style={{
              position: "fixed",
              top: dragState.contextMenu.y,
              left: dragState.contextMenu.x,
              zIndex: 9999,
              background: "#222",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 8,
              padding: 4,
              minWidth: 160,
              boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            <button
              type="button"
              style={ctxItemStyle}
              onClick={() => handleBringToFront(dragState.contextMenu!.key)}
            >
              맨 앞으로 보내기
            </button>
            <button
              type="button"
              style={ctxItemStyle}
              onClick={() => handleSendToBack(dragState.contextMenu!.key)}
            >
              맨 뒤로 보내기
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  background: "#1a1a1a",
};

const emptyStyle: React.CSSProperties = {
  ...containerStyle,
  color: "rgba(255,255,255,0.4)",
  fontSize: 18,
  fontFamily: "sans-serif",
};

const ctxItemStyle: React.CSSProperties = {
  width: "100%",
  border: 0,
  background: "transparent",
  color: "rgba(255,255,255,0.85)",
  padding: "8px 14px",
  borderRadius: 4,
  cursor: "pointer",
  fontSize: 13,
  fontFamily: "system-ui, sans-serif",
  textAlign: "left",
};
