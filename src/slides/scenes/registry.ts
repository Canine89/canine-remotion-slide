import React from "react";
import { SceneProps } from "./SceneProps";
import { ComparisonFlowScene } from "./ComparisonFlowScene";
import { EditorVsTerminalScene } from "./EditorVsTerminalScene";
import { RemotionEaseScene } from "./RemotionEaseScene";

interface SceneEntry {
  match: (direction: string) => boolean;
  Component: React.FC<SceneProps>;
}

const scenes: SceneEntry[] = [
  {
    match: (d) =>
      /remotion/i.test(d) &&
      /슬라이드/i.test(d) &&
      /편해졌|편해졌다|자연스럽게|테마/i.test(d),
    Component: RemotionEaseScene,
  },
  {
    match: (d) =>
      /토큰.*소모|token.*consum/i.test(d) &&
      /ast|전처리/i.test(d),
    Component: ComparisonFlowScene,
  },
  {
    match: (d) =>
      /에디터|editor|gui/i.test(d) &&
      /터미널|terminal|cli/i.test(d),
    Component: EditorVsTerminalScene,
  },
];

export const findSceneComponent = (
  direction: string,
): React.FC<SceneProps> | null => {
  for (const entry of scenes) {
    if (entry.match(direction)) return entry.Component;
  }
  return null;
};
