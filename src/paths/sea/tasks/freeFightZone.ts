import {
  $familiar,
  $items,
  $location,
  $skill,
  BloodCubicZirconia,
  BurningLeaves,
  get,
  Macro,
} from "libram";
import { Quest } from "../../../engine/task";
import { CombatStrategy } from "../../../engine/combat";

export const FreeFightZoneTask: Quest = {
  name: "Free Fights for Fishy",
  tasks: [
    {
      name: "Free Zone Fights",
      ready: () => get("neverendingPartyAlways"),
      completed: () => get("_neverendingPartyFreeTurns") >= 10,
      do: $location`The Neverending Party`,
      combat: new CombatStrategy()
        .macro(
          Macro.externalIf(
            BloodCubicZirconia.timesCast($skill`BCZ: Refracted Gaze`) < 2,
            Macro.if_("!monstername burnout ", Macro.trySkill($skill`BCZ: Refracted Gaze`))
          )
        )
        .kill(),
      limit: { soft: 11 },
      outfit: {
        equip: $items`Everfull Dart Holster, spring shoes, blood cubic zirconia, Monodent of the Sea, toy Cupid bow`,
        familiar: $familiar`peace turkey`,
      },
    },
    {
      name: "Free Fights (Barroom)",
      completed: () => !get("ownsSpeakeasy") || get("_speakeasyFreeFights") >= 3,
      do: $location`An Unusually Quiet Barroom Brawl`,
      combat: new CombatStrategy().killHard(),
      outfit: {
        modifier: "item",
        familiar: $familiar`Peace Turkey`,
        equip: $items`Everfull Dart Holster, spring shoes, April Shower Thoughts Shield`,
        avoid: $items`Peridot of Peril`,
      },
      limit: { soft: 11 },
    },
    {
      name: "Free Fights (Leaves)",
      completed: () =>
        !BurningLeaves.have() ||
        BurningLeaves.numberOfLeaves() < 11 ||
        get("_leafMonstersFought") >= 5,
      do: () => {
        BurningLeaves.burnLeaves(11);
      },
      combat: new CombatStrategy().killHard(),
      outfit: {
        familiar: $familiar`Peace Turkey`,
        equip: $items`Everfull Dart Holster, spring shoes, Monodent of the Sea, April Shower Thoughts Shield, toy Cupid bow`,
      },
      limit: { soft: 11 },
    },
  ],
};
