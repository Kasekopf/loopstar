import { $effect, have } from "libram";
import { ActiveTask, Engine } from "../../engine/engine";
import { doFirstAvailableFishySource } from "./lib";
import { Task } from "../../engine/task";
import { EngineOptions } from "grimoire-kolmafia";
import { CombatActions } from "../../engine/combat";
import { SeaActionDefaults } from "./combat";


export class SeaEngine extends Engine {

  constructor(tasks: Task[], options: EngineOptions<CombatActions, ActiveTask> = {}) {
    if (!options.combat_defaults) options.combat_defaults = new SeaActionDefaults();
    super(tasks, options);
  }

  override prepare(): void {
    if (!have($effect`Fishy`) && !have($effect`Driving Waterproofly`)) {
      doFirstAvailableFishySource();
    }
  }
}
