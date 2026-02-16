import { Quest } from "../../engine/task";
import { TootQuest } from "../../tasks/level1";
import { ColosseumQuest } from "./tasks/colosseum";
import { FreeFightZoneTask } from "./tasks/freeFightZone";
import { FinalQuest } from "./tasks/final";
import { ItemTask } from "./tasks/itemRush";
import { SeaMonkeeQuest } from "./tasks/seaMonkee";
import { PreItemTask } from "./tasks/preItem";
import { ScholarTask as ScholarQuest } from "./tasks/scholar";
import { ShadowRealmTask } from "./tasks/shadowRealm";
import { BuffQuest, StartupQuest } from "./tasks/startup";
import { PearlsQuest } from "./tasks/pearls";
import { SummonsQuest } from "./tasks/merkinGear";
import { CurrentsQuest } from "./tasks/currents";
import { SkateParkQuest } from "./tasks/skatepark";

export const TheSeaQuest: Quest[] = [
  TootQuest,
  StartupQuest,
  BuffQuest,
  ShadowRealmTask,
  FreeFightZoneTask,
  SummonsQuest,
  SeaMonkeeQuest,
  PreItemTask,
  ItemTask,
  CurrentsQuest,
  ScholarQuest,
  SkateParkQuest,
  ColosseumQuest,
  PearlsQuest,
  FinalQuest,
];

// Aftercore goal to prepare Dad
export const TestQuest: Quest[] = [SeaMonkeeQuest, SkateParkQuest, CurrentsQuest, ScholarQuest];
