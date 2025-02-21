import { inHardcore, myTurncount, pullsRemaining, runCombat } from "kolmafia";
import { args } from "../args";
import { debug, stableSort } from "../lib";
import { summonSources } from "../resources/summon";
import { Allocation, Allocations, AllocationSummon, DeltaTask, Task } from "./task";
import { $effect, get, have, undelay } from "libram";
import { forceNCSources, noncombatForceNCSources } from "../resources/forcenc";
import { Priorities } from "./priority";
import { luckySources } from "../resources/lucky";

type Allocator = {
  applies: (which: Allocation) => boolean; // True if this allocator can satisfy this request
  amount: () => number; // The number of resources available to be allocated
  delta: DeltaTask | ((which: Allocation) => DeltaTask); // The change to make on the task if a resource is allocated
};

const allocators: Allocator[] = [
  // Pulls
  {
    applies: (which) => which === Allocations.Pull,
    amount: () => {
      if (inHardcore() || myTurncount() >= 1000) return 0;
      return pullsRemaining() - (20 - args.major.pulls);
    },
    delta: {
      tag: "Pull",
    },
  },
  // NC Forcers
  {
    applies: (which) => which === Allocations.NCForce,
    amount: () => (get("noncombatForcerActive") ? 1 : 0),
    delta: {
      tag: "NCForce",
    },
  },
  ...noncombatForceNCSources.map(
    (s) =>
      <Allocator>{
        applies: (which) => which === Allocations.NCForce,
        amount: () => s.remaining(),
        delta: {
          tag: "NCForce",
          combine: {
            priority: () => {
              if (get("noncombatForcerActive")) return Priorities.None;
              if (s.available()) return Priorities.None;
              return Priorities.BadForcingNC;
            },
            prepare: () => {
              if (!get("noncombatForcerActive")) s.do();
            },
          },
        },
      }
  ),
  ...forceNCSources.map(
    (s) =>
      <Allocator>{
        applies: (which) => which === Allocations.NCForce,
        amount: () => s.remaining(),
        delta: {
          tag: "NCForce",
          combine: {
            priority: () => {
              if (get("noncombatForcerActive")) return Priorities.None;
              return Priorities.BadForcingNC;
            },
          },
        },
      }
  ),
  // Summons
  ...summonSources.map(
    (s) =>
      <Allocator>{
        applies: (which: Allocation) =>
          typeof which === "object" && "summon" in which && s.canFight(which.summon),
        amount: () => s.available(),
        delta: (req) =>
          <DeltaTask>{
            replace: {
              do: () => {
                // Perform the actual summon
                debug(`Summon source: ${s.name}`);
                s.summon((req as AllocationSummon).summon);
                runCombat();
              },
            },
            combine: {
              ready: s.ready,
            },
            tag: s.name,
          },
      }
  ),
  // Lucky
  {
    applies: (which) => which === Allocations.Lucky,
    amount: () => (have($effect`Lucky!`) ? 1 : 0),
    delta: {
      tag: "Lucky",
    },
  },
  ...luckySources.map(
    (s) =>
      <Allocator>{
        applies: (which) => which === Allocations.Lucky,
        amount: () => s.remaining(),
        delta: {
          tag: "Lucky",
          combine: {
            prepare: () => {
              if (!have($effect`Lucky!`)) s.do();
            },
          },
        },
      }
  ),
];

export function allocateResources(tasks: Task[]): Map<string, DeltaTask> {
  const resourcesAllocated = new Map<string, DeltaTask>();
  const resourcesNeeded = tasks.filter((task) => task.resources && !task.completed());
  const tasksByResource = stableSort(
    resourcesNeeded,
    (task) => -1 * (undelay(task.resources)?.value ?? 0)
  );

  const remaining = allocators.map((s) => s.amount());
  for (const task of tasksByResource) {
    const resources = undelay(task.resources);
    if (!resources) break;
    let foundResource = false;
    for (let i = 0; i < (resources.repeat ?? 1); i++) {
      const found = allocators.findIndex((a, i) => a.applies(resources.which) && remaining[i] > 0);
      if (found >= 0) {
        const delta =
          typeof allocators[found].delta === "function"
            ? allocators[found].delta(resources.which)
            : allocators[found].delta;
        remaining[found] -= 1;
        if (!foundResource) {
          // Only adjust the task for the *next* resource use
          resourcesAllocated.set(task.name, delta);
        }
        foundResource = true;
      }
    }

    if (!foundResource && resources.required) {
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
