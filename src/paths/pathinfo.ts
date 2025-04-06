import { Engine } from "../engine/engine";
import { Task } from "../engine/task";
import { Requirement } from "../sim";

export interface PathInfo {
  name(): string;
  active(): boolean;
  finished(): boolean;

  args(): string; // extra command-line arguments to be used while in this run

  getTasks(tasks: Task[]): Task[]; // for loadEngine
  getEngine(tasks: Task[]): Engine; // for loadEngine
  getRoute(route: string[]): string[]; // for loadEngine
  getRequirements(reqs: Requirement[]): Requirement[]; // for sim
  runIntro(): void;
}
