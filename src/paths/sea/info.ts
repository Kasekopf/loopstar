import { myPath } from "kolmafia";
import { $path, get } from "libram";
import { args } from "../../args";
import { findAndMerge, Task } from "../../engine/task";
import { Requirement } from "../../sim";
import { PathInfo } from "../pathinfo";
import { getTasks } from "grimoire-kolmafia";
import { Engine } from "../../engine/engine";
import { TheSeaQuest } from "./tasks";
import { TheSeaEngine } from "./engine";
import { seaRoute } from "./route";

export class TheSeaInfo implements PathInfo {
  name(): string {
    return `11,037 Leagues Under the Sea`;
  }

  active(): boolean {
    return myPath() === $path`11,037 Leagues Under the Sea`;
  }

  finished(): boolean {
    return get("kingLiberated");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getTasks(tasks: Task[]): Task[] {
    const newQuests = TheSeaQuest;
    const newTasks = getTasks(newQuests, false, false);
    return findAndMerge([...newTasks], []);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getRoute(route: string[]): string[] {
    return seaRoute;
  }

  getEngine(tasks: Task[]): Engine {
    return new TheSeaEngine(tasks);
  }

  runIntro() {
    return null; // ih8u doesn't have an intro NC apparently!
  }

  getRequirements(reqs: Requirement[]): Requirement[] {
    return reqs;
  }

  args(): string | undefined {
    return args.ih8u.ih8uargs;
  }
}
