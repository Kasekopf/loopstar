import { getTasks, step } from "grimoire-kolmafia";
import { myPath, runChoice, visitUrl } from "kolmafia";
import { $familiar, $path, set } from "libram";
import { args } from "../../args";
import { findAndMerge, Task } from "../../engine/task";
import { Requirement, RequirementCategory } from "../../sim";
import { PathInfo } from "../pathinfo";
import { IH8UDietQuest } from "./diet";
import { Engine } from "../../engine/engine";
import { IH8UPullQuest } from "./pulls";


export class IH8UInfo implements PathInfo {
  name(): string {
    return "11 Things I Hate About U";
  }

  active(): boolean {
    return myPath() === $path`11 Things I Hate About U`;
  }

  finished(): boolean {
    return step("questL13Final") > 11;
  }

  getTasks(tasks: Task[]): Task[] {
    const newQuests = [IH8UDietQuest, IH8UPullQuest];
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
    // Clear intro adventure
    set("choiceAdventure1464", 1);
    if (visitUrl("main.php").includes("somewhat-human-shaped mass of grey goo nanites"))
      runChoice(-1);
  }

  getRequirements(reqs: Requirement[]): Requirement[] {
    return [
      ...reqs,
      {
        thing: $familiar`Mini Kiwi`,
        why: "Adv gain",
        required: true,
        category: RequirementCategory.IOTM,
      },
    ];
  }

  args(): string | undefined {
    return args.gyou.gyouargs;
  }
}
