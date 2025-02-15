import { Path } from "kolmafia";
import { Task } from "../engine/task";
import { Engine } from "../engine/engine";
import { RunPlan } from "../engine/runplan";

export interface PathInfo {
  getPath(): Path;
  getPlan(plan: RunPlan): RunPlan;
  getEngine(tasks: Task[], ignoreTasks: string[], completedTasks: string[]): Engine;
  runIntro(): void;
}
