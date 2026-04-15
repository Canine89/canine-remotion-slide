import React, { useEffect, useRef } from "react";
import { Internals } from "remotion";
import { SlideData, SLIDE_DEFAULTS } from "../slides/types";
import { SlideRenderer } from "../slides/SlideRenderer";

/**
 * Remotion Player 없이 슬라이드를 정적 렌더링한다.
 * useCurrentFrame()이 settledFrame 값을 반환하도록 최소 컨텍스트를 제공한다.
 *
 * 원리:
 * - CanUseRemotionHooksProvider로 useCurrentFrame() 활성화
 * - window.remotion_initialFrame을 설정하면 useVideo()가 null일 때 이 값을 반환
 * - CompositionManager의 기본값(compositions: [])으로 useVideo()는 null 반환
 */

interface Props {
  slide: SlideData;
  frame: number;
  width?: number;
  height?: number;
  editable?: boolean;
  onFieldEdit?: (field: string, value: unknown, subIndex?: number) => void;
  style?: React.CSSProperties;
  className?: string;
}

export const StaticSlideFrame: React.FC<Props> = ({
  slide,
  frame,
  width = 1920,
  height = 1080,
  editable,
  onFieldEdit,
  style,
  className,
}) => {
  const prevFrame = useRef<number | undefined>(undefined);

  useEffect(() => {
    (window as any).remotion_initialFrame = frame;
    return () => {
      if (prevFrame.current !== undefined) {
        (window as any).remotion_initialFrame = prevFrame.current;
      }
    };
  }, [frame]);

  // 즉시 설정 (렌더링 전에 값이 필요)
  prevFrame.current = (window as any).remotion_initialFrame;
  (window as any).remotion_initialFrame = frame;

  return (
    <Internals.CanUseRemotionHooksProvider>
      <div
        className={className}
        style={{
          width,
          height,
          position: "relative",
          overflow: "hidden",
          ...style,
        }}
      >
        <SlideRenderer
          slide={slide}
          editable={editable}
          onFieldEdit={onFieldEdit}
        />
      </div>
    </Internals.CanUseRemotionHooksProvider>
  );
};
