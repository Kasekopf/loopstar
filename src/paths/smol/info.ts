import { $path, set } from "libram";
import { PathInfo } from "../pathinfo";
import { Task } from "../../engine/task";
import { Engine } from "../../engine/engine";
import { runChoice, visitUrl } from "kolmafia";

export class SmolInfo implements PathInfo {
  getPath() {
    return $path`A Shrunken Adventurer am I`;
  }

  getTasks(tasks: Task[]) {
    return tasks;
  }

  getEngine(tasks: Task[], ignoreTasks: string[], completedTasks: string[]): Engine {
    return new Engine(tasks, ignoreTasks, completedTasks);
  }

  runIntro() {
    // Clear intro adventure
    set("choiceAdventure1507", 1);
    if (visitUrl("main.php").includes("dense, trackless jungle")) runChoice(-1);
  }
}
