/**
 * Temporary priorities that override the routing.
 */

import { familiarWeight, getCounter, Location, Monster, myLocation, myPath } from "kolmafia";
import {
  $effect,
  $familiar,
  $item,
  $location,
  $path,
  $skill,
  Environment,
  get,
  getTodaysHolidayWanderers,
  have,
  undelay,
} from "libram";
import { CombatStrategy } from "./combat";
import { moodCompatible } from "./moods";
import { hasDelay, Priority, Task } from "./task";
import { globalStateCache } from "./state";
import { canEquipResource, getModifiersFrom } from "./outfit";
import { Outfit } from "grimoire-kolmafia";
import { args } from "../args";
import { forceItemSources, yellowRaySources } from "../resources/yellowray";
import { ChainSource, WandererSource, wandererSources } from "../resources/wanderer";
import { getActiveBackupTarget } from "../resources/backup";
import { breathitinProgress, BreathitinStates, cosmicBowlingBallReady } from "../lib";
import { asdonBanishAvailable } from "../resources/runaway";
import { globalAbsorbState } from "../paths/gyou/absorb";

export class Priorities {
  static Always: Priority = { score: 40000, reason: "Forced" };
  static Pull: Priority = { score: 20000, reason: "Pull" };
  static Free: Priority = { score: 10000, reason: "Free action" };
  static LastCopyableMonster: Priority = { score: 4000, reason: "Copy last monster" };
  static GoodFeelNostalgia: Priority = { score: 3999, reason: "Feel Nostalgia is ready" };
  static ChainWanderer: Priority = { score: 2300, reason: "Wanderer + Chain" };
  static BestWanderer: Priority = { score: 2200, reason: "Wanderer [Preferred]" };
  static Wanderer: Priority = { score: 2000, reason: "Wanderer" };
  static GoodForceNC: Priority = { score: 1000, reason: "Forcing NC" };
  static Start: Priority = { score: 900, reason: "Initial tasks" };
  static Effect: Priority = { score: 20, reason: "Useful effect" };
  static GoodOrb: Priority = { score: 15, reason: "Target orb monster" };
  static BestCosmicBowlingBall: Priority = {
    score: 14,
    reason: "Use cosmic bowling ball + Melodramedary",
  };
  static CosmicBowlingBall: Priority = { score: 11, reason: "Use cosmic bowling ball" };
  static SpringShoes: Priority = { score: 11, reason: "Use spring shoes" };
  static AsdonMartin: Priority = { score: 11, reason: "Use asdon martin" };
  static GoodYR: Priority = { score: 10, reason: "Yellow ray" };
  static GoodDarts: Priority = { score: 9, reason: "Darts Bullseye is ready" };
  static GoodCandelabra: Priority = { score: 8, reason: "Purple Candle is ready" };
  static GoodCleaver: Priority = { score: 5, reason: "Cleaver is ready" };
  static GoodAutumnaton: Priority = { score: 4, reason: "Setup Autumnaton" };
  static GoodCamel: Priority = { score: 3, reason: "Melodramedary is ready" };
  static MinorEffect: Priority = { score: 2, reason: "Useful minor effect" };
  static GoodLocation: Priority = { score: 1.5, reason: "Last location is useful" };
  static GoodBanish3: Priority = { score: 0.7, reason: "3+ banishes committed" };
  static GoodBanish2: Priority = { score: 0.6, reason: "2 banishes committed" };
  static GoodBanish: Priority = { score: 0.5, reason: "1 banish committed" };
  static GoodExtend: Priority = { score: 0.11, reason: "No-fight for Breathitin" };
  static GoodUnderground: Priority = { score: 0.1, reason: "Underground for Breathitin" };
  static SeekJellyfish: Priority = { score: 0.1, reason: "Get Spectral Jellyfish" };
  static None: Priority = { score: 0 };
  static BadForcingNC: Priority = { score: -0.4, reason: "Not forcing NC" };
  static BadAutumnaton: Priority = { score: -2, reason: "Autumnaton in use here" };
  static BadTrain: Priority = { score: -3, reason: "Use Trainset" };
  static BadOrb: Priority = { score: -4, reason: "Avoid orb monster" };
  static BadCamel: Priority = { score: -5, reason: "Waiting for Melodramedary" };
  static BadHoliday: Priority = { score: -10 };
  static BadYR: Priority = { score: -16, reason: "Too early for yellow ray" };
  static BadSweat: Priority = { score: -20, reason: "Not enough sweat" };
  static BadProtonic: Priority = { score: -40, reason: "Protonic ghost here" };
  static BadStats: Priority = { score: -50, reason: "Low stats" };
  static BadMood: Priority = { score: -100, reason: "Wrong effects" };
  static Last: Priority = { score: -10000, reason: "Only if nothing else" };
}

