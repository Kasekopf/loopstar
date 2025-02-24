import { Location, Monster } from "kolmafia";
import { Quest as BaseQuest, Task as BaseTask, Limit } from "grimoire-kolmafia";
import { CombatActions, CombatStrategy } from "./combat";
import { Delayed, undelay } from "libram";
import { debug } from "../lib";

export type Quest = BaseQuest<Task>;

export type Task = {
  priority?: () => Priority | Priority[];
  combat?: CombatStrategy;

  // Control safeguards
  limit: Limit;
  expectbeatenup?: boolean | (() => boolean);

  // Flags on the task for engine behavior
  freeaction?: boolean | (() => boolean);
  skipprep?: boolean | (() => boolean);
  freecombat?: boolean;
  boss?: boolean;
  nofightingfamiliars?: boolean;

  // Resources
  delay?: number | (() => number);
  ignorebanishes?: () => boolean;
  map_the_monster?: Monster | (() => Monster); // Try and map to the given monster, if possible
  parachute?: Monster | (() => Monster | undefined); // Try and crepe parachute to the given monster, if possible
  resources?: Delayed<ResourceRequest | undefined>;
  tags?: string[];
  ignoremonsters?: () => Monster[]; // Extra monsters to ignore on the combat strategy
  preferwanderer?: boolean;

  // The monsters to search for with orb.
  // In addition, absorb targets are always searched with the orb.
  // If not given, monsters to search for are based on the CombatStrategy.
  // If given but function returns undefined, do not use orb predictions.
  orbtargets?: () => Monster[] | undefined;
} & BaseTask<CombatActions>;

/**
 * A reason to run this task sooner or later than the route would suggest.
 *
 * @member score: The strength of reason; higher is sooner; see {@link ./priority.ts} for scale.
 *  Positive scores cause the task to run sooner than the route would suggest,
 *  negative scores cause the task to run later.
 * @member reason: A description for the priority change, for debugging.
 */
export type Priority = {
  score: number;
  reason?: string;
};

/**
 * Returns true if this task has delay remaining.
 */
export function hasDelay(task: Task): boolean {
  if (!task.delay) return false;
  if (!(task.do instanceof Location)) return false;
  return task.do.turnsSpent < undelay(task.delay);
}

/**
 * Get the name of this task, including tag delta tracking.
 */
export function getTaggedName(task: Task): string {
  if (!task.tags) return task.name;
  return [task.name, ...task.tags].join(" # ");
}

/**
 * Types for a task to allocate resources.
 */

/**
 * A request to allocate resources to this task (see {@link allocation.ts}).
 *
 * @member which: The type of resource to request.
 * @member benefit: The benefit incurred if this request is granted,
 *    typically in units of number of adventures saved/gained.
 * @member required: True if this task needs this resource to run.
 *    The task will be made undready if the resource is not allocated.
 * @member repeat: The number of copies of this resource to request.
 *    It is possible that only some of the requests are granted.
 * @member delta: A delta to apply to this task if the request is granted.
 */
export type ResourceRequest = {
  which: ResourceType;
  benefit: number;
  required?: boolean;
  repeat?: number;
  delta?: DeltaTask;
};

/**
 * Basic resource request types, with no additional information.
 */
export enum Resources {
  Pull = "Pull",
  NCForce = "NCForce",
  Lucky = "Lucky",
}
/**
 * Request the summoning of a particular monster.
 */
export type ResourceSummon = {
  summon: Monster;
};
/**
 * Information about the type of resource to request.
 */
export type ResourceType = Resources | ResourceSummon;

/**
 * Returns a print-friendly name for this allocation type.
 */
export function getResourceFriendlyName(allocation: ResourceType): string {
  switch (allocation) {
    case Resources.Pull:
    case Resources.NCForce:
    case Resources.Lucky:
      return allocation;
    default:
      return `{ summon: ${allocation.summon} }`;
  }
}

