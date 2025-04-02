import { CombatActions, CombatStrategy } from "../../engine/combat";
import { CombatResources, EngineOptions, Outfit } from "grimoire-kolmafia";
import { ActiveTask, Engine } from "../../engine/engine";
import { $item, undelay } from "libram";
import { Task } from "../../engine/task";
import { BorisActionDefaults } from "./combat";

export class BorisEngine extends Engine {
  constructor(tasks: Task[], options: EngineOptions<CombatActions, ActiveTask> = {}) {
    if (!options.combat_defaults) options.combat_defaults = new BorisActionDefaults();
    super(tasks, options);
  }

  customize(
    task: ActiveTask,
    outfit: Outfit,
    combat: CombatStrategy,
    resources: CombatResources<CombatActions>
  ): void {
    super.customize(task, outfit, combat, resources);
  }

  createOutfit(task: Task): Outfit {
    const spec = undelay(task.outfit);
    const outfit = new Outfit();
    outfit.equip($item`Trusty`);
    if (spec !== undefined) outfit.equip(spec); // no error on failure
    return outfit;
  }
}
