import { CombatResources, EngineOptions, Outfit } from "grimoire-kolmafia";
import { ActiveTask, Engine } from "../../engine/engine";
import { CombatActions, CombatStrategy } from "../../engine/combat";
import { $effect, $effects, $familiar, $item, $items, $location, $monsters, Counter, ensureEffect, have, PropertiesManager, undelay, uneffect } from "libram";
import { Task } from "../../engine/task";
import { doFirstAvailableFishySource, doFirstAvailableWaterBreathSource } from "./util";
import { SeaActionDefaults } from "./combat";
import { abort, cliExecute, create, Location, myHp, myMaxhp, myMaxmp, myMp, numericModifier, print, restoreHp, restoreMp, setLocation, use } from "kolmafia";

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
    combat.action("killHard", $monsters`time cop`);

    // Let the base engine do its thing
    super.customize(task, outfit, combat, resources);
  }

  override prepare(): void {
    if (!have($effect`Driving Waterproofly`)) {
      doFirstAvailableWaterBreathSource();
    }
    if (!have($effect`fishy`)) {
      doFirstAvailableFishySource();
    }
  }

  override createOutfit(task: ActiveTask): Outfit {
    print("Running createOutfit for task");
    print(task.name);

    const outfit = super.createOutfit(task);

    const underwater =
      (task.do instanceof Location && task.do.environment === "underwater");

    if (underwater) {
      if (
        !(
          outfit.haveEquipped($item`Mer-kin gladiator mask`) ||
          outfit.haveEquipped($item`Mer-kin scholar mask`) ||
          outfit.haveEquipped($item`crappy Mer-kin mask`) ||
          outfit.haveEquipped($item`old SCUBA tank`)
        )
      ) {
        if (!outfit.equip($item`really, really nice swimming trunks`)) {
          throw `Unable to breathe underwater for ${task.name}`;
        }
      }

      if (!outfit.familiar?.underwater) {
        if (have($item`das boot`)) {
          if (!outfit.equip($item`das boot`)) {
            throw `Unable to breathe underwater for ${task.name}`;
          }
        } else {
          if (!outfit.equip($item`little bitty bathysphere`)) {
            throw `Unable to breathe underwater for ${task.name}`;
          }
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
      const effects = $effects`
        Smooth Movements,
        Chorale of Companionship,
        The Sonata of Sneakiness,
        Hiding From Seekers,
        Wild and Westy!,
        Ultra-Soft Steps
      `;
      uneffect($effect`Fat Leon's Phat Loot Lyric`);
      effects.forEach(ensureEffect);
    } else if (modifier === "item") {
      $effects`The Sonata of Sneakiness, Ode to Booze`.forEach(uneffect);
      $effects`
        Donho's Bubbly Ballad,
        Fat Leon's Phat Loot Lyric,
        The Ballad of Richie Thingfinder,
        Chorale of Companionship
      `.forEach(ensureEffect);
    } else if (modifier === "+combat") {
      $effects`
        The Sonata of Sneakiness,
        Ode to Booze,
        Fat Leon's Phat Loot Lyric
      `.forEach(uneffect);
      $effects`
        Crunchy Steps,
        Carlweather's Cantata of Confrontation,
        Musk of the Moose,
        Attracting Snakes,
        Bloodbathed,
        Towering Muscles
      `.forEach(ensureEffect);
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
  [$location`Dive Bar`, "Sleaze resistance"],
  [$location`Madness Reef`, "Stench resistance"],
  [$location`Marinara Trench`, "Hot resistance"],
  [$location`The Briniest Deepests`, "Cold resistance"]
])

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
    throw `Could not reach desired ${pearlResist} for ${location}`;
  }
}