export class Prioritization {
  private priorities = new Set<Priority>();
  private _orbMonster?: Monster = undefined;
  private _wanderer?: WandererSource = undefined;
  private _chain?: ChainSource = undefined;

  static fixed(priority: Priority) {
    const result = new Prioritization();
    result.priorities.add(priority);
    return result;
  }

  static from(task: Task, outfit: Outfit, chainSources: ChainSource[]): Prioritization {
    const result = new Prioritization();
    const base = task.priority?.() ?? Priorities.None;

    if (Array.isArray(base)) {
      for (const priority of base) result.priorities.add(priority);
    } else {
      if (base !== Priorities.None) result.priorities.add(base);
    }

    // Prioritize free tasks
    if (undelay(task.freeaction)) {
      result.priorities.add(Priorities.Free);
    }

    // Prioritize utilizing NC forces
    if (get("noncombatForcerActive") && task.tags?.includes("NCForce")) {
      result.priorities.add(Priorities.GoodForceNC);
    }

    // Prioritize getting a YR
    const yr_needed =
      task.combat?.can("yellowRay") ||
      (task.combat?.can("forceItems") && !forceItemSources.find((s) => s.available()));
    if (yr_needed && yellowRaySources.find((yr) => yr.available())) {
      if (have($effect`Everything Looks Yellow`)) {
        if (!have($skill`Emotionally Chipped`) || get("_feelEnvyUsed") === 3)
          result.priorities.add(Priorities.BadYR);
      } else result.priorities.add(Priorities.GoodYR);
    }

    // Ensure that the current +/- combat effects are compatible
    //  (Macguffin/Forest is tough and doesn't need much +combat; just power though)
    const modifier = getModifiersFrom(outfit);
    if (!moodCompatible(modifier) && task.name !== "Macguffin/Forest") {
      result.priorities.add(Priorities.BadMood);
    }

    // Burn off desert debuffs
    if (
      (have($effect`Prestidigysfunction`) || have($effect`Turned Into a Skeleton`)) &&
      task.combat &&
      task.combat.can("killItem")
    ) {
      result.priorities.add(Priorities.BadMood);
    }

    // If we have already used banishes in the zone, prefer it
    if (!task?.ignorebanishes?.()) {
      const numBanished = globalStateCache.banishes().numPartiallyBanished(task);
      if (numBanished === 1) result.priorities.add(Priorities.GoodBanish);
      else if (numBanished === 2) result.priorities.add(Priorities.GoodBanish2);
      else if (numBanished >= 3) result.priorities.add(Priorities.GoodBanish3);
    }

    // Avoid ML boosting zones when a scaling holiday wanderer is due
    if (modifier?.includes("ML") && !modifier.match("-[\\d .]*ML")) {
      if (getTodaysHolidayWanderers().length > 0 && getCounter("holiday") <= 0) {
        result.priorities.add(Priorities.BadHoliday);
      }
    }

    // Delay if there is a protonic ghost we have not killed
    if (
      have($item`protonic accelerator pack`) &&
      get("questPAGhost") !== "unstarted" &&
      get("ghostLocation") &&
      get("ghostLocation") === task.do
    )
      result.priorities.add(Priorities.BadProtonic);

    // Prioritize the parachute
    const parachuteTarget = undelay(task.parachute);
    if (
      parachuteTarget &&
      have($item`crepe paper parachute cape`) &&
      !have($effect`Everything looks Beige`)
    ) {
      // Consider using the June cleaver noncombat to prepare the right zone
      if (
        have($item`June cleaver`) &&
        get("_juneCleaverFightsLeft") === 0 &&
        // Needing the Saber to force items is more important
        (!task.combat?.can("forceItems") ||
          !have($item`Fourth of May Cosplay Saber`) ||
          get("_saberForceUses") >= 5)
      )
        result.priorities.add(Priorities.GoodCleaver);

      // Prefer parachute if the last location is set correctly
      if (task.do instanceof Location && task.do === myLocation())
        result.priorities.add(Priorities.GoodLocation);
    }

    // Dodge useless monsters with the orb
    if (task.do instanceof Location && !result.priorities.has(Priorities.GoodLocation)) {
      const next_monster = globalStateCache.orb().prediction(task.do);
      if (next_monster !== undefined) {
        result._orbMonster = next_monster;
        result.priorities.add(orbPriority(task, next_monster));
      }
    }

    // Consider (more expensive to compute) ways to burn delay
    const delayRemaing = hasDelay(task);
    if (delayRemaing) {
      // Consider backing up a monster into the task
      if (have($item`backup camera`) && get("_backUpUses") < 11 - args.resources.savebackups) {
        const backup = getActiveBackupTarget();
        if (backup) {
          if (outfit.canEquip($item`backup camera`)) {
            result.priorities.add(Priorities.LastCopyableMonster);
          }
        }
      }

      // Consider using a wandering monster
      const wanderer = wandererSources.find(
        (source) => source.available() && source.chance() === 1
      );
      if (wanderer && (!wanderer.fulloutfit || !undelay(task.outfit))) {
        const matchedSpec = canEquipResource(outfit, wanderer);
        if (matchedSpec !== undefined) {
          const wandererOutfit = outfit.clone();
          wandererOutfit.equip(matchedSpec);
          const chainable = chainSources.find(
            (source) =>
              source.available() &&
              wandererOutfit.canEquip(source.equip) &&
              source.length <= delayRemaing
          );
          if (chainable && wanderer.chainable && !task.nochain) {
            result.priorities.add(Priorities.ChainWanderer);
            result._chain = chainable;
          } else if (task.preferwanderer) {
            result.priorities.add(Priorities.BestWanderer);
          } else {
            result.priorities.add(Priorities.Wanderer);
          }
          result._wanderer = wanderer;
        }
      }
    }

    // Prefer tasks where the cosmic bowling ball is useful
    const location = task.do instanceof Location ? task.do : $location`none`;
    const runawayUseful =
      task.combat === undefined ||
      task.combat.can("ignore") ||
      task.combat.can("banish") ||
      task.combat.getDefaultAction() === undefined;
    const runawayMayNotBeUseful =
      task.combat?.can("kill") ||
      task.combat?.can("killHard") ||
      task.combat?.can("killItem") ||
      task.combat?.can("killFree") ||
      task.combat?.can("forceItems") ||
      task.combat?.can("yellowRay");
    const locationDenylist = [
      $location`The Shore, Inc. Travel Agency`,
      $location`The Hidden Temple`,
      $location`The Oasis`,
      $location`Lair of the Ninja Snowmen`,
      $location`A-Boo Peak`,
      $location`The eXtreme Slope`,
    ];
    const locationAllowlist = [
      $location`The Haunted Bathroom`,
      $location`The Castle in the Clouds in the Sky (Top Floor)`,
      $location`Lair of the Ninja Snowmen`,
      $location`The Batrat and Ratbat Burrow`,
    ];
    // Don't use asdon when it would mess up tracking
    // (from non-banishable monsters)
    const asdonDenylist = ["Tavern/Basement", "Bat/Boss Bat"];
    if (!result._wanderer) {
      if (
        locationAllowlist.includes(location) ||
        (!task.freeaction &&
          !task.freecombat &&
          runawayUseful &&
          !runawayMayNotBeUseful &&
          !locationDenylist.includes(location) &&
          !task.tags?.includes("NCForce") &&
          !task.name.startsWith("Tower"))
      ) {
        if (cosmicBowlingBallReady()) result.priorities.add(Priorities.CosmicBowlingBall);
        else if (have($item`spring shoes`) && !have($effect`Everything Looks Green`))
          result.priorities.add(Priorities.SpringShoes);
        else if (asdonBanishAvailable() && !asdonDenylist.includes(task.name))
          result.priorities.add(Priorities.AsdonMartin);
      }
    }

    if (result._wanderer) {
      result.priorities.delete(Priorities.GoodDarts);
    }

    if (args.minor.breathitin) {
      const breathStatus = breathitinProgress();
      if (
        breathStatus === BreathitinStates.UNDERGROUND &&
        task.do instanceof Location &&
        task.do.environment === Environment.Underground
      ) {
        result.priorities.add(Priorities.GoodUnderground);
      } else if (breathStatus === BreathitinStates.EXTEND && task.nofight) {
        result.priorities.add(Priorities.GoodExtend);
      }
    }
    return result;
  }

