import { $path, set } from "libram";
import { PathInfo } from "../pathinfo";
import { Task } from "../../engine/task";
import { Engine } from "../../engine/engine";
import { runChoice, visitUrl } from "kolmafia";
import { SmolDietQuest } from "./tasks";
import { RunPlan } from "../../engine/runplan";
import { smolPulls } from "./pulls";

export class SmolInfo implements PathInfo {
  getPath() {
    return $path`A Shrunken Adventurer am I`;
  }

  getPlan(plan: RunPlan): RunPlan {
    plan.quests.concat(SmolDietQuest);
    plan.pullStrategy.add(smolPulls);
    return plan;
  }

  getEngine(tasks: Task[]): Engine {
    return new Engine(tasks);
  }

  runIntro() {
    // Clear intro adventure
    set("choiceAdventure1507", 1);
    if (visitUrl("main.php").includes("dense, trackless jungle")) runChoice(-1);
  }
}
