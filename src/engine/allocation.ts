import { debug } from "console";
import { inHardcore, myTurncount, pullsRemaining, runCombat } from "kolmafia";
import { args } from "../args";
import { stableSort } from "../lib";
import { summonSources } from "../resources/summon";
import { Allocations, DeltaTask, Task } from "./task";

export function allocateResources(tasks: Task[]): Map<string, DeltaTask> {
  const resourcesAllocated = new Map<string, DeltaTask>();
  const resourcesNeeded = tasks.filter((task) => task.resources && !task.completed());
  const tasksByResource = stableSort(resourcesNeeded, (task) => -1 * (task.resources?.value ?? 0));
  let pullsLeft = pullsRemaining() - (20 - args.major.pulls);
  if (inHardcore() || myTurncount() >= 1000) pullsLeft = 0; // No pulls in hardcore or out of ronin

  const summonsLeft = summonSources.map((s) => s.available());

  for (const task of tasksByResource) {
    if (!task.resources) break;
    let allocated = false;
    if (task.resources.which === Allocations.Pull) {
      if (pullsLeft > 0) {
        resourcesAllocated.set(task.name, {
          tag: "Pull",
        });
        pullsLeft -= 1;
        allocated = true;
      }
    } else if ("summon" in task.resources.which) {
      for (let i = 0; i < summonsLeft.length; i++) {
        if (!summonsLeft[i]) continue;
        if (summonSources[i].canFight(task.resources.which.summon)) {
          const allocatedSummon = summonSources[i];
          const monster = task.resources.which.summon;
          resourcesAllocated.set(task.name, {
            replace: {
              do: () => {
                // Perform the actual summon
                debug(`Summon source: ${allocatedSummon.name}`);
                allocatedSummon.summon(monster);
                runCombat();
              },
            },
            amend: {
              ready: (orignalReady) => {
                return () => (orignalReady?.() ?? true) && (allocatedSummon.ready?.() ?? true);
              },
            },
            tag: allocatedSummon.name,
          });
          allocated = true;
          break;
        }
      }
    }

    if (!allocated && task.resources.required) {
      resourcesAllocated.set(task.name, UNFULFILLED_ALLOCATION);
    }
  }
  return resourcesAllocated;
}

const UNFULFILLED_ALLOCATION = {
  replace: {
    ready: () => false,
  },
  tag: "Unallocated",
};
