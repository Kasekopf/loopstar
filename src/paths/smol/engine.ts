import { myFullness, myLevel, myTurncount } from "kolmafia";
import { $effect, $item, have, Macro } from "libram";
import { CombatActions, CombatStrategy } from "../../engine/combat";
import { CombatResources, Outfit } from "grimoire-kolmafia";
import { ActiveTask, Engine } from "../../engine/engine";

export class SmolEngine extends Engine {
  customize(
    task: ActiveTask,
    outfit: Outfit,
    combat: CombatStrategy,
    resources: CombatResources<CombatActions>
  ): void {
    super.customize(task, outfit, combat, resources);

    // Use red rocket to boost food stats
    if (
      have($item`red rocket`) &&
      myFullness() === 0 &&
      myTurncount() > 1 &&
      myLevel() < 12 &&
      !have($effect`Everything Looks Red`)
    ) {
      combat.macro(new Macro().tryItem($item`red rocket`), undefined, true);
    }
  }
}
