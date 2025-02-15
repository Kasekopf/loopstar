import { Path } from "kolmafia";
import { Task } from "../engine/task";
import { Engine } from "../engine/engine";

export interface PathInfo {
  getPath(): Path;
  getTasks(tasks: Task[]): Task[];
  getEngine(tasks: Task[], ignoreTasks: string[], completedTasks: string[]): Engine;
  runIntro(): void;
}
