import { getTasks } from "grimoire-kolmafia";
import { myPath } from "kolmafia";
import { $path, get } from "libram";
import { args } from "../../args";
import { findAndMerge, Task } from "../../engine/task";
import { Requirement } from "../../sim";
import { PathInfo } from "../pathinfo";
import { SeaPullsQuest } from "./pulls";
import { SeaQuest } from "./thesea";
import { Engine } from "../../engine/engine";

export class TheSeaInfo implements PathInfo {
  name(): string {
    return "11037 Leagues Under the Sea";
  }

  active(): boolean {
    return myPath() === $path`11,037 Leagues Under the Sea`;
  }

  finished(): boolean {
    return get("kingLiberated");
  }

  getTasks(tasks: Task[]): Task[] {
    const newQuests = [SeaPullsQuest, SeaQuest];
    const newTasks = getTasks(newQuests, false, false);
    return findAndMerge([...tasks, ...newTasks], []);
  }

  getRoute(route: string[]): string[] {
    return route;
  }

  getEngine(tasks: Task[]): Engine {
    return new Engine(tasks);
  }

  runIntro() {
    return null; // ih8u doesn't have an intro NC apparently!
  }

  getRequirements(reqs: Requirement[]): Requirement[] {
    return [
      ...reqs,
    ];
  }

  args(): string | undefined {
    return args.ih8u.ih8uargs;
  }
}
