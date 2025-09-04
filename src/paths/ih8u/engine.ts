import { CombatResources, Outfit } from "grimoire-kolmafia";
import { ActiveTask, Engine } from "../../engine/engine";
import { CombatActions, CombatStrategy } from "../../engine/combat";
import { $monsters, $path, PropertiesManager, undelay } from "libram";
import { Task } from "../../engine/task";
import { myPath } from "kolmafia";

function scaleLimit(limit: Record<string, unknown>): Record<string, unknown> {
  const scaled: Record<string, unknown> = { ...limit };
  for (const key of Object.keys(scaled)) {
    const value = scaled[key];
    if (typeof value === "number") {
      scaled[key] = Math.ceil(value * 1.15);
    }
  }
  return scaled;
}

export class IH8UEngine extends Engine {
  override customize(
    task: ActiveTask,
    outfit: Outfit,
    combat: CombatStrategy,
    resources: CombatResources<CombatActions>
  ): void {

    if (myPath() === $path`11 Things I Hate About U` && task.limit) {
      task.limit = scaleLimit(task.limit);
    }

    // Ensure that if we encounter an Ewe, we always killHard
    combat.action("killHard", $monsters`ewe`);

    super.customize(task, outfit, combat, resources);
  }

  override createOutfit(task: Task): Outfit {
    const spec = undelay(task.outfit);
    const outfit = new Outfit();

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
