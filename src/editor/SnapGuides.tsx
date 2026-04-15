import React from "react";
import { InteractionMode, SnapLine } from "./useObjectDrag";

interface Props {
  lines: SnapLine[];
  selectionRect: DOMRect | null;
  mode: InteractionMode;
  isImage?: boolean;
  onResizeStart?: (e: React.PointerEvent, handle: string) => void;
}

const HANDLE_SIZE = 10;

export const SnapGuides: React.FC<Props> = ({
  lines,
  selectionRect,
  mode,
  isImage,
  onResizeStart,
}) => {
  if (lines.length === 0 && !selectionRect) return null;

  const showResize = isImage && mode === "selected" && selectionRect;

  const handles = selectionRect
    ? [
        { id: "nw", x: selectionRect.x - HANDLE_SIZE / 2, y: selectionRect.y - HANDLE_SIZE / 2, cursor: "nwse-resize" },
        { id: "ne", x: selectionRect.x + selectionRect.width - HANDLE_SIZE / 2, y: selectionRect.y - HANDLE_SIZE / 2, cursor: "nesw-resize" },
        { id: "sw", x: selectionRect.x - HANDLE_SIZE / 2, y: selectionRect.y + selectionRect.height - HANDLE_SIZE / 2, cursor: "nesw-resize" },
        { id: "se", x: selectionRect.x + selectionRect.width - HANDLE_SIZE / 2, y: selectionRect.y + selectionRect.height - HANDLE_SIZE / 2, cursor: "nwse-resize" },
      ]
    : [];

  return (
    <>
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1920,
          height: 1080,
          pointerEvents: "none",
          zIndex: 9999,
        }}
      >
        {/* 스냅 가이드 라인 */}
        {lines.map((line, i) =>
          line.axis === "x" ? (
            <line key={`s-${i}`} x1={line.pos} y1={0} x2={line.pos} y2={1080}
              stroke="#ff3b6b" strokeWidth={2} strokeDasharray="8 4" opacity={0.8} />
          ) : (
            <line key={`s-${i}`} x1={0} y1={line.pos} x2={1920} y2={line.pos}
              stroke="#ff3b6b" strokeWidth={2} strokeDasharray="8 4" opacity={0.8} />
          ),
        )}

        {/* 선택 박스 */}
        {selectionRect && (
          <rect
            x={selectionRect.x - 2} y={selectionRect.y - 2}
            width={selectionRect.width + 4} height={selectionRect.height + 4}
            fill="none" stroke="#4a9eff" strokeWidth={2.5}
            strokeDasharray={mode === "editing" ? "6 4" : "none"} rx={3}
          />
        )}

        {/* 모서리 핸들 (선택 모드) */}
        {mode === "selected" && selectionRect && handles.map(h => (
          <rect key={h.id}
            x={h.x} y={h.y} width={HANDLE_SIZE} height={HANDLE_SIZE}
            fill="#fff" stroke="#4a9eff" strokeWidth={2} rx={2}
          />
        ))}
      </svg>

      {/* 리사이즈 핸들 (이미지일 때만, 실제 포인터 이벤트 수신) */}
      {showResize && handles.map(h => (
        <div
          key={`rh-${h.id}`}
          onPointerDown={(e) => onResizeStart?.(e, h.id)}
          style={{
            position: "absolute",
            left: h.x - 2,
            top: h.y - 2,
            width: HANDLE_SIZE + 4,
            height: HANDLE_SIZE + 4,
            cursor: h.cursor,
            zIndex: 10000,
          }}
        />
      ))}
    </>
  );
};
