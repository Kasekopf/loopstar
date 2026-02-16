import { CombatResources, EngineOptions, Outfit } from "grimoire-kolmafia";
import { ActiveTask, Engine } from "../../engine/engine";
import { CombatActions, CombatStrategy, replaceActions } from "../../engine/combat";
import {
  $effect,
  $effects,
  $item,
  $location,
  $monsters,
  $path,
  $slot,
  ensureEffect,
  get,
  have,
  Macro,
  PropertiesManager,
  uneffect,
} from "libram";
import { Task } from "../../engine/task";
import { SeaActionDefaults } from "./combat";
import {
  abort,
  cliExecute,
  create,
  getWorkshed,
  Location,
  myHp,
  myMaxhp,
  myMaxmp,
  myMp,
  myPath,
  myTurncount,
  numericModifier,
  restoreHp,
  restoreMp,
  setLocation,
  use,
} from "kolmafia";
import { equipFirst } from "../../engine/outfit";
import { freekillSources } from "../../resources/freekill";
import { forceNCPossible, forceNCSources } from "../../resources/forcenc";
import { ROUTE_WAIT_TO_NCFORCE } from "../../route";
import {
  familiarWaterBreathEquips,
  familiarWaterBreathSources,
  fishySources,
  waterBreathSources,
} from "./util";

export class TheSeaEngine extends Engine {
  constructor(tasks: Task[], options: EngineOptions<CombatActions, ActiveTask> = {}) {
    if (!options.combat_defaults) {
      options.combat_defaults = new SeaActionDefaults();
    }
    super(tasks, options);
  }

  override customize(
    task: ActiveTask,
    outfit: Outfit,
    combat: CombatStrategy,
    resources: CombatResources<CombatActions>
  ): void {
    // Add your custom combat behavior
    combat.action("killHard", $monsters`time cop, some fish`);

    if (combat.can("killFree")) resources.provide("killFree", equipFirst(outfit, freekillSources));

    if (
      forceNCPossible() &&
      !(task.do instanceof Location) &&
      !get("noncombatForcerActive") &&
      myTurncount() >= ROUTE_WAIT_TO_NCFORCE
    ) {
      if (
        task.availableTasks?.find((t) => t.tags?.includes("NCForce") && t.name !== task.name) !==
        undefined
      ) {
        const ncforcer = equipFirst(outfit, forceNCSources);
        if (ncforcer) {
          combat.macro(ncforcer.do, undefined, true);
        }
      }
    }

    // Upgrade normal kills to free kills if provided
    if (resources.has("killFree") && !task.boss) {
      replaceActions(combat, "kill", "killFree");
      replaceActions(combat, "killItem", "killFree");
    }

    // Let the base engine do its thing
    super.customize(task, outfit, combat, resources);

    // If we added a generic familiar that cannot breath water,
    // we need to override the familiar equip and hope nothing too bad happens
    if (outfit.familiar && !outfit.familiar.underwater) {
      if (getWorkshed() !== $item`Asdon Martin keyfob (on ring)`) {
        const famequip = outfit.equips.get($slot`familiar`) ?? $item`none`;
        if (!familiarWaterBreathEquips.includes(famequip)) {
          const firstFamiliarWaterBreath = familiarWaterBreathEquips.find((e) => have(e));
          if (!firstFamiliarWaterBreath) {
            throw `Unable to provide familiar water breathing for ${task.name}`;
          }
          outfit.equips.set($slot`familiar`, firstFamiliarWaterBreath);
        }
      }
    }

    // Train the sea lasso all the time
    if (!task.freeaction && get("lassoTrainingCount") < 18 && have($item`sea lasso`)) {
      combat.startingMacro(Macro.tryItem($item`sea lasso`));
    }
  }

