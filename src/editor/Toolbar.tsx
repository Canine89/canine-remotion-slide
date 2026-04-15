import React from "react";
import { useEditorState } from "./useEditorStore";

interface Props {
  onSave?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export const Toolbar: React.FC<Props> = ({
  onSave,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}) => {
  const { isDirty, isLoading, isSaving, isReloading, markdownPath } = useEditorState();

  const filename = markdownPath.split("/").pop() ?? "untitled";
  const statusLabel = isLoading
    ? "Loading"
    : isSaving
      ? "Saving"
      : isReloading
        ? "Reloading"
        : isDirty
          ? "Unsaved"
          : "Synced";
  const statusColor = isLoading || isReloading
    ? "#93c5fd"
    : isSaving
      ? "#f59e0b"
      : isDirty
        ? "#f59e0b"
        : "#34d399";

  return (
    <div style={toolbarStyle}>
      <div style={leftStyle}>
        <span style={logoStyle}>Slides Editor</span>
        <span style={filenameStyle}>
          {filename}
          {isDirty && <span style={dirtyDotStyle} />}
        </span>
        <span style={{ ...statusStyle, color: statusColor }}>{statusLabel}</span>
      </div>
      <div style={centerStyle}>
        <button
          type="button"
          style={btnStyle}
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          &#x21B6;
        </button>
        <button
          type="button"
          style={btnStyle}
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
        >
          &#x21B7;
        </button>
      </div>
      <div style={rightStyle}>
        <button
          type="button"
          style={{
            ...btnStyle,
            ...(isDirty ? saveBtnActiveStyle : {}),
          }}
          onClick={onSave}
          disabled={!isDirty || isSaving || isLoading || isReloading}
          title="Save (Ctrl+S)"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

const toolbarStyle: React.CSSProperties = {
  height: 48,
  minHeight: 48,
  background: "#0d0d0d",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 16px",
  fontFamily: "system-ui, sans-serif",
  color: "rgba(255,255,255,0.8)",
};

const leftStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const centerStyle: React.CSSProperties = {
  display: "flex",
  gap: 4,
};

const rightStyle: React.CSSProperties = {
  display: "flex",
  gap: 8,
};

const logoStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: "-0.02em",
};

const filenameStyle: React.CSSProperties = {
  fontSize: 12,
  color: "rgba(255,255,255,0.45)",
  display: "flex",
  alignItems: "center",
  gap: 6,
};

const statusStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.02em",
  textTransform: "uppercase",
};

const dirtyDotStyle: React.CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: "50%",
  background: "#f59e0b",
  display: "inline-block",
};

const btnStyle: React.CSSProperties = {
  border: 0,
  borderRadius: 6,
  padding: "6px 12px",
  background: "rgba(255,255,255,0.08)",
  color: "rgba(255,255,255,0.7)",
  cursor: "pointer",
  fontSize: 13,
  fontFamily: "system-ui, sans-serif",
};

const saveBtnActiveStyle: React.CSSProperties = {
  background: "#2563eb",
  color: "#fff",
};
