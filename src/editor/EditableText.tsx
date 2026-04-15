import React, { useCallback, useRef, useState } from "react";

interface Props {
  value: string;
  onChange: (newValue: string) => void;
  style?: React.CSSProperties;
  multiline?: boolean;
  placeholder?: string;
}

/**
 * contentEditable 기반 인라인 텍스트 편집 컴포넌트.
 * 한글 IME composition을 올바르게 처리한다.
 */
export const EditableText: React.FC<Props> = ({
  value,
  onChange,
  style,
  multiline = false,
  placeholder = "텍스트 입력...",
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const composing = useRef(false);
  const [focused, setFocused] = useState(false);

  const handleBlur = useCallback(() => {
    setFocused(false);
    const text = ref.current?.textContent ?? "";
    if (text !== value) {
      onChange(text);
    }
  }, [onChange, value]);

  const handleFocus = useCallback(() => {
    setFocused(true);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (composing.current) return;

      if (e.key === "Escape") {
        e.preventDefault();
        // 원래 값 복원
        if (ref.current) ref.current.textContent = value;
        ref.current?.blur();
        return;
      }

      if (!multiline && e.key === "Enter") {
        e.preventDefault();
        ref.current?.blur();
        return;
      }

      // 편집 중 키보드 이벤트가 부모로 전파되지 않도록
      e.stopPropagation();
    },
    [multiline, value],
  );

  const handleCompositionStart = useCallback(() => {
    composing.current = true;
  }, []);

  const handleCompositionEnd = useCallback(() => {
    composing.current = false;
  }, []);

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const text = e.clipboardData.getData("text/plain");
      const cleaned = multiline ? text : text.replace(/\n/g, " ");
      document.execCommand("insertText", false, cleaned);
    },
    [multiline],
  );

  const isEmpty = !value;

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      onPaste={handlePaste}
      data-placeholder={isEmpty && !focused ? placeholder : undefined}
      style={{
        ...style,
        outline: "none",
        cursor: "text",
        minWidth: 20,
        borderRadius: 4,
        transition: "box-shadow 120ms ease",
        boxShadow: focused
          ? "0 0 0 2px rgba(74, 158, 255, 0.6)"
          : "0 0 0 1px transparent",
      }}
      onMouseEnter={(e) => {
        if (!focused) {
          (e.currentTarget as HTMLElement).style.boxShadow =
            "0 0 0 1px rgba(74, 158, 255, 0.3)";
        }
      }}
      onMouseLeave={(e) => {
        if (!focused) {
          (e.currentTarget as HTMLElement).style.boxShadow =
            "0 0 0 1px transparent";
        }
      }}
    >
      {value}
    </div>
  );
};
