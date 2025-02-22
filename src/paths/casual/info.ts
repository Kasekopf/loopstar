import { PathInfo } from "../pathinfo";
import { Task } from "../../engine/task";
import { Engine } from "../../engine/engine";
import { inCasual } from "kolmafia";
import { getAcquireQuest } from "./acquire";
import { getTasks } from "grimoire-kolmafia";

export class SmolInfo implements PathInfo {
  name(): string {
    return "Casual";
  }

  active(): boolean {
    return inCasual();
  }

  getTasks(tasks: Task[]): Task[] {
    const newTasks = getTasks([getAcquireQuest()], false, false);
    return [...newTasks, ...tasks];
  }

  getEngine(tasks: Task[]): Engine {
    return new Engine(tasks);
  }

  runIntro() {
    // Do nothing
  }
}
