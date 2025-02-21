import { Location, Monster } from "kolmafia";
import { Quest as BaseQuest, Task as BaseTask, Limit } from "grimoire-kolmafia";
import { CombatActions, CombatStrategy } from "./combat";
import { Delayed, undelay } from "libram";
import { Delta, mergeDelta } from "../lib";

export type Quest = BaseQuest<Task>;

export type Task = {
  priority?: () => Priority | Priority[];
  combat?: CombatStrategy;
  delay?: number | (() => number);
  freeaction?: boolean | (() => boolean);
  skipprep?: boolean | (() => boolean);
  freecombat?: boolean;
  limit: Limit;
  expectbeatenup?: boolean | (() => boolean);

  // The monsters to search for with orb.
  // In addition, absorb targets are always searched with the orb.
  // If not given, monsters to search for are based on the CombatStrategy.
  // If given but function returns undefined, do not use orb predictions.
  orbtargets?: () => Monster[] | undefined;
  boss?: boolean;
  ignore_banishes?: () => boolean;
  map_the_monster?: Monster | (() => Monster); // Try and map to the given monster, if possible
  nofightingfamiliars?: boolean;
  parachute?: Monster | (() => Monster | undefined); // Try and crepe parachute to the given monster, if possible

  resources?: Delayed<AllocationRequest | undefined>;
  tags?: string[];
} & BaseTask<CombatActions>;

export type DeltaTask = Delta<Task> & {
  tag?: string;
  combine?: Partial<Pick<Task, "prepare" | "ready" | "priority">>;
};

export function getTaggedName(task: Task): string {
  if (!task.tags) return task.name;
  return [task.name, ...task.tags].join(" # ");
}

function compose<T>(
  func1: (() => T) | undefined,
  func2: (() => T) | undefined,
  combine: (a: T, b: T) => T
): (() => T) | undefined {
  if (!func1) return func2;
  if (!func2) return func1;
  return () => combine(func1(), func2());
}

export function merge(task: Task, delta: DeltaTask): Task {
  const result = mergeDelta(task, delta);
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

export type Priority = {
  score: number;
  reason?: string;
};

export function hasDelay(task: Task): boolean {
  if (!task.delay) return false;
  if (!(task.do instanceof Location)) return false;
  return task.do.turnsSpent < undelay(task.delay);
}

export enum Allocations {
  Pull,
  NCForce,
  Lucky,
}
export type AllocationSummon = {
  summon: Monster;
};
export type Allocation = Allocations | AllocationSummon;

export type AllocationRequest = {
  which: Allocation;
  value: number;
  required?: boolean;
  repeat?: number;
  delta?: DeltaTask;
};
