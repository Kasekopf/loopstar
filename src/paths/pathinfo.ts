import { Engine } from "../engine/engine";
import { Task } from "../engine/task";
import { Requirement } from "../sim";

export interface PathInfo {
  name(): string;
  active(): boolean;
  finished(): boolean;

  getTasks(tasks: Task[]): Task[]; // for loadEngine
  getEngine(tasks: Task[]): Engine; // for loadEngine
  getRoute(route: string[]): string[]; // for loadEngine
  getRequirements(reqs: Requirement[]): Requirement[]; // for sim
  runIntro(): void;
}
