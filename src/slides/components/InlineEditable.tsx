import React, { useCallback, useLayoutEffect, useRef, useState } from "react";

interface Props {
  as?: "div" | "span";
  value: string;
  onChange?: (value: string) => void;
  style?: React.CSSProperties;
  className?: string;
  multiline?: boolean;
  "data-pptx"?: string;
  onEditorKeyDown?: (event: React.KeyboardEvent<HTMLElement>, currentValue: string) => boolean | void;
}

export const InlineEditable: React.FC<Props> = ({
  as = "div",
  value,
  onChange,
  style,
  className,
  multiline = false,
  "data-pptx": dataPptx,
  onEditorKeyDown,
}) => {
  const ref = useRef<HTMLElement>(null);
  const composing = useRef(false);
  const [focused, setFocused] = useState(false);

  const commit = useCallback(() => {
    const nextValue = ref.current?.textContent ?? "";
    if (nextValue !== value) onChange?.(nextValue);
  }, [onChange, value]);

  useLayoutEffect(() => {
    if (!ref.current || focused) return;
    if ((ref.current.textContent ?? "") !== value) {
      ref.current.textContent = value;
    }
  }, [focused, value]);

  const handleInput = useCallback(() => {
    if (composing.current) return;
    commit();
  }, [commit]);

  const handleBlur = useCallback(() => {
    setFocused(false);
    commit();
  }, [commit]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLElement>) => {
    if (composing.current) return;
    if (e.metaKey || e.ctrlKey) return;
    const currentValue = ref.current?.textContent ?? "";

    if (onEditorKeyDown?.(e, currentValue)) {
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      if (ref.current) ref.current.textContent = value;
      ref.current?.blur();
      return;
    }

    if (!multiline && e.key === "Enter") {
      e.preventDefault();
      ref.current?.blur();
      return;
    }

    e.stopPropagation();
  }, [multiline, onEditorKeyDown, value]);

  return React.createElement(as, {
    ref,
    className,
    style,
    contentEditable: true,
    suppressContentEditableWarning: true,
    onFocus: () => setFocused(true),
    onBlur: handleBlur,
    onInput: handleInput,
    onKeyDown: handleKeyDown,
    onCompositionStart: () => {
      composing.current = true;
    },
    onCompositionEnd: () => {
      composing.current = false;
      commit();
    },
    "data-pptx": dataPptx,
  });
};
