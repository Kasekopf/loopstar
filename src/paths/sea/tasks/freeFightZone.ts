import { $items, $location, $skill, BurningLeaves, get, Macro } from "libram";
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
            get("_bczRefractedGazeCasts") < 2,
            Macro.if_("!monstername burnout ", Macro.trySkill($skill`BCZ: Refracted Gaze`))
          )
        )
        .kill(),
      limit: { soft: 11 },
      outfit: {
        equip: $items`blood cubic zirconia`,
      },
    },
    {
      name: "Free Fights (Barroom)",
      completed: () => !get("ownsSpeakeasy") || get("_speakeasyFreeFights") >= 3,
      do: $location`An Unusually Quiet Barroom Brawl`,
      combat: new CombatStrategy().killHard(),
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
      limit: { soft: 11 },
    },
  ],
};
