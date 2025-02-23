import { $items, $path, $skill, set } from "libram";
import { PathInfo } from "../pathinfo";
import { Task } from "../../engine/task";
import { Engine } from "../../engine/engine";
import { myPath, runChoice, visitUrl } from "kolmafia";
import { SmolQuest } from "./tasks";
import { SmolPullQuest, smolPulls } from "./pulls";
import { SmolEngine } from "./engine";
import { getTasks } from "grimoire-kolmafia";
import { buildPullRequirements, Requirement, RequirementCategory } from "../../sim";

export class SmolInfo extends PathInfo {
  name(): string {
    return "Shrunken Adventurer";
  }

  active(): boolean {
    return myPath() === $path`A Shrunken Adventurer am I`;
  }

  getTasks(tasks: Task[]): Task[] {
    const newTasks = getTasks([SmolQuest, SmolPullQuest], false, false);
    return [...newTasks, ...tasks];
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
}
