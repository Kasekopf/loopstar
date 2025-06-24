import { CombatResources, Outfit } from "grimoire-kolmafia";
import { ActiveTask, Engine } from "../../engine/engine";
import { CombatActions, CombatStrategy } from "../../engine/combat";
import { $familiar, $item, $monsters, $slot, PropertiesManager } from "libram";


export class IH8UEngine extends Engine {
  override customize(
    task: ActiveTask,
    outfit: Outfit,
    combat: CombatStrategy,
    resources: CombatResources<CombatActions>
  ): void {
    // Ensure that if we encounter an Ewe, we always killHard
    combat.action("killHard", $monsters`ewe`);

    const hat = outfit.equips.get($slot`hat`);
    const pants = outfit.equips.get($slot`pants`);
    const familiar = outfit.familiar;

    if (
      familiar !== $familiar`Mini Kiwi` &&
      hat === $item`beer helmet` &&
      pants !== $item`distressed denim pants`
    ) {
      outfit.enthrone($familiar`Mini Kiwi`);
    } else {
      outfit.bjornify($familiar`Mini Kiwi`);
    }

    super.customize(task, outfit, combat, resources);
  }

  override setChoices(task: ActiveTask, manager: PropertiesManager): void {
    super.setChoices(task, manager);
    this.propertyManager.setChoices({
      1528: 1
    });
  }
}
