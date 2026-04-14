import React from "react";
import { ThemeColors } from "../../slides/themes";
import { AbstractPrompt, AbstractSceneItem } from "../../slides/types";
import { findSceneComponent } from "../../slides/scenes/registry";
import { AbstractSceneSlide } from "../../slides/templates/AbstractSceneSlide";

interface Props {
  badge: string;
  badgeBg: string;
  badgeText: string;
  title: string;
  direction: string;
  prompts?: AbstractPrompt[];
  scenes: AbstractSceneItem[];
  theme: ThemeColors;
}

export const VerticalAbstractSceneSlide: React.FC<Props> = (props) => {
  const CustomScene = findSceneComponent(props.direction);
  if (CustomScene) {
    return <CustomScene {...props} layout="vertical" />;
  }

  return <AbstractSceneSlide {...props} layout="vertical" />;
};
