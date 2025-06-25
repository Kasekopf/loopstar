import { CombatResources, Outfit } from "grimoire-kolmafia";
import { ActiveTask, Engine } from "../../engine/engine";
import { CombatActions, CombatStrategy } from "../../engine/combat";
import { $familiar, $familiars, $monsters, PropertiesManager, undelay } from "libram";
import { Task } from "../../engine/task";

export class IH8UEngine extends Engine {
  override customize(
    task: ActiveTask,
    outfit: Outfit,
    combat: CombatStrategy,
    resources: CombatResources<CombatActions>
  ): void {
    // Ensure that if we encounter an Ewe, we always killHard
    combat.action("killHard", $monsters`ewe`);

    super.customize(task, outfit, combat, resources);
  }

  override createOutfit(task: Task): Outfit {
    const spec = undelay(task.outfit);
    const outfit = new Outfit();
    const replaceFamiliars = $familiars`Blood-Faced Volleyball`;
    if (!outfit.modifier.includes("Item Drop")) {
      replaceFamiliars.push($familiar`Jill-of-All-Trades`);
    }
    if (outfit.familiar && replaceFamiliars.includes(outfit.familiar)) {
      outfit.equip($familiar`Mini Kiwi`);
    }

    if (spec !== undefined) outfit.equip(spec); // no error on failure
    return outfit;
  }

  override setChoices(task: ActiveTask, manager: PropertiesManager): void {
    super.setChoices(task, manager);
    this.propertyManager.setChoices({
      1528: 1,
    });
  }
}
