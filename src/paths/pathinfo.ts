import { Task } from "../engine/task";
import { Engine } from "../engine/engine";
import { verifyDependencies } from "grimoire-kolmafia";

export abstract class PathInfo {
  abstract name(): string;
  abstract active(): boolean;
  abstract getTasks(tasks: Task[]): Task[];
  abstract getEngine(tasks: Task[]): Engine;
  abstract runIntro(): void;

  load(tasks: Task[]): Engine {
    const customizedTasks = this.getTasks(tasks);
    verifyDependencies(customizedTasks);
    return this.getEngine(customizedTasks);
  }
}
