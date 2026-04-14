import { ThemeColors } from "../themes";
import { AbstractPrompt, AbstractSceneItem } from "../types";

export interface SceneProps {
  badge: string;
  badgeBg: string;
  badgeText: string;
  title: string;
  direction: string;
  prompts?: AbstractPrompt[];
  scenes: AbstractSceneItem[];
  theme: ThemeColors;
  layout?: "horizontal" | "vertical";
}