  override createOutfit(task: ActiveTask): Outfit {
    const outfit = super.createOutfit(task);

    const locationUnderwater = task.do instanceof Location && task.do.environment === "underwater";
    if (task.underwater || locationUnderwater) {
      const playerBreathing = equipFirst(outfit, waterBreathSources);
      if (!playerBreathing) {
        throw `Unable to breath underwater for ${task.name}`;
      }
      if (playerBreathing.prepare) {
        outfit.afterDress(playerBreathing.prepare);
      }

      const fishy = equipFirst(outfit, fishySources);
      if (!fishy) {
        throw `Unable to become fishy`;
      }
      if (fishy.prepare) {
        outfit.afterDress(fishy.prepare);
      }

      if (outfit.familiar && !outfit.familiar.underwater) {
        const familiarBreathing = equipFirst(outfit, familiarWaterBreathSources);
        if (!familiarBreathing) {
          throw `Unable to provide familiar water breathing for ${task.name}`;
        }
        if (familiarBreathing.prepare) {
          outfit.afterDress(familiarBreathing.prepare);
        }
      }
    }
    return outfit;
  }

  override dress(task: ActiveTask, outfit: Outfit): void {
    if (have($effect`Beaten Up`)) abort();

    if (have($item`whirled peas`, 2) && !have($item`handful of split pea soup`)) {
      create($item`handful of split pea soup`);
    }

    if (task.do instanceof Location) setLocation(task.do);
    outfit.dress();

    if (myHp() < 200 && myHp() < myMaxhp()) {
      restoreHp(myMaxhp());
    }

    if (myMp() < 200 && myMp() < myMaxmp()) {
      restoreMp(600);
    }

    if (
      task.do instanceof Location &&
      task.do === $location`Shadow Rift (The Misspelled Cemetary)` &&
      myHp() < myMaxhp() * 0.95
    ) {
      restoreHp(myMaxhp());
    }

    const modifier = outfit.modifier.join(",");

    if (modifier === "-combat") {
      const effects = $effects`Smooth Movements, The Sonata of Sneakiness, Hiding From Seekers, Wild and Westy!, Ultra-Soft Steps`;
      uneffect($effect`Fat Leon's Phat Loot Lyric`);
      effects.forEach(ensureEffect);
    } else if (modifier === "item") {
      $effects`The Sonata of Sneakiness, Ode to Booze`.forEach(uneffect);
      $effects`Donho's Bubbly Ballad, Fat Leon's Phat Loot Lyric, The Ballad of Richie Thingfinder, `.forEach(
        ensureEffect
      );
    } else if (modifier === "+combat") {
      $effects`The Sonata of Sneakiness, Ode to Booze, Fat Leon's Phat Loot Lyric`.forEach(
        uneffect
      );
      $effects`Crunchy Steps, Carlweather's Cantata of Confrontation, Musk of the Moose, Attracting Snakes, Bloodbathed, Towering Muscles`.forEach(
        ensureEffect
      );
    }

    ensureResistsForTask(task);
  }

  override setChoices(task: ActiveTask, manager: PropertiesManager): void {
    super.setChoices(task, manager);

    manager.setChoices({
      1528: 1,
    });
  }
}

const pearlResists = new Map<Location, string>([
  [$location`Anemone Mine`, "Spooky resistance"],
  [$location`The Dive Bar`, "Sleaze resistance"],
  [$location`Madness Reef`, "Stench resistance"],
  [$location`The Marinara Trench`, "Hot resistance"],
  [$location`The Briniest Deepests`, "Cold resistance"],
]);

function taskLocation(task: Task): Location | undefined {
  if (task.do instanceof Location) return task.do;

  // Running task.do on most tasks here will cause it to be run twice
  // Hack a special-case for these two tasks until they are fixed
  if (!task.name.includes("Do Habs") && !task.name.includes("Get Pearls")) return undefined;

  const result = task.do();
  return result instanceof Location ? result : undefined;
}

function ensureResistsForTask(task: Task): void {
  if (myPath() !== $path`11,037 Leagues Under the Sea`) return;
  const location = taskLocation(task);
  if (!location) return;

  const pearlResist = pearlResists.get(location);
  if (!pearlResist) return;

  if (!have($effect`Minor Invulnerability`)) {
    use($item`scroll of minor invulnerability`);
  }

  if (numericModifier(pearlResist) < 18) {
    cliExecute(`maximize ${pearlResist}`);
    if (numericModifier(pearlResist) < 18) {
      throw `Could not reach desired ${pearlResist} for ${location}`;
    }
  }
}
