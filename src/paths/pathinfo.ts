import { findAndMerge, NamedDeltaTask, Task } from "../engine/task";
import { Engine } from "../engine/engine";
import { verifyDependencies } from "grimoire-kolmafia";
import { Requirement } from "../sim";
import { args } from "../args";
import { prioritize } from "../route";

export abstract class PathInfo {
  abstract name(): string;
  abstract active(): boolean;
  abstract getTasks(tasks: Task[]): Task[]; // for load
  abstract getEngine(tasks: Task[]): Engine; // for load
  abstract getRequirements(reqs: Requirement[]): Requirement[]; // for sim
  abstract runIntro(): void;

  load(baseTasks: Task[]): Engine {
    const customizedTasks = this.getTasks(baseTasks);
    verifyDependencies(customizedTasks);

    const softTunedTasks = customizedTasks.map((t) => {
      if (t.limit.soft && args.minor.luck !== 1)
        return { ...t, limit: { ...t.limit, soft: t.limit.soft * args.minor.luck } };
      return t;
    });

    const ignoreTasks = args.debug.ignoretasks?.split(",") ?? [];
    const completedTasks = args.debug.completedtasks?.split(",") ?? [];
    const deltas = [
      ...ignoreTasks.map(
        (name) =>
          <NamedDeltaTask>{
            name: name,
            replace: {
              ready: () => false,
            },
            tag: "ignoretasks",
          }
      ),
      ...completedTasks.map(
        (name) =>
          <NamedDeltaTask>{
            name: name,
            replace: {
              completed: () => true,
            },
            tag: "completedtasks",
          }
      ),
    ];
    const tasksAfterIgnoreCompleted = findAndMerge(softTunedTasks, deltas, undefined, true);
    return this.getEngine(prioritize(tasksAfterIgnoreCompleted));
  }
}
