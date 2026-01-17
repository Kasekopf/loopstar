import { CombatResources, EngineOptions, Outfit } from "grimoire-kolmafia";
import { ActiveTask, Engine } from "../../engine/engine";
import { CombatActions, CombatStrategy } from "../../engine/combat";
import { $effect, $monsters, have, PropertiesManager, undelay } from "libram";
import { Task } from "../../engine/task";
import { doFirstAvailableWaterBreathSource } from "./util";
import { SeaActionDefaults } from "./combat";

export class TheSeaEngine extends Engine {
  constructor(
    tasks: Task[],
    options: EngineOptions<CombatActions, ActiveTask> = {}
  ) {
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

  override createOutfit(task: Task): Outfit {
    const spec = undelay(task.outfit);
    const outfit = new Outfit();

    if (spec !== undefined) outfit.equip(spec); // ignore equip failures
    return outfit;
  }

  override prepare(): void {
    if (!have($effect`Driving Waterproofly`)) {
      doFirstAvailableWaterBreathSource();
    }
  }

  override setChoices(task: ActiveTask, manager: PropertiesManager): void {
    super.setChoices(task, manager);

    manager.setChoices({
      1528: 1,
    });
  }
}
