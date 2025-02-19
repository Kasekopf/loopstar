import { Quest, Task } from "./task";
import { KeyStrategy } from "../tasks/keys";
import { getTasks } from "grimoire-kolmafia";
import { args } from "../args";
import { prioritize } from "../route";
import { debug } from "../lib";

export class RunPlan {
  quests: Quest[];
  keyStrategy: KeyStrategy;

  constructor(quests: Quest[], keyStrategy: KeyStrategy) {
    this.quests = quests;
    this.keyStrategy = keyStrategy;
  }

  update() {
    this.keyStrategy.update();
  }

  getTasks(): Task[] {
    const quests = [...this.quests];
    const tasks = prioritize(getTasks(quests));
    for (const task of tasks) {
      if (task.limit.soft) {
        task.limit.soft *= args.minor.luck;
      }
    }

    // Include ignoretasks and completedtasks args
    const taskNames = new Set<string>(tasks.map((task) => task.name));
    const ignoreTasks = args.debug.ignoretasks?.split(",") ?? [];
    const completedTasks = args.debug.completedtasks?.split(",") ?? [];
    const ignoreSet = new Set<string>(ignoreTasks.map((n) => n.trim()));
    const completedSet = new Set<string>(completedTasks.map((n) => n.trim()));
    // Completed tasks are always completed, ignored tasks are never ready
    const fixedTasks = tasks.map((task) => {
      if (completedSet.has(task.name)) return { ...task, completed: () => true };
      if (ignoreSet.has(task.name)) return { ...task, ready: () => false };
      return task;
    });
    for (const task of ignoreTasks) {
      if (!taskNames.has(task)) debug(`Warning: Unknown ignoretask ${task}`);
    }
    for (const task of completedSet) {
      if (!taskNames.has(task)) debug(`Warning: Unknown completedtask ${task}`);
    }
    return fixedTasks;
  }
}
