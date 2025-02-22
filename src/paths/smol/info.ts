import { $path, set } from "libram";
import { PathInfo } from "../pathinfo";
import { Task } from "../../engine/task";
import { Engine } from "../../engine/engine";
import { runChoice, visitUrl } from "kolmafia";
import { SmolQuest } from "./tasks";
import { SmolPullQuest } from "./pulls";
import { SmolEngine } from "./engine";
import { getTasks } from "grimoire-kolmafia";

export class SmolInfo implements PathInfo {
  getPath() {
    return $path`A Shrunken Adventurer am I`;
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
}
