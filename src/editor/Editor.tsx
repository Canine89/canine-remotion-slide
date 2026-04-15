import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { parseSlideMarkdown } from "../slides/parseMarkdown";
import { ThemeDirective } from "../slides/types";
import {
  EditorDocumentPayload,
  normalizeEditorDocumentState,
  serializeEditorDocumentState,
} from "./documentState";
import { EditorCanvas } from "./EditorCanvas";
import { EditorSidebar } from "./EditorSidebar";
import { EditorProvider, useEditor } from "./useEditorStore";
import { LayerPanel } from "./LayerPanel";
import { rewriteMarkdownAssetPaths, stripMarkdownAssetPaths } from "./markdownPaths";
import { PropertyPanel } from "./PropertyPanel";
import { serializeSlidesToMarkdown } from "./serializeMarkdown";
import { Toolbar } from "./Toolbar";
import { Snapshot, useHistory } from "./useHistory";

function getThemeFromMarkdown(markdown: string): ThemeDirective {
  const themeMatch = markdown.match(/^---[\s\S]*?theme:\s*(\S+)[\s\S]*?---/);
  return (themeMatch?.[1] ?? "dark") as ThemeDirective;
}

const EditorInner: React.FC = () => {
  const { state, dispatch } = useEditor();
  const history = useHistory();
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const prevSnapshotRef = useRef<Snapshot>({
    slides: state.slides,
    offsets: state.offsets,
    layerOrders: state.layerOrders,
    sizes: state.sizes,
  });
  const savingRef = useRef(false);
  const skipHistoryRef = useRef(false);
  const reloadInFlightRef = useRef(false);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slideContainerRef = useRef<HTMLDivElement>(null);
  const [selectedObjectKey, setSelectedObjectKey] = useState<string | null>(null);

  const currentSnapshot = useMemo<Snapshot>(
    () => ({
      slides: state.slides,
      offsets: state.offsets,
      layerOrders: state.layerOrders,
      sizes: state.sizes,
    }),
    [state.slides, state.offsets, state.layerOrders, state.sizes],
  );

  const syncHistoryFlags = useCallback(() => {
    setCanUndo(history.canUndo());
    setCanRedo(history.canRedo());
  }, [history]);

  const applyPayload = useCallback(
    (
      payload: EditorDocumentPayload,
      action: "LOAD_SUCCESS" | "SAVE_SUCCESS",
      selectedIndex: number,
    ) => {
      const renderMarkdown = rewriteMarkdownAssetPaths(payload.markdown, payload.path);
      const slides = parseSlideMarkdown(renderMarkdown);
      const theme = getThemeFromMarkdown(payload.markdown);
      const editorState = normalizeEditorDocumentState(payload.editorState, slides.length);
      const snapshot: Snapshot = {
        slides,
        offsets: editorState.offsets,
        layerOrders: editorState.layerOrders,
        sizes: editorState.sizes,
      };

      skipHistoryRef.current = true;
      prevSnapshotRef.current = snapshot;
      dispatch({
        type: action,
        slides,
        theme,
        path: payload.path,
        revision: payload.revision,
        editorState,
        selectedIndex,
      });
      history.reset();
      syncHistoryFlags();
    },
    [dispatch, history, syncHistoryFlags],
  );

  const loadDocument = useCallback(
    async (reloading = false) => {
      if (reloadInFlightRef.current) return;
      reloadInFlightRef.current = true;
      dispatch({ type: "LOAD_START", reloading });
      try {
        const response = await fetch("/api/slides/document");
        if (!response.ok) {
          throw new Error(await response.text());
        }
        const payload = (await response.json()) as EditorDocumentPayload;
        applyPayload(payload, "LOAD_SUCCESS", state.selectedIndex);
      } catch (error) {
        console.error("Failed to load document:", error);
        dispatch({ type: "SAVE_ERROR" });
      } finally {
        reloadInFlightRef.current = false;
      }
    },
    [applyPayload, dispatch, state.selectedIndex],
  );

  useEffect(() => {
    void loadDocument(false);
  }, [loadDocument]);

  useEffect(() => {
    if (skipHistoryRef.current) {
      skipHistoryRef.current = false;
      prevSnapshotRef.current = currentSnapshot;
      return;
    }

    const prev = prevSnapshotRef.current;
    if (
      (prev.slides !== state.slides ||
        prev.offsets !== state.offsets ||
        prev.layerOrders !== state.layerOrders ||
        prev.sizes !== state.sizes) &&
      state.isDirty
    ) {
      history.pushSnapshot(prev);
      syncHistoryFlags();
    }

    prevSnapshotRef.current = currentSnapshot;
  }, [
    currentSnapshot,
    history,
    state.isDirty,
    state.layerOrders,
    state.offsets,
    state.sizes,
    state.slides,
    syncHistoryFlags,
  ]);

  const handleUndo = useCallback(() => {
    const prev = history.undo(currentSnapshot);
    if (!prev) return;

    skipHistoryRef.current = true;
    dispatch({
      type: "RESTORE_SNAPSHOT",
      slides: prev.slides,
      offsets: prev.offsets,
      layerOrders: prev.layerOrders,
      sizes: prev.sizes,
    });
    syncHistoryFlags();
  }, [currentSnapshot, dispatch, history, syncHistoryFlags]);

  const handleRedo = useCallback(() => {
    const next = history.redo(currentSnapshot);
    if (!next) return;

    skipHistoryRef.current = true;
    dispatch({
      type: "RESTORE_SNAPSHOT",
      slides: next.slides,
      offsets: next.offsets,
      layerOrders: next.layerOrders,
      sizes: next.sizes,
    });
    syncHistoryFlags();
  }, [currentSnapshot, dispatch, history, syncHistoryFlags]);

  const handleSave = useCallback(async () => {
    if (savingRef.current || !state.isDirty) return;

    savingRef.current = true;
    dispatch({ type: "SAVE_START" });

    try {
      const markdown = stripMarkdownAssetPaths(
        serializeSlidesToMarkdown(state.slides, state.globalTheme),
        state.markdownPath,
      );
      const editorState = serializeEditorDocumentState({
        slideCount: state.slides.length,
        offsets: state.offsets,
        sizes: state.sizes,
        layerOrders: state.layerOrders,
      });

      const response = await fetch("/api/slides/document", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown, editorState }),
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }

      const payload = (await response.json()) as EditorDocumentPayload;
      applyPayload(payload, "SAVE_SUCCESS", state.selectedIndex);
    } catch (error) {
      console.error("Save failed:", error);
      dispatch({ type: "SAVE_ERROR" });
    } finally {
      savingRef.current = false;
    }
  }, [
    applyPayload,
    dispatch,
    state.globalTheme,
    state.isDirty,
    state.layerOrders,
    state.offsets,
    state.sizes,
    state.slides,
  ]);

  useEffect(() => {
    if (!state.isDirty || state.isLoading || state.isReloading || state.isSaving) {
      if (autosaveTimerRef.current) {
        window.clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
      }
      return;
    }

    autosaveTimerRef.current = setTimeout(() => {
      void handleSave();
    }, 400);

    return () => {
      if (autosaveTimerRef.current) {
        window.clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
      }
    };
  }, [handleSave, state.isDirty, state.isLoading, state.isReloading, state.isSaving]);

  useEffect(() => {
    const events = new EventSource("/api/slides/events");
    const handleChanged = () => {
      if (savingRef.current) return;
      void loadDocument(true);
    };

    events.addEventListener("editor-document-changed", handleChanged);
    return () => {
      events.removeEventListener("editor-document-changed", handleChanged);
      events.close();
    };
  }, [loadDocument]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (!isMod) return;

      if (e.key === "s") {
        e.preventDefault();
        void handleSave();
        return;
      }

      if (e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }

      if (e.key === "z" && e.shiftKey) {
        e.preventDefault();
        handleRedo();
        return;
      }

      if (e.key === "y") {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener("keydown", handler, true);
    return () => window.removeEventListener("keydown", handler, true);
  }, [handleRedo, handleSave, handleUndo]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (state.isDirty) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [state.isDirty]);

  return (
    <div style={rootStyle}>
      <Toolbar
        onSave={() => {
          void handleSave();
        }}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
      />
      <div style={bodyStyle}>
        <EditorSidebar />
        <EditorCanvas
          slideContainerRef={slideContainerRef}
          onSelectedKeyChange={setSelectedObjectKey}
        />
        <div style={rightPanelStyle}>
          <PropertyPanel />
          <LayerPanel
            slideContainerRef={slideContainerRef}
            selectedKey={selectedObjectKey}
          />
        </div>
      </div>
    </div>
  );
};

export const Editor: React.FC = () => {
  return (
    <EditorProvider>
      <EditorInner />
    </EditorProvider>
  );
};

const rootStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  background: "#0d0d0d",
  color: "#fff",
};

const bodyStyle: React.CSSProperties = {
  flex: 1,
  display: "flex",
  overflow: "hidden",
};

const rightPanelStyle: React.CSSProperties = {
  width: 260,
  minWidth: 260,
  background: "#111111",
  borderLeft: "1px solid rgba(255,255,255,0.08)",
  overflowY: "auto",
  padding: "0 16px 16px",
  fontFamily: "system-ui, sans-serif",
  color: "rgba(255,255,255,0.8)",
  display: "flex",
  flexDirection: "column",
};
