import { CombatResources, EngineOptions, Outfit } from "grimoire-kolmafia";
import { ActiveTask, Engine } from "../../engine/engine";
import { CombatActions, CombatStrategy, replaceActions } from "../../engine/combat";
import {
  $effect,
  $effects,
  $item,
  $location,
  $monsters,
  ensureEffect,
  get,
  have,
  PropertiesManager,
  uneffect,
} from "libram";
import { Task } from "../../engine/task";
import {
  applyFirstAvailableFamiliarWaterBreathSource,
  applyFirstAvailableWaterBreathSource,
  doFirstAvailableFishySource,
} from "./util";
import { SeaActionDefaults } from "./combat";
import {
  abort,
  cliExecute,
  create,
  Location,
  myHp,
  myMaxhp,
  myMaxmp,
  myMp,
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
  }

  override prepare(): void {
    if (!have($effect`Fishy`)) {
      doFirstAvailableFishySource();
    }
  }

  override createOutfit(task: ActiveTask): Outfit {
    const outfit = super.createOutfit(task);

    const underwater = task.do instanceof Location && task.do.environment === "underwater";
    const waterbreathingeffects = $effects`Driving Waterproofly, Really Deep Breath, Pumped Stomach, Oxygenated Blood, Pneumatic`;

    if (underwater && waterbreathingeffects.forEach((e) => !have(e))) {
      // Player breathing
      if (!applyFirstAvailableWaterBreathSource(outfit)) {
        throw `Unable to breathe underwater for ${task.name}`;
      }

      // Familiar breathing
      if (
        outfit.familiar &&
        outfit.familiar.underwater === false &&
        !have($effect`Driving Waterproofly`)
      ) {
        if (!applyFirstAvailableFamiliarWaterBreathSource(outfit)) {
          throw `Unable to provide familiar water breathing for ${task.name}`;
        }
      }
    }

    return outfit;
  }

  override dress(task: ActiveTask, outfit: Outfit): void {
    if (have($effect`Beaten Up`)) abort();

    if (have($item`Grandma's Chartreuse Yarn`)) {
      cliExecute("grandpa note");
    }

    if (have($item`whirled peas`, 2)) {
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

  const result = task.do();
  return result instanceof Location ? result : undefined;
}

function ensureResistsForTask(task: Task): void {
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
