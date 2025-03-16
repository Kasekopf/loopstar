import { inHardcore, myTurncount, pullsRemaining, runCombat } from "kolmafia";
import { args } from "../args";
import { debug, stableSort } from "../lib";
import { summonSources } from "../resources/summon";
import {
  DeltaTask,
  getResourceFriendlyName,
  getTaggedName,
  Resources,
  ResourceSummon,
  ResourceType,
  Task,
} from "./task";
import { $effect, get, have, undelay } from "libram";
import { forceNCSources, noncombatForceNCSources } from "../resources/forcenc";
import { Priorities } from "./priority";
import { luckySources } from "../resources/lucky";

type Allocator = {
  name: string; // Name for debugging printout
  appliesTo: (which: ResourceType) => boolean; // True if this allocator can satisfy this request
  amount: () => number; // The number of resources available to be allocated
  delta: DeltaTask | ((which: ResourceType) => DeltaTask); // The change to make on the task if a resource is allocated
};

function getAllocators(): Allocator[] {
  // NCForces are fungible, so despite which NCForce is allocated to what,
  // always use the next noncombat source in the delta.
  // (We keep them as separate allocators for debugging)
  const nextNCForce = noncombatForceNCSources.find((s) => s.available());

  return [
    // Pulls
    {
      name: "Pull",
      appliesTo: (which) => which === Resources.Pull,
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
      name: "NC Force Active",
      appliesTo: (which) => which === Resources.NCForce,
      amount: () => (get("noncombatForcerActive") ? 1 : 0),
      delta: {
        tag: "NCForce",
      },
    },
    ...noncombatForceNCSources.map(
      (s) =>
        <Allocator>{
          name: s.name,
          appliesTo: (which) => which === Resources.NCForce,
          amount: () => s.remaining(),
          delta: {
            tag: "NCForce",
            combine: {
              priority: () => {
                if (get("noncombatForcerActive")) return Priorities.None;
                if (nextNCForce) return Priorities.None;
                return Priorities.BadForcingNC;
              },
              prepare: () => {
                if (!get("noncombatForcerActive") && nextNCForce) nextNCForce.prepare();
              },
            },
          },
        }
    ),
    ...forceNCSources.map(
      (s) =>
        <Allocator>{
          name: s.name,
          appliesTo: (which) => which === Resources.NCForce,
          amount: () => s.remaining(),
          delta: {
            tag: "NCForce",
            combine: {
              priority: () => {
                if (get("noncombatForcerActive")) return Priorities.None;
                if (nextNCForce) return Priorities.None;
                return Priorities.BadForcingNC;
              },
              prepare: () => {
                if (!get("noncombatForcerActive") && nextNCForce) nextNCForce.prepare();
              },
            },
          },
        }
    ),
    // Summons
    ...summonSources.map(
      (s) =>
        <Allocator>{
          name: s.name,
          appliesTo: (which: ResourceType) =>
            typeof which === "object" && "summon" in which && s.canFight(which.summon),
          amount: () => s.available(),
          delta: (req) =>
            <DeltaTask>{
              replace: {
                do: () => {
                  // Perform the actual summon
                  debug(`Summon source: ${s.name}`);
                  s.summon((req as ResourceSummon).summon);
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
      name: "Lucky Active",
      appliesTo: (which) => which === Resources.Lucky,
      amount: () => (have($effect`Lucky!`) ? 1 : 0),
      delta: {
        tag: "Lucky",
      },
    },
    ...luckySources.map(
      (s) =>
        <Allocator>{
          name: s.name,
          appliesTo: (which) => which === Resources.Lucky,
          amount: () => s.remaining(),
          delta: {
            tag: "Lucky",
            combine: {
              prepare: () => {
                if (!have($effect`Lucky!`)) s.prepare();
              },
            },
          },
        }
    ),
  ];
}

export function allocateResources(tasks: Task[], verbose = false): Map<string, DeltaTask> {
  // Order tasks by the value fulfilling their resource request will give.
  // We will fulfil these requests greedily in this order.
  const resourcesNeeded = tasks.filter((task) => task.resources && !task.completed());
  const tasksByResource = stableSort(
    resourcesNeeded,
    (task) => -1 * (undelay(task.resources)?.benefit ?? 0)
  );

  const fulfillments = new Map<string, DeltaTask>();
  const allocators = getAllocators();
  const remainingToAllocate = allocators.map((s) => s.amount());
  for (const task of tasksByResource) {
    const request = undelay(task.resources);
    if (!request) continue;
    if (verbose) {
      const name = getTaggedName(task);
      const requestStr = getResourceFriendlyName(request.which);
      const valueStr = request.benefit.toFixed(2);
      debug(`${name}: ${requestStr} x${request.repeat ?? 1} for ${valueStr}`);
    }
    let foundResource = false;
    const repeat = request.repeat ?? 1;
    for (let i = 0; i < repeat; i++) {
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
        if (verbose) {
          debug(` + ${allocators[foundIndex].name}`);
        }
        foundResource = true;
      } else {
        if (verbose && i > 0) {
          debug(` # Unallocated x${repeat - i}`);
        }
        break; // Any further repeated requests will fail anyway
      }
    }

    if (!foundResource) {
      if (request.required) {
        // Block the task from running
        fulfillments.set(task.name, UNALLOCATED);
      }
      if (verbose) {
        debug(` # Unallocated x${repeat}`);
      }
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
