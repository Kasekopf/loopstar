import { args } from "../../args";
import { PathInfo } from "../pathinfo";
import { findAndMerge, Task } from "../../engine/task";
import { Engine } from "../../engine/engine";
import { getTasks } from "grimoire-kolmafia";
import { FriarQuest } from "../../tasks/level6";
import { OrganQuest } from "../casual/tasks";
import { LevelingQuest } from "../../tasks/leveling";
import { $skill, get, have } from "libram";
import { Requirement } from "../../sim";
import { atLevel } from "../../lib";

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
    switch (goal) {
      case "organ":
        return have($skill`Liver of Steel`);
      case "level":
        return atLevel(12);
      default:
        throw `Unknown goal ${goal}`;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      default:
        throw `Unknown goal ${goal}`;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getRoute(route: string[]): string[] {
    return []; // Just follow task order
  }

  getEngine(tasks: Task[]): Engine {
    return new Engine(tasks);
  }

  runIntro() {
    // Do nothing
  }

  getRequirements(reqs: Requirement[]): Requirement[] {
    return reqs;
  }
}
