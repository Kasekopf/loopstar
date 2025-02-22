import { args } from "../../args";
import { PathInfo } from "../pathinfo";
import { findAndMerge, Task } from "../../engine/task";
import { Engine } from "../../engine/engine";
import { getTasks } from "grimoire-kolmafia";
import { FriarQuest } from "../../tasks/level6";
import { OrganQuest } from "../casual/tasks";
import { LevelingQuest } from "../../tasks/leveling";
import { get } from "libram";

export class AftercoreInfo implements PathInfo {
  name(): string {
    return "Aftercore";
  }

  active(): boolean {
    if (!args.major.goal) return false;
    return get("kingLiberated");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getTasks(_: Task[]): Task[] {
    if (!args.major.goal) return [];
    switch (args.major.goal) {
      case "organ":
        return getTasks([FriarQuest, OrganQuest]);
      case "level":
        return findAndMerge(getTasks([LevelingQuest], false, false), [
          {
            name: "Leveling/Mouthwash",
            amend: {
              after: (a) => a?.filter((b) => b.startsWith("Leveling")),
            },
          },
        ]);
      default:
        throw `Unknown goal ${args.major.goal}`;
    }
  }

  getEngine(tasks: Task[]): Engine {
    return new Engine(tasks);
  }

  runIntro() {
    // Do nothing
  }
}
