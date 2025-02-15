import { Item, Location, Monster, print, Skill, toLocation, toMonster, visitUrl } from "kolmafia";
import { $item, get, getBanishedMonsters } from "libram";
import { args } from "../args";
import { Task } from "./task";
import { getMonsters, underStandard } from "../lib";

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

export class BanishState {
  already_banished: Map<Monster, Item | Skill>;

  constructor() {
    const banished = getBanishedMonsters();
    if (underStandard()) banished.delete($item`ice house`);
    this.already_banished = new Map(Array.from(banished, (entry) => [entry[1], entry[0]]));
  }

  // Return true if some of the monsters in the task are banished
  isPartiallyBanished(task: Task): boolean {
    const targets: Monster[] = [];
    targets.push(...(task.combat?.where("banish") ?? []));
    targets.push(...(task.combat?.where("ignoreSoftBanish") ?? []));
    if (
      (task.combat?.getDefaultAction() === "banish" ||
        task.combat?.getDefaultAction() === "ignoreSoftBanish") &&
      task.do instanceof Location
    ) {
      for (const monster of getMonsters(task.do)) {
        const strat = task.combat?.currentStrategy(monster);
        if (strat === "banish" || strat === "ignoreSoftBanish") {
          targets.push(monster);
        }
      }
    }
    return (
      targets.find(
        (monster) =>
          this.already_banished.has(monster) &&
          this.already_banished.get(monster) !== $item`ice house`
      ) !== undefined
    );
  }

  // Return true if some of the monsters in the task are banished
  numPartiallyBanished(task: Task): number {
    const targets: Monster[] = [];
    targets.push(...(task.combat?.where("banish") ?? []));
    targets.push(...(task.combat?.where("ignoreSoftBanish") ?? []));
    if (
      (task.combat?.getDefaultAction() === "banish" ||
        task.combat?.getDefaultAction() === "ignoreSoftBanish") &&
      task.do instanceof Location
    ) {
      for (const monster of getMonsters(task.do)) {
        const strat = task.combat?.currentStrategy(monster);
        if (strat === "banish" || strat === "ignoreSoftBanish") {
          targets.push(monster);
        }
      }
    }
    return targets.filter(
      (monster) =>
        this.already_banished.has(monster) &&
        this.already_banished.get(monster) !== $item`ice house`
    ).length;
  }

  // Return true if all requested monsters in the task are banished
  isFullyBanished(task: Task): boolean {
    return (
      task.combat?.where("banish")?.find((monster) => !this.already_banished.has(monster)) ===
      undefined
    );
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
