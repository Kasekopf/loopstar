import { PathInfo } from "../pathinfo";
import { findAndMerge, Task } from "../../engine/task";
import { Engine } from "../../engine/engine";
import { inCasual } from "kolmafia";
import { getAcquireQuest } from "./acquire";
import { getTasks, step } from "grimoire-kolmafia";
import { casualDeltas, OrganQuest } from "./tasks";
import { CasualDietQuest } from "./diet";
import { args } from "../../args";
import { Requirement } from "../../sim";
import { $skill, have } from "libram";

export class CasualInfo implements PathInfo {
  name(): string {
    return "Casual";
  }

  active(): boolean {
    return inCasual();
  }

  finished(): boolean {
    return step("questL13Final") > 11 && (!args.casual.steelorgan || have($skill`Liver of Steel`));
  }

  getTasks(tasks: Task[]): Task[] {
    const changedTasks = findAndMerge(tasks, casualDeltas, "Casual");
    const newQuests = [getAcquireQuest(), CasualDietQuest];
    if (args.casual.steelorgan) newQuests.concat(OrganQuest);
    const newTasks = getTasks(newQuests, false, false);
    return [...newTasks, ...changedTasks];
  }

  getRoute(route: string[]): string[] {
    return route;
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
