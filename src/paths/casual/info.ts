import { PathInfo } from "../pathinfo";
import { findAndMerge, Task } from "../../engine/task";
import { Engine } from "../../engine/engine";
import { inCasual } from "kolmafia";
import { getAcquireQuest } from "./acquire";
import { getTasks } from "grimoire-kolmafia";
import { casualDeltas } from "./tasks";
import { CasualDietQuest } from "./diet";

export class CasualInfo implements PathInfo {
  name(): string {
    return "Casual";
  }

  active(): boolean {
    return inCasual();
  }

  getTasks(tasks: Task[]): Task[] {
    const changedTasks = findAndMerge(tasks, casualDeltas, "Casual");
    const newQuests = [getAcquireQuest(), CasualDietQuest];
    const newTasks = getTasks(newQuests, false, false);
    return [...newTasks, ...changedTasks];
  }

  getEngine(tasks: Task[]): Engine {
    return new Engine(tasks);
  }

  runIntro() {
    // Do nothing
  }
}
