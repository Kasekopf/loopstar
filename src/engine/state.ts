import {
  Item,
  Location,
  Monster,
  print,
  Skill,
  toItem,
  toLocation,
  toMonster,
  toSkill,
  visitUrl,
} from "kolmafia";
import { $item, $items, $skill, get, multiSplit } from "libram";
import { args } from "../args";
import { Task } from "./task";
import { getMonsters, underStandard } from "../lib";
import { CombatActions } from "./combat";
import { CombatStrategy } from "grimoire-kolmafia";

class GameState {
  private _banishes?: BanishState;
  private _orb?: OrbState;

  banishes(): BanishState {
    if (this._banishes === undefined) {
      this._banishes = new BanishState();
    }
    return this._banishes;
  }

  orb(): OrbState {
    if (this._orb === undefined) {
      this._orb = new OrbState();
    }
    return this._orb;
  }

  invalidate() {
    this._banishes = undefined;
    this._orb = undefined;
  }
}

const banishSource = (banisher: string) => {
  if (banisher.toLowerCase() === "saber force") return $skill`Use the Force`;
  if (banisher.toLowerCase() === "nanorhino") return $skill`Unleash Nanites`;

  const item = toItem(banisher);
  if ($items`none, training scroll:  Snokebomb, tomayohawk-style reflex hammer`.includes(item)) {
    return toSkill(banisher);
  }
  return item;
};

const BANISH_ACTIONS = new Set<CombatActions>(["banish", "ignoreSoftBanish", "killBanish"]);

/**
 * A version of libram getBanishedMonsters that maintains the banishing turncounts.
 */
function getBanishedMonsters(): Map<Item | Skill, [Monster, number][]> {
  const entries = multiSplit("banishedMonsters", ":", ":", [toMonster, banishSource, Number]);
  const banishUsages = new Map<Item | Skill, [Monster, number][]>();
  for (const entry of entries) {
    if (banishUsages.has(entry[1])) banishUsages.get(entry[1])?.push([entry[0], entry[2]]);
    else banishUsages.set(entry[1], [[entry[0], entry[2]]]);
  }
  return banishUsages;
}

export class BanishState {
  // Monster => banish
  private alreadyBanished = new Map<Monster, Item | Skill>();
  // Banish => Number of parallel usages (normally 1)
  private numBanished = new Map<Item | Skill, number>();
  // Banish => Oldest banished monster
  private oldestBanished = new Map<Item | Skill, Monster>();

  constructor() {
    const banished = getBanishedMonsters();
    if (underStandard()) banished.delete($item`ice house`);
    for (const entry of banished.entries()) {
      for (const monster_turn of entry[1]) {
        this.alreadyBanished.set(monster_turn[0], entry[0]);
      }
      this.numBanished.set(entry[0], entry[1].length);
      if (entry[1].length > 1) {
        // Ensure the oldest usage appears first
        entry[1].sort((a, b) => a[1] - b[1]);
      }
      this.oldestBanished.set(entry[0], entry[1][0][0]);
    }
  }

  /**
   * Return the number of monster in the task that are banished.
   */
  numPartiallyBanished(task: Task): number {
    const targets: Monster[] = [];
    for (const action of BANISH_ACTIONS) {
      targets.push(...(task.combat?.where(action) ?? []));
    }
    if (
      BANISH_ACTIONS.has(task.combat?.getDefaultAction() ?? "ignore") &&
      task.do instanceof Location
    ) {
      for (const monster of getMonsters(task.do)) {
        const strat = task.combat?.currentStrategy(monster);
        if (BANISH_ACTIONS.has(strat ?? "ignore")) {
          targets.push(monster);
        }
      }
    }
    return targets.filter(
      (monster) =>
        this.alreadyBanished.has(monster) && this.alreadyBanished.get(monster) !== $item`ice house`
    ).length;
  }

  /**
   * Return true if all requested monsters in the task are banished.
   */
  isFullyBanished(combat?: CombatStrategy<CombatActions>): boolean {
    // Do not consider ignoreSoftBanish
    return (
      this.unbanished("banish", combat).length === 0 &&
      this.unbanished("killBanish", combat).length === 0
    );
  }

  /**
   * Return the unbanished monsters according to the provided combat strategy.
   */
  unbanished(
    banishAction: "banish" | "killBanish",
    combat?: CombatStrategy<CombatActions>
  ): Monster[] {
    return (
      combat
        ?.where(banishAction)
        ?.filter(
          (monster) =>
            !this.alreadyBanished.has(monster) && monster.phylum.toString() !== get("banishedPhyla")
        ) ?? []
    );
  }

  /**
   * Return the banish used on this monster (or undefined if not banished).
   */
  banishedWith(monster: Monster): Item | Skill | undefined {
    return this.alreadyBanished.get(monster);
  }

  /**
   * Return the monster whose banish will be overwritten if this banish
   * is used again (possibly undefined, if nothing will be overwritten).
   *
   * For single-use banishes, this is the currently banished monster.
   * For multi-use banishes, this is the [capacity]-th oldest banished monster
   * (or none if fewer than [capacity] monsters have been banished).
   *
   * @param banish The banish tracker to check.
   * @param capacity The capacity of this banish.
   */
  overwrittenMonster(banish: Item | Skill, capacity = 1): Monster | undefined {
    const usage = this.numBanished.get(banish);
    if (!usage || capacity > usage) return undefined;
    return this.oldestBanished.get(banish);
  }
}

class OrbState {
  predictions: Map<Location, Monster>;

  constructor() {
    const initialPrediction = get("crystalBallPredictions");
    visitUrl("inventory.php?ponder=1", false);
    if (get("crystalBallPredictions") !== initialPrediction && args.debug.verbose) {
      print(`Verbose: Tracking misalignment on orb.`);
    }
    this.predictions = new Map(
      get("crystalBallPredictions")
        .split("|")
        .filter(Boolean)
        .map((element) => element.split(":") as [string, string, string])
        .filter((tuple) => tuple.length === 3)
        .map(
          ([, location, monster]) =>
            [toLocation(location), toMonster(monster)] as [Location, Monster]
        )
    );
  }

  prediction(loc: Location): Monster | undefined {
    return this.predictions.get(loc);
  }
}

export const globalStateCache = new GameState();
