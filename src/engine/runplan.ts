import { Quest, Task } from "./task";
import { PullStrategy } from "../tasks/pulls";
import { SummonStrategy } from "../tasks/summons";
import { KeyStrategy } from "../tasks/keys";
import { getTasks } from "grimoire-kolmafia";
import { args } from "../args";
import { prioritize } from "../route";

export class RunPlan {
  quests: Quest[];
  summonStrategy: SummonStrategy;
  pullStrategy: PullStrategy;
  keyStrategy: KeyStrategy;

  constructor(
    quests: Quest[],
    summonStrategy: SummonStrategy,
    pullStrategy: PullStrategy,
    keyStrategy: KeyStrategy
  ) {
    this.quests = quests;
    this.summonStrategy = summonStrategy;
    this.pullStrategy = pullStrategy;
    this.keyStrategy = keyStrategy;
  }

  update() {
    this.summonStrategy.update();
    this.keyStrategy.update();
    this.pullStrategy.update();
  }

  getTasks(): Task[] {
    const quests = [...this.quests, this.summonStrategy.getQuest(), this.pullStrategy.getQuest()];
    const tasks = prioritize(getTasks(quests));
    for (const task of tasks) {
      if (task.limit.soft) {
        task.limit.soft *= args.minor.luck;
      }
    }
    return tasks;
  }
}
