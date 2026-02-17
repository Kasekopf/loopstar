import { args } from "../../args";
import { PathInfo } from "../pathinfo";
import { findAndMerge, Task } from "../../engine/task";
import { Engine } from "../../engine/engine";
import { getTasks } from "grimoire-kolmafia";
import { FriarQuest } from "../../tasks/level6";
import { OrganQuest } from "./organ";
import { LevelingQuest } from "../../tasks/leveling";
import { $item, $skill, get, have } from "libram";
import { Requirement } from "../../sim";
import { atLevel } from "../../lib";
import { KnobQuest } from "../../tasks/level5";
import { MenagerieQuest } from "./menagerie";
import { myAscensions } from "kolmafia";
import { DisQuest } from "./dis";
import { TheSeaEngine } from "../sea/engine";
import { DadPath, GladiatorPath, ScholarPath } from "../sea/tasks";

export class AftercoreInfo implements PathInfo {
  name(): string {
    return "Aftercore";
  }

  active(): boolean {
    if (!args.aftercore.goal) return false;
    return get("kingLiberated");
  }

  finished(goalOverride: string | undefined = undefined): boolean {
    const goal = goalOverride ?? args.aftercore.goal;
    if (!goal) return true;
    switch (goal) {
      case "organ":
        return have($skill`Liver of Steel`);
      case "level":
        return atLevel(12);
      case "menagerie":
        return have($item`Cobb's Knob Menagerie key`);
      case "dis":
        return get("lastThingWithNoNameDefeated") === myAscensions();
      case "violence":
        return get("shubJigguwattDefeated") || get("isMerkinHighPriest"); // scholar locks out violence
      case "hatred":
        return get("yogUrtDefeated") || get("isMerkinGladiatorChampion"); // gladiator locks out hatred
      case "loathing":
        return get("seahorseName") !== "";
      default:
        throw `Unknown goal ${goal}`;
    }
  }

  getTasks(_: Task[], goalOverride: string | undefined = undefined): Task[] {
    const goal = goalOverride ?? args.aftercore.goal;
    if (!goal) return [];
    switch (goal) {
      case "organ":
        return getTasks([FriarQuest, OrganQuest]);
      case "level":
        return findAndMerge(getTasks([LevelingQuest], false, false), [
          {
            name: "Leveling/Mouthwash",
            amend: {
              after: (a) => a?.filter((b) => b.startsWith("Leveling")),
            },
          },
        ]);
      case "menagerie":
        return getTasks([KnobQuest, MenagerieQuest]);
      case "dis":
        return getTasks([DisQuest]);
      case "violence":
        return getTasks(GladiatorPath);
      case "hatred":
        return getTasks(ScholarPath);
      case "loathing":
        return getTasks(DadPath);
      default:
        throw `Unknown goal ${goal}`;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getRoute(route: string[]): string[] {
    return []; // Just follow task order
  }

  getEngine(tasks: Task[]): Engine {
    switch (args.aftercore.goal) {
      case "seatest":
        return new TheSeaEngine(tasks);
      default:
        return new Engine(tasks);
    }
  }

  runIntro() {
    // Do nothing
  }

  getRequirements(reqs: Requirement[]): Requirement[] {
    return reqs;
  }

  args(): string | undefined {
    return undefined;
  }
}
