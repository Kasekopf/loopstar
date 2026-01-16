import { Quest } from "../../engine/task";
import { TootQuest } from "../../tasks/level1";
import { ColosseumQuest } from "./tasks/colosseum";
import { CyberRealmTask } from "./tasks/cyberRealm";
import { FinalQuest } from "./tasks/final";
import { ItemTask } from "./tasks/itemRush";
import { OctopusGardenTask } from "./tasks/octopusGarden";
import { PreItemTask } from "./tasks/preCurrents";
import { ScholarTask } from "./tasks/scholar";
import { ShadowRealmTask } from "./tasks/shadowRealm";
import { BuffQuest, StartupQuest } from "./tasks/startup";
import { WrapupQuest } from "./tasks/wrapup";

export const TheSeaQuest: Quest[] = [
  TootQuest,
  StartupQuest,
  BuffQuest,
  ShadowRealmTask,
  CyberRealmTask,
  OctopusGardenTask,
  PreItemTask,
  ItemTask,
  ScholarTask,
  ColosseumQuest,
  WrapupQuest,
  FinalQuest,
];
