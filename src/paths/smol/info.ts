import { $path, set } from "libram";
import { PathInfo } from "../pathinfo";
import { Task } from "../../engine/task";
import { Engine } from "../../engine/engine";
import { runChoice, visitUrl } from "kolmafia";
import { SmolQuest } from "./tasks";
import { RunPlan } from "../../engine/runplan";
import { SmolPullQuest } from "./pulls";
import { SmolEngine } from "./engine";

export class SmolInfo implements PathInfo {
  getPath() {
    return $path`A Shrunken Adventurer am I`;
  }

  getPlan(plan: RunPlan): RunPlan {
    plan.quests.splice(0, 0, SmolQuest); // Limit stats should be first
    plan.quests.push(SmolPullQuest);
    return plan;
  }

  getEngine(tasks: Task[]): Engine {
    return new SmolEngine(tasks);
  }

  runIntro() {
    // Clear intro adventure
    set("choiceAdventure1507", 1);
    if (visitUrl("main.php").includes("dense, trackless jungle")) runChoice(-1);
  }
}
