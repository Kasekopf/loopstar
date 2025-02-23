import { Task } from "../engine/task";
import { Engine } from "../engine/engine";
import { verifyDependencies } from "grimoire-kolmafia";
import { Requirement } from "../sim";

export abstract class PathInfo {
  abstract name(): string;
  abstract active(): boolean;
  abstract getTasks(tasks: Task[]): Task[]; // for load
  abstract getEngine(tasks: Task[]): Engine; // for load
  abstract getRequirements(reqs: Requirement[]): Requirement[]; // for sim
  abstract runIntro(): void;

  load(tasks: Task[]): Engine {
    const customizedTasks = this.getTasks(tasks);
    verifyDependencies(customizedTasks);
    return this.getEngine(customizedTasks);
  }
}
