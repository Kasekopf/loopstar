import { PathInfo } from "../pathinfo";
import { findAndMerge, Task } from "../../engine/task";
import { Engine } from "../../engine/engine";
import { inCasual } from "kolmafia";
import { getTasks, step } from "grimoire-kolmafia";
import { Requirement } from "../../sim";
import { borisRoute } from "./route";
import { borisDeltas, BorisQuest, SlowManorQuest } from "./tasks";

export class BorisInfo implements PathInfo {
  name(): string {
    return "Boris";
  }

  active(): boolean {
    return inCasual();
  }

  finished(): boolean {
    return step("questL13Final") > 11;
  }

  getTasks(tasks: Task[]): Task[] {
    const changedTasks = findAndMerge(tasks, borisDeltas, "Boris");
    const newQuests = [BorisQuest, SlowManorQuest];
    const newTasks = getTasks(newQuests, false, false);
    return [...newTasks, ...changedTasks];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getRoute(route: string[]): string[] {
    return borisRoute;
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
