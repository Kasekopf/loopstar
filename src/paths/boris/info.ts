import { PathInfo } from "../pathinfo";
import { findAndMerge, Task } from "../../engine/task";
import { Engine } from "../../engine/engine";
import { myPath } from "kolmafia";
import { getTasks, step } from "grimoire-kolmafia";
import { Requirement } from "../../sim";
import { borisRoute } from "./route";
import { borisDeltas, BorisDietQuest, BorisQuest, SlowManorQuest } from "./tasks";
import { $path } from "libram";
import { args } from "../../args";
import { BorisEngine } from "./engine";

export class BorisInfo implements PathInfo {
  name(): string {
    return "Boris";
  }

  active(): boolean {
    return myPath() === $path`Avatar of Boris`;
  }

  finished(): boolean {
    return step("questL13Final") > 11;
  }

  getTasks(tasks: Task[]): Task[] {
    const changedTasks = findAndMerge(tasks, borisDeltas, "Boris");
    const newQuests = [BorisQuest, BorisDietQuest, SlowManorQuest];
    const newTasks = getTasks(newQuests, false, false);
    return [...newTasks, ...changedTasks];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getRoute(route: string[]): string[] {
    return borisRoute;
  }

  getEngine(tasks: Task[]): Engine {
    return new BorisEngine(tasks);
  }

  runIntro() {
    // Do nothing
  }

  getRequirements(reqs: Requirement[]): Requirement[] {
    return reqs;
  }

  args(): string | undefined {
    return args.boris.borisargs;
  }
}
