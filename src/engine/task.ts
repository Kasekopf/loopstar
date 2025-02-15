import { Item, Location, Monster } from "kolmafia";
import { Quest as BaseQuest, Task as BaseTask, Limit } from "grimoire-kolmafia";
import { CombatActions, CombatStrategy } from "./combat";
import { undelay } from "libram";

export type AcquireItem = {
  item: Item;
  num?: number;
  price?: number;
  useful?: () => boolean;
  optional?: boolean;
};

export type Quest = BaseQuest<Task>;

export enum NCForce {
  No = 0,
  Yes = 1, // After ROUTE_WAIT_TO_NCFORCE turns
  Eventually = 2, // After ROUTE_WAIT_TO_EVENTUALLY_NCFORCE turns
}

export type Task = {
  priority?: () => Priority | Priority[];
  combat?: CombatStrategy;
  delay?: number | (() => number);
  freeaction?: boolean | (() => boolean);
  freecombat?: boolean;
  limit: Limit;
  expectbeatenup?: boolean | (() => boolean);

  // The monsters to search for with orb.
  // In addition, absorb targets are always searched with the orb.
  // If not given, monsters to search for are based on the CombatStrategy.
  // If given but function returns undefined, do not use orb predictions.
  orbtargets?: () => Monster[] | undefined;
  boss?: boolean;
  ncforce?: NCForce | (() => NCForce);
  ignore_banishes?: () => boolean;
  map_the_monster?: Monster | (() => Monster); // Try and map to the given monster, if possible
  nofightingfamiliars?: boolean;
  parachute?: Monster | (() => Monster | undefined); // Try and crepe parachute to the given monster, if possible
} & BaseTask<CombatActions>;

export type Priority = {
  score: number;
  reason?: string;
};

export function hasDelay(task: Task): boolean {
  if (!task.delay) return false;
  if (!(task.do instanceof Location)) return false;
  return task.do.turnsSpent < undelay(task.delay);
}
