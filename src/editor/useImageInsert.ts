import { useCallback, useEffect, useRef } from "react";

export interface SlideInfo {
  slideIndex: number;
  badge: string;
  /** 해당 슬라이드에 이미 존재하는 이미지 수 */
  existingImageCount: number;
}

/**
 * 파일명 생성: {슬라이드번호}-{주제}-{a,b,c,...}.png
 * 예: 03-INTRO-a.png, 03-INTRO-b.png
 */
function generateFilename(info: SlideInfo, ext: string): string {
  const num = String(info.slideIndex + 1).padStart(2, "0");
  const topic = info.badge
    ? info.badge.replace(/[^a-zA-Z0-9가-힣_-]/g, "").slice(0, 20) || "slide"
    : "slide";
  const letter = String.fromCharCode(97 + info.existingImageCount); // a, b, c, ...
  return `${num}-${topic}-${letter}${ext}`;
}

/**
 * 이미지 붙여넣기(Ctrl+V) 및 드래그앤드롭 처리.
 */
export function useImageInsert(
  containerRef: React.RefObject<HTMLElement | null>,
  onImageInserted: (relativePath: string) => void,
  slideInfo: SlideInfo,
) {
  const infoRef = useRef(slideInfo);
  infoRef.current = slideInfo;

  const uploadFile = useCallback(
    async (file: File) => {
      const ext = file.name.match(/\.\w+$/)?.[0] ?? ".png";
      const filename = generateFilename(infoRef.current, ext);

      const buf = await file.arrayBuffer();
      const res = await fetch("/api/upload-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
          "X-Filename": filename,
        },
        body: buf,
      });

      if (!res.ok) {
        console.error("Image upload failed:", await res.text());
        return;
      }

      const { path } = await res.json();
      onImageInserted(path);
    },
    [onImageInserted],
  );

  // 클립보드 붙여넣기
  useEffect(() => {
    const handler = (e: ClipboardEvent) => {
      // contentEditable에서 텍스트 붙여넣기 중이면 무시
      if (
        document.activeElement instanceof HTMLElement &&
        document.activeElement.isContentEditable
      ) {
        return;
      }

      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) uploadFile(file);
          return;
        }
      }
    };

    document.addEventListener("paste", handler);
    return () => document.removeEventListener("paste", handler);
  }, [uploadFile]);

  // 파일 드래그 앤 드롭
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleDragOver = (e: DragEvent) => {
      if (e.dataTransfer?.types.includes("Files")) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      const files = e.dataTransfer?.files;
      if (!files) return;

      for (const file of files) {
        if (file.type.startsWith("image/")) {
          uploadFile(file);
          return;
        }
      }
    };

    container.addEventListener("dragover", handleDragOver);
    container.addEventListener("drop", handleDrop);
    return () => {
      container.removeEventListener("dragover", handleDragOver);
      container.removeEventListener("drop", handleDrop);
    };
  }, [containerRef, uploadFile]);
}
