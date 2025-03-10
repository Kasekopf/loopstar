import { getTasks, step } from "grimoire-kolmafia";
import { myPath, runChoice, visitUrl } from "kolmafia";
import { $path, set } from "libram";
import { PathInfo } from "../pathinfo";
import { Task } from "../../engine/task";
import { Engine } from "../../engine/engine";
import { Requirement } from "../../sim";
import { GyouEngine } from "./engine";
import { AbsorbQuest } from "./absorb";
import { MenagerieQuest } from "../aftercore/menagerie";

export class GyouInfo implements PathInfo {
  name(): string {
    return "Grey You";
  }

  active(): boolean {
    return myPath() === $path`Grey You`;
  }

  finished(): boolean {
    return step("questL13Final") > 11;
  }

  getTasks(tasks: Task[]): Task[] {
    const newTasks = getTasks([AbsorbQuest, MenagerieQuest], false, false);
    return [...tasks, ...newTasks];
  }

  getRoute(route: string[]): string[] {
    return route;
  }

  getEngine(tasks: Task[]): Engine {
    return new GyouEngine(tasks);
  }

  runIntro() {
    // Clear intro adventure
    set("choiceAdventure1464", 1);
    if (visitUrl("main.php").includes("somewhat-human-shaped mass of grey goo nanites"))
      runChoice(-1);
  }

  getRequirements(reqs: Requirement[]): Requirement[] {
    return reqs;
  }
}
