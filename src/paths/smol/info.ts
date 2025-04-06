import { $items, $path, $skill, set } from "libram";
import { PathInfo } from "../pathinfo";
import { findAndMerge, Task } from "../../engine/task";
import { Engine } from "../../engine/engine";
import { myPath, runChoice, visitUrl } from "kolmafia";
import { smolDeltas, SmolQuest } from "./tasks";
import { SmolPullQuest, smolPulls } from "./pulls";
import { SmolEngine } from "./engine";
import { getTasks, step } from "grimoire-kolmafia";
import { buildPullRequirements, Requirement, RequirementCategory } from "../../sim";
import { args } from "../../args";

export class SmolInfo implements PathInfo {
  name(): string {
    return "Shrunken Adventurer";
  }

  active(): boolean {
    return myPath() === $path`A Shrunken Adventurer am I`;
  }

  finished(): boolean {
    return step("questL13Final") > 11;
  }

  getTasks(tasks: Task[]): Task[] {
    const newTasks = getTasks([SmolQuest, SmolPullQuest], false, false);
    return findAndMerge([...newTasks, ...tasks], smolDeltas);
  }

  getRoute(route: string[]): string[] {
    return route;
  }

  getEngine(tasks: Task[]): Engine {
    return new SmolEngine(tasks);
  }

  runIntro() {
    // Clear intro adventure
    set("choiceAdventure1507", 1);
    if (visitUrl("main.php").includes("dense, trackless jungle")) runChoice(-1);
  }

  getRequirements(reqs: Requirement[]): Requirement[] {
    return [
      ...reqs,
      ...buildPullRequirements(smolPulls),
      {
        thing: $skill`Pizza Lover`,
        why: "Adv gain, +exp",
        required: true,
        category: RequirementCategory.Permed,
      },
      {
        thing: $items`Calzone of Legend, Pizza of Legend, Deep Dish of Legend`,
        why: "Adv",
        required: true,
        category: RequirementCategory.Item,
      },
    ];
  }

  args(): string {
    return args.smol.smolargs;
  }
}