  private fillWhenExists(explanation: string, tag: string, replacement: string) {
    if (replacement) return explanation.replace(tag, `${replacement}`);
    return explanation;
  }

  public explain(): string {
    const result = [...this.priorities]
      .map((priority) => priority.reason)
      .filter((priority) => priority !== undefined)
      .join(", ");
    const withOrb = this.fillWhenExists(result, "orb monster", `${this._orbMonster ?? ""}`);
    const withWanderer = this.fillWhenExists(
      withOrb,
      "Wanderer",
      `Wandering ${this._wanderer?.name ?? ""}`
    );
    const withChain = this.fillWhenExists(withWanderer, "Chain", `${this._chain?.name ?? ""}`);
    return withChain;
  }

  public explainWithColor(): string | undefined {
    const result = [...this.priorities]
      .map((priority) => {
        if (priority.reason === undefined) return undefined;
        if (priority.score > 0) return `<font color='blue'>${priority.reason}</font>,`;
        else if (priority.score < 0) return `<font color='red'>${priority.reason}</font>,`;
        else return undefined;
      })
      .filter((priority) => priority !== undefined)
      .join(" ");
    if (result === undefined || result.length === 0) return undefined;

    const trimmedResult = result.slice(0, -1);
    const withOrb = this.fillWhenExists(trimmedResult, "orb monster", `${this._orbMonster ?? ""}`);
    const withWanderer = this.fillWhenExists(
      withOrb,
      "Wanderer",
      `Wandering ${this._wanderer?.name ?? ""}`
    );
    const withChain = this.fillWhenExists(withWanderer, "Chain", `${this._chain?.name ?? ""}`);
    return withChain;
  }

