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
  appliesTo: (which: Allocation) => boolean; // True if this allocator can satisfy this request
  amount: () => number; // The number of resources available to be allocated
  delta: DeltaTask | ((which: Allocation) => DeltaTask); // The change to make on the task if a resource is allocated
};

const allocators: Allocator[] = [
  // Pulls
  {
    appliesTo: (which) => which === Allocations.Pull,
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
    appliesTo: (which) => which === Allocations.NCForce,
    amount: () => (get("noncombatForcerActive") ? 1 : 0),
    delta: {
      tag: "NCForce",
    },
  },
  ...noncombatForceNCSources.map(
    (s) =>
      <Allocator>{
        appliesTo: (which) => which === Allocations.NCForce,
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
        appliesTo: (which) => which === Allocations.NCForce,
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
        appliesTo: (which: Allocation) =>
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
    appliesTo: (which) => which === Allocations.Lucky,
    amount: () => (have($effect`Lucky!`) ? 1 : 0),
    delta: {
      tag: "Lucky",
    },
  },
  ...luckySources.map(
    (s) =>
      <Allocator>{
        appliesTo: (which) => which === Allocations.Lucky,
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
  // Order tasks by the value fulfilling their resource request will give.
  // We will fulfil these requests greedily in this order.
  const resourcesNeeded = tasks.filter((task) => task.resources && !task.completed());
  const tasksByResource = stableSort(
    resourcesNeeded,
    (task) => -1 * (undelay(task.resources)?.value ?? 0)
  );

  const fulfillments = new Map<string, DeltaTask>();
  const remainingToAllocate = allocators.map((s) => s.amount());
  for (const task of tasksByResource) {
    const request = undelay(task.resources);
    if (!request) continue;
    let foundResource = false;
    for (let i = 0; i < (request.repeat ?? 1); i++) {
      // Try to find a resource to fulfill the request
      const foundIndex = allocators.findIndex(
        (a, i) => a.appliesTo(request.which) && remainingToAllocate[i] > 0
      );
      if (foundIndex >= 0) {
        remainingToAllocate[foundIndex] -= 1;
        if (!foundResource) {
          // Only adjust the task for the *next* resource use
          const delta = undelay(allocators[foundIndex].delta, request.which);
          fulfillments.set(task.name, delta);
        }
        foundResource = true;
      } else {
        break; // Any further repeated requests will fail anyway
      }
    }

    if (!foundResource && request.required) {
      // Block the task from running
      fulfillments.set(task.name, UNALLOCATED);
    }
  }
  return fulfillments;
}

export const UNALLOCATED: DeltaTask = {
  replace: {
    ready: () => false,
  },
  tag: "Unallocated",
};
