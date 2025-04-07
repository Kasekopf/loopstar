import { CombatActions, CombatStrategy } from "../../engine/combat";
import { CombatResources, EngineOptions, Outfit } from "grimoire-kolmafia";
import { ActiveTask, Engine } from "../../engine/engine";
import {
  $effect,
  $effects,
  $familiar,
  $item,
  $skill,
  $skills,
  $slot,
  get,
  have,
  undelay,
} from "libram";
import { Task } from "../../engine/task";
import { BorisActionDefaults } from "./combat";
import { castWithMpSwaps, ensureWithMPSwaps } from "../../engine/moods";

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

  override createOutfit(task: Task): Outfit {
    const spec = undelay(task.outfit);
    const outfit = new Outfit();
    outfit.equip($item`Trusty`);
    outfit.equip($familiar`none`);
    outfit.equip($item`none`, $slot`familiar`);
    if (spec !== undefined) outfit.equip(spec); // no error on failure
    return outfit;
  }

  override dress(task: ActiveTask, outfit: Outfit): void {
    super.dress(task, outfit);
    if (undelay(task.freeaction) || undelay(task.skipprep)) {
      // Prepare only as requested by the task
      return;
    }

    let modifier = outfit.modifier.join(",");
    // No need to buff -combat if we just force the NC
    if (task.tags?.includes("NCForce") || get("noncombatForcerActive"))
      modifier = modifier.replace("-combat", "");

    // Manage Boris song effects
    if (modifier.includes("ML") && !modifier.includes("-ML")) {
      if (have($skill`Pep Talk`) && !have($effect`Overconfident`)) {
        castWithMpSwaps($skills`Pep Talk`); // add
      }
      ensureWithMPSwaps($effects`Song of Cockiness`);
    } else {
      if (have($skill`Pep Talk`) && have($effect`Overconfident`)) {
        castWithMpSwaps($skills`Pep Talk`); // remove
      }

      if (modifier.includes("-combat")) {
        ensureWithMPSwaps($effects`Song of Solitude`);
      } else if (modifier.includes("combat")) {
        ensureWithMPSwaps($effects`Song of Battle`);
      } else if (modifier.includes("item") || modifier.includes("meat")) {
        ensureWithMPSwaps($effects`Song of Fortune`);
      }
    }
  }
}
