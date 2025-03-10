import {
  autosell,
  autosellPrice,
  familiarWeight,
  getInventory,
  historicalPrice,
  Item,
  itemAmount,
  Location,
  myAdventures,
  myPath,
  myTurncount,
  overdrink,
  print,
  putCloset,
  toInt,
  toMonster,
  visitUrl,
} from "kolmafia";
import {
  $familiar,
  $item,
  $items,
  $monster,
  $path,
  $skill,
  get,
  getKramcoWandererChance,
  have,
  Macro,
  set,
  undelay,
} from "libram";
import { CombatActions, CombatStrategy, replaceActions } from "../../engine/combat";
import { CombatResources, EngineOptions, Outfit } from "grimoire-kolmafia";
import { ActiveTask, Engine } from "../../engine/engine";
import { globalAbsorbState } from "./absorb";
import { Priorities } from "../../engine/priority";
import { globalStateCache } from "../../engine/state";
import { getModifiersFrom } from "../../engine/outfit";
import { toTempPref } from "../../args";
import { atLevel, debug } from "../../lib";
import { GyouActionDefaults } from "./combat";
import { Task } from "../../engine/task";

export class GyouEngine extends Engine {
  constructor(tasks: Task[], options: EngineOptions<CombatActions, ActiveTask> = {}) {
    if (!options.combat_defaults) options.combat_defaults = new GyouActionDefaults();
    super(tasks, options);
  }

  public available(task: ActiveTask): boolean {
    // Wait until we get Infinite Loop before doing most things
    if (task.do instanceof Location && !have($skill`Infinite Loop`)) return false;

    return super.available(task);
  }

  customize(
    task: ActiveTask,
    outfit: Outfit,
    combat: CombatStrategy,
    resources: CombatResources<CombatActions>
  ): void {
    let goose_weight_in_use = false;

    // Try to use the goose for stats, if we can
    if (
      mayLaunchGooseForStats() &&
      !undelay(task.freeaction) &&
      task.name !== "Summon/Pygmy Witch Lawyer"
    ) {
      if (outfit.equip($familiar`Grey Goose`)) {
        combat.macro(new Macro().trySkill($skill`Convert Matter to Pomade`), undefined, true);
        goose_weight_in_use = true;
      }
    }

    // Absorb targeted monsters
    if (task.do instanceof Location) {
      for (const monster of globalAbsorbState.getActiveTargets(task.do)) {
        if (globalAbsorbState.isReprocessTarget(monster) && !goose_weight_in_use) {
          outfit.equip($familiar`Grey Goose`);
          combat.autoattack(new Macro().trySkill($skill`Re-Process Matter`), monster);
          combat.macro(new Macro().trySkill($skill`Re-Process Matter`), monster, true);
          debug(`Target x2: ${monster.name}`, "purple");
        } else {
          debug(`Target: ${monster.name}`, "purple");
        }
        const strategy = combat.currentStrategy(monster);
        if (
          strategy === "ignore" ||
          strategy === "banish" ||
          strategy === "ignoreNoBanish" ||
          strategy === "ignoreSoftBanish"
        ) {
          combat.action("kill", monster); // TODO: KillBanish for Banish, KillNoBanish for IgnoreNoBanish
        }
      }
    }

    // Before L11, it is more important to level up than runaway
    if (!atLevel(11)) {
      replaceActions(combat, "ignore", "kill");
      replaceActions(combat, "ignoreSoftBanish", "kill");
      replaceActions(combat, "ignoreNoBanish", "kill");
    }

    super.customize(task, outfit, combat, resources);
  }

  do(task: ActiveTask): void {
    const start_advs = myAdventures();
    const goose_weight = familiarWeight($familiar`Grey Goose`);
    const reprocess_targets = get("gooseReprocessed");

    super.do(task);

    // If adventures went up and the goose weight went down, we probably reprocessed
    const reprocessed =
      familiarWeight($familiar`Grey Goose`) < goose_weight && myAdventures() >= start_advs + 4;
    const monster = toMonster(get("lastEncounter", ""));
    if (reprocessed && get("gooseReprocessed") === reprocess_targets) {
      print(`WARNING: Probably reprocessed ${monster} but mafia did not notice.`, "red");
      if (monster === $monster`none`) {
        print("WARNING: But we were unable to tell with lastEncounter what was fought.");
      } else {
        const untracked = get(toTempPref("untrackedGooseReprocessed"));
        const new_untracked = untracked.length > 0 ? `,${monster.id}` : `${monster.id}`;
        set(toTempPref("untrackedGooseReprocessed"), new_untracked);
        globalStateCache.invalidate();
      }
    }
  }

  customizeOutfitInitial(outfit: Outfit): void {
    // Use goose for +item instead of jill
    const modifier = getModifiersFrom(outfit);
    if (modifier.includes("item")) {
      outfit.equip($familiar`Grey Goose`);
    }
    super.customizeOutfitInitial(outfit);
  }