  public has(priorty: Priority) {
    for (const prior of this.priorities) {
      if (prior.score === priorty.score) return true;
    }
    return false;
  }

  public wanderer(): WandererSource | undefined {
    return this._wanderer;
  }

  public chain(): ChainSource | undefined {
    return this._chain;
  }

  public delete(p: Priority) {
    this.priorities.delete(p);
  }

  public add(p: Priority) {
    this.priorities.add(p);
  }

  public score(): number {
    let result = 0;
    for (const priority of this.priorities) {
      result += priority.score;
    }
    return result;
  }
}

function orbPriority(task: Task, monster: Monster): Priority {
  if (!(task.do instanceof Location)) return Priorities.None;

  // Determine any path-specific orb targetting
  let pathTargets = new Set<Monster>();
  if (myPath() === $path`Grey You`) {
    // If the goose is not charged, do not aim to reprocess
    if (globalAbsorbState.isReprocessTarget(monster) && familiarWeight($familiar`Grey Goose`) < 6)
      return Priorities.None;
    pathTargets = globalAbsorbState.getActiveTargets(task.do);
  }

  // Determine if a monster is useful or not based on the combat goals
  if (task.orbtargets === undefined) {
    const task_combat = task.combat ?? new CombatStrategy();
    const next_monster_strategy = task_combat.currentStrategy(monster);

    const next_useless =
      !pathTargets.has(monster) &&
      (next_monster_strategy === "ignore" ||
        next_monster_strategy === "ignoreNoBanish" ||
        next_monster_strategy === "ignoreSoftBanish" ||
        next_monster_strategy === "banish" ||
        next_monster_strategy === undefined);

    const others_useless =
      task_combat.can("ignore") ||
      task_combat.can("ignoreNoBanish") ||
      task_combat.can("banish") ||
      task_combat.can("ignoreSoftBanish") ||
      task_combat.getDefaultAction() === undefined;

    const others_useful =
      task_combat.can("kill") ||
      task_combat.can("killFree") ||
      task_combat.can("killHard") ||
      task_combat.can("killItem") ||
      pathTargets.size;

    if (next_useless && others_useful) {
      return Priorities.BadOrb;
    } else if (!next_useless && others_useless) {
      return Priorities.GoodOrb;
    } else {
      return Priorities.None;
    }
  }

  // Use orbtargets to decide if the next monster is useful
  const taskTargets = task.orbtargets() ?? [];
  const targets = [...taskTargets, ...pathTargets];
  if (targets === undefined) return Priorities.None;
  if (targets.length === 0) return Priorities.None;
  if (targets.find((t) => t === monster) === undefined) {
    return Priorities.BadOrb;
  } else {
    return Priorities.GoodOrb;
  }
}
