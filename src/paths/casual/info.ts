import { PathInfo } from "../pathinfo";
import { findAndMerge, Task } from "../../engine/task";
import { Engine } from "../../engine/engine";
import { inCasual } from "kolmafia";
import { getAcquireQuest } from "./acquire";
import { getTasks } from "grimoire-kolmafia";
import { casualDeltas, OrganQuest } from "./tasks";
import { CasualDietQuest } from "./diet";
import { args } from "../../args";
import { Requirement } from "../../sim";

export class CasualInfo extends PathInfo {
  name(): string {
    return "Casual";
  }

  active(): boolean {
    return inCasual();
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
