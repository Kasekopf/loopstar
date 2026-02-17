import { Quest } from "../../engine/task";
import { TootQuest } from "../../tasks/level1";
import { ColosseumQuest } from "./tasks/colosseum";
import { FreeFightZoneTask } from "./tasks/freeFightZone";
import { FinalQuest } from "./tasks/final";
import { SeaMonkeeQuest } from "./tasks/seaMonkee";
import { ScholarTask as ScholarQuest } from "./tasks/scholar";
import { ShadowRealmTask } from "./tasks/shadowRealm";
import { BuffQuest, StartupQuest } from "./tasks/startup";
import { PearlsQuest } from "./tasks/pearls";
import { MerkinGearQuest } from "./tasks/merkinGear";
import { CurrentsQuest } from "./tasks/currents";
import { SkateParkQuest } from "./tasks/skatepark";
import { SeaAcquireQuest, SeaPullQuest } from "./tasks/pulls";

export const TheSeaQuest: Quest[] = [
  SeaPullQuest,
  TootQuest,
  StartupQuest,
  BuffQuest,
  ShadowRealmTask,
  FreeFightZoneTask,
  MerkinGearQuest,
  SeaMonkeeQuest,
  // PreItemTask,
  // ItemTask,
  CurrentsQuest,
  MerkinGearQuest,
  ScholarQuest,
  SkateParkQuest,
  ColosseumQuest,
  PearlsQuest,
  FinalQuest,
];

// Aftercore goal to do scholar
export const TestQuest: Quest[] = [
  SeaAcquireQuest,
  SeaMonkeeQuest,
  SkateParkQuest,
  CurrentsQuest,
  MerkinGearQuest,
  ScholarQuest,
];
