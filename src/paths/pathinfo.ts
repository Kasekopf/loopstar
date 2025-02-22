import { Task } from "../engine/task";
import { Engine } from "../engine/engine";

export interface PathInfo {
  name(): string;
  active(): boolean;
  getTasks(tasks: Task[]): Task[];
  getEngine(tasks: Task[]): Engine;
  runIntro(): void;
}
