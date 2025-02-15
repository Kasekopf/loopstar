import { Path } from "kolmafia";
import { Quest, Task } from "../engine/task";
import { Engine } from "../engine/engine";

export interface PathInfo {
  getPath(): Path;
  getQuests(quests: Quest[]): Quest[];
  getEngine(tasks: Task[], ignoreTasks: string[], completedTasks: string[]): Engine;
  runIntro(): void;
}