/**
 * A modification to a task.
 *
 * @member tag: A tag to add to tasks that apply this change (for debugging).
 * @member replace: Replace the corresponding value in the task.
 * @member amend: Modify each corresponding value in the task with a new value.
 *    DO NOT modify the original value in place; return a new (copied) object.
 * @member combine: Merge the new value with the old value in a smart way (see {@link merge}).
 */
export type DeltaTask = {
  tag?: string;
  replace?: Partial<Task>;
  amend?: Partial<Amend<Task>>;
  combine?: Partial<Pick<Task, "prepare" | "ready" | "priority">>;
};

/**
 * A modification to a task, specifying the task by name (see {@link findAndMerge}).
 *
 * @member name: The name of the task to modify.
 * @member delete: Delete this task from the list.
 *    Dependent tasks will treat this task as completed.
 */
export type NamedDeltaTask = DeltaTask & {
  name: string;
  delete?: boolean;
};

/**
 * For each field, map the old field value to a new value.
 */
type Amend<T> = {
  [Property in keyof T]: (original: T[Property]) => T[Property];
};

function compose<T>(
  func1: (() => T) | undefined,
  func2: (() => T) | undefined,
  combine: (a: T, b: T) => T
): (() => T) | undefined {
  if (!func1) return func2;
  if (!func2) return func1;
  return () => combine(func1(), func2());
}

/**
 * Returns a copy of the given task with the delta applied.
 */
export function merge(task: Task, delta: DeltaTask): Task {
  const result: Task = { ...task, ...(delta.replace ?? {}) };
  if (delta.amend) {
    for (const field in delta.amend) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fieldAmend = (delta.amend as any)[field];
      if (fieldAmend) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (result as any)[field] = fieldAmend((result as any)[field]);
      }
    }
  }
  if (delta.tag) {
    if (!result.tags) result.tags = [delta.tag];
    else result.tags = [...result.tags, delta.tag];
  }
  if (delta.combine) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    result.prepare = compose(delta.combine.prepare, result.prepare, (a, b) => undefined);
    result.ready = compose(delta.combine.ready, result.ready, (a, b) => a && b);
    result.priority = compose(delta.combine.priority, result.priority, (a, b) => {
      const aArr = Array.isArray(a) ? a : [a];
      const bArr = Array.isArray(b) ? b : [b];
      return [...aArr, ...bArr];
    });
  }
  return result;
}

/**
 * Apply the given list of deltas to a set of tasks.
 *
 * @param tasks The base task list.
 * @param deltas The deltas to apply, each to the specified task.
 * @param defaultTag A tag name to use for each delta with no tag.
 * @returns a copy of the task list with all deltas applied as specified.
 */
export function findAndMerge(
  tasks: Task[],
  deltas: NamedDeltaTask[],
  defaultTag: string | undefined = undefined,
  forceMatch = false
) {
  const taskNames = new Set<string>(tasks.map((t) => t.name));
  const deltasByName = new Map<string, NamedDeltaTask>();
  const tasksToDelete = new Set<string>();
  for (const delta of deltas) {
    if (!taskNames.has(delta.name)) {
      const tag = delta.tag ?? defaultTag ?? "delta;";
      const err = `Unable to match name ${delta.name} from ${tag}`;
      if (forceMatch) throw err;
      else debug(`Warning: ${err}`);
    }
    if (delta.delete) tasksToDelete.add(delta.name);
    else deltasByName.set(delta.name, delta);
  }

  return tasks
    .filter((task) => !tasksToDelete.has(task.name))
    .map((task) => <Task>{ ...task, after: task.after?.filter((name) => !tasksToDelete.has(name)) })
    .map((task) => {
      const delta = deltasByName.get(task.name);
      if (!delta) {
        return task;
      }
      if (!delta.tag) {
        return merge(task, { ...delta, tag: defaultTag });
      }
      return merge(task, delta);
    });
}