  customizeOutfitCharging(
    task: ActiveTask,
    outfit: Outfit,
    mightKillSomething: boolean,
    noFightingFamiliars: boolean
  ): void {
    // Charge exp on the Grey Goose when needed
    if (needGooseCharge(task, outfit)) {
      if (outfit.equip($familiar`Grey Goose`)) {
        const modifier = getModifiersFrom(outfit);
        outfit.equip($item`yule hatchet`);
        if (!atLevel(11)) outfit.equip($item`teacher's pen`);

        // Use latte mug for familiar exp
        if (
          !modifier.includes("-combat") &&
          have($item`latte lovers member's mug`) &&
          get("latteModifier").includes("Experience (familiar): 3")
        ) {
          outfit.equip($item`latte lovers member's mug`);
        }

        // Equip an offhand if it is not needed for the -combat umbrella
        if (
          !modifier.includes("-combat") ||
          have($skill`Photonic Shroud`) ||
          !have($item`unbreakable umbrella`)
        ) {
          outfit.equip($item`ghostly reins`);
          outfit.equip($item`familiar scrapbook`);
        }

        // Equip familiar equipment
        outfit.equip($item`toy Cupid bow`);
        outfit.equip($item`grey down vest`);

        if (modifier.length === 0) outfit.equip($item`teacher's pen`);
      }
    }

    // Determine if it is useful to target monsters with an orb (with no predictions).
    // 1. If task.orbtargets is undefined, then use an orb if there are absorb targets.
    // 2. If task.orbtargets() is undefined, an orb is detrimental in this zone, do not use it.
    // 3. Otherwise, use an orb if task.orbtargets() is nonempty, or if there are absorb targets.
    const orb_targets = task.orbtargets?.();
    const has_absorb_targets =
      task.do instanceof Location
        ? globalAbsorbState.hasTargets(task.do) || globalAbsorbState.hasReprocessTargets(task.do)
        : false;
    const orb_useful =
      task.orbtargets === undefined
        ? has_absorb_targets
        : orb_targets !== undefined && (orb_targets.length > 0 || has_absorb_targets);
    if (orb_useful && !outfit.skipDefaults) {
      outfit.equip($item`miniature crystal ball`);
    }

    super.customizeOutfitCharging(task, outfit, mightKillSomething, noFightingFamiliars);
  }

  post(task: ActiveTask): void {
    super.post(task);
    absorbConsumables();
    globalAbsorbState.refresh();
  }
}

export function mayLaunchGooseForStats() {
  // Launch early on if we have short-order cook
  return familiarWeight($familiar`Grey Goose`) >= 9 && myTurncount() < 5;
}

const consumables_blacklist = new Set<Item>(
  $items`wet stew, wet stunt nut stew, stunt nuts, astral pilsner, astral hot dog dinner, giant marshmallow, booze-soaked cherry, sponge cake, gin-soaked blotter paper, steel margarita, bottle of Chateau de Vinegar, Bowl of Scorpions, unnamed cocktail, Flamin' Whatshisname, goat cheese, Extrovermectin™, blueberry muffin, bran muffin, chocolate chip muffin, Schrödinger's thermos, quantum taco, pirate fork, everfull glass, [glitch season reward name], Affirmation Cookie, boxed wine, piscatini, grapefruit, drive-by shooting`
);
function absorbConsumables(): void {
  if (myPath() !== $path`Grey You`) return; // final safety
  if (myTurncount() >= 1000) return; // stop after breaking ronin

  let absorbed_list = get(toTempPref("absorbedConsumables"), "");
  const absorbed = new Set<string>(absorbed_list.split(",").filter((s) => s.length > 0));

  for (const item_name in getInventory()) {
    const item = Item.get(item_name);
    const item_id = `${toInt(item)}`;
    if (
      consumables_blacklist.has(item) ||
      historicalPrice(item) > Math.max(5000, autosellPrice(item) * 2) ||
      !item.tradeable ||
      item.quest ||
      item.gift
    )
      continue;
    if (item.inebriety > 0 && !absorbed.has(item_id)) {
      overdrink(item);
      absorbed_list += absorbed_list.length > 0 ? `,${item_id}` : item_id;
    }
    if (item.fullness > 0 && !absorbed.has(item_id)) {
      if (have($item`Special Seasoning`))
        putCloset(itemAmount($item`Special Seasoning`), $item`Special Seasoning`);
      // eat(item);
      visitUrl(`inv_eat.php?pwd&which=1&whichitem=${item_id}`); // hotfix for food issue
      absorbed_list += absorbed_list.length > 0 ? `,${item_id}` : item_id;
    }
  }
  set(toTempPref("absorbedConsumables"), absorbed_list);

  // Sell extra consumables (after 1 has been absorbed)
  for (const item_name in getInventory()) {
    const item = Item.get(item_name);
    if (
      consumables_blacklist.has(item) ||
      historicalPrice(item) > Math.max(5000, autosellPrice(item) * 2) ||
      !item.tradeable ||
      item.quest ||
      item.gift
    )
      continue;
    if (autosellPrice(item) === 0) continue;
    if (item.inebriety > 0 || item.fullness > 0 || item.spleen > 0) {
      autosell(item, itemAmount(item));
    }
  }
}

function needGooseCharge(task: ActiveTask, outfit: Outfit): boolean {
  // Underweight Goose always need exp
  if (familiarWeight($familiar`Grey Goose`) < 6) return true;

  if (
    familiarWeight($familiar`Grey Goose`) >= 6 &&
    [...outfit.equips.values()].includes($item`Kramco Sausage-o-Matic™`) &&
    getKramcoWandererChance() === 1
  )
    return true;

  // Recharge the goose after gaining stats
  if (
    mayLaunchGooseForStats() &&
    !undelay(task.freeaction) &&
    task.name !== "Summon/Pygmy Witch Lawyer"
  )
    return true;

  // Recharge the goose after reprocessing
  if (
    (task.activePriority?.has(Priorities.GoodOrb) &&
      outfit.equippedAmount($item`miniature crystal ball`) > 0 &&
      task.do instanceof Location &&
      globalAbsorbState.isReprocessTarget(
        globalStateCache.orb().prediction(task.do) ?? $monster`none`
      )) ||
    [
      "Summon/Little Man In The Canoe",
      "Summon/One-Eyed Willie",
      "Summon/Revolving Bugbear",
      "Summon/Cloud Of Disembodied Whiskers",
      "Summon/Vicious Gnauga",
    ].includes(task.name)
  )
    return true;

  return false;
}
