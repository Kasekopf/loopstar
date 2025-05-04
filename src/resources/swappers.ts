import { $item, $skill, get, have } from "libram";
import { CombatResource } from "./lib";
import { inCasual } from "kolmafia";

export const swapperSources: CombatResource[] = [
  {
    name: "Waffle",
    do: $item`waffle`,
    available: () => have($item`waffle`) && !inCasual(),
  },
  {
    name: "Macrometeorite",
    do: $skill`Macrometeorite`,
    available: () => have($skill`Macrometeorite`) && get("_macrometeoriteUses") < 10,
  },
  {
    name: "Power Glove",
    do: $skill`CHEAT CODE: Replace Enemy`,
    equip: $item`Powerful Glove`,
    available: () => have($item`Powerful Glove`) && get("_powerfulGloveBatteryPowerUsed") <= 90,
  },
];
